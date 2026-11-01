import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseCash,
  difference,
  differenceLabel,
  canCloseShift,
  shiftPermissions,
} from '../../src/features/shift/lib/reconciliation.ts';

test('tiền bắt buộc, không âm, nguyên và nằm trong giới hạn chính xác', () => {
  assert.equal(parseCash('0'), 0);
  assert.equal(parseCash(' 150000 '), 150000);
  for (const input of [
    '',
    ' ',
    '-1',
    '1.5',
    '1e3',
    'NaN',
    '100,000',
    'Infinity',
    '9007199254740992',
  ])
    assert.throws(() => parseCash(input));
});
test('đối soát đủ khớp/thừa/thiếu, không tự giả định số dự kiến thiếu là 0', () => {
  assert.equal(difference(150000, 150000), 0);
  assert.equal(differenceLabel(difference(150000, 150000)), 'Khớp');
  assert.equal(differenceLabel(difference(160000, 150000)), 'Thừa');
  assert.equal(difference(140000, 150000), -10000);
  assert.equal(differenceLabel(difference(0, 150000)), 'Thiếu');
  assert.equal(difference(0, null), null);
});
test('thu ngân không được xem danh sách toàn hệ thống', () => {
  assert.deepEqual(shiftPermissions('CASHIER'), { manage: false, operate: true });
  assert.deepEqual(shiftPermissions('MANAGER'), { manage: true, operate: true });
  for (const role of ['CUSTOMER', 'BARISTA', undefined])
    assert.deepEqual(shiftPermissions(role), { manage: false, operate: false });
});
test('không cho đóng ca fallback, ca đã đóng hoặc trạng thái không biết', () => {
  assert.equal(canCloseShift('CASHIER', 'DANG_MO', 2, null), false);
  assert.equal(canCloseShift('CASHIER', 'DANG_MO', 2, 1), false);
  assert.equal(canCloseShift('CASHIER', 'DANG_MO', 2, 2), true);
  assert.equal(canCloseShift('ADMIN', 'DANG_MO', 2, null), true);
  for (const status of ['DA_DONG', 'UNKNOWN'])
    assert.equal(canCloseShift('ADMIN', status, 2, 2), false);
  assert.equal(canCloseShift('CUSTOMER', 'DANG_MO', 2, 2), false);
});
