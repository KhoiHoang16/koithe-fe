import axios, { AxiosError, type AxiosInstance } from 'axios';
import { env } from '@/shared/libs/env';

/** Custom API Error class */
export class ApiError extends Error {
  constructor(
    public code: number,
    public message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Axios instance chính */
export const httpClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/** Response interceptor: unwrap data, xử lý lỗi */
httpClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    // Backend trả về { code, message, data, timestamp }
    if (body?.code !== undefined && body.code >= 400) {
      throw new ApiError(body.code, body.message, body.data);
    }
    return body?.data !== undefined ? body.data : body;
  },
  (error: AxiosError) => {
    if (error.response) {
      const body = error.response.data as Record<string, unknown>;
      throw new ApiError(
        (body?.code as number) ?? error.response.status,
        (body?.message as string) ?? error.message,
        body?.data,
      );
    }
    if (error.request) {
      throw new ApiError(0, 'Không thể kết nối tới server. Vui lòng kiểm tra mạng.');
    }
    throw new ApiError(0, error.message ?? 'Lỗi không xác định');
  },
);
