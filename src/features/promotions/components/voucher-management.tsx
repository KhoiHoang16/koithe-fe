import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/components/ui/button';
import { promotionManagementApi } from '../api/promotion-api';
import {
  promotionPermissions,
  programStatus,
  type ManagedVoucher,
  type VoucherInput,
} from '../lib/admin-promotion';
import { money, when } from '../lib/admin-presentation';
import { PromotionError, PromotionModal, PromotionPager } from './admin-shared';
import { VoucherForm } from './voucher-form';

export function VoucherManagement() {
  const user = useAuthStore((state) => state.user);
  const permissions = promotionPermissions(user?.vaiTro);
  const client = useQueryClient();
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<ManagedVoucher | null | undefined>();
  const [deleting, setDeleting] = useState<ManagedVoucher | null>(null);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);
  const vouchers = useQuery({
    queryKey: ['promotion-management', user?.id, 'vouchers', page],
    queryFn: () => promotionManagementApi.vouchers(page),
    enabled: permissions.write,
    retry: false,
  });
  const programs = useQuery({
    queryKey: ['promotion-management', user?.id, 'program-options'],
    queryFn: promotionManagementApi.programOptions,
    enabled: permissions.write,
    retry: false,
  });
  const save = useMutation({
    mutationFn: (input: VoucherInput) =>
      editing
        ? promotionManagementApi.updateVoucher(editing.id, input)
        : promotionManagementApi.createVoucher(input),
    onSuccess: async () => {
      setEditing(undefined);
      await client.invalidateQueries({ queryKey: ['promotion-management', user?.id] });
      toast.success('Đã lưu voucher.');
    },
  });
  const remove = useMutation({
    mutationFn: (id: number) => promotionManagementApi.deleteVoucher(id),
    onSuccess: async () => {
      setDeleting(null);
      setPage(0);
      await client.invalidateQueries({ queryKey: ['promotion-management', user?.id] });
      toast.success('Đã xóa voucher.');
    },
  });
  if (!permissions.write || !user) return <p role="alert">Bạn không có quyền quản lý voucher.</p>;
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Voucher</h1>
          <Link className="text-sm text-primary underline" to="/admin/promotions">
            Xem chương trình khuyến mãi
          </Link>
        </div>
        <Button
          onClick={() => {
            save.reset();
            setEditing(null);
          }}
        >
          Tạo voucher
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Tên chương trình và thời hạn của voucher được lấy từ chương trình liên kết.
      </p>
      {programs.isError && (
        <PromotionError error={programs.error} retry={() => void programs.refetch()} />
      )}
      {vouchers.isPending ? (
        <p role="status">Đang tải voucher...</p>
      ) : vouchers.isError ? (
        <PromotionError error={vouchers.error} retry={() => void vouchers.refetch()} />
      ) : (
        <>
          {!vouchers.data.content.length ? (
            <p>Chưa có voucher.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {[
                      'Mã voucher',
                      'Chương trình',
                      'Giảm giá',
                      'Đơn tối thiểu',
                      'Giảm tối đa',
                      'Đã dùng / Phát hành',
                      'Thời hạn (giờ VN)',
                      'Trạng thái',
                      'Thao tác',
                    ].map((name) => (
                      <th key={name} className="p-3">
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vouchers.data.content.map((voucher) => {
                    const program = programs.data?.find((row) => row.id === voucher.maChuongTrinh);
                    return (
                      <tr className="border-t" key={voucher.id}>
                        <td className="p-3 font-mono font-semibold">{voucher.maCode}</td>
                        <td className="p-3">
                          {program?.tenChuongTrinh ??
                            (programs.isPending ? 'Đang tải...' : 'Chưa có thông tin')}
                        </td>
                        <td className="p-3">
                          {voucher.loaiGiamGia === 'PHAN_TRAM'
                            ? `${voucher.giaTriGiam}%`
                            : money(voucher.giaTriGiam)}
                        </td>
                        <td className="p-3">{money(voucher.donHangToiThieu)}</td>
                        <td className="p-3">
                          {voucher.mucGiamToiDa ? money(voucher.mucGiamToiDa) : 'Không giới hạn'}
                        </td>
                        <td className="p-3">
                          {voucher.soLuotDaDung} / {voucher.gioiHanSuDung ?? 'Không giới hạn'}
                        </td>
                        <td className="p-3">
                          {program ? (
                            <>
                              {when(program.ngayBatDau)}
                              <br />
                              {when(program.ngayKetThuc)}
                            </>
                          ) : (
                            'Chưa có thông tin'
                          )}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex rounded-full bg-muted px-2 py-1">
                            {programStatus(program, now)}
                          </span>
                          {voucher.gioiHanSuDung !== null &&
                            voucher.soLuotDaDung >= voucher.gioiHanSuDung && (
                              <p className="text-xs">Đã hết lượt</p>
                            )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                save.reset();
                                setEditing(voucher);
                              }}
                            >
                              Sửa
                            </Button>
                            {permissions.remove && (
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  remove.reset();
                                  setDeleting(voucher);
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
          <PromotionPager
            page={page}
            total={vouchers.data.totalPages}
            pending={vouchers.isFetching}
            change={setPage}
          />
        </>
      )}
      {editing !== undefined && (
        <PromotionModal
          title={editing ? 'Sửa voucher' : 'Tạo voucher'}
          description="Nhập thông tin giảm giá và chọn chương trình áp dụng."
          busy={save.isPending}
          close={() => setEditing(undefined)}
        >
          <VoucherForm
            key={`${user.id}-${editing?.id ?? 'new'}`}
            userId={user.id}
            voucher={editing}
            busy={save.isPending}
            error={save.error}
            save={(input) => {
              if (permissions.write) save.mutate(input);
            }}
          />
        </PromotionModal>
      )}
      {deleting && (
        <PromotionModal
          title="Xóa voucher?"
          description={`Xác nhận xóa mã ${deleting.maCode}. Voucher sẽ không còn dùng được cho giao dịch mới.`}
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
              onClick={() => {
                if (permissions.remove) remove.mutate(deleting.id);
              }}
            >
              {remove.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </div>
        </PromotionModal>
      )}
    </section>
  );
}
