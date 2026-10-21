import { api } from '@/shared/api/http-client';

export type PaymentMethodCode = 'VNPAY' | 'MOMO' | 'CHUYEN_KHOAN_QR' | 'TIEN_MAT';

export interface CreatePaymentRequest {
  maDonHang: number;
  phuongThucThanhToan: PaymentMethodCode;
  soTien: number;
  noiDungVietqr?: string;
}

export interface GuestCashPaymentRequest {
  maDonHang: number;
  cartToken: string;
  soTien: number;
}

export interface PaymentResponse {
  id: number;
  maDonHang: number;
  phuongThucThanhToan: PaymentMethodCode;
  soTien: number;
  noiDungVietqr?: string;
  trangThai: string;
  thoiGianThanhToan?: string;
  redirectUrl?: string;
}

export const paymentApi = {
  create: (request: CreatePaymentRequest) => api.post<PaymentResponse>('/payments', request),
  createGuestCash: (request: GuestCashPaymentRequest) =>
    api.post<PaymentResponse>('/payments/guest-cash', request),
  getById: (id: number) => api.get<PaymentResponse>(`/payments/${id}`),
};
