import { z } from 'zod';

const envSchema = z.object({
  VITE_BACKEND_URL: z.string().url().optional(),
  VITE_API_BASE_URL: z.string().url().or(z.string().startsWith('/')),
  VITE_ENABLE_QUERY_DEVTOOLS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  VITE_APP_NAME: z.string().default('MilkTea'),
  VITE_PAYMENT_QR_TIMEOUT: z.coerce.number().default(900),
  VITE_PAYMENT_POLLING_INTERVAL: z.coerce.number().default(3000),
  VITE_VNPAY_RETURN_URL: z.string().url(),
  VITE_MOMO_RETURN_URL: z.string().url(),
});

export const env = envSchema.parse({
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_ENABLE_QUERY_DEVTOOLS: import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_PAYMENT_QR_TIMEOUT: import.meta.env.VITE_PAYMENT_QR_TIMEOUT,
  VITE_PAYMENT_POLLING_INTERVAL: import.meta.env.VITE_PAYMENT_POLLING_INTERVAL,
  VITE_VNPAY_RETURN_URL: import.meta.env.VITE_VNPAY_RETURN_URL,
  VITE_MOMO_RETURN_URL: import.meta.env.VITE_MOMO_RETURN_URL,
});
