import { ApiError } from '@/shared/api/http-client';

export const control = 'w-full rounded-md border bg-background px-3 py-2';
export const money = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
export function errorText(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    if ([400, 404, 409].includes(error.code)) return error.message;
    return 'Không thể thực hiện thao tác. Vui lòng thử lại.';
  }
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi.';
}
