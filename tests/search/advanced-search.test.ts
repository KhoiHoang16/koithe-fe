import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateRule,
  evaluateAdvancedFilter,
} from '../../src/shared/components/search/advanced-search-evaluator.ts';
import type { AdvancedSearchFilter } from '../../src/shared/components/search/advanced-search-types.ts';

test('Toán tử so sánh số: >, <, >=, <=, =, !=, BETWEEN', () => {
  // Lớn hơn
  assert.equal(
    evaluateRule(150000, {
      id: '1',
      field: 'tongThanhToan',
      operator: 'GREATER_THAN',
      value: '100000',
    }),
    true,
  );
  assert.equal(
    evaluateRule(50000, {
      id: '1',
      field: 'tongThanhToan',
      operator: 'GREATER_THAN',
      value: '100000',
    }),
    false,
  );

  // Nhỏ hơn
  assert.equal(
    evaluateRule(45000, {
      id: '2',
      field: 'tongThanhToan',
      operator: 'LESS_THAN',
      value: '50000',
    }),
    true,
  );

  // Trong khoảng (BETWEEN)
  assert.equal(
    evaluateRule(75000, {
      id: '3',
      field: 'tongThanhToan',
      operator: 'BETWEEN',
      value: '50000',
      valueTo: '100000',
    }),
    true,
  );
  assert.equal(
    evaluateRule(120000, {
      id: '3',
      field: 'tongThanhToan',
      operator: 'BETWEEN',
      value: '50000',
      valueTo: '100000',
    }),
    false,
  );
});

test('Toán tử chuỗi & Phủ định NOT: CONTAINS, NOT_CONTAINS, isNot', () => {
  // Chứa
  assert.equal(
    evaluateRule('Nguyen Van A', {
      id: '1',
      field: 'khachHangTen',
      operator: 'CONTAINS',
      value: 'Van',
    }),
    true,
  );

  // Không chứa
  assert.equal(
    evaluateRule('Nguyen Van A', {
      id: '2',
      field: 'khachHangTen',
      operator: 'NOT_CONTAINS',
      value: 'Tran',
    }),
    true,
  );

  // Phủ định NOT trên điều kiện
  assert.equal(
    evaluateRule('Nguyen Van A', {
      id: '3',
      field: 'khachHangTen',
      operator: 'CONTAINS',
      value: 'Van',
      isNot: true, // NOT CONTAINS
    }),
    false,
  );
});

test('Quy tắc kết hợp logic AND & OR', () => {
  const item = {
    maDonHang: 'DH-001',
    tongThanhToan: 150000,
    loaiDonHang: 'DELIVERY',
    trangThai: 'COMPLETED',
  };

  // AND: Thỏa mãn cả 2 điều kiện
  const andFilter: AdvancedSearchFilter = {
    combiner: 'AND',
    rules: [
      { id: '1', field: 'tongThanhToan', operator: 'GREATER_THAN', value: '100000' },
      { id: '2', field: 'trangThai', operator: 'EQUALS', value: 'COMPLETED' },
    ],
  };
  assert.equal(evaluateAdvancedFilter(item, andFilter), true);

  // AND thất bại nếu 1 điều kiện sai
  const andFailFilter: AdvancedSearchFilter = {
    combiner: 'AND',
    rules: [
      { id: '1', field: 'tongThanhToan', operator: 'GREATER_THAN', value: '200000' },
      { id: '2', field: 'trangThai', operator: 'EQUALS', value: 'COMPLETED' },
    ],
  };
  assert.equal(evaluateAdvancedFilter(item, andFailFilter), false);

  // OR: Thỏa mãn 1 trong 2 điều kiện
  const orFilter: AdvancedSearchFilter = {
    combiner: 'OR',
    rules: [
      { id: '1', field: 'tongThanhToan', operator: 'GREATER_THAN', value: '200000' }, // false
      { id: '2', field: 'loaiDonHang', operator: 'EQUALS', value: 'DELIVERY' }, // true
    ],
  };
  assert.equal(evaluateAdvancedFilter(item, orFilter), true);
});
