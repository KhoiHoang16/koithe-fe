import { test } from 'node:test';
import {
  sameProgram,
  editedProgramDates,
} from '../../src/features/promotions/lib/admin-promotion.ts';
import assert from 'node:assert/strict';
import {
  validateVoucher,
  programDates,
  programStatus,
  localVietnamTime,
  promotionPermissions,
  type VoucherInput,
  type PromotionProgram,
} from '../../src/features/promotions/lib/admin-promotion.ts';

const input: VoucherInput = {
  maChuongTrinh: 1,
  maCode: ' test08 ',
  loaiGiamGia: 'PHAN_TRAM',
  giaTriGiam: 10,
  donHangToiThieu: 0,
  mucGiamToiDa: null,
  gioiHanSuDung: 100,
};
test('chuẩn hóa mã và giữ mức giảm 100%, tiền cố định, giới hạn trống', () => {
  assert.equal(validateVoucher(input).maCode, 'TEST08');
  assert.equal(validateVoucher({ ...input, giaTriGiam: 100 }).giaTriGiam, 100);
  assert.equal(
    validateVoucher({
      ...input,
      loaiGiamGia: 'TIEN_CO_DINH',
      giaTriGiam: 10000,
      gioiHanSuDung: null,
    }).gioiHanSuDung,
    null,
  );
});
test('chặn phần trăm >100, tiền âm, số lượng sai, mã rỗng và thiếu chương trình', () => {
  for (const patch of [
    { giaTriGiam: 101 },
    { giaTriGiam: 0 },
    { giaTriGiam: Infinity },
    { maCode: ' ' },
    { maChuongTrinh: 0 },
    { donHangToiThieu: -1 },
    { mucGiamToiDa: -1 },
    { gioiHanSuDung: 0 },
    { gioiHanSuDung: 1.5 },
    { gioiHanSuDung: 2147483648 },
  ])
    assert.throws(() => validateVoucher({ ...input, ...patch }));
});
test('ngày kết thúc sau ngày bắt đầu, chuyển giờ VN sang Instant, chặn ngày sai', () => {
  assert.deepEqual(programDates('2026-10-29T10:00', '2026-10-29T11:00'), {
    ngayBatDau: '2026-10-29T03:00:00.000Z',
    ngayKetThuc: '2026-10-29T04:00:00.000Z',
  });
  assert.equal(localVietnamTime('2026-10-29T03:00:00Z'), '2026-10-29T10:00');
  for (const end of ['2026-10-29T10:00', '2026-10-29T09:00', '', '2026-02-30T10:00'])
    assert.throws(() => programDates('2026-10-29T10:00', end));
});
test('trạng thái không suy đoán khi thiếu chương trình, có đủ trước/trong/sau/tạm ngưng', () => {
  const program: PromotionProgram = {
    id: 1,
    tenChuongTrinh: 'Test',
    moTa: null,
    ngayBatDau: '2026-10-29T03:00:00Z',
    ngayKetThuc: '2026-10-29T04:00:00Z',
    dangHoatDong: true,
  };
  assert.equal(programStatus(program, Date.parse('2026-10-29T02:00:00Z')), 'Sắp diễn ra');
  assert.equal(programStatus(program, Date.parse('2026-10-29T03:30:00Z')), 'Đang diễn ra');
  assert.equal(programStatus(program, Date.parse('2026-10-29T05:00:00Z')), 'Hết hạn');
  assert.equal(programStatus({ ...program, dangHoatDong: false }), 'Tạm ngưng');
  assert.equal(programStatus(undefined), 'Chưa có thông tin chương trình');
});
test('sửa chương trình giữ chính xác giây và giờ Việt Nam của thời hạn cũ', () => {
  const start = '2026-01-01T00:00:00Z';
  const end = '2026-12-31T16:59:59Z';
  const edited = programDates(localVietnamTime(start, true), localVietnamTime(end, true));
  assert.equal(Date.parse(edited.ngayBatDau), Date.parse(start));
  assert.equal(Date.parse(edited.ngayKetThuc), Date.parse(end));
});
test('phát hiện dữ liệu chương trình cũ và giữ mili giây khi chỉ sửa tên', () => {
  const original: PromotionProgram = {
    id: 5,
    tenChuongTrinh: 'Test',
    moTa: null,
    ngayBatDau: '2026-10-29T03:00:00.123Z',
    ngayKetThuc: '2026-10-30T03:00:00.456Z',
    dangHoatDong: false,
  };
  assert.equal(sameProgram(original, { ...original }), true);
  for (const changed of [
    { tenChuongTrinh: 'Changed' },
    { dangHoatDong: true },
    { moTa: 'Updated' },
    { ngayKetThuc: '2026-11-01T03:00:00Z' },
  ])
    assert.equal(sameProgram(original, { ...original, ...changed }), false);
  assert.deepEqual(
    editedProgramDates(
      localVietnamTime(original.ngayBatDau, true),
      localVietnamTime(original.ngayKetThuc, true),
      original,
    ),
    { ngayBatDau: original.ngayBatDau, ngayKetThuc: original.ngayKetThuc },
  );
});
test('MANAGER thêm/sửa, chỉ ADMIN xóa, CASHIER không quản lý', () => {
  assert.deepEqual(promotionPermissions('ADMIN'), { write: true, remove: true });
  assert.deepEqual(promotionPermissions('MANAGER'), { write: true, remove: false });
  for (const role of ['CASHIER', 'CUSTOMER', 'BARISTA', undefined])
    assert.deepEqual(promotionPermissions(role), { write: false, remove: false });
});
