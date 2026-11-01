import { api } from '@/shared/api/http-client';

export interface InventoryPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface Supplier {
  id: number;
  tenNhaCungCap: string;
  soDienThoai: string;
  email: string | null;
  diaChi: string | null;
  nguoiDaiDien: string | null;
  dangHopTac: boolean;
  maSoThue: string | null;
}
export interface SupplierInput {
  tenNhaCungCap: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
  nguoiDaiDien: string;
}
export const supplierApi = {
  list: (page = 0) =>
    api.get<InventoryPage<Supplier>>('/suppliers', { params: { page, size: 20 } }),
  create: (data: SupplierInput) => api.post<Supplier>('/suppliers', data),
  update: (id: number, data: SupplierInput) => api.put<Supplier>(`/suppliers/${id}`, data),
  remove: (id: number) => api.delete(`/suppliers/${id}`),
  // Dropdown phải lấy hết các trang, không chỉ 20 nhà cung cấp đầu tiên.
  options: async () => {
    const first = await supplierApi.list();
    const result = [...first.content];
    for (let page = 1; page < first.totalPages; page++)
      result.push(...(await supplierApi.list(page)).content);
    return result;
  },
};
