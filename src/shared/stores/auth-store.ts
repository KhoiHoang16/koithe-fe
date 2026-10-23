import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/shared/types/common.types';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;

  // Actions
  login: (data: LoginResponse) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isGuest: true,

      login: ({ accessToken, refreshToken, user }) => {
        // Lưu refresh token vào localStorage
        localStorage.setItem('refresh_token', refreshToken);
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isGuest: false,
        });
      },

      logout: () => {
        localStorage.removeItem('refresh_token');
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isGuest: true,
        });
      },

      setUser: (user) => set({ user }),

      setAccessToken: (token) => set({ accessToken: token }),

      hasRole: (role) => {
        const userRole = get().user?.vaiTro;
        if (!userRole) return false;
        if (Array.isArray(role)) return role.includes(userRole);
        return userRole === role;
      },
    }),
    {
      name: 'auth-storage',
      // Persist user và accessToken để giữ trạng thái đăng nhập và Authorization header khi reload trang
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
