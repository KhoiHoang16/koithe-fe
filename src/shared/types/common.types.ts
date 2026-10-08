// ============================================================
// SHARED TYPES - Backend response format chuẩn
// ============================================================

/** Response wrapper format từ backend */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/** Phân trang */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/** Tham số phân trang */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

/** Roles người dùng */
export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'BARISTA' | 'CUSTOMER';

/** Thông tin người dùng */
export interface User {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string;
  vaiTro: UserRole;
  anhDaiDien?: string;
  trangThai: boolean;
  createdAt: string;
}

/** Customer (khách hàng đã đăng ký) */
export interface Customer {
  id: number;
  maKhachHang: string;
  hoTen: string;
  email?: string;
  soDienThoai: string;
  daDangKy: boolean;
  daXacThuc: boolean;
  tongDiem: number;
  hangThanhVien: MemberTier;
  createdAt: string;
}

/** Hạng thành viên */
export type MemberTier = 'DONG' | 'BAC' | 'VANG' | 'KIM_CUONG';

/** Địa chỉ */
export interface Address {
  id: number;
  tenNguoiNhan: string;
  soDienThoai: string;
  diaChiChiTiet: string;
  tinhThanh: string;
  quanHuyen: string;
  phuongXa: string;
  macDinh: boolean;
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Option cho select/filter */
export interface SelectOption<T = string> {
  label: string;
  value: T;
}
