import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function ToppingsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tenTopping, setTenTopping] = useState('');
  const [giaBan, setGiaBan] = useState('10000');

  const { data: toppings, isLoading } = useQuery({
    queryKey: ['admin', 'toppings'],
    queryFn: () => catalogApi.getToppings(),
  });

  const createMutation = useMutation({
    mutationFn: () => catalogApi.createTopping({ tenTopping, giaBan: Number(giaBan), coSan: true, trangThai: true }),
    onSuccess: () => {
      toast.success('Đã thêm topping mới!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'toppings'] });
      setIsModalOpen(false);
      setTenTopping('');
    },
  });

  if (isLoading) return <LoadingScreen message="Đang tải danh sách topping..." />;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Topping</h1>
          <p className="text-muted-foreground text-xs">Cấu hình các loại topping đi kèm và đơn giá</p>
        </div>
        <Button size="sm" className="gap-2 text-xs font-bold" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> Thêm Topping
        </Button>
      </div>

      {isModalOpen && (
        <Card className="p-5 border space-y-4 bg-muted/20">
          <h3 className="font-bold text-sm border-b pb-2">Thêm Topping mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold">Tên Topping *</label>
              <Input value={tenTopping} onChange={(e) => setTenTopping(e.target.value)} className="mt-1 text-xs" placeholder="VD: Trân Châu Trắng..." />
            </div>
            <div>
              <label className="text-xs font-semibold">Giá bán (VND) *</label>
              <Input type="number" value={giaBan} onChange={(e) => setGiaBan(e.target.value)} className="mt-1 text-xs font-mono" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button size="sm" className="text-xs font-bold" onClick={() => createMutation.mutate()} isLoading={createMutation.isPending}>Lưu Topping</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b font-semibold text-muted-foreground">
            <tr>
              <th className="p-3">Tên Topping</th>
              <th className="p-3">Đơn giá</th>
              <th className="p-3">Tình trạng kho</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {toppings?.map((t) => (
              <tr key={t.id} className="hover:bg-muted/30">
                <td className="p-3 font-bold text-foreground">{t.tenTopping}</td>
                <td className="p-3 font-bold text-primary font-mono">{formatVND(t.giaBan)}</td>
                <td className="p-3">
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">Sẵn sàng</Badge>
                </td>
                <td className="p-3">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Đang bán</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
