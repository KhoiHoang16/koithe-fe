import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLines,
  purchaseTotal,
  canEditPurchase,
  dateBounds,
} from '../../src/features/inventory/lib/purchase.ts';

const row = { key: 1, variantId: '12', quantity: '3', price: '15000' };
test('payload dùng maBienThe, tổng tiền gồm nhiều dòng và chấp nhận giá 0', () => {
  const lines = buildLines([row, { ...row, key: 2, variantId: '13', quantity: '2', price: '0' }]);
  assert.deepEqual(lines[0], { maBienThe: 12, soLuong: 3, donGiaNhap: 15000 });
  assert.equal(purchaseTotal(lines), 45000);
});
test('chặn phiếu rỗng, dòng trùng, thiếu biến thể và số tiền/số lượng không hợp lệ', () => {
  assert.throws(() => buildLines([]));
  assert.throws(() => buildLines([row, row]));
  for (const patch of [
    { variantId: '' },
    { variantId: '-1' },
    { quantity: '' },
    { quantity: '0' },
    { quantity: '1.5' },
    { price: '' },
    { price: '-1' },
    { price: 'Infinity' },
    { price: '1e20' },
  ])
    assert.throws(() => buildLines([{ ...row, ...patch }]));
  assert.throws(() => purchaseTotal([{ soLuong: Number.MAX_SAFE_INTEGER, donGiaNhap: 2 }]));
});
test('chỉ phiếu chờ duyệt được chỉnh sửa, kể cả trạng thái lạ đều khóa', () => {
  assert.equal(canEditPurchase('CHO_DUYET'), true);
  for (const status of ['DA_NHAP_KHO', 'DA_NHAP', 'DA_HUY', '', 'UNKNOWN'])
    assert.equal(canEditPurchase(status), false);
});
test('lọc bao gồm đầu và cuối ngày địa phương, chặn khoảng ngày ngược', () => {
  const result = dateBounds('2026-10-28', '2026-10-28');
  assert.equal(new Date(result.from!).getHours(), 0);
  assert.equal(new Date(result.to!).getHours(), 23);
  assert.equal(new Date(result.to!).getMilliseconds(), 999);
  assert.throws(() => dateBounds('2026-10-29', '2026-10-28'));
  assert.deepEqual(dateBounds('', ''), { from: undefined, to: undefined });
});
