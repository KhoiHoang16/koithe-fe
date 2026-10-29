import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customerApi, customerKeys } from '../api/customer-api';
import { customerId, customerPermissions } from '../schema/customer-form';
import { useAuthStore } from '@/shared/stores/auth-store';
import { ApiError } from '@/shared/api/http-client';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';

function dateLabel(value: string | null) {
  if (!value || Number.isNaN(new Date(value).getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}

export function CustomerDetail() {
  const { id: rawId } = useParams<{ id: string }>();
  const id = customerId(rawId);
  const user = useAuthStore((state) => state.user);
  const query = useQuery({
    queryKey: customerKeys.detail(user?.id, id),
    queryFn: () => customerApi.getById(id!),
    enabled: !!id && customerPermissions(user?.vaiTro).read,
    retry: false,
  });
  const customer = query.data;
  return (
    <div className="max-w-4xl space-y-6">
      <Button asChild variant="outline">
        <Link to="/admin/customers">Quay lại danh sách khách hàng</Link>
      </Button>
      <h1 className="text-2xl font-bold">Chi tiết khách hàng</h1>
      {!id ? (
        <Card className="p-6" role="alert">
          Mã khách hàng không hợp lệ.
        </Card>
      ) : query.isPending ? (
        <Card className="p-6" role="status">
          Đang tải thông tin khách hàng...
        </Card>
      ) : query.isError ? (
        <Card className="p-6 space-y-3" role="alert">
          <p>
            {query.error instanceof ApiError && query.error.code === 404
              ? 'Không tìm thấy khách hàng.'
              : 'Không thể tải thông tin khách hàng.'}
          </p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Thử lại
          </Button>
        </Card>
      ) : customer ? (
        <>
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">{customer.hoVaTen}</h2>
            <dl className="grid sm:grid-cols-2 gap-5 text-sm">
              {[
                ['Số điện thoại', customer.soDienThoai],
                ['Email', customer.email || '—'],
                [
                  'Điểm tích lũy',
                  customer.diemTichLuy == null ? '—' : String(customer.diemTichLuy),
                ],
                ['Hạng thành viên', customer.hangThanhVien || '—'],
                [
                  'Xác thực',
                  customer.daXacThuc == null
                    ? 'Chưa có thông tin'
                    : customer.daXacThuc
                      ? 'Đã xác thực'
                      : 'Chưa xác thực',
                ],
                ['Ngày tạo', dateLabel(customer.ngayTao || customer.createdAt)],
                ['Cập nhật', dateLabel(customer.updatedAt)],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-medium break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card className="p-6 space-y-2">
            <h2 className="font-semibold">Lịch sử mua hàng và tích điểm</h2>
            <p className="text-sm text-muted-foreground">
              Lịch sử mua hàng và biến động điểm chưa khả dụng tại đây.
            </p>
          </Card>
        </>
      ) : (
        <Card className="p-6" role="status">
          Không có thông tin khách hàng.
        </Card>
      )}
    </div>
  );
}
