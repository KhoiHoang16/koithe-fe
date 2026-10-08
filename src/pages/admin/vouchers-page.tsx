import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { promotionApi } from '@/features/promotions/api/promotion-api';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function VouchersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maVoucher, setMaVoucher] = useState('');
  const [tenVoucher, setTenVoucher] = useState('');
  const [giaTriGiam, setGiaTriGiam] = useState('20000');
  const [donHangToiThieu, setDonHangToiThieu] = useState('100000');

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['admin', 'vouchers'],
    queryFn: () => promotionApi.getVouchers(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      promotionApi.createVoucher({
        maVoucher: maVoucher.toUpperCase(),
        tenVoucher,
        loaiGiamGia: 'FIXED',
        giaTriGiam: Number(giaTriGiam),
        donHangToiThieu: Number(donHangToiThieu),
        ngayBatDau: '2026-01-01',
        ngayKetThuc: '2026-12-31',
        soLuong: 500,
        daSuDung: 0,
        trangThai: true,
      }),
    onSuccess: () => {
      toast.success('Đã tạo Voucher thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] });
      setIsModalOpen(false);
      setMaVoucher('');
      setTenVoucher('');
    },
  });

  if (isLoading) return <LoadingScreen message="Đang tải danh sách voucher..." />;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Voucher & Khuyến mãi</h1>
          <p className="text-muted-foreground text-xs">Tạo mã giảm giá và chương trình ưu đãi cho khách hàng</p>
        </div>
        <Button size="sm" className="gap-2 text-xs font-bold" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> Tạo Voucher mới
        </Button>
      </div>

      {isModalOpen && (
        <Card className="p-5 border space-y-4 bg-muted/20">
          <h3 className="font-bold text-sm border-b pb-2">Tạo mã Voucher giảm giá mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold">Mã Voucher (VD: KOINEW) *</label>
              <Input value={maVoucher} onChange={(e) => setMaVoucher(e.target.value.toUpperCase())} className="mt-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xs font-semibold">Tên Voucher *</label>
              <Input value={tenVoucher} onChange={(e) => setTenVoucher(e.target.value)} className="mt-1 text-xs" placeholder="VD: Giảm 20k đơn từ 100k..." />
            </div>
            <div>
              <label className="text-xs font-semibold">Giá trị giảm (VND) *</label>
              <Input type="number" value={giaTriGiam} onChange={(e) => setGiaTriGiam(e.target.value)} className="mt-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xs font-semibold">Đơn hàng tối thiểu (VND) *</label>
              <Input type="number" value={donHangToiThieu} onChange={(e) => setDonHangToiThieu(e.target.value)} className="mt-1 text-xs font-mono" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button size="sm" className="text-xs font-bold" onClick={() => createMutation.mutate()} isLoading={createMutation.isPending}>Tạo Voucher</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b font-semibold text-muted-foreground">
            <tr>
              <th className="p-3">Mã Voucher</th>
              <th className="p-3">Tên Voucher</th>
              <th className="p-3">Mức giảm</th>
              <th className="p-3">Đơn tối thiểu</th>
              <th className="p-3">Đã sử dụng</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vouchers?.map((v) => (
              <tr key={v.id} className="hover:bg-muted/30">
                <td className="p-3 font-mono font-bold text-primary">{v.maVoucher}</td>
                <td className="p-3 font-bold text-foreground">{v.tenVoucher}</td>
                <td className="p-3 font-bold text-emerald-600">
                  {v.loaiGiamGia === 'FIXED' ? formatVND(v.giaTriGiam) : `${v.giaTriGiam}%`}
                </td>
                <td className="p-3 font-mono text-muted-foreground">{formatVND(v.donHangToiThieu)}</td>
                <td className="p-3 font-bold">{v.daSuDung} / {v.soLuong}</td>
                <td className="p-3">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Hoạt động</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
