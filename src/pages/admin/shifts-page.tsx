import { ShiftManagement } from '@/features/shift/components/shift-management';
import { useAuthStore } from '@/shared/stores/auth-store';

export function ShiftsPage() {
  const user = useAuthStore((state) => state.user);
  return user ? (
    <ShiftManagement key={`${user.id}-${user.vaiTro}`} userId={user.id} role={user.vaiTro} />
  ) : null;
}
