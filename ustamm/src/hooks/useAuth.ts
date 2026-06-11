import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      store.setLoading(true);
      if (firebaseUser) {
        const userData = await authService.getUserData(firebaseUser.uid);
        store.setUser(userData);
      } else {
        store.setUser(null);
      }
      store.setLoading(false);
    });
    return unsubscribe;
  }, []);

  return {
    user: store.user,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    error: store.error,
    login: store.login,
    register: store.register,
    logout: store.logout,
    updateUser: store.updateUser,
    clearError: store.clearError,
  };
};
