import { useState, useEffect, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar, Eye, FileText, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { shiftApi, type Shift } from '../api/shift-api';
import { cash, date, control, statusLabel } from '../lib/presentation';
import { canCloseShift, parseCash, shiftPermissions } from '../lib/reconciliation';
import { ShiftSummary, ShiftError } from './shift-summary';
import { ShiftDialog } from './shift-dialog';
import { CloseShiftDialog } from './close-shift-dialog';

function ShiftDetailSubform({
  id,
  userId,
  role,
  openedByMeId,
  onCloseShift,
  close,
}: {
  id: number;
  userId: number;
  role: string;
  openedByMeId: number | null;
  onCloseShift: (shiftId: number) => void;
  close: () => void;
}) {
  const query = useQuery({
    queryKey: ['shifts', userId, 'detail', id],
    queryFn: () => shiftApi.detail(id),
    retry: false,
  });

  const shift = query.data;

  return (
    <Card className="border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold">Chi tiết ca & Đối soát (#{id})</h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={close}
          title="Đóng chi tiết"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 space-y-4">
        {query.isPending ? (
          <p role="status" className="text-sm text-muted-foreground">
            Đang tải chi tiết ca...
          </p>
        ) : query.isError ? (
          <ShiftError error={query.error} retry={() => void query.refetch()} />
        ) : (
          shift && (
            <>
              <ShiftSummary shift={shift} />
              <div className="flex justify-end pt-2 border-t">
                <Button
                  size="sm"
                  disabled={
                    !canCloseShift(
                      role,
                      shift.trangThai,
                      shift.maThuNgan ?? shift.id,
                      userId ?? openedByMeId,
                    ) || query.isFetching
                  }
                  onClick={() => onCloseShift(shift.id)}
                >
                  Đóng ca này
                </Button>
              </div>
            </>
          )
        )}
      </div>
    </Card>
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

  useEffect(() => {
    const items = list.data ?? [];
    if (items.length === 0) return;
    if (detail === null || !items.some((s) => s.id === detail)) {
      setDetail(items[0].id);
    }
  }, [list.data, detail]);

  const open = useMutation({
    mutationFn: shiftApi.open,
    onSuccess: async (result) => {
      setOpenedByMeId(result.id);
      setDetail(result.id);
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
  const isOwnShift = ownIsOpen || (displayed?.maThuNgan != null && displayed.maThuNgan === userId);

  if (!permission.operate) return <p role="alert">Bạn không có quyền quản lý ca làm việc.</p>;

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ca làm việc & Đối soát tiền mặt</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chọn ca làm việc ở danh sách bên trái để xem chi tiết đối soát tiền mặt ở sub-form bên phải
          </p>
        </div>
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
              {role === 'CASHIER' && !isOwnShift && (
                <p className="rounded-md bg-muted p-3 text-sm">
                  Chưa xác định được ca này thuộc tài khoản của bạn. Bạn có thể thử mở ca cho tài
                  khoản hiện tại; nếu đã có ca, hệ thống sẽ báo. Chức năng đóng ca có sẵn từ phiên
                  mở ca tại đây.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setDetail(displayed.id)}>
                  Xem chi tiết ở Sub-form
                </Button>
                <Button
                  disabled={
                    !canCloseShift(
                      role,
                      displayed.trangThai,
                      displayed.maThuNgan ?? displayed.id,
                      userId ?? openedByMeId,
                    ) ||
                    current.isFetching ||
                    own.isFetching
                  }
                  onClick={() => setClosing(displayed.id)}
                >
                  Đóng ca
                </Button>
                {!isOwnShift && (
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

      {permission.manage ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <label className="block max-w-xs text-sm font-medium">
              Lọc theo trạng thái
              <select
                className={control}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="DANG_MO">Đang mở</option>
                <option value="DA_DONG">Đã đóng</option>
              </select>
            </label>
          </div>

          {list.isPending ? (
            <p role="status">Đang tải danh sách ca...</p>
          ) : list.isError ? (
            <ShiftError error={list.error} retry={() => void list.refetch()} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: Danh sách ca làm việc */}
              <Card className="lg:col-span-7 overflow-hidden border">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold">Danh sách ca làm việc (DSCa)</h2>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {list.data.length} ca
                  </Badge>
                </div>

                {!list.data.length ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    Không có ca làm việc phù hợp.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-muted/50 border-b text-muted-foreground">
                        <tr>
                          {[
                            'Mã ca',
                            'Bắt đầu',
                            'Tiền đầu ca',
                            'Doanh thu',
                            'Trạng thái',
                            'Thao tác',
                          ].map((s) => (
                            <th key={s} className="p-3 font-medium">
                              {s}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {list.data.map((shift) => {
                          const isSelected = shift.id === detail;
                          return (
                            <tr
                              key={shift.id}
                              onClick={() => setDetail(shift.id)}
                              className={`border-t cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-primary/10 hover:bg-primary/15'
                                  : 'hover:bg-muted/20'
                              }`}
                            >
                              <td className="p-3 font-mono font-bold text-primary">
                                <div className="flex items-center gap-1.5">
                                  {isSelected && (
                                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                  )}
                                  <span>#{shift.id}</span>
                                </div>
                              </td>
                              <td className="p-3">{date(shift.thoiGianBatDau)}</td>
                              <td className="p-3">{cash(shift.tienDauCa)}</td>
                              <td className="p-3 font-semibold">{cash(shift.tongDoanhThu)}</td>
                              <td className="p-3">{statusLabel(shift.trangThai)}</td>
                              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                <div className="flex gap-1.5">
                                  <Button
                                    size="sm"
                                    variant={isSelected ? 'default' : 'outline'}
                                    className="h-7 text-xs gap-1"
                                    onClick={() => setDetail(shift.id)}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    Xem
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs"
                                    disabled={
                                      !canCloseShift(
                                        role,
                                        shift.trangThai,
                                        shift.maThuNgan ?? shift.id,
                                        userId ?? openedByMeId,
                                      ) || list.isFetching
                                    }
                                    onClick={() => setClosing(shift.id)}
                                  >
                                    Đóng ca
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* RIGHT: Sub-form Chi tiết ca làm việc */}
              <div className="lg:col-span-5 lg:sticky lg:top-4">
                {detail !== null ? (
                  <ShiftDetailSubform
                    key={detail}
                    id={detail}
                    userId={userId}
                    role={role}
                    openedByMeId={openedByMeId}
                    onCloseShift={(shiftId) => setClosing(shiftId)}
                    close={() => setDetail(null)}
                  />
                ) : (
                  <Card className="border overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                      <FileText className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold">Chi tiết ca & Đối soát</h3>
                    </div>
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      Chọn một ca làm việc ở danh sách bên trái để xem chi tiết số liệu đối soát.
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </section>
      ) : (
        detail !== null && (
          <ShiftDetailSubform
            key={detail}
            id={detail}
            userId={userId}
            role={role}
            openedByMeId={openedByMeId}
            onCloseShift={(shiftId) => setClosing(shiftId)}
            close={() => setDetail(null)}
          />
        )
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
