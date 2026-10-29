import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/components/ui/button';
import {
  purchaseOrderApi,
  type PurchaseFilters,
  type PurchaseInput,
} from '../api/purchase-order-api';
import { supplierApi } from '../api/supplier-api';
import { dateBounds, purchaseStatus } from '../lib/purchase';
import { ErrorNotice, Modal, Pager } from './shared';
import { control, money } from '../lib/presentation';
import { PurchaseForm } from './purchase-form';
import { PurchaseDetail } from './purchase-detail';
import { ProductPicker } from './product-picker';

export function InventoryManagement() {
  const user = useAuthStore((s) => s.user);
  const allowed = user?.vaiTro === 'ADMIN' || user?.vaiTro === 'MANAGER';
  const client = useQueryClient();
  const [filters, setFilters] = useState<PurchaseFilters>({ page: 0 });
  const [filterError, setFilterError] = useState<Error | null>(null);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState<number | null>(null);
  const [stock, setStock] = useState(false);
  const query = useQuery({
    queryKey: ['inventory', user?.id, 'purchases', filters],
    queryFn: () => purchaseOrderApi.list(filters),
    enabled: allowed,
    retry: false,
  });
  const suppliers = useQuery({
    queryKey: ['inventory', user?.id, 'supplier-options'],
    queryFn: supplierApi.options,
    enabled: allowed,
    retry: false,
  });
  const create = useMutation({
    mutationFn: (input: PurchaseInput) => purchaseOrderApi.create(input),
    onSuccess: async (order) => {
      setCreating(false);
      setDetail(order.id);
      setFilters((f) => ({ ...f, page: 0 }));
      await client.invalidateQueries({ queryKey: ['inventory', user?.id, 'purchases'] });
      toast.success('Đã tạo phiếu chờ duyệt.');
    },
  });
  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilterError(null);
    try {
      const data = new FormData(event.currentTarget);
      setFilters({
        page: 0,
        supplierId: Number(data.get('supplier')) || undefined,
        trangThai: String(data.get('status')) || undefined,
        ...dateBounds(String(data.get('from')), String(data.get('to'))),
      });
    } catch (e) {
      setFilterError(e instanceof Error ? e : new Error('Bộ lọc không hợp lệ.'));
    }
  }
  if (!allowed) return <p role="alert">Bạn không có quyền quản lý nhập hàng.</p>;
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Phiếu nhập hàng & Tồn kho</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStock(!stock)}>
            {stock ? 'Ẩn tồn kho' : 'Xem tồn kho'}
          </Button>
          <Button
            onClick={() => {
              create.reset();
              setCreating(true);
            }}
          >
            Tạo phiếu nhập
          </Button>
        </div>
      </div>
      {stock && (
        <section className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="font-semibold">Tồn kho theo biến thể sản phẩm</h2>
          <ProductPicker scope={user?.id} stock />
        </section>
      )}
      <form
        onSubmit={filter}
        className="grid items-end gap-3 rounded-lg border bg-card p-4 md:grid-cols-5"
      >
        <label>
          Nhà cung cấp
          <select name="supplier" className={control} defaultValue="">
            <option value="">Tất cả</option>
            {suppliers.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.tenNhaCungCap}
              </option>
            ))}
          </select>
        </label>
        <label>
          Từ ngày
          <input type="date" name="from" className={control} />
        </label>
        <label>
          Đến ngày
          <input type="date" name="to" className={control} />
        </label>
        <label>
          Trạng thái
          <select name="status" className={control} defaultValue="">
            <option value="">Tất cả</option>
            <option value="CHO_DUYET">Chờ duyệt</option>
            <option value="DA_NHAP_KHO">Đã nhập kho</option>
            <option value="DA_HUY">Đã hủy</option>
          </select>
        </label>
        <Button type="submit">Lọc phiếu</Button>
      </form>
      {suppliers.isPending && <p role="status">Đang tải bộ lọc nhà cung cấp...</p>}
      {suppliers.isError && (
        <ErrorNotice error={suppliers.error} retry={() => void suppliers.refetch()} />
      )}
      {filterError && <ErrorNotice error={filterError} />}
      {query.isPending ? (
        <p role="status">Đang tải phiếu nhập...</p>
      ) : query.isError ? (
        <ErrorNotice error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          {!query.data.content.length ? (
            <p>Không có phiếu nhập phù hợp.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {['Mã phiếu', 'Ngày nhập', 'Tổng tiền', 'Trạng thái', 'Thao tác'].map((s) => (
                      <th key={s} className="p-3">
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {query.data.content.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="p-3 font-medium">{order.maPhieuNhap}</td>
                      <td className="p-3">{new Date(order.ngayNhap).toLocaleString('vi-VN')}</td>
                      <td className="p-3">{money(order.tongTien)}</td>
                      <td className="p-3">{purchaseStatus(order.trangThai)}</td>
                      <td className="p-3">
                        <Button variant="outline" onClick={() => setDetail(order.id)}>
                          Xem chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pager
            page={filters.page}
            total={query.data.totalPages}
            pending={query.isFetching}
            change={(page) => setFilters((f) => ({ ...f, page }))}
          />
        </>
      )}
      {creating && (
        <Modal
          title="Tạo phiếu nhập hàng"
          description="Chọn nhà cung cấp và các biến thể cần nhập. Tạo phiếu chưa làm tăng tồn kho."
          close={() => setCreating(false)}
          busy={create.isPending}
        >
          <PurchaseForm
            scope={user?.id}
            pending={create.isPending}
            error={create.error}
            save={(input) => {
              if (allowed) create.mutate(input);
            }}
          />
        </Modal>
      )}
      {detail !== null && (
        <PurchaseDetail key={detail} id={detail} scope={user?.id} close={() => setDetail(null)} />
      )}
    </section>
  );
}
