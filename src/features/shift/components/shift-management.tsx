import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { shiftApi, type Shift } from '../api/shift-api';
import { cash, date, control, statusLabel } from '../lib/presentation';
import { canCloseShift, parseCash, shiftPermissions } from '../lib/reconciliation';
import { ShiftSummary, ShiftError } from './shift-summary';
import { ShiftDialog } from './shift-dialog';
import { CloseShiftDialog } from './close-shift-dialog';

function ShiftDetail({ id, userId, close }: { id: number; userId: number; close: () => void }) {
  const query = useQuery({
    queryKey: ['shifts', userId, 'detail', id],
    queryFn: () => shiftApi.detail(id),
    retry: false,
  });
  return (
    <ShiftDialog
      title={`Chi tiết ca #${id}`}
      description="Số liệu ca làm việc do hệ thống ghi nhận."
      close={close}
    >
      {query.isPending ? (
        <p role="status">Đang tải chi tiết ca...</p>
      ) : query.isError ? (
        <ShiftError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <ShiftSummary shift={query.data} />
      )}
    </ShiftDialog>
  );
}

export function ShiftManagement({ userId, role }: { userId: number; role: string }) {
  const permission = shiftPermissions(role);
  const client = useQueryClient();
  const [status, setStatus] = useState('');
  const [opening, setOpening] = useState(false);
  const [amount, setAmount] = useState('');
  const [validation, setValidation] = useState<Error | null>(null);
  const [openedByMeId, setOpenedByMeId] = useState<number | null>(null);
  const [detail, setDetail] = useState<number | null>(null);
  const [closing, setClosing] = useState<number | null>(null);
  const current = useQuery({
    queryKey: ['shifts', userId, 'current'],
    queryFn: shiftApi.current,
    enabled: permission.operate,
    retry: false,
  });
  const list = useQuery({
    queryKey: ['shifts', userId, 'list', status],
    queryFn: () => shiftApi.list(status),
    enabled: permission.manage,
    retry: false,
  });
  // Theo dõi riêng ca vừa mở: /current có thể fallback sang ca khác sau khi ca này đóng.
  const own = useQuery({
    queryKey: ['shifts', userId, 'detail', openedByMeId],
    queryFn: () => shiftApi.detail(openedByMeId!),
    enabled: openedByMeId !== null,
    retry: false,
  });
  const open = useMutation({
    mutationFn: shiftApi.open,
    onSuccess: async (result) => {
      setOpenedByMeId(result.id);
      client.setQueryData(['shifts', userId, 'detail', result.id], result);
      client.setQueryData(['shifts', userId, 'current'], result);
      setOpening(false);
      await client.invalidateQueries({ queryKey: ['shifts', userId] });
      toast.success('Đã mở ca làm việc.');
    },
    onError: () => {
      void client.invalidateQueries({ queryKey: ['shifts', userId] });
    },
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    setValidation(null);
    try {
      const value = parseCash(amount);
      if (permission.operate) open.mutate(value);
    } catch (e) {
      setValidation(e instanceof Error ? e : new Error('Số tiền không hợp lệ.'));
    }
  }
  function startOpen() {
    open.reset();
    setValidation(null);
    setAmount('');
    setOpening(true);
  }
  function finished(result: Shift) {
    client.setQueryData(['shifts', userId, 'detail', result.id], result);
    setClosing(null);
    setDetail(result.id);
  }
  const ownIsOpen = own.data?.trangThai === 'DANG_MO';
  const displayed = ownIsOpen ? own.data : current.data;
  if (!permission.operate) return <p role="alert">Bạn không có quyền quản lý ca làm việc.</p>;
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Ca làm việc & Đối soát tiền mặt</h1>
        <Button
          variant="outline"
          disabled={current.isFetching || list.isFetching || own.isFetching}
          onClick={() => void client.invalidateQueries({ queryKey: ['shifts', userId] })}
        >
          Tải lại số liệu
        </Button>
      </div>
      {current.isPending ? (
        <p role="status">Đang tải ca hiện tại...</p>
      ) : current.isError ? (
        <ShiftError error={current.error} retry={() => void current.refetch()} />
      ) : (
        <section className="space-y-4 rounded-lg border bg-card p-4">
          {!displayed ? (
            <>
              <p className="font-medium">Bạn chưa mở ca làm việc hôm nay</p>
              <Button onClick={startOpen}>Mở ca</Button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">
                {ownIsOpen ? 'Ca của bạn vừa mở' : 'Ca đang mở theo hệ thống'}
              </h2>
              <ShiftSummary shift={displayed} />
              {role === 'CASHIER' && !ownIsOpen && (
                <p className="rounded-md bg-muted p-3 text-sm">
                  Chưa xác định được ca này thuộc tài khoản của bạn. Bạn có thể thử mở ca cho tài
                  khoản hiện tại; nếu đã có ca, hệ thống sẽ báo. Chức năng đóng ca có sẵn từ phiên
                  mở ca tại đây. Nếu ca được mở trước đó hoặc trên POS, cần BE bổ sung thông tin chủ
                  ca để xác minh.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setDetail(displayed.id)}>
                  Xem chi tiết
                </Button>
                <Button
                  disabled={
                    !canCloseShift(role, displayed.trangThai, displayed.id, openedByMeId) ||
                    current.isFetching ||
                    own.isFetching
                  }
                  onClick={() => setClosing(displayed.id)}
                >
                  Đóng ca
                </Button>
                {!ownIsOpen && (
                  <Button variant="outline" onClick={startOpen}>
                    Mở ca cho tài khoản hiện tại
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      )}
      {own.isError && <ShiftError error={own.error} retry={() => void own.refetch()} />}
      {permission.manage && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Danh sách ca làm việc</h2>
          <label className="block max-w-xs">
            Trạng thái
            <select className={control} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="DANG_MO">Đang mở</option>
              <option value="DA_DONG">Đã đóng</option>
            </select>
          </label>
          {list.isPending ? (
            <p role="status">Đang tải danh sách ca...</p>
          ) : list.isError ? (
            <ShiftError error={list.error} retry={() => void list.refetch()} />
          ) : !list.data.length ? (
            <p>Không có ca làm việc phù hợp.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {[
                      'Mã ca',
                      'Bắt đầu',
                      'Kết thúc',
                      'Tiền đầu ca',
                      'Doanh thu',
                      'Trạng thái',
                      'Thao tác',
                    ].map((s) => (
                      <th key={s} className="p-3">
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.data.map((shift) => (
                    <tr key={shift.id} className="border-t">
                      <td className="p-3">#{shift.id}</td>
                      <td className="p-3">{date(shift.thoiGianBatDau)}</td>
                      <td className="p-3">{date(shift.thoiGianKetThuc)}</td>
                      <td className="p-3">{cash(shift.tienDauCa)}</td>
                      <td className="p-3">{cash(shift.tongDoanhThu)}</td>
                      <td className="p-3">{statusLabel(shift.trangThai)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setDetail(shift.id)}>
                            Chi tiết
                          </Button>
                          <Button
                            disabled={
                              !canCloseShift(role, shift.trangThai, shift.id, openedByMeId) ||
                              list.isFetching
                            }
                            onClick={() => setClosing(shift.id)}
                          >
                            Đóng ca
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
      {opening && (
        <ShiftDialog
          title="Mở ca làm việc"
          description="Nhập số tiền mặt đầu ca cho tài khoản đang đăng nhập. Thao tác mở ca sẽ được ghi nhận trên hệ thống dùng chung POS."
          close={() => setOpening(false)}
          busy={open.isPending}
        >
          <form onSubmit={submit} className="space-y-4" noValidate>
            <label className="block">
              Tiền đầu ca (đồng) *
              <input
                className={control}
                autoFocus
                inputMode="numeric"
                value={amount}
                disabled={open.isPending}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setValidation(null);
                  open.reset();
                }}
              />
            </label>
            {validation && <ShiftError error={validation} />}
            {open.isError && <ShiftError error={open.error} />}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={open.isPending}
                onClick={() => setOpening(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={open.isPending}>
                {open.isPending ? 'Đang mở ca...' : 'Xác nhận mở ca'}
              </Button>
            </div>
          </form>
        </ShiftDialog>
      )}
      {detail !== null && (
        <ShiftDetail key={detail} id={detail} userId={userId} close={() => setDetail(null)} />
      )}
      {closing !== null && (
        <CloseShiftDialog
          key={closing}
          id={closing}
          userId={userId}
          role={role}
          openedByMeId={openedByMeId}
          close={() => setClosing(null)}
          completed={finished}
        />
      )}
    </section>
  );
}
