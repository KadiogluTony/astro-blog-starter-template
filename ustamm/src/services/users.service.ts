import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Category } from '../types';

// Geohash-based proximity search radius in degrees (~1 degree = ~111km)
const degreeToKm = (deg: number) => deg * 111;
const kmToDegree = (km: number) => km / 111;

export const usersService = {
  async getUser(userId: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as User;
  },

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async getTradesmenByCategory(category: Category, pageLimit = 20): Promise<User[]> {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'tradesman'),
      where('categories', 'array-contains', category),
      where('isAvailable', '==', true),
      orderBy('rating', 'desc'),
      limit(pageLimit)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as User[];
  },

  async getNearbyTradesmen(
    lat: number,
    lng: number,
    radiusKm: number,
    category?: Category
  ): Promise<User[]> {
    const delta = kmToDegree(radiusKm);

    let q = query(
      collection(db, 'users'),
      where('role', '==', 'tradesman'),
      where('isAvailable', '==', true),
      where('location.lat', '>=', lat - delta),
      where('location.lat', '<=', lat + delta)
    );

    if (category) {
      q = query(q, where('categories', 'array-contains', category));
    }

    const snap = await getDocs(q);
    const allTradesmen = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as User[];

    // Client-side filter for longitude (Firestore only supports range query on one field)
    return allTradesmen.filter((t) => {
      if (!t.location) return false;
      const lngDiff = Math.abs(t.location.lng - lng);
      return lngDiff <= delta;
    });
  },

  async searchUsers(searchTerm: string): Promise<User[]> {
    // Simple search - in production use Algolia or similar
    const q = query(
      collection(db, 'users'),
      where('fullName', '>=', searchTerm),
      where('fullName', '<=', searchTerm + ''),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as User[];
  },

  async updateAvailability(userId: string, isAvailable: boolean): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { isAvailable, updatedAt: serverTimestamp() });
  },

  async getTopRatedTradesmen(category?: Category, pageLimit = 10): Promise<User[]> {
    let q = query(
      collection(db, 'users'),
      where('role', '==', 'tradesman'),
      orderBy('rating', 'desc'),
      limit(pageLimit)
    );
    if (category) {
      q = query(
        collection(db, 'users'),
        where('role', '==', 'tradesman'),
        where('categories', 'array-contains', category),
        orderBy('rating', 'desc'),
        limit(pageLimit)
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as User[];
  },
};
