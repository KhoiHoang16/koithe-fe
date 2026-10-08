import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useCategories, useProducts } from '@/features/catalog/api/queries';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function MenuPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts({
    danhMucId: activeCategoryId || undefined,
    search: searchQuery || undefined,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Thực đơn</h1>
        <p className="text-muted-foreground">Khám phá hơn 50+ loại đồ uống hấp dẫn</p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="menu-search"
            placeholder="Tìm kiếm đồ uống..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" aria-label="Bộ lọc">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
        <button
          onClick={() => setActiveCategoryId(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeCategoryId === null
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategoryId === cat.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat.tenDanhMuc}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {isLoadingProducts ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            // Find lowest price
            const hasVariants = product.bienTheList && product.bienTheList.length > 0;
            const price = hasVariants ? Math.min(...product.bienTheList.map(v => v.giaBan)) : product.giaTu;

            return (
              <Card key={product.id} className="group overflow-hidden card-hover cursor-pointer flex flex-col">
                <Link to={`/menu/${product.id}`} aria-label={`Xem chi tiết ${product.tenSanPham}`} className="flex-1">
                  <div className="relative h-40 bg-secondary flex items-center justify-center overflow-hidden">
                    {product.hinhAnh ? (
                      <img src={product.hinhAnh} alt={product.tenSanPham} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🧋</span>
                    )}
                    {!product.trangThai && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <Badge variant="secondary">Hết hàng</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">{product.danhMucTen}</div>
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.tenSanPham}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">{formatCurrency(price)}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span>{product.danhGiaTrungBinh?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Link>
                <div className="px-3 pb-3 mt-auto">
                  <Button size="sm" className="w-full" disabled={!product.trangThai} aria-label={`Thêm ${product.tenSanPham} vào giỏ`}>
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    Thêm vào giỏ
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoadingProducts && products.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-muted-foreground">Không tìm thấy sản phẩm phù hợp</p>
        </div>
      )}
    </div>
  );
}
