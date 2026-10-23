import { ApiError, api, httpClient } from './http-client';
import { useAuthStore } from '@/shared/stores/auth-store';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/** Xử lý hàng chờ khi refresh token */
function processQueue(error: unknown, token: string | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  refreshQueue = [];
}

/** Request interceptor: gắn Bearer token và X-Cart-Token */
httpClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  const guestCartToken = typeof localStorage !== 'undefined' ? localStorage.getItem('guest_cart_token') : null;

  // Gắn Authorization header
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Gắn X-Cart-Token cho guest cart/order request (hỗ trợ backend merge giỏ guest vào tài khoản khi đã login)
  const isCartOrOrder = /^\/?(?:carts|orders)/.test(config.url ?? '');
  if (guestCartToken && isCartOrOrder) {
    config.headers['X-Cart-Token'] = guestCartToken;
  }

  return config;
});

/** Response interceptor: lưu guest cart token mới */
httpClient.interceptors.response.use(undefined, async (error: AxiosError | ApiError) => {
    const originalRequest = (error.config ??
      (error instanceof ApiError ? error.config : undefined)) as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error instanceof ApiError ? error.code : error.response?.status;

    // Xử lý 401 - refresh token tự động
    if (status === 401 && originalRequest && !originalRequest._retry) {
      // Bỏ qua các endpoint auth
      const isAuthEndpoint = /\/auth\/(login|register|refresh)/.test(originalRequest.url ?? '');
      if (isAuthEndpoint) return Promise.reject(error);

      if (isRefreshing) {
        // Đang refresh → đưa vào hàng chờ
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return httpClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        if (!refreshToken) throw new Error('No refresh token');

        const res = await api.post<{ accessToken: string; refreshToken: string }>(
          '/auth/refresh',
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = res;

        // Cập nhật store và localStorage
        useAuthStore.getState().setAccessToken(accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh thất bại → logout
        useAuthStore.getState().logout();
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  });
