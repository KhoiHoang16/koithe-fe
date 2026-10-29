import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import type { ManagedCustomer } from '../api/customer-api';
import {
  createCustomerSchema,
  updateCustomerSchema,
  type CustomerFormValues,
} from '../schema/customer-form';

export function CustomerForm({
  customer,
  pending,
  error,
  onSave,
  onCancel,
}: {
  customer: ManagedCustomer | null;
  pending: boolean;
  error: string | null;
  onSave: (values: CustomerFormValues) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customer ? updateCustomerSchema : createCustomerSchema),
    defaultValues: {
      hoVaTen: customer?.hoVaTen ?? '',
      soDienThoai: customer?.soDienThoai ?? '',
      email: customer?.email ?? '',
    },
  });
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4" noValidate>
      <fieldset disabled={pending} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-name">Họ và tên *</Label>
          <Input
            id="customer-name"
            autoFocus
            maxLength={100}
            {...register('hoVaTen')}
            aria-invalid={!!errors.hoVaTen}
            aria-describedby={errors.hoVaTen ? 'customer-name-error' : undefined}
          />
          {errors.hoVaTen && (
            <p id="customer-name-error" className="text-sm text-destructive">
              {errors.hoVaTen.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-phone">Số điện thoại *</Label>
          <Input
            id="customer-phone"
            type="tel"
            readOnly={!!customer}
            {...register('soDienThoai')}
            aria-invalid={!!errors.soDienThoai}
            aria-describedby={
              customer
                ? 'customer-phone-note'
                : errors.soDienThoai
                  ? 'customer-phone-error'
                  : undefined
            }
          />
          {customer && (
            <p id="customer-phone-note" className="text-xs text-muted-foreground">
              Số điện thoại không thể thay đổi tại đây.
            </p>
          )}
          {errors.soDienThoai && (
            <p id="customer-phone-error" className="text-sm text-destructive">
              {errors.soDienThoai.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            type="email"
            {...register('email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'customer-email-error' : undefined}
          />
          {errors.email && (
            <p id="customer-email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" isLoading={pending}>
          {customer ? 'Lưu thay đổi' : 'Thêm khách hàng'}
        </Button>
      </div>
    </form>
  );
}
