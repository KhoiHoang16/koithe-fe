import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Search, Edit3, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { ConfirmDeleteDialog } from '@/shared/components/overlay/confirm-delete-dialog';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';
import type { Product } from '@/shared/types/catalog.types';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => catalogApi.getProducts(),
  });

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => catalogApi.deleteProduct(id),
    onSuccess: () => {
      toast.success('Đã xóa sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('Không thể xóa sản phẩm');
    },
  });

  const filteredProducts = (products || []).filter((item) => {
    const matchCat = selectedCategory === 'ALL' || item.danhMucId === selectedCategory;
    const matchSearch =
      item.tenSanPham.toLowerCase().includes(search.toLowerCase()) ||
      item.maSanPham.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (isLoading) return <LoadingScreen message="Đang tải danh sách sản phẩm..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground text-xs">Danh sách đồ uống, giá bán và cấu hình biến thể</p>
        </div>
        <Button asChild className="gap-2 font-bold text-xs bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4" /> Thêm sản phẩm mới
          </Link>
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên hoặc mã SP (VD: TS-001)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                selectedCategory === 'ALL' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Tất cả
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.tenDanhMuc}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Product Data Table */}
      <Card className="overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
              <tr>
                <th className="p-3">Mã SP</th>
                <th className="p-3">Sản phẩm</th>
                <th className="p-3">Danh mục</th>
                <th className="p-3">Giá từ</th>
                <th className="p-3">Biến thể</th>
                <th className="p-3">Nổi bật</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono font-semibold">{p.maSanPham}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                        {p.hinhAnh ? <img src={p.hinhAnh} alt={p.tenSanPham} className="w-full h-full object-cover" /> : <span>🧋</span>}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{p.tenSanPham}</div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">{p.moTa}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[11px]">
                      {p.danhMucTen || 'Chưa xếp'}
                    </Badge>
                  </td>
                  <td className="p-3 font-bold text-primary">{formatVND(p.giaTu)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {p.bienTheList.map((v) => (
                        <span key={v.id} className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {v.tenBienThe} ({formatVND(v.giaBan)})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    {p.noiBat ? (
                      <Badge className="bg-accent/20 text-accent gap-1 text-[10px] hover:bg-accent/30">
                        <Sparkles className="h-3 w-3" /> Nổi bật
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Badge variant="secondary" className={p.trangThai ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}>
                      {p.trangThai ? 'Đang bán' : 'Tạm ngưng'}
                    </Badge>
                  </td>
                  <td className="p-[#0.75rem] text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link to={`/admin/products/${p.id}/edit`}>
                          <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(p)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Xóa sản phẩm "${deleteTarget?.tenSanPham}"?`}
        description="Sản phẩm này sẽ bị xóa vĩnh viễn khỏi thực đơn. Thao tác này không thể hoàn tác."
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
