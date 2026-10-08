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

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tenDanhMuc, setTenDanhMuc] = useState('');
  const [moTa, setMoTa] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: () => catalogApi.createCategory({ tenDanhMuc, moTa, thuTu: (categories?.length || 0) + 1, trangThai: true }),
    onSuccess: () => {
      toast.success('Đã thêm danh mục mới!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setIsModalOpen(false);
      setTenDanhMuc('');
      setMoTa('');
    },
  });

  if (isLoading) return <LoadingScreen message="Đang tải danh mục..." />;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý danh mục</h1>
          <p className="text-muted-foreground text-xs">Phân loại các dòng sản phẩm đồ uống và đồ ăn kèm</p>
        </div>
        <Button size="sm" className="gap-2 text-xs font-bold" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> Thêm danh mục
        </Button>
      </div>

      {/* Add Category Form/Card */}
      {isModalOpen && (
        <Card className="p-5 border space-y-4 bg-muted/20">
          <h3 className="font-bold text-sm border-b pb-2">Tạo danh mục mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold">Tên danh mục *</label>
              <Input value={tenDanhMuc} onChange={(e) => setTenDanhMuc(e.target.value)} className="mt-1 text-xs" placeholder="VD: Trà Sữa Đặc Biệt..." />
            </div>
            <div>
              <label className="text-xs font-semibold">Mô tả ngắn</label>
              <Input value={moTa} onChange={(e) => setMoTa(e.target.value)} className="mt-1 text-xs" placeholder="Mô tả danh mục..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button size="sm" className="text-xs font-bold" onClick={() => createMutation.mutate()} isLoading={createMutation.isPending}>Lưu danh mục</Button>
          </div>
        </Card>
      )}

      {/* Categories Table */}
      <Card className="overflow-hidden border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b font-semibold text-muted-foreground">
            <tr>
              <th className="p-3">Thứ tự</th>
              <th className="p-3">Tên danh mục</th>
              <th className="p-3">Mô tả</th>
              <th className="p-3">Số sản phẩm</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories?.map((c, idx) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="p-3 font-mono font-bold text-muted-foreground">#{idx + 1}</td>
                <td className="p-3 font-bold text-foreground">{c.tenDanhMuc}</td>
                <td className="p-3 text-muted-foreground">{c.moTa || '-'}</td>
                <td className="p-3 font-bold text-primary">{c.soLuongSanPham || 5} món</td>
                <td className="p-3">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Đang hiển thị</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
