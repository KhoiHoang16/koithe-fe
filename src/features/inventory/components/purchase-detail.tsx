import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/shared/components/ui/alert-dialog';
import { purchaseOrderApi, type PurchaseOrder } from '../api/purchase-order-api';
import { canEditPurchase, purchaseStatus } from '../lib/purchase';
import { ErrorNotice, Modal, Pager } from './shared';
import { control, money } from '../lib/presentation';

export function PurchaseDetail({
  id,
  scope,
  close,
}: {
  id: number;
  scope: number | undefined;
  close: () => void;
}) {
  const client = useQueryClient();
  const [page, setPage] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const detail = useQuery({
    queryKey: ['inventory', scope, 'purchase', id],
    queryFn: () => purchaseOrderApi.detail(id),
    retry: false,
  });
  const lines = useQuery({
    queryKey: ['inventory', scope, 'purchase-lines', id, page],
    queryFn: () => purchaseOrderApi.lines(id, page),
    retry: false,
  });
  async function updated(order: PurchaseOrder) {
    client.setQueryData(['inventory', scope, 'purchase', id], order);
    await client.invalidateQueries({ queryKey: ['inventory', scope] });
  }
  const approve = useMutation({
    mutationFn: () => purchaseOrderApi.approve(id),
    onSuccess: async (order) => {
      setConfirm(false);
      await updated(order);
      toast.success('Đã duyệt phiếu nhập.');
    },
    onError: () => {
      void client.invalidateQueries({ queryKey: ['inventory', scope] });
    },
  });
  const edit = useMutation({
    mutationFn: (note: string) => purchaseOrderApi.updateNote(id, note),
    onSuccess: async (order) => {
      await updated(order);
      toast.success('Đã lưu ghi chú.');
    },
    onError: () => {
      void client.invalidateQueries({ queryKey: ['inventory', scope, 'purchase', id] });
    },
  });
  const pending = approve.isPending || edit.isPending;
  const order = detail.data;
  const editable = !!order && canEditPurchase(order.trangThai) && !detail.isFetching;
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editable) edit.mutate(String(new FormData(event.currentTarget).get('note') ?? '').trim());
  }
  return (
    <Modal
      title="Chi tiết phiếu nhập"
      description="Thông tin phiếu và các mặt hàng từ hệ thống."
      close={close}
      busy={pending}
    >
      {detail.isPending ? (
        <p role="status">Đang tải phiếu...</p>
      ) : detail.isError ? (
        <ErrorNotice error={detail.error} retry={() => void detail.refetch()} />
      ) : (
        order && (
          <div className="space-y-4">
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt>Mã phiếu</dt>
                <dd className="font-semibold">{order.maPhieuNhap}</dd>
              </div>
              <div>
                <dt>Trạng thái</dt>
                <dd>{purchaseStatus(order.trangThai)}</dd>
              </div>
              <div>
                <dt>Ngày nhập</dt>
                <dd>{new Date(order.ngayNhap).toLocaleString('vi-VN')}</dd>
              </div>
              <div>
                <dt>Tổng tiền</dt>
                <dd>{money(order.tongTien)}</dd>
              </div>
            </dl>
            {lines.isPending ? (
              <p role="status">Đang tải mặt hàng...</p>
            ) : lines.isError ? (
              <ErrorNotice error={lines.error} retry={() => void lines.refetch()} />
            ) : (
              <>
                {!lines.data.content.length ? (
                  <p>Phiếu chưa có mặt hàng.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr>
                          {['Mặt hàng', 'Đơn vị', 'Số lượng', 'Đơn giá', 'Thành tiền'].map((s) => (
                            <th className="p-2" key={s}>
                              {s}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lines.data.content.map((line) => (
                          <tr key={line.id} className="border-t">
                            <td className="p-2">{line.tenMatHang}</td>
                            <td>{line.donViTinh}</td>
                            <td>{line.soLuong}</td>
                            <td>{money(line.donGiaNhap)}</td>
                            <td>{money(line.thanhTien)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <Pager
                  page={page}
                  total={lines.data.totalPages}
                  pending={lines.isFetching}
                  change={setPage}
                />
              </>
            )}
            <form onSubmit={save} className="space-y-2">
              <label className="block">
                Ghi chú
                <textarea
                  key={`${order.id}-${order.ghiChu}`}
                  name="note"
                  defaultValue={order.ghiChu ?? ''}
                  className={control}
                  maxLength={2000}
                  readOnly={!editable || pending}
                />
              </label>
              <Button type="submit" variant="outline" disabled={!editable || pending}>
                Lưu ghi chú
              </Button>
            </form>
            {!canEditPurchase(order.trangThai) && <p>Phiếu đã khóa chỉnh sửa.</p>}
            {edit.isError && <ErrorNotice error={edit.error} />}
            {approve.isError && <ErrorNotice error={approve.error} />}
            <Button
              disabled={
                !editable ||
                pending ||
                !lines.data?.totalElements ||
                lines.isError ||
                lines.isFetching
              }
              onClick={() => {
                approve.reset();
                setConfirm(true);
              }}
            >
              Duyệt phiếu nhập
            </Button>
            <AlertDialog
              open={confirm}
              onOpenChange={(open) => {
                if (!pending) setConfirm(open);
              }}
            >
              <AlertDialogContent>
                <AlertDialogTitle>Xác nhận duyệt phiếu</AlertDialogTitle>
                <AlertDialogDescription>
                  Duyệt phiếu {order.maPhieuNhap}? Hệ thống sẽ cộng số lượng mặt hàng vào tồn kho.
                  Sau duyệt, phiếu không thể chỉnh sửa.
                </AlertDialogDescription>
                {approve.isError && <ErrorNotice error={approve.error} />}
                <div className="flex gap-2">
                  <Button
                    disabled={!editable || pending}
                    onClick={() => {
                      if (editable) approve.mutate();
                    }}
                  >
                    {approve.isPending ? 'Đang duyệt...' : 'Xác nhận duyệt'}
                  </Button>
                  <Button variant="outline" disabled={pending} onClick={() => setConfirm(false)}>
                    Hủy
                  </Button>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      )}
    </Modal>
  );
}
