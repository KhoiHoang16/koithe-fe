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
// /current có thể trả ca người khác; chỉ response mở ca trong phiên chứng minh chủ ca.
export function canCloseShift(
  role: string | undefined,
  status: string,
  id: number,
  openedByMeId: number | null,
) {
  const permissions = shiftPermissions(role);
  return status === 'DANG_MO' && permissions.operate && (permissions.manage || openedByMeId === id);
}
