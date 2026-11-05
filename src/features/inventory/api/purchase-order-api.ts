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
  giaBan?: number;
  soLuongTon: number;
  conHang: boolean;
}
export interface InventoryProduct {
  id: number;
  tenSanPham: string;
  tenDanhMuc?: string;
  maDanhMuc?: number;
  hinhAnh?: string;
}
export interface ProductStockSummary {
  id: number;
  tenSanPham: string;
  tenDanhMuc: string;
  hinhAnh?: string;
  variants: StockVariant[];
  totalStock: number;
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
  updateVariantStock: (variantId: number, soLuongTon: number) =>
    api.patch<StockVariant>(`/variants/${variantId}/stock`, { soLuongTon }),
  allProductsWithStock: async (): Promise<ProductStockSummary[]> => {
    const pageData = await api.get<InventoryPage<InventoryProduct>>('/products', {
      params: { page: 0, size: 100 },
    });
    const products = pageData.content ?? [];
    const results = await Promise.all(
      products.map(async (p) => {
        const variants = await api.get<StockVariant[]>(`/products/${p.id}/variants`);
        const normalized = (variants ?? []).map((v) => ({
          ...v,
          soLuongTon: Number(v.soLuongTon ?? 0),
        }));
        const totalStock = normalized.reduce((sum, v) => sum + v.soLuongTon, 0);
        return {
          id: p.id,
          tenSanPham: p.tenSanPham,
          tenDanhMuc: p.tenDanhMuc || 'Đồ uống',
          hinhAnh: p.hinhAnh,
          variants: normalized,
          totalStock,
        };
      }),
    );
    return results;
  },
};
