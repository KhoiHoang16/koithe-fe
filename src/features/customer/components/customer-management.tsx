import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import { ApiError } from '@/shared/api/http-client';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
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

export function CustomerManagement() {
  const user = useAuthStore((state) => state.user);
  const permissions = customerPermissions(user?.vaiTro);
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState('');
  const [editor, setEditor] = useState<{ customer: ManagedCustomer | null } | null>(null);
  const [deleting, setDeleting] = useState<ManagedCustomer | null>(null);
  const customers = useCustomers(phone);
  const save = useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      if (!editor || (editor.customer ? !permissions.update : !permissions.create))
        throw new Error('Forbidden');
      return editor.customer
        ? customerApi.update(editor.customer.id, { hoVaTen: values.hoVaTen, email: values.email })
        : customerApi.create(values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customerKeys.all });
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Thông tin khách hàng, điểm tích lũy và hạng thành viên.
          </p>
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
      <Card className="p-4 space-y-4">
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
        {customers.isPending || customers.isDebouncing ? (
          <div role="status" className="py-10 text-center text-muted-foreground">
            Đang tải danh sách khách hàng...
          </div>
        ) : customers.isError ? (
          <div role="alert" className="py-8 space-y-3 text-center">
            <p className="text-destructive">Không thể tải danh sách khách hàng.</p>
            <Button variant="outline" onClick={() => void customers.refetch()}>
              Thử lại
            </Button>
          </div>
        ) : !customers.data?.length ? (
          <p role="status" className="py-10 text-center text-muted-foreground">
            {phone.trim()
              ? 'Không tìm thấy khách hàng khớp số điện thoại.'
              : 'Chưa có khách hàng nào.'}
          </p>
        ) : (
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full text-sm text-left">
              <caption className="sr-only">Danh sách khách hàng</caption>
              <thead className="border-b text-muted-foreground">
                <tr>
                  {[
                    'Họ tên',
                    'Số điện thoại',
                    'Email',
                    'Điểm tích lũy',
                    'Hạng thành viên',
                    'Thao tác',
                  ].map((heading) => (
                    <th key={heading} scope="col" className="p-3 font-medium whitespace-nowrap">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.data.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0">
                    <td className="p-3">
                      <Link
                        to={'/admin/customers/' + customer.id}
                        className="font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {customer.hoVaTen}
                      </Link>
                    </td>
                    <td className="p-3 whitespace-nowrap">{customer.soDienThoai}</td>
                    <td className="p-3 break-all">{customer.email || '—'}</td>
                    <td className="p-3">{customer.diemTichLuy ?? '—'}</td>
                    <td className="p-3">{customer.hangThanhVien || '—'}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to={'/admin/customers/' + customer.id}>Chi tiết</Link>
                        </Button>
                        {permissions.update && (
                          <Button
                            size="sm"
                            variant="outline"
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
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
