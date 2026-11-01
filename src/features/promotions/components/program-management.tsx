import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/shared/stores/auth-store';
import { promotionManagementApi } from '../api/promotion-api';
import {
  editedProgramDates,
  programStatus,
  promotionPermissions,
  localVietnamTime,
  type PromotionProgram,
  type ProgramInput,
} from '../lib/admin-promotion';
import { control, when } from '../lib/admin-presentation';
import { PromotionError, PromotionModal, PromotionPager } from './admin-shared';

function ProgramForm({
  program,
  busy,
  error,
  save,
}: {
  program: PromotionProgram | null;
  busy: boolean;
  error: unknown;
  save: (input: ProgramInput) => void;
}) {
  const [validation, setValidation] = useState<Error | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidation(null);
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? '').trim();
    try {
      if (!get('name')) throw new Error('Tên chương trình không được để trống.');
      save({
        tenChuongTrinh: get('name'),
        moTa: get('description'),
        ...editedProgramDates(get('start'), get('end'), program),
        dangHoatDong: data.get('active') === 'on',
      });
    } catch (err) {
      setValidation(err instanceof Error ? err : new Error('Dữ liệu không hợp lệ.'));
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <fieldset disabled={busy} className="space-y-4">
        <label className="block">
          Tên chương trình *
          <input
            autoFocus
            name="name"
            maxLength={200}
            className={control}
            defaultValue={program?.tenChuongTrinh ?? ''}
          />
        </label>
        <label className="block">
          Mô tả
          <textarea
            name="description"
            maxLength={2000}
            className={control}
            defaultValue={program?.moTa ?? ''}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            Ngày bắt đầu (giờ Việt Nam) *
            <input
              type="datetime-local"
              step="1"
              name="start"
              className={control}
              defaultValue={program ? localVietnamTime(program.ngayBatDau, true) : ''}
            />
          </label>
          <label>
            Ngày kết thúc (giờ Việt Nam) *
            <input
              type="datetime-local"
              step="1"
              name="end"
              className={control}
              defaultValue={program ? localVietnamTime(program.ngayKetThuc, true) : ''}
            />
          </label>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={program?.dangHoatDong ?? false} />
          Cho phép hoạt động
        </label>
      </fieldset>
      {validation && <PromotionError error={validation} />}
      {!!error && <PromotionError error={error} />}
      <Button type="submit" disabled={busy}>
        {busy ? 'Đang lưu...' : program ? 'Lưu thay đổi' : 'Tạo chương trình'}
      </Button>
    </form>
  );
}

export function ProgramManagement() {
  const user = useAuthStore((state) => state.user);
  const allowed = promotionPermissions(user?.vaiTro).write;
  const canDelete = promotionPermissions(user?.vaiTro).remove;
  const client = useQueryClient();
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<PromotionProgram | null | undefined>();
  const [deleting, setDeleting] = useState<PromotionProgram | null>(null);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);
  const query = useQuery({
    queryKey: ['promotion-management', user?.id, 'programs', page],
    queryFn: () => promotionManagementApi.programs(page),
    enabled: allowed,
    retry: false,
  });
  const create = useMutation({
    mutationFn: (input: ProgramInput) => {
      if (!promotionPermissions(useAuthStore.getState().user?.vaiTro).write)
        throw new Error('Bạn không có quyền sửa chương trình khuyến mãi.');
      return editing
        ? promotionManagementApi.updateProgram(editing.id, input, editing)
        : promotionManagementApi.createProgram(input);
    },
    onError: () => {
      void client.invalidateQueries({ queryKey: ['promotion-management', user?.id] });
    },
    onSuccess: async () => {
      setEditing(undefined);
      setPage(0);
      await client.invalidateQueries({ queryKey: ['promotion-management', user?.id] });
      toast.success('Đã lưu chương trình khuyến mãi.');
    },
  });
  const remove = useMutation({
    mutationFn: (id: number) => {
      if (!promotionPermissions(useAuthStore.getState().user?.vaiTro).remove) {
        throw new Error('Bạn không có quyền xóa chương trình khuyến mãi.');
      }
      return promotionManagementApi.deleteProgram(id);
    },
    onSuccess: async () => {
      setDeleting(null);
      setPage(0);
      await client.invalidateQueries({ queryKey: ['promotion-management', user?.id] });
      toast.success('Đã xóa chương trình khuyến mãi.');
    },
  });
  if (!allowed || !user) return <p role="alert">Bạn không có quyền quản lý khuyến mãi.</p>;
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Chương trình khuyến mãi</h1>
          <Link className="text-sm text-primary underline" to="/admin/vouchers">
            Quản lý voucher
          </Link>
        </div>
        <Button
          onClick={() => {
            create.reset();
            setEditing(null);
          }}
        >
          Tạo chương trình
        </Button>
      </div>
      {query.isPending ? (
        <p role="status">Đang tải chương trình...</p>
      ) : query.isError ? (
        <PromotionError error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          {!query.data.content.length ? (
            <p>Chưa có chương trình khuyến mãi.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {[
                      'Chương trình',
                      'Mô tả',
                      'Bắt đầu (giờ VN)',
                      'Kết thúc (giờ VN)',
                      'Trạng thái',
                      'Thao tác',
                    ].map((title) => (
                      <th key={title} className="p-3">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {query.data.content.map((program) => (
                    <tr key={program.id} className="border-t">
                      <td className="p-3 font-medium">{program.tenChuongTrinh}</td>
                      <td className="p-3">{program.moTa || '—'}</td>
                      <td className="p-3">{when(program.ngayBatDau)}</td>
                      <td className="p-3">{when(program.ngayKetThuc)}</td>
                      <td className="p-3">{programStatus(program, now)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              create.reset();
                              setEditing(program);
                            }}
                          >
                            Sửa
                          </Button>
                          {canDelete && (
                            <Button
                              variant="destructive"
                              onClick={() => {
                                remove.reset();
                                setDeleting(program);
                              }}
                            >
                              Xóa
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <PromotionPager
            page={page}
            total={query.data.totalPages}
            pending={query.isFetching}
            change={setPage}
          />
        </>
      )}
      {editing !== undefined && (
        <PromotionModal
          title={editing ? 'Sửa chương trình khuyến mãi' : 'Tạo chương trình khuyến mãi'}
          description="Thay đổi thời hạn hoặc trạng thái hoạt động sẽ áp dụng cho tất cả voucher liên kết với chương trình này."
          busy={create.isPending}
          close={() => setEditing(undefined)}
        >
          <ProgramForm
            key={editing?.id ?? 'new'}
            program={editing}
            busy={create.isPending}
            error={create.error}
            save={(input) => {
              if (allowed) create.mutate(input);
            }}
          />
        </PromotionModal>
      )}
      {deleting && canDelete && (
        <PromotionModal
          title="Xóa chương trình khuyến mãi?"
          description={`Xác nhận xóa chương trình “${deleting.tenChuongTrinh}”. Chương trình còn voucher hoặc cấu hình khuyến mãi liên kết sẽ không được phép xóa.`}
          busy={remove.isPending}
          close={() => setDeleting(null)}
        >
          {remove.isError && <PromotionError error={remove.error} />}
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={remove.isPending} onClick={() => setDeleting(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => remove.mutate(deleting.id)}
            >
              {remove.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </div>
        </PromotionModal>
      )}
    </section>
  );
}
