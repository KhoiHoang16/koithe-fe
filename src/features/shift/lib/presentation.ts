import { ApiError } from '@/shared/api/http-client';
export const cash = (value: number | null) =>
  value === null
    ? 'Chưa có dữ liệu'
    : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
export const date = (value: string | null) =>
  value ? new Date(value).toLocaleString('vi-VN') : '—';
export const statusLabel = (status: string) =>
  (({ DANG_MO: 'Đang mở', DA_DONG: 'Đã đóng' }) as Record<string, string>)[status] ?? status;
export const control = 'w-full rounded-md border bg-background px-3 py-2';
export function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    if (error.code === 0) return 'Không thể kết nối server. Vui lòng thử lại.';
    if ([400, 404, 409].includes(error.code)) return error.message;
    return 'Không thể thực hiện thao tác. Vui lòng thử lại.';
  }
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi.';
}
