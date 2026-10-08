// ============================================================
// ADMIN MANAGEMENT TYPES - Table, Employee, Shift
// ============================================================

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';

export interface StoreTable {
  id: number;
  soBan: string;
  khuVuc: string; // e.g. "Tầng 1", "Tầng 2", "Sân thượng"
  soGhe: number;
  trangThai: TableStatus;
  qrCodeUrl?: string;
  donHangHienTaiId?: number;
}

export interface Employee {
  id: number;
  maNhanVien: string;
  hoTen: string;
  soDienThoai: string;
  email: string;
  chucVu: 'QUAN_LY' | 'THU_NGAN' | 'BARISTA' | 'GIAO_HANG';
  luongTheoGio: number;
  trangThai: boolean;
  ngayVaoLam: string;
}

export interface WorkShift {
  id: number;
  tenCa: string;
  gioBatDau: string; // "07:00"
  gioKetThuc: string; // "15:00"
  nhanVienIds: number[];
  ngayLam: string;
  trangThai: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}
