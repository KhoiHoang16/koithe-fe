import { httpClient } from '@/shared/api/http-client';
import type { Voucher, ValidateVoucherResult, VoucherDiscountType } from '@/shared/types/promotion.types';
import type { PageResponse } from '@/shared/types/common.types';

interface BackendVoucher {
  id: number;
  maChuongTrinh: number;
  maCode: string;
  loaiGiamGia: 'TIEN_CO_DINH' | 'PHAN_TRAM';
  giaTriGiam: number;
  mucGiamToiDa?: number;
  donHangToiThieu: number;
  gioiHanSuDung?: number;
  soLuotDaDung: number;
}

interface BackendValidateResponse {
  maCode: string;
  hopLe: boolean;
  soTienGiam: number;
  tongTienSauGiam: number;
  thongDiep: string;
}

function mapDiscountType(type: BackendVoucher['loaiGiamGia']): VoucherDiscountType {
  return type === 'PHAN_TRAM' ? 'PERCENT' : 'FIXED';
}

function mapVoucher(voucher: BackendVoucher): Voucher {
  return {
    id: voucher.id,
    maVoucher: voucher.maCode,
    tenVoucher: voucher.maCode,
    loaiGiamGia: mapDiscountType(voucher.loaiGiamGia),
    giaTriGiam: Number(voucher.giaTriGiam),
    giamGiaToiDa: voucher.mucGiamToiDa != null ? Number(voucher.mucGiamToiDa) : undefined,
    donHangToiThieu: Number(voucher.donHangToiThieu),
    ngayBatDau: '',
    ngayKetThuc: '',
    soLuong: voucher.gioiHanSuDung ?? 0,
    daSuDung: voucher.soLuotDaDung ?? 0,
    trangThai: true,
  };
}

function minimalVoucher(maCode: string, giamGia: number): Voucher {
  return {
    id: 0,
    maVoucher: maCode,
    tenVoucher: maCode,
    loaiGiamGia: 'FIXED',
    giaTriGiam: giamGia,
    donHangToiThieu: 0,
    ngayBatDau: '',
    ngayKetThuc: '',
    soLuong: 0,
    daSuDung: 0,
    trangThai: true,
  };
}

export const promotionApi = {
  getVouchers: async (): Promise<Voucher[]> => {
    const response = (await httpClient.get('/vouchers')) as unknown as PageResponse<BackendVoucher>;
    return response.content.map(mapVoucher);
  },

  validateVoucher: async (code: string, subtotal: number): Promise<ValidateVoucherResult> => {
    const result = (await httpClient.post('/vouchers/validate', {
      maCode: code,
      tongTienDonHang: subtotal,
    })) as unknown as BackendValidateResponse;
    return {
      valid: result.hopLe,
      message: result.thongDiep,
      voucher: result.hopLe ? minimalVoucher(result.maCode, Number(result.soTienGiam)) : undefined,
      giamGia: Number(result.soTienGiam),
    };
  },

  createVoucher: async (data: Partial<Voucher>): Promise<Voucher> => {
    const voucher = (await httpClient.post('/vouchers', {
      maChuongTrinh: 1,
      maCode: data.maVoucher,
      loaiGiamGia: data.loaiGiamGia === 'PERCENT' ? 'PHAN_TRAM' : 'TIEN_CO_DINH',
      giaTriGiam: data.giaTriGiam,
      mucGiamToiDa: data.giamGiaToiDa,
      donHangToiThieu: data.donHangToiThieu,
      gioiHanSuDung: data.soLuong,
      soLuotDaDung: data.daSuDung ?? 0,
    })) as unknown as BackendVoucher;
    return mapVoucher(voucher);
  },

  deleteVoucher: async (id: number): Promise<void> => {
    await httpClient.delete(`/vouchers/${id}`);
  },
};
