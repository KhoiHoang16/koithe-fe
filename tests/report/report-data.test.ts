import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  presetRange,
  vietnamDate,
  validateRange,
  mapReport,
  type BackendReport,
} from '../../src/features/report/lib/report-data.ts';

test('ngày báo cáo tính theo Việt Nam kể cả thời điểm còn ngày trước ở UTC', () => {
  const now = new Date('2026-10-28T18:00:00Z');
  assert.equal(vietnamDate(now), '2026-10-29');
  assert.deepEqual(presetRange('today', now), { from: '2026-10-29', to: '2026-10-29' });
  assert.deepEqual(presetRange('week', now), { from: '2026-10-23', to: '2026-10-29' });
  assert.deepEqual(presetRange('month', now), { from: '2026-10-01', to: '2026-10-29' });
});
test('7 ngày qua đi đúng qua biên tháng/năm', () => {
  assert.deepEqual(presetRange('week', new Date('2026-01-02T01:00:00Z')), {
    from: '2025-12-27',
    to: '2026-01-02',
  });
});
test('chặn thiếu/ngày sai/ngày ngược, cho phép kỳ một ngày', () => {
  for (const range of [
    { from: '', to: '2026-10-29' },
    { from: '2026-02-30', to: '2026-03-01' },
    { from: '2026-10-30', to: '2026-10-29' },
  ])
    assert.throws(() => validateRange(range));
  assert.deepEqual(validateRange({ from: '2026-10-29', to: '2026-10-29' }), {
    from: '2026-10-29',
    to: '2026-10-29',
  });
});
test('adapter giữ nguyên doanh thu, kênh gộp, thứ hạng biến thể và số 0', () => {
  const data: BackendReport = {
    tuNgay: '2026-10-01',
    denNgay: '2026-10-29',
    tongDoanhThu: 120000,
    tongSoDonHang: 2,
    tongSoLyDaBan: 3,
    doanhThuTheoNgay: [
      { ngay: '2026-10-28', doanhThu: 120000, soDon: 2 },
      { ngay: '2026-10-27', doanhThu: 0, soDon: 0 },
    ],
    doanhThuTheoKenh: [
      { maKenh: 'ONLINE_WEB', tenKenh: 'Website / Quét QR bàn', doanhThu: 120000, soDon: 2 },
    ],
    doanhThuTheoPhuongThuc: [],
    topSanPhamBanChay: [
      { bienTheId: 1, tenSanPham: 'Trà', kichCo: 'M', soLuongDaBan: 3, tongTien: 120000 },
    ],
  };
  const report = mapReport(data);
  assert.equal(report.revenue, 120000);
  assert.equal(report.daily[0].revenue, 0);
  assert.equal(report.daily[1].orders, 2);
  assert.equal(report.channels.length, 1);
  assert.equal(report.channels[0].code, 'ONLINE_WEB');
  assert.deepEqual(report.topProducts[0], {
    id: 1,
    name: 'Trà',
    size: 'M',
    quantity: 3,
    revenue: 120000,
  });
  assert.equal(data.doanhThuTheoNgay[0].ngay, '2026-10-28');
});
