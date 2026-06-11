import { create } from 'zustand';
import { Job, Offer, Category } from '../types';
import { jobsService } from '../services/jobs.service';

interface JobFilters {
  category?: Category;
  maxDistance?: number;
  minBudget?: number;
  maxBudget?: number;
  status?: string;
}

interface JobsState {
  jobs: Job[];
  selectedJob: Job | null;
  offers: Offer[];
  filters: JobFilters;
  isLoading: boolean;
  error: string | null;

  fetchJobs: (params?: { lat?: number; lng?: number; radiusKm?: number }) => Promise<void>;
  fetchJobById: (jobId: string) => Promise<Job | null>;
  fetchJobsByUser: (userId: string) => Promise<void>;
  setSelectedJob: (job: Job | null) => void;
  setFilters: (filters: Partial<JobFilters>) => void;
  clearFilters: () => void;
  fetchOffers: (jobId: string) => Promise<void>;
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  selectedJob: null,
  offers: [],
  filters: {},
  isLoading: false,
  error: null,

  fetchJobs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      let jobs: Job[];
      if (params?.lat && params?.lng) {
        jobs = await jobsService.getNearbyJobs(params.lat, params.lng, params.radiusKm || 10);
      } else {
        jobs = await jobsService.getJobs();
      }
      const { filters } = get();
      let filtered = jobs;
      if (filters.category) {
        filtered = filtered.filter((j) => j.category === filters.category);
      }
      if (filters.minBudget) {
        filtered = filtered.filter((j) => j.budget.max >= filters.minBudget!);
      }
      if (filters.maxBudget) {
        filtered = filtered.filter((j) => j.budget.min <= filters.maxBudget!);
      }
      set({ jobs: filtered, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchJobById: async (jobId) => {
    set({ isLoading: true, error: null });
    try {
      const job = await jobsService.getJobById(jobId);
      set({ selectedJob: job, isLoading: false });
      return job;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  fetchJobsByUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const jobs = await jobsService.getJobsByUser(userId);
      set({ jobs, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setSelectedJob: (job) => set({ selectedJob: job }),

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

  clearFilters: () => set({ filters: {} }),

  fetchOffers: async (jobId) => {
    set({ isLoading: true, error: null });
    try {
      const offers = await jobsService.getOffersForJob(jobId);
      set({ offers, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addOffer: async (offerData) => {
    try {
      await jobsService.createOffer(offerData);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  setError: (error) => set({ error }),
}));
