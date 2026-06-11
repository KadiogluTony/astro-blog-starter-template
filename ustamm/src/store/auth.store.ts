import { create } from 'zustand';
import { User, UserRole } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, phone: string, fullName: string, role: UserRole, categories?: string[]) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await authService.login(email, password);
      const userData = await authService.getUserData(firebaseUser.uid);
      if (!userData) throw new Error('Kullanıcı verisi bulunamadı');
      set({ user: userData, isAuthenticated: true, isLoading: false });
      return userData;
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential' ? 'E-posta veya şifre hatalı' : err.message || 'Giriş başarısız';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (email, password, phone, fullName, role, categories) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(email, password, phone, fullName, role, categories);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use' ? 'Bu e-posta zaten kayıtlı' : err.message || 'Kayıt başarısız';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateUser: async (data) => {
    const { user } = get();
    if (!user) return;
    await authService.updateProfile(user.id, data);
    set({ user: { ...user, ...data } });
  },

  clearError: () => set({ error: null }),
}));
