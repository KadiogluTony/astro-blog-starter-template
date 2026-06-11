import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Review } from '../types';

export const reviewsService = {
  async addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: serverTimestamp(),
    });
    await reviewsService.calculateAndUpdateAverageRating(reviewData.targetId);
    return { id: docRef.id, ...reviewData, createdAt: new Date() };
  },

  async getReviewsByUser(userId: string): Promise<Review[]> {
    const snapshot = await getDocs(
      query(collection(db, 'reviews'), where('targetId', '==', userId))
    );
    return snapshot.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        ...data,
        createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
      } as Review;
    });
  },

  async getReviewsByJob(jobId: string): Promise<Review[]> {
    const snapshot = await getDocs(
      query(collection(db, 'reviews'), where('jobId', '==', jobId))
    );
    return snapshot.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        ...data,
        createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
      } as Review;
    });
  },

  async calculateAndUpdateAverageRating(userId: string): Promise<void> {
    const reviews = await reviewsService.getReviewsByUser(userId);
    if (reviews.length === 0) return;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await updateDoc(doc(db, 'users', userId), {
      rating: Math.round(avg * 10) / 10,
      totalReviews: reviews.length,
    });
  },

  async canReview(reviewerId: string, jobId: string): Promise<boolean> {
    const snapshot = await getDocs(
      query(
        collection(db, 'reviews'),
        where('reviewerId', '==', reviewerId),
        where('jobId', '==', jobId)
      )
    );
    return snapshot.empty;
  },
};
