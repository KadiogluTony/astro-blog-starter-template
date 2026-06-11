import { useCallback } from 'react';
import { useJobsStore } from '../store/jobs.store';
import { useAuthStore } from '../store/auth.store';
import { Category } from '../types';

export const useJobs = () => {
  const store = useJobsStore();
  const { user } = useAuthStore();

  const fetchNearbyJobs = useCallback(
    async (lat: number, lng: number, radiusKm = 10) => {
      await store.fetchJobs({ lat, lng, radiusKm });
    },
    [store]
  );

  const fetchMyJobs = useCallback(async () => {
    if (!user) return;
    await store.fetchJobsByUser(user.id);
  }, [user, store]);

  const filterByCategory = useCallback(
    (category: Category | undefined) => {
      store.setFilters({ category });
    },
    [store]
  );

  return {
    jobs: store.jobs,
    selectedJob: store.selectedJob,
    offers: store.offers,
    filters: store.filters,
    isLoading: store.isLoading,
    error: store.error,
    fetchNearbyJobs,
    fetchMyJobs,
    fetchJobById: store.fetchJobById,
    setSelectedJob: store.setSelectedJob,
    setFilters: store.setFilters,
    clearFilters: store.clearFilters,
    fetchOffers: store.fetchOffers,
    addOffer: store.addOffer,
    filterByCategory,
  };
};
