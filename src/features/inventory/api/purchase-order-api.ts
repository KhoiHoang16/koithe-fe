import { api } from '@/shared/api/http-client';
import type { InventoryPage } from './supplier-api';

export interface PurchaseOrder {
  id: number;
  maPhieuNhap: string;
  tongTien: number;
  ghiChu: string | null;
  trangThai: string;
  ngayNhap: string;
}
export interface PurchaseLine {
  id: number;
  tenMatHang: string;
  donViTinh: string;
  soLuong: number;
  donGiaNhap: number;
  thanhTien: number;
}
export interface LineInput {
  maBienThe: number;
  soLuong: number;
  donGiaNhap: number;
}
export interface PurchaseInput {
  maPhieuNhap: string;
  maNhaCungCap: number;
  ghiChu: string;
  tongTien: number;
  chiTiet: LineInput[];
}
export interface PurchaseFilters {
  supplierId?: number;
  from?: string;
  to?: string;
  trangThai?: string;
  page: number;
}
export interface StockVariant {
  id: number;
  kichCo: string;
  soLuongTon: number;
  conHang: boolean;
}
export interface InventoryProduct {
  id: number;
  tenSanPham: string;
}
export const purchaseOrderApi = {
  list: (params: PurchaseFilters) =>
    api.get<InventoryPage<PurchaseOrder>>('/purchase-orders', { params: { ...params, size: 20 } }),
  detail: (id: number) => api.get<PurchaseOrder>(`/purchase-orders/${id}`),
  lines: (id: number, page = 0) =>
    api.get<InventoryPage<PurchaseLine>>('/purchase-order-lines', {
      params: { maPhieuNhap: id, page, size: 20 },
    }),
  create: (data: PurchaseInput) => api.post<PurchaseOrder>('/purchase-orders', data),
  updateNote: (id: number, ghiChu: string) =>
    api.put<PurchaseOrder>(`/purchase-orders/${id}`, { ghiChu }),
  approve: (id: number) => api.post<PurchaseOrder>(`/purchase-orders/${id}/approve`),
  products: (keyword: string, page: number) =>
    api.get<InventoryPage<InventoryProduct>>('/products', { params: { keyword, page, size: 20 } }),
  variants: (id: number) => api.get<StockVariant[]>(`/products/${id}/variants`),
};
