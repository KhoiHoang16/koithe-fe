import type { Shift } from '../api/shift-api';
import { cash, date, errorMessage, statusLabel } from '../lib/presentation';
import { difference, differenceLabel } from '../lib/reconciliation';
import { Button } from '@/shared/components/ui/button';

export function ShiftError({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div role="alert" className="space-y-2 text-destructive">
      <p>{errorMessage(error)}</p>
      {retry && (
        <Button type="button" variant="outline" onClick={retry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
export function ShiftSummary({ shift }: { shift: Shift }) {
  const delta =
    shift.chenhLech ??
    (shift.trangThai === 'DA_DONG' && shift.tienKetCa !== null
      ? difference(shift.tienKetCa, shift.tienMatDuKien)
      : null);
  const entries = [
    ['Mã ca', `#${shift.id}`],
    ['Trạng thái', statusLabel(shift.trangThai)],
    ['Bắt đầu', date(shift.thoiGianBatDau)],
    ['Kết thúc', date(shift.thoiGianKetThuc)],
    ['Tiền đầu ca', cash(shift.tienDauCa)],
    ['Tổng doanh thu theo hệ thống', cash(shift.tongDoanhThu)],
    ['Số đơn hàng', shift.soDonHang ?? 'Chưa có dữ liệu'],
    ['Tiền mặt dự kiến theo hệ thống', cash(shift.tienMatDuKien)],
    [
      'Tiền thực đếm khi đóng ca',
      shift.trangThai === 'DA_DONG' ? cash(shift.tienKetCa) : 'Chưa đóng ca',
    ],
    [
      'Chênh lệch',
      delta === null
        ? 'Chưa có dữ liệu đối soát'
        : `${differenceLabel(delta)} — ${cash(Math.abs(delta))}`,
    ],
  ];
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {entries.map(([label, value]) => (
        <div key={label}>
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
