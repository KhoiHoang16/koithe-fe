import { ApiError } from './http-client';
import { toast } from 'sonner';

/** Lấy thông báo lỗi user-friendly từ ApiError */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Đã xảy ra lỗi không xác định';
}

/** Xử lý lỗi và hiển thị toast */
export function handleApiError(error: unknown, fallbackMessage?: string): void {
  const message = fallbackMessage ?? getErrorMessage(error);
  toast.error(message);
  console.error('[API Error]', error);
}

/** Kiểm tra có phải lỗi network không */
export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.code === 0;
}

/** Kiểm tra có phải lỗi 401 không */
export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.code === 401;
}

/** Kiểm tra có phải lỗi 403 không */
export function isForbiddenError(error: unknown): boolean {
  return error instanceof ApiError && error.code === 403;
}
