import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth-store';
import { customerApi, customerKeys } from '../api/customer-api';
import { customerPermissions } from '../schema/customer-form';

export function useCustomers(phone: string) {
  const user = useAuthStore((state) => state.user);
  const [debouncedPhone, setDebouncedPhone] = useState(phone.trim());
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPhone(phone.trim()), 300);
    return () => clearTimeout(timer);
  }, [phone]);
  const query = useQuery({
    queryKey: customerKeys.list(user?.id, debouncedPhone),
    queryFn: () => customerApi.getAll(debouncedPhone),
    enabled: customerPermissions(user?.vaiTro).read,
    retry: false,
  });
  return { ...query, isDebouncing: phone.trim() !== debouncedPhone };
}
