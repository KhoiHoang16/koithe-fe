import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/shared/libs/env';

/** Custom API Error class */
export class ApiError extends Error {
  constructor(
    public code: number,
    public message: string,
    public details?: unknown,
    public config?: InternalAxiosRequestConfig,
    public response?: AxiosResponse,
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
    const cartToken = response.headers?.['x-cart-token'];
    if (cartToken && typeof localStorage !== 'undefined') {
      localStorage.setItem('guest_cart_token', cartToken);
    }
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
        error.config,
        error.response,
      );
    }
    if (error.request) {
      throw new ApiError(0, 'Không thể kết nối tới server. Vui lòng kiểm tra mạng.');
    }
    throw new ApiError(0, error.message ?? 'Lỗi không xác định');
  },
);

/** Typed helpers trả về đúng dữ liệu đã unwrap (body.data) thay vì AxiosResponse */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    httpClient.get(url, config) as unknown as Promise<T>,
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpClient.post(url, data, config) as unknown as Promise<T>,
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpClient.put(url, data, config) as unknown as Promise<T>,
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpClient.patch(url, data, config) as unknown as Promise<T>,
  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    httpClient.delete(url, config) as unknown as Promise<T>,
};
