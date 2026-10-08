// ============================================================
// PROMOTION & VOUCHER TYPES
// ============================================================

export type VoucherDiscountType = 'PERCENT' | 'FIXED';

export interface Voucher {
  id: number;
  maVoucher: string;
  tenVoucher: string;
  moTa?: string;
  loaiGiamGia: VoucherDiscountType;
  giaTriGiam: number; // e.g., 20 (%) or 30000 (VND)
  giamGiaToiDa?: number; // Tối đa bao nhiêu VND nếu là %
  donHangToiThieu: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  soLuong: number;
  daSuDung: number;
  trangThai: boolean;
}

export interface ValidateVoucherResult {
  valid: boolean;
  message?: string;
  voucher?: Voucher;
  giamGia: number;
}
