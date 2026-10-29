import { api } from '@/shared/api/http-client';

export interface ManagedCustomer {
  id: number;
  soDienThoai: string;
  hoVaTen: string;
  email: string | null;
  diemTichLuy: number | null;
  hangThanhVien: string | null;
  daXacThuc: boolean | null;
  ngayTao: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateCustomerInput {
  hoVaTen: string;
  soDienThoai: string;
  email: string;
}

export interface UpdateCustomerInput {
  hoVaTen: string;
  email: string;
}

export const customerKeys = {
  all: ['customer-management'] as const,
  list: (ownerId: number | undefined, phone: string) =>
    ['customer-management', ownerId, 'list', phone] as const,
  detail: (ownerId: number | undefined, id: number | null) =>
    ['customer-management', ownerId, 'detail', id] as const,
};

export const customerApi = {
  getAll: (phone = '') =>
    api.get<ManagedCustomer[]>('/customers', { params: phone ? { phone } : undefined }),
  getById: (id: number) => api.get<ManagedCustomer>('/customers/' + id),
  create: (input: CreateCustomerInput) => api.post<ManagedCustomer>('/customers', input),
  update: (id: number, input: UpdateCustomerInput) =>
    api.put<ManagedCustomer>('/customers/' + id, input),
  delete: (id: number) => api.delete('/customers/' + id),
};
