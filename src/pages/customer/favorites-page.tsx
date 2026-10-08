import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { MOCK_PRODUCTS } from '@/features/catalog/api/catalog-api';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function FavoritesPage() {
  const favorites = MOCK_PRODUCTS.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
          <Heart className="h-7 w-7 text-rose-500 fill-rose-500" /> Đồ uống yêu thích
        </h1>
        <p className="text-muted-foreground text-sm">Danh sách đồ uống bạn hay chọn nhất để đặt lại nhanh chóng</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((product) => (
          <Card key={product.id} className="p-4 overflow-hidden border card-hover">
            <div className="h-44 bg-muted rounded-xl mb-3 overflow-hidden relative">
              <img src={product.hinhAnh} alt={product.tenSanPham} className="w-full h-full object-cover" />
              <Button variant="ghost" size="icon-sm" className="absolute top-2 right-2 bg-white/80 rounded-full text-rose-500">
                <Heart className="h-4 w-4 fill-rose-500" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">{product.danhMucTen}</div>
            <h3 className="font-bold text-sm line-clamp-1 mt-0.5 mb-2">{product.tenSanPham}</h3>
            <div className="flex justify-between items-center">
              <span className="font-bold text-primary">{formatVND(product.giaTu)}</span>
              <Button size="sm" asChild className="text-xs gap-1">
                <Link to={`/menu/${product.id}`}>
                  <ShoppingBag className="h-3.5 w-3.5" /> Đặt ngay
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
