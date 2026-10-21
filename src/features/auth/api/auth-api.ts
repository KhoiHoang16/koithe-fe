import { api } from '@/shared/api/http-client';
import type { User, UserRole } from '@/shared/types/common.types';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface MeResponse {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface AuthSession extends TokenResponse {
  user: User;
}

function toUser(me: MeResponse): User {
  return {
    id: me.id,
    hoTen: me.fullName,
    email: '',
    soDienThoai: /^\+?[\d\s-]+$/.test(me.username) ? me.username : '',
    vaiTro: me.role,
    trangThai: true,
    createdAt: '',
    username: me.username,
  };
}

export const authApi = {
  login: async (username: string, password: string): Promise<AuthSession> => {
    const tokens = await api.post<TokenResponse>('/auth/login', { username, password });
    const me = await api.get<MeResponse>('/auth/me', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    return { ...tokens, user: toUser(me) };
  },

  register: (data: { username: string; password: string; fullName: string; phone?: string }) =>
    api.post<TokenResponse>('/auth/register', data),

  me: async (): Promise<User> => toUser(await api.get<MeResponse>('/auth/me')),

  logout: (refreshToken?: string | null) =>
    api.post<void>('/auth/logout', refreshToken ? { refreshToken } : undefined),
};
