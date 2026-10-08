// ============================================================
// CATALOG TYPES - Category, Topping, Variant, Product
// ============================================================

export interface Category {
  id: number;
  tenDanhMuc: string;
  moTa?: string;
  hinhAnh?: string;
  thuTu: number;
  trangThai: boolean; // true = active, false = hidden
  soLuongSanPham?: number;
}

export interface Topping {
  id: number;
  tenTopping: string;
  giaBan: number;
  coSan: boolean;
  trangThai: boolean;
}

export interface ProductVariant {
  id: number;
  tenBienThe: string; // e.g. "Size S", "Size M", "Size L"
  giaGoc?: number;
  giaBan: number;
  coSan: boolean;
}

export interface Product {
  id: number;
  maSanPham: string;
  tenSanPham: string;
  moTa?: string;
  hinhAnh?: string;
  giaTu: number;
  trangThai: boolean;
  noiBat: boolean;
  danhMucId: number;
  danhMucTen?: string;
  bienTheList: ProductVariant[];
  toppingList: Topping[];
  soLuongBan?: number;
  danhGiaTrungBinh?: number;
  soLuotDanhGia?: number;
}

export interface ProductFilterParams {
  danhMucId?: number;
  search?: string;
  noiBat?: boolean;
  coSan?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}
