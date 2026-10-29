import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/components/ui/button';
import { supplierApi, type Supplier, type SupplierInput } from '../api/supplier-api';
import { ErrorNotice, Modal, Pager } from './shared';
import { control, errorText } from '../lib/presentation';

function SupplierForm({
  supplier,
  pending,
  error,
  save,
}: {
  supplier: Supplier | null;
  pending: boolean;
  error: unknown;
  save: (data: SupplierInput) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? '').trim();
    save({
      tenNhaCungCap: get('tenNhaCungCap'),
      soDienThoai: get('soDienThoai'),
      email: get('email'),
      diaChi: get('diaChi'),
      nguoiDaiDien: get('nguoiDaiDien'),
    });
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          Tên nhà cung cấp *
          <input
            autoFocus
            required
            pattern=".*\S.*"
            maxLength={200}
            name="tenNhaCungCap"
            className={control}
            defaultValue={supplier?.tenNhaCungCap ?? ''}
          />
        </label>
        <label className="space-y-1">
          Số điện thoại *
          <input
            required
            type="tel"
            pattern="0[0-9]{9}"
            maxLength={10}
            inputMode="numeric"
            title="Nhập số điện thoại gồm 10 chữ số, bắt đầu bằng 0"
            name="soDienThoai"
            className={control}
            defaultValue={supplier?.soDienThoai ?? ''}
          />
        </label>
        <label className="space-y-1">
          Email
          <input
            type="email"
            maxLength={255}
            name="email"
            className={control}
            defaultValue={supplier?.email ?? ''}
          />
        </label>
        <label className="space-y-1">
          Người liên hệ
          <input
            maxLength={100}
            name="nguoiDaiDien"
            className={control}
            defaultValue={supplier?.nguoiDaiDien ?? ''}
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          Địa chỉ
          <input
            maxLength={500}
            name="diaChi"
            className={control}
            defaultValue={supplier?.diaChi ?? ''}
          />
        </label>
      </fieldset>
      {!!error && <ErrorNotice error={error} />}
      <Button type="submit" disabled={pending}>
        {pending ? 'Đang lưu...' : 'Lưu nhà cung cấp'}
      </Button>
    </form>
  );
}

export function SupplierManagement() {
  const user = useAuthStore((s) => s.user);
  const allowed = user?.vaiTro === 'ADMIN' || user?.vaiTro === 'MANAGER';
  const client = useQueryClient();
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Supplier | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Supplier | null>(null);
  const query = useQuery({
    queryKey: ['inventory', user?.id, 'suppliers', page],
    queryFn: () => supplierApi.list(page),
    enabled: allowed,
    retry: false,
  });
  const save = useMutation({
    mutationFn: (data: SupplierInput) =>
      editing ? supplierApi.update(editing.id, data) : supplierApi.create(data),
    onSuccess: async () => {
      setEditing(undefined);
      await client.invalidateQueries({ queryKey: ['inventory', user?.id] });
      toast.success('Đã lưu nhà cung cấp.');
    },
  });
  const remove = useMutation({
    mutationFn: (id: number) => supplierApi.remove(id),
    onSuccess: async () => {
      setDeleting(null);
      setPage(0);
      await client.invalidateQueries({ queryKey: ['inventory', user?.id] });
      toast.success('Đã xóa nhà cung cấp.');
    },
  });
  if (!allowed) return <p role="alert">Bạn không có quyền quản lý nhà cung cấp.</p>;
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Nhà cung cấp</h1>
        <Button
          onClick={() => {
            save.reset();
            setEditing(null);
          }}
        >
          Thêm nhà cung cấp
        </Button>
      </div>
      {query.isPending ? (
        <p role="status">Đang tải nhà cung cấp...</p>
      ) : query.isError ? (
        <ErrorNotice error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          {query.data.content.length === 0 ? (
            <p>Chưa có nhà cung cấp.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {[
                      'Tên nhà cung cấp',
                      'SĐT',
                      'Email',
                      'Địa chỉ',
                      'Người liên hệ',
                      'Hợp tác',
                      'Thao tác',
                    ].map((s) => (
                      <th key={s} className="p-3">
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {query.data.content.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-3 font-medium">{s.tenNhaCungCap}</td>
                      <td className="p-3">{s.soDienThoai}</td>
                      <td className="p-3">{s.email || '—'}</td>
                      <td className="p-3">{s.diaChi || '—'}</td>
                      <td className="p-3">{s.nguoiDaiDien || '—'}</td>
                      <td className="p-3">{s.dangHopTac ? 'Đang hợp tác' : 'Dừng hợp tác'}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              save.reset();
                              setEditing(s);
                            }}
                          >
                            Sửa
                          </Button>
                          {user.vaiTro === 'ADMIN' && (
                            <Button
                              variant="destructive"
                              onClick={() => {
                                remove.reset();
                                setDeleting(s);
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
          <Pager
            page={page}
            total={query.data.totalPages}
            pending={query.isFetching}
            change={setPage}
          />
        </>
      )}
      {editing !== undefined && (
        <Modal
          title={editing ? 'Sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
          description="Nhập thông tin liên hệ của nhà cung cấp."
          close={() => setEditing(undefined)}
          busy={save.isPending}
        >
          <SupplierForm
            supplier={editing}
            pending={save.isPending}
            error={save.error}
            save={(data) => {
              if (allowed) save.mutate(data);
            }}
          />
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Xóa nhà cung cấp?"
          description={`Xác nhận xóa ${deleting.tenNhaCungCap}. Nhà cung cấp đã có phiếu nhập có thể không được phép xóa.`}
          close={() => setDeleting(null)}
          busy={remove.isPending}
        >
          {remove.isError && (
            <p role="alert" className="text-destructive">
              {errorText(remove.error)}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={remove.isPending} onClick={() => setDeleting(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (user.vaiTro === 'ADMIN') remove.mutate(deleting.id);
              }}
            >
              {remove.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
