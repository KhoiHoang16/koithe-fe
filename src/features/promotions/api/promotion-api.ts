import { httpClient } from '@/shared/api/http-client';
import type { Voucher, ValidateVoucherResult } from '@/shared/types/promotion.types';

export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 1,
    maVoucher: 'KOINEW',
    tenVoucher: 'Giảm 20k cho khách hàng mới',
    moTa: 'Áp dụng cho đơn hàng từ 100.000đ',
    loaiGiamGia: 'FIXED',
    giaTriGiam: 20000,
    donHangToiThieu: 100000,
    ngayBatDau: '2026-01-01',
    ngayKetThuc: '2026-12-31',
    soLuong: 500,
    daSuDung: 120,
    trangThai: true,
  },
  {
    id: 2,
    maVoucher: 'HEVIP15',
    tenVoucher: 'Giảm 15% tổng hóa đơn',
    moTa: 'Giảm tối đa 30.000đ cho đơn từ 150.000đ',
    loaiGiamGia: 'PERCENT',
    giaTriGiam: 15,
    giamGiaToiDa: 30000,
    donHangToiThieu: 150000,
    ngayBatDau: '2026-06-01',
    ngayKetThuc: '2026-12-31',
    soLuong: 1000,
    daSuDung: 430,
    trangThai: true,
  },
  {
    id: 3,
    maVoucher: 'FREESHIP',
    tenVoucher: 'Miễn phí giao hàng 15k',
    moTa: 'Áp dụng cho mọi đơn giao hàng',
    loaiGiamGia: 'FIXED',
    giaTriGiam: 15000,
    donHangToiThieu: 80000,
    ngayBatDau: '2026-01-01',
    ngayKetThuc: '2026-12-31',
    soLuong: 2000,
    daSuDung: 890,
    trangThai: true,
  },
];

export const promotionApi = {
  getVouchers: async (): Promise<Voucher[]> => {
    try {
      return (await httpClient.get('/promotions/vouchers')) as Voucher[];
    } catch {
      return MOCK_VOUCHERS;
    }
  },

  validateVoucher: async (code: string, subtotal: number): Promise<ValidateVoucherResult> => {
    try {
      return (await httpClient.post('/promotions/vouchers/validate', {
        code,
        subtotal,
      })) as ValidateVoucherResult;
    } catch {
      const voucher = MOCK_VOUCHERS.find((v) => v.maVoucher.toUpperCase() === code.toUpperCase() && v.trangThai);
      if (!voucher) {
        return { valid: false, message: 'Mã voucher không tồn tại hoặc đã hết hạn', giamGia: 0 };
      }
      if (subtotal < voucher.donHangToiThieu) {
        return {
          valid: false,
          message: `Đơn hàng phải từ ${voucher.donHangToiThieu.toLocaleString('vi-VN')}đ để sử dụng voucher này`,
          giamGia: 0,
        };
      }
      let discount = 0;
      if (voucher.loaiGiamGia === 'FIXED') {
        discount = voucher.giaTriGiam;
      } else {
        discount = Math.round((subtotal * voucher.giaTriGiam) / 100);
        if (voucher.giamGiaToiDa && discount > voucher.giamGiaToiDa) {
          discount = voucher.giamGiaToiDa;
        }
      }
      return { valid: true, voucher, giamGia: discount, message: 'Áp dụng mã giảm giá thành công!' };
    }
  },

  createVoucher: async (data: Partial<Voucher>): Promise<Voucher> => {
    return (await httpClient.post('/admin/vouchers', data)) as Voucher;
  },

  deleteVoucher: async (id: number): Promise<void> => {
    await httpClient.delete(`/admin/vouchers/${id}`);
  },
};
