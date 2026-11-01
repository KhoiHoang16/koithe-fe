import { ApiError } from '@/shared/api/http-client';
export const money = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
export const count = (value: number) => new Intl.NumberFormat('vi-VN').format(value);
export const dateLabel = (value: string) =>
  `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}`;
export function reportError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === 403) return 'Bạn không có quyền xem báo cáo.';
    if (error.code === 0) return 'Không thể kết nối server. Vui lòng thử lại.';
    if (error.code === 400) return error.message;
    return 'Không thể tải báo cáo. Vui lòng thử lại.';
  }
  return error instanceof Error ? error.message : 'Không thể tải báo cáo.';
}
