import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { shiftApi, type Shift } from '../api/shift-api';
import { cash, control } from '../lib/presentation';
import { canCloseShift, parseCash, difference, differenceLabel } from '../lib/reconciliation';
import { ShiftDialog } from './shift-dialog';
import { ShiftSummary, ShiftError } from './shift-summary';

export function CloseShiftDialog({
  id,
  userId,
  role,
  openedByMeId,
  close,
  completed,
}: {
  id: number;
  userId: number;
  role: string;
  openedByMeId: number | null;
  close: () => void;
  completed: (shift: Shift) => void;
}) {
  const client = useQueryClient();
  const [amount, setAmount] = useState('');
  const [validation, setValidation] = useState<Error | null>(null);
  const query = useQuery({
    queryKey: ['shifts', userId, 'detail', id],
    queryFn: () => shiftApi.detail(id),
    retry: false,
  });
  const shift = query.data;
  const allowed =
    !!shift &&
    canCloseShift(role, shift.trangThai, shift.maThuNgan ?? id, userId ?? openedByMeId);
  let actual: number | null = null;
  try {
    actual = parseCash(amount);
  } catch {
    /* Chưa đủ dữ liệu để đối soát. */
  }
  const delta = actual !== null && shift ? difference(actual, shift.tienMatDuKien) : null;
  const mutation = useMutation({
    mutationFn: async (value: number) => {
      if (!allowed) throw new Error('Ca không đủ điều kiện đóng. Vui lòng tải lại.');
      const fresh = await shiftApi.detail(id);
      if (!canCloseShift(role, fresh.trangThai, fresh.maThuNgan ?? fresh.id, userId ?? openedByMeId))
        throw new Error('Ca đã đóng hoặc không đủ điều kiện đóng.');
      if (
        fresh.tienMatDuKien !== shift?.tienMatDuKien ||
        fresh.tongDoanhThu !== shift?.tongDoanhThu
      ) {
        client.setQueryData(['shifts', userId, 'detail', id], fresh);
        throw new Error(
          'Doanh thu ca vừa thay đổi. Vui lòng kiểm tra số liệu mới rồi xác nhận lại.',
        );
      }
      return shiftApi.close(id, value);
    },
    onSuccess: async (result) => {
      completed(result);
      await client.invalidateQueries({ queryKey: ['shifts', userId] });
      toast.success('Đã đóng ca làm việc.');
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
      if (allowed) mutation.mutate(value);
    } catch (e) {
      setValidation(e instanceof Error ? e : new Error('Số tiền không hợp lệ.'));
    }
  }
  return (
    <ShiftDialog
      title={`Đóng ca #${id}`}
      description="Đối chiếu tiền thực đếm trước khi xác nhận. Đóng ca ảnh hưởng hoạt động POS dùng chung."
      busy={mutation.isPending}
      close={close}
    >
      {query.isPending ? (
        <p role="status">Đang tải số liệu ca...</p>
      ) : query.isError ? (
        <ShiftError error={query.error} retry={() => void query.refetch()} />
      ) : (
        shift && (
          <div className="space-y-4">
            <ShiftSummary shift={shift} />
            <p className="rounded-md bg-muted p-3 text-sm">
              Tiền mặt dự kiến do BE tính từ tiền đầu ca và các giao dịch tiền mặt đã thanh toán trong ca.
            </p>
            {!allowed && <p role="alert">Ca đã đóng hoặc chưa xác định được quyền đóng ca này.</p>}
            <form onSubmit={submit} className="space-y-4" noValidate>
              <label className="block space-y-1">
                Tiền mặt thực đếm (đồng) *
                <input
                  autoFocus
                  className={control}
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setValidation(null);
                    mutation.reset();
                  }}
                  disabled={!allowed || mutation.isPending}
                />
              </label>
              <p aria-live="polite" className="font-semibold">
                Chênh lệch:{' '}
                {delta === null
                  ? 'Nhập số tiền hợp lệ để đối chiếu'
                  : `${differenceLabel(delta)} — ${cash(Math.abs(delta))}`}
              </p>
              <p className="text-sm text-muted-foreground">
                Xác nhận sẽ đóng ca. Bạn không thể sửa hoặc đóng lại ca đã đóng.
              </p>
              {validation && <ShiftError error={validation} />}
              {mutation.isError && <ShiftError error={mutation.error} />}
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={close}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={!allowed || mutation.isPending || query.isFetching}>
                  {mutation.isPending ? 'Đang đóng ca...' : 'Xác nhận đóng ca'}
                </Button>
              </div>
            </form>
          </div>
        )
      )}
    </ShiftDialog>
  );
}
