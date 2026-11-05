import { api } from '@/shared/api/http-client';

export interface ManagedUser {
  id: number;
  username: string;
  fullName: string;
  phone: string | null;
  role: string;
  roleId: number;
  isActive: boolean;
  createdAt: string | null;
}

export interface RoleOption {
  id: number;
  roleName: string;
  description: string | null;
}

export interface CreateUserInput {
  username: string;
  password: string;
  fullName: string;
  phone?: string;
  role: string;
}

export interface UpdateUserInput {
  fullName: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  password?: string;
}

export interface UserFilterParams {
  role?: string;
  keyword?: string;
}

export const userKeys = {
  all: ['user-management'] as const,
  list: (role: string, keyword: string) => ['user-management', 'list', role, keyword] as const,
  roles: () => ['user-management', 'roles'] as const,
};

export const userApi = {
  getAll: (params?: UserFilterParams, signal?: AbortSignal) => {
    const query: Record<string, string> = {};
    if (params?.role && params.role !== 'ALL') query.role = params.role;
    if (params?.keyword?.trim()) query.keyword = params.keyword.trim();
    return api.get<ManagedUser[]>('/users', {
      params: Object.keys(query).length ? query : undefined,
      signal,
    });
  },

  getById: (id: number) => api.get<ManagedUser>(`/users/${id}`),

  getRoles: () => api.get<RoleOption[]>('/users/roles'),

  create: (input: CreateUserInput) => api.post<ManagedUser>('/users', input),

  update: (id: number, input: UpdateUserInput) => api.put<ManagedUser>(`/users/${id}`, input),

  updateStatus: (id: number, isActive: boolean) =>
    api.patch<ManagedUser>(`/users/${id}/status`, { isActive }),

  delete: (id: number) => api.delete(`/users/${id}`),
};

