import { httpClient } from './http-client';
import { useAuthStore } from '@/shared/stores/auth-store';

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
  const guestCartToken = localStorage.getItem('guest_cart_token');

  // Gắn Authorization header
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Gắn X-Cart-Token cho guest cart/order request
  const isCartOrOrder = /^\/?(?:carts|orders)/.test(config.url ?? '');
  if (!accessToken && guestCartToken && isCartOrOrder) {
    config.headers['X-Cart-Token'] = guestCartToken;
  }

  return config;
});

/** Response interceptor: lưu guest cart token mới */
httpClient.interceptors.response.use(
  (response) => {
    // Lưu X-Cart-Token mới từ backend (khi tạo giỏ hàng guest)
    const newCartToken = response.headers['x-cart-token'];
    if (newCartToken) {
      localStorage.setItem('guest_cart_token', newCartToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Xử lý 401 - refresh token tự động
    if (error.response?.status === 401 && !originalRequest._retry) {
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
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await httpClient.post<{ accessToken: string; refreshToken: string }>(
          '/auth/refresh',
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = res as unknown as {
          accessToken: string;
          refreshToken: string;
        };

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
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
