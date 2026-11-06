import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Search, Users, UserCheck, Eye, Edit3, Trash2 } from 'lucide-react';
import { ApiError } from '@/shared/api/http-client';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { customerApi, customerKeys, type ManagedCustomer } from '../api/customer-api';
import { useCustomers } from '../hooks/use-customers';
import { customerPermissions, type CustomerFormValues } from '../schema/customer-form';
import { CustomerForm } from './customer-form';

function errorMessage(error: unknown) {
  if (error instanceof ApiError && [400, 404, 409].includes(error.code)) return error.message;
  if (error instanceof ApiError && error.code === 403)
    return 'Bạn không có quyền thực hiện thao tác này.';
  return 'Không thể thực hiện thao tác. Vui lòng thử lại.';
}

function dateLabel(value: string | null) {
  if (!value || Number.isNaN(new Date(value).getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

export function CustomerManagement() {
  const user = useAuthStore((state) => state.user);
  const permissions = customerPermissions(user?.vaiTro);
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editor, setEditor] = useState<{ customer: ManagedCustomer | null } | null>(null);
  const [deleting, setDeleting] = useState<ManagedCustomer | null>(null);
  const customers = useCustomers(phone);

  useEffect(() => {
    const list = customers.data ?? [];
    if (list.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId === null || !list.some((c) => c.id === selectedId)) {
      setSelectedId(list[0].id);
    }
  }, [customers.data, selectedId]);

  const detailQuery = useQuery({
    queryKey: customerKeys.detail(user?.id, selectedId),
    queryFn: () => customerApi.getById(selectedId!),
    enabled: !!selectedId && permissions.read,
    retry: false,
  });

  const selectedCustomer =
    detailQuery.data ?? customers.data?.find((c) => c.id === selectedId) ?? null;

  const save = useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      if (!editor || (editor.customer ? !permissions.update : !permissions.create))
        throw new Error('Forbidden');
      return editor.customer
        ? customerApi.update(editor.customer.id, { hoVaTen: values.hoVaTen, email: values.email })
        : customerApi.create(values);
    },
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: customerKeys.all });
      if (saved?.id) setSelectedId(saved.id);
      setEditor(null);
      toast.success('Đã lưu thông tin khách hàng.');
    },
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!deleting || !permissions.delete) throw new Error('Forbidden');
      await customerApi.delete(deleting.id);
      queryClient.removeQueries({ queryKey: customerKeys.detail(user?.id, deleting.id) });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerKeys.all });
      setDeleting(null);
      toast.success('Đã xóa khách hàng.');
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>

        </div>
        {permissions.create && (
          <Button
            onClick={() => {
              save.reset();
              setEditor({ customer: null });
            }}
          >
            <Plus className="h-4 w-4" />
            Thêm khách hàng
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="max-w-sm space-y-2">
          <label htmlFor="customer-search" className="text-sm font-medium">
            Tìm theo số điện thoại
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="customer-search"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="pl-9"
              placeholder="Nhập số điện thoại đầy đủ"
            />
          </div>
        </div>
      </Card>

      {customers.isPending || customers.isDebouncing ? (
        <Card role="status" className="py-10 text-center text-muted-foreground">
          Đang tải danh sách khách hàng...
        </Card>
      ) : customers.isError ? (
        <Card role="alert" className="py-8 space-y-3 text-center">
          <p className="text-destructive">Không thể tải danh sách khách hàng.</p>
          <Button variant="outline" onClick={() => void customers.refetch()}>
            Thử lại
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: DSKH - Danh sách khách hàng */}
          <Card className="lg:col-span-7 overflow-hidden border">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold">Danh sách khách hàng (DSKH)</h2>
              </div>
              <Badge variant="secondary" className="text-xs">
                {customers.data?.length ?? 0} khách
              </Badge>
            </div>

            {!customers.data?.length ? (
              <p role="status" className="py-10 text-center text-sm text-muted-foreground">
                {phone.trim()
                  ? 'Không tìm thấy khách hàng khớp số điện thoại.'
                  : 'Chưa có khách hàng nào.'}
              </p>
            ) : (
              <div className="overflow-x-auto" data-lenis-prevent>
                <table className="w-full text-xs sm:text-sm text-left">
                  <caption className="sr-only">Danh sách khách hàng</caption>
                  <thead className="bg-muted/50 border-b text-muted-foreground">
                    <tr>
                      {['Họ tên', 'Số điện thoại', 'Điểm', 'Hạng', 'Thao tác'].map((heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="p-3 font-medium whitespace-nowrap"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.data.map((customer) => {
                      const isSelected = customer.id === selectedId;
                      return (
                        <tr
                          key={customer.id}
                          onClick={() => setSelectedId(customer.id)}
                          className={`border-b last:border-0 cursor-pointer transition-colors ${isSelected
                              ? 'bg-primary/10 hover:bg-primary/15'
                              : 'hover:bg-muted/20'
                            }`}
                        >
                          <td className="p-3 font-semibold text-primary">
                            <div className="flex items-center gap-1.5">
                              {isSelected && (
                                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              )}
                              <span>{customer.hoVaTen}</span>
                            </div>
                          </td>
                          <td className="p-3 whitespace-nowrap">{customer.soDienThoai}</td>
                          <td className="p-3 font-semibold">{customer.diemTichLuy ?? '—'}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[11px]">
                              {customer.hangThanhVien || '—'}
                            </Badge>
                          </td>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                variant={isSelected ? 'default' : 'outline'}
                                className="h-7 text-xs gap-1"
                                onClick={() => setSelectedId(customer.id)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Xem
                              </Button>
                              {permissions.update && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  aria-label={'Sửa khách hàng ' + customer.hoVaTen}
                                  onClick={() => {
                                    save.reset();
                                    setEditor({ customer });
                                  }}
                                >
                                  Sửa
                                </Button>
                              )}
                              {permissions.delete && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 text-xs"
                                  aria-label={'Xóa khách hàng ' + customer.hoVaTen}
                                  onClick={() => {
                                    remove.reset();
                                    setDeleting(customer);
                                  }}
                                >
                                  Xóa
                                </Button>
                              )}
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

          {/* RIGHT: CTKH - Sub-form Chi tiết khách hàng */}
          <Card className="lg:col-span-5 border lg:sticky lg:top-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold">Chi tiết khách hàng (CTKH)</h2>
              </div>
              {selectedCustomer && (
                <div className="flex items-center gap-1.5">
                  {permissions.update && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        save.reset();
                        setEditor({ customer: selectedCustomer });
                      }}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Sửa
                    </Button>
                  )}
                  {permissions.delete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        remove.reset();
                        setDeleting(selectedCustomer);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa
                    </Button>
                  )}
                </div>
              )}
            </div>

            {!selectedId ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Chọn một khách hàng ở danh sách bên trái (DSKH) để xem chi tiết.
              </div>
            ) : detailQuery.isPending && !selectedCustomer ? (
              <div className="p-6 text-xs text-muted-foreground" role="status">
                Đang tải thông tin khách hàng...
              </div>
            ) : detailQuery.isError && !selectedCustomer ? (
              <div className="p-6 space-y-3 text-xs" role="alert">
                <p className="text-destructive">
                  {detailQuery.error instanceof ApiError && detailQuery.error.code === 404
                    ? 'Không tìm thấy khách hàng.'
                    : 'Không thể tải thông tin khách hàng.'}
                </p>
                <Button size="sm" variant="outline" onClick={() => void detailQuery.refetch()}>
                  Thử lại
                </Button>
              </div>
            ) : selectedCustomer ? (
              <div className="p-4 space-y-4 text-xs sm:text-sm">
                <div className="flex items-center justify-between pb-3 border-b">
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {selectedCustomer.hoVaTen}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mã KH: #{selectedCustomer.id} • {selectedCustomer.soDienThoai}
                    </p>
                  </div>
                  <Badge className="bg-primary/15 text-primary font-bold">
                    {selectedCustomer.hangThanhVien || 'Thành viên'}
                  </Badge>
                </div>

                <dl className="grid sm:grid-cols-2 gap-3 bg-muted/40 p-3.5 rounded-xl text-xs">
                  {[
                    ['Số điện thoại', selectedCustomer.soDienThoai],
                    ['Email', selectedCustomer.email || '—'],
                    [
                      'Điểm tích lũy',
                      selectedCustomer.diemTichLuy == null
                        ? '—'
                        : `${selectedCustomer.diemTichLuy} điểm`,
                    ],
                    ['Hạng thành viên', selectedCustomer.hangThanhVien || '—'],
                    [
                      'Xác thực tài khoản',
                      selectedCustomer.daXacThuc == null
                        ? 'Chưa có thông tin'
                        : selectedCustomer.daXacThuc
                          ? 'Đã xác thực'
                          : 'Chưa xác thực',
                    ],
                    ['Ngày tạo', dateLabel(selectedCustomer.ngayTao || selectedCustomer.createdAt)],
                    ['Cập nhật gần nhất', dateLabel(selectedCustomer.updatedAt)],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="mt-0.5 font-semibold text-foreground break-words">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="rounded-xl border p-3.5 space-y-1 bg-card">
                  <h4 className="text-xs font-bold text-foreground">
                    Lịch sử mua hàng và tích điểm
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Điểm tích lũy được cộng tự động khi đơn hàng của khách hoàn tất thanh toán.
                  </p>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      )}

      <Dialog
        open={!!editor}
        onOpenChange={(open) => {
          if (!open && !save.isPending) setEditor(null);
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)]"
          data-lenis-prevent
        >
          <DialogHeader>
            <DialogTitle>{editor?.customer ? 'Sửa khách hàng' : 'Thêm khách hàng'}</DialogTitle>
            <DialogDescription>Nhập thông tin liên hệ của khách hàng.</DialogDescription>
          </DialogHeader>
          {editor && (
            <CustomerForm
              key={editor.customer?.id ?? 'new'}
              customer={editor.customer}
              pending={save.isPending}
              error={save.isError ? errorMessage(save.error) : null}
              onSave={(values) => save.mutate(values)}
              onCancel={() => setEditor(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setDeleting(null);
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa khách hàng</DialogTitle>
            <DialogDescription>
              Bạn muốn xóa khách hàng {deleting?.hoVaTen} ({deleting?.soDienThoai})?
            </DialogDescription>
          </DialogHeader>
          {remove.isError && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage(remove.error)}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={remove.isPending} onClick={() => setDeleting(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              isLoading={remove.isPending}
              onClick={() => remove.mutate()}
            >
              Xác nhận xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
