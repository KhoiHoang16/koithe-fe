import { useRef, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { supplierApi } from '../api/supplier-api';
import type { PurchaseInput } from '../api/purchase-order-api';
import { buildLines, purchaseTotal, type DraftLine } from '../lib/purchase';
import { ProductPicker } from './product-picker';
import { ErrorNotice } from './shared';
import { control, money } from '../lib/presentation';

export function PurchaseForm({
  scope,
  pending,
  error,
  save,
}: {
  scope: number | undefined;
  pending: boolean;
  error: unknown;
  save: (input: PurchaseInput) => void;
}) {
  const nextKey = useRef(1);
  const [rows, setRows] = useState<DraftLine[]>([
    { key: 0, variantId: '', quantity: '1', price: '' },
  ]);
  const [validation, setValidation] = useState<Error | null>(null);
  const suppliers = useQuery({
    queryKey: ['inventory', scope, 'supplier-options'],
    queryFn: supplierApi.options,
    retry: false,
  });
  function change(key: number, patch: Partial<DraftLine>) {
    setRows((items) => items.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    setValidation(null);
  }
  let total: number | null = null;
  try {
    total = purchaseTotal(buildLines(rows));
  } catch {
    /* Tổng chỉ hiển thị khi các dòng hợp lệ. */
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidation(null);
    try {
      const data = new FormData(event.currentTarget);
      const supplierId = Number(data.get('supplier'));
      if (!suppliers.data?.some((s) => s.id === supplierId && s.dangHopTac))
        throw new Error('Cần chọn nhà cung cấp đang hợp tác.');
      const chiTiet = buildLines(rows);
      save({
        maNhaCungCap: supplierId,
        maPhieuNhap: String(data.get('code') ?? '').trim(),
        ghiChu: String(data.get('note') ?? '').trim(),
        chiTiet,
        tongTien: purchaseTotal(chiTiet),
      });
    } catch (e) {
      setValidation(e instanceof Error ? e : new Error('Dữ liệu chưa hợp lệ.'));
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={pending} className="space-y-4">
        <label className="block">
          Mã phiếu
          <input
            name="code"
            maxLength={50}
            className={control}
            placeholder="Để trống để hệ thống tự sinh"
          />
        </label>
        {suppliers.isPending ? (
          <p role="status">Đang tải nhà cung cấp...</p>
        ) : suppliers.isError ? (
          <ErrorNotice error={suppliers.error} retry={() => void suppliers.refetch()} />
        ) : (
          <>
            <label className="block">
              Nhà cung cấp *
              <select required name="supplier" defaultValue="" className={control}>
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.data
                  .filter((s) => s.dangHopTac)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.tenNhaCungCap}
                    </option>
                  ))}
              </select>
            </label>
            {!suppliers.data.some((s) => s.dangHopTac) && (
              <p>Cần thêm nhà cung cấp đang hợp tác trước khi tạo phiếu.</p>
            )}
          </>
        )}
        {rows.map((row, index) => (
          <div className="space-y-3 rounded-lg border p-4" key={row.key}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Mặt hàng {index + 1}</h3>
              <Button
                type="button"
                variant="outline"
                disabled={rows.length === 1}
                onClick={() => {
                  setRows((items) => items.filter((r) => r.key !== row.key));
                  setValidation(null);
                }}
              >
                Bỏ dòng
              </Button>
            </div>
            <ProductPicker scope={scope} choose={(variantId) => change(row.key, { variantId })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                Số lượng *
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  className={control}
                  value={row.quantity}
                  onChange={(e) => change(row.key, { quantity: e.target.value })}
                />
              </label>
              <label>
                Đơn giá nhập (đồng) *
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  className={control}
                  value={row.price}
                  onChange={(e) => change(row.key, { price: e.target.value })}
                />
              </label>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setRows((items) => [
              ...items,
              { key: nextKey.current++, variantId: '', quantity: '1', price: '' },
            ])
          }
        >
          Thêm dòng sản phẩm
        </Button>
        <label className="block">
          Ghi chú
          <textarea name="note" maxLength={2000} className={control} />
        </label>
        <p className="font-semibold">
          Tổng tiền: {total === null ? 'Nhập đầy đủ mặt hàng để tính tổng' : money(total)}
        </p>
      </fieldset>
      {!!(validation || error) && <ErrorNotice error={validation || error} />}
      <Button type="submit" disabled={pending || !suppliers.data?.some((s) => s.dangHopTac)}>
        {pending ? 'Đang tạo...' : 'Tạo phiếu chờ duyệt'}
      </Button>
    </form>
  );
}
