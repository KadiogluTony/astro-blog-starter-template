import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Job, JobStatus, Offer, OfferStatus, Category } from '../types';

const toDate = (val: unknown): Date => {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date();
};

const mapJobDoc = (id: string, data: Record<string, unknown>): Job => ({
  id,
  customerId: data.customerId as string,
  title: data.title as string,
  description: data.description as string,
  category: data.category as Category,
  location: data.location as Job['location'],
  status: data.status as JobStatus,
  budget: data.budget as Job['budget'],
  images: (data.images as string[]) ?? [],
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
  acceptedOfferId: data.acceptedOfferId as string | undefined,
  tradesmanId: data.tradesmanId as string | undefined,
});

export const jobsService = {
  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    const ref = await addDoc(collection(db, 'jobs'), {
      ...jobData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return {
      id: ref.id,
      ...jobData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async getJobs(filters?: {
    category?: Category;
    city?: string;
    maxBudget?: number;
    status?: JobStatus;
  }): Promise<Job[]> {
    let q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const constraints = [];
    if (filters?.category) constraints.push(where('category', '==', filters.category));
    if (filters?.city) constraints.push(where('location.city', '==', filters.city));
    if (filters?.status) constraints.push(where('status', '==', filters.status));

    if (constraints.length > 0) {
      q = query(collection(db, 'jobs'), ...constraints, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapJobDoc(d.id, d.data() as Record<string, unknown>));
  },

  async getNearbyJobs(lat: number, lng: number, radiusKm: number): Promise<Job[]> {
    const snapshot = await getDocs(
      query(collection(db, 'jobs'), where('status', '==', JobStatus.PENDING))
    );
    return snapshot.docs
      .map((d) => mapJobDoc(d.id, d.data() as Record<string, unknown>))
      .filter((job) => {
        const dlat = job.location.lat - lat;
        const dlng = job.location.lng - lng;
        const dist = Math.sqrt(dlat * dlat + dlng * dlng) * 111;
        return dist <= radiusKm;
      });
  },

  async getJobById(jobId: string): Promise<Job | null> {
    const snap = await getDoc(doc(db, 'jobs', jobId));
    if (!snap.exists()) return null;
    return mapJobDoc(snap.id, snap.data() as Record<string, unknown>);
  },

  async getJobsByUser(userId: string, role: 'customer' | 'tradesman'): Promise<Job[]> {
    const field = role === 'customer' ? 'customerId' : 'tradesmanId';
    const snapshot = await getDocs(
      query(collection(db, 'jobs'), where(field, '==', userId), orderBy('createdAt', 'desc'))
    );
    return snapshot.docs.map((d) => mapJobDoc(d.id, d.data() as Record<string, unknown>));
  },

  async updateJobStatus(jobId: string, status: JobStatus): Promise<void> {
    await updateDoc(doc(db, 'jobs', jobId), { status, updatedAt: serverTimestamp() });
  },

  async updateJob(jobId: string, data: Partial<Job>): Promise<void> {
    await updateDoc(doc(db, 'jobs', jobId), { ...data, updatedAt: serverTimestamp() });
  },

  async deleteJob(jobId: string): Promise<void> {
    await deleteDoc(doc(db, 'jobs', jobId));
  },

  async addJobImage(jobId: string, imageUri: string): Promise<string> {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storageRef = ref(storage, `jobs/${jobId}/${Date.now()}.jpg`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    const existing = (jobDoc.data()?.images ?? []) as string[];
    await updateDoc(doc(db, 'jobs', jobId), { images: [...existing, url] });
    return url;
  },

  async createOffer(offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Offer> {
    const docRef = await addDoc(collection(db, 'offers'), {
      ...offerData,
      status: OfferStatus.PENDING,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // Increment offerCount on the job
    const jobRef = doc(db, 'jobs', offerData.jobId);
    const jobSnap = await getDoc(jobRef);
    if (jobSnap.exists()) {
      const current = (jobSnap.data().offerCount as number) || 0;
      await updateDoc(jobRef, { offerCount: current + 1 });
    }
    return {
      id: docRef.id,
      ...offerData,
      status: OfferStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async getOffersForJob(jobId: string): Promise<Offer[]> {
    const q = query(
      collection(db, 'offers'),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
      updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
    })) as Offer[];
  },

  async getOffersByTradesman(tradesmanId: string): Promise<Offer[]> {
    const q = query(
      collection(db, 'offers'),
      where('tradesmanId', '==', tradesmanId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
      updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
    })) as Offer[];
  },

  async acceptOffer(jobId: string, offerId: string, tradesmanId: string): Promise<void> {
    await updateDoc(doc(db, 'offers', offerId), {
      status: OfferStatus.ACCEPTED,
      updatedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'jobs', jobId), {
      status: JobStatus.IN_PROGRESS,
      acceptedOfferId: offerId,
      tradesmanId,
      updatedAt: serverTimestamp(),
    });
    // Reject all other offers
    const q = query(collection(db, 'offers'), where('jobId', '==', jobId), where('status', '==', OfferStatus.PENDING));
    const snap = await getDocs(q);
    await Promise.all(
      snap.docs
        .filter((d) => d.id !== offerId)
        .map((d) => updateDoc(d.ref, { status: OfferStatus.REJECTED, updatedAt: serverTimestamp() }))
    );
  },
};
