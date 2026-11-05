import { api } from '@/shared/api/http-client';

export interface Shift {
  id: number;
  thoiGianBatDau: string;
  thoiGianKetThuc: string | null;
  tienDauCa: number | null;
  tienKetCa: number | null;
  trangThai: string;
  tongDoanhThu: number | null;
  soDonHang: number | null;
  tienMatDuKien: number | null;
  chenhLech: number | null;
  maThuNgan?: number | null;
  tenThuNgan?: string | null;
}
export const shiftApi = {
  list: (status?: string) =>
    api.get<Shift[]>('/shifts', { params: { status: status || undefined } }),
  current: () => api.get<Shift | null>('/shifts/current'),
  detail: (id: number) => api.get<Shift>(`/shifts/${id}`),
  open: (tienDauCa: number) => api.post<Shift>('/shifts/open', { tienDauCa }),
  close: (id: number, tienKetCa: number) => api.post<Shift>(`/shifts/${id}/close`, { tienKetCa }),
};
