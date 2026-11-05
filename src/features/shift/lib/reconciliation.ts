export function parseCash(input: string): number {
  if (!/^\d+$/.test(input.trim())) throw new Error('Nhập số tiền nguyên không âm (đồng).');
  const value = Number(input.trim());
  if (!Number.isSafeInteger(value)) throw new Error('Số tiền vượt giới hạn cho phép.');
  return value;
}
export function difference(actual: number, expected: number | null): number | null {
  if (expected === null || !Number.isFinite(expected)) return null;
  return actual - expected;
}
export function differenceLabel(value: number | null): string {
  if (value === null) return 'Chưa có dữ liệu đối soát';
  return value === 0 ? 'Khớp' : value > 0 ? 'Thừa' : 'Thiếu';
}
export function shiftPermissions(role: string | undefined) {
  const manage = role === 'ADMIN' || role === 'MANAGER';
  return { manage, operate: manage || role === 'CASHIER' };
}
// Chỉ chủ ca hoặc người có quyền quản lý (ADMIN, MANAGER) mới được đóng ca.
export function canCloseShift(
  role: string | undefined,
  status: string,
  shiftOwnerOrId?: number | null,
  currentUserIdOrOpenedByMeId?: number | null,
) {
  const permissions = shiftPermissions(role);
  if (status !== 'DANG_MO' || !permissions.operate) return false;
  if (permissions.manage) return true;
  return (
    shiftOwnerOrId != null &&
    currentUserIdOrOpenedByMeId != null &&
    shiftOwnerOrId === currentUserIdOrOpenedByMeId
  );
}
