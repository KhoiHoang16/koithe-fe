import { z } from 'zod';

const fields = {
  hoVaTen: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(100, 'Họ tên không quá 100 ký tự'),
  email: z.string().trim().email('Email không hợp lệ').or(z.literal('')),
};

export const createCustomerSchema = z.object({
  ...fields,
  soDienThoai: z
    .string()
    .trim()
    .regex(/^0[35789]\d{8}$/, 'Nhập số điện thoại Việt Nam 10 chữ số hợp lệ'),
});

export const updateCustomerSchema = z.object({ ...fields, soDienThoai: z.string() });
export type CustomerFormValues = z.infer<typeof createCustomerSchema>;

export function customerPermissions(role?: string) {
  return {
    read: ['ADMIN', 'MANAGER', 'CASHIER'].includes(role ?? ''),
    create: ['ADMIN', 'MANAGER', 'CASHIER'].includes(role ?? ''),
    update: role === 'ADMIN' || role === 'MANAGER',
    delete: role === 'ADMIN',
  };
}

export function customerId(value?: string): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
