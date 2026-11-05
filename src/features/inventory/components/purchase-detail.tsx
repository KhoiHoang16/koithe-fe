import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
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
  inline = false,
}: {
  id: number;
  scope: number | undefined;
  close: () => void;
  inline?: boolean;
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

  const content = detail.isPending ? (
    <p role="status" className="text-sm text-muted-foreground p-2">
      Đang tải phiếu...
    </p>
  ) : detail.isError ? (
    <ErrorNotice error={detail.error} retry={() => void detail.refetch()} />
  ) : (
    order && (
      <div className="space-y-4 text-xs sm:text-sm">
        <dl className="grid gap-3 sm:grid-cols-2 bg-muted/40 p-3 rounded-xl">
          <div>
            <dt className="text-xs text-muted-foreground">Mã phiếu</dt>
            <dd className="font-mono font-bold text-primary mt-0.5">{order.maPhieuNhap}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Trạng thái</dt>
            <dd className="font-semibold mt-0.5">{purchaseStatus(order.trangThai)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Ngày nhập</dt>
            <dd className="mt-0.5">{new Date(order.ngayNhap).toLocaleString('vi-VN')}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Tổng tiền</dt>
            <dd className="font-bold text-foreground mt-0.5">{money(order.tongTien)}</dd>
          </div>
        </dl>
        {lines.isPending ? (
          <p role="status" className="text-xs text-muted-foreground">
            Đang tải mặt hàng...
          </p>
        ) : lines.isError ? (
          <ErrorNotice error={lines.error} retry={() => void lines.refetch()} />
        ) : (
          <>
            {!lines.data.content.length ? (
              <p className="text-xs text-muted-foreground">Phiếu chưa có mặt hàng.</p>
            ) : (
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 border-b text-muted-foreground">
                    <tr>
                      {['Mặt hàng', 'Đơn vị', 'SL', 'Đơn giá', 'Thành tiền'].map((s) => (
                        <th className="p-2 font-semibold" key={s}>
                          {s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {lines.data.content.map((line) => (
                      <tr key={line.id}>
                        <td className="p-2 font-medium">{line.tenMatHang}</td>
                        <td className="p-2">{line.donViTinh}</td>
                        <td className="p-2 font-bold">{line.soLuong}</td>
                        <td className="p-2">{money(line.donGiaNhap)}</td>
                        <td className="p-2 font-semibold">{money(line.thanhTien)}</td>
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
          <label className="block text-xs font-medium">
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button type="submit" size="sm" variant="outline" disabled={!editable || pending}>
              Lưu ghi chú
            </Button>
            <Button
              size="sm"
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
          </div>
        </form>
        {!canEditPurchase(order.trangThai) && (
          <p className="text-xs text-muted-foreground italic">Phiếu đã khóa chỉnh sửa.</p>
        )}
        {edit.isError && <ErrorNotice error={edit.error} />}
        {approve.isError && <ErrorNotice error={approve.error} />}
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
  );

  if (inline) {
    return (
      <Card className="border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">Chi tiết phiếu nhập (CTPN)</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            onClick={close}
            title="Đóng chi tiết"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">{content}</div>
      </Card>
    );
  }

  return (
    <Modal
      title="Chi tiết phiếu nhập"
      description="Thông tin phiếu và các mặt hàng từ hệ thống."
      close={close}
      busy={pending}
    >
      {content}
    </Modal>
  );
}
