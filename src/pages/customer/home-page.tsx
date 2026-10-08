import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, ShoppingBag, Star, TrendingUp, Truck, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useCategories, useProducts } from '@/features/catalog/api/queries';
import { Category, Product } from '@/shared/types/catalog.types';

const PROMOTIONS = [
  { code: 'CHAOMUNG20', desc: 'Giảm 20% cho lần đầu', expire: '31/12/2024', color: 'from-primary to-primary/80' },
  { code: 'FREESHIP', desc: 'Miễn phí giao hàng', expire: '30/11/2024', color: 'from-accent to-accent/80' },
];

const CAT_COLORS = [
  'from-primary/20 to-primary/40',
  'from-accent/20 to-accent/40',
  'from-primary/10 to-primary/30',
  'from-secondary to-secondary/80',
  'from-muted to-muted/80',
  'from-accent/10 to-accent/30'
];

const CAT_ICONS = ['🧋', '☕', '🍓', '🥤', '🍦', '🍮'];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function HomePage() {
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories();
  const { data: featuredProducts = [], isLoading: isLoadingProducts } = useProducts({ noiBat: true, size: 8 });

  return (
    <div className="min-h-screen">
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/90 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-white blur-2xl" />
        </div>

        <div className="relative container mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">
          {/* Left */}
          <div className="flex-1 text-center md:text-left">
            <Badge variant="outline" className="border-white/40 text-white mb-4 text-xs">
              🎉 Ưu đãi mở cửa hàng mới
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Thưởng thức <br />
              <span className="text-yellow-300">trà sữa ngon</span> <br />
              mỗi ngày
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Hơn 50 loại đồ uống cao cấp, giao hàng trong 30 phút.
              Tích điểm và nhận ưu đãi hấp dẫn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="xl" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg" asChild>
                <Link to="/menu">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Đặt ngay
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="border-white/50 text-white hover:bg-white/10" asChild>
                <Link to="/menu">
                  Xem thực đơn
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="flex gap-8 mt-10 justify-center md:justify-start">
              {[
                { value: '50+', label: 'Loại đồ uống' },
                { value: '4.9★', label: 'Đánh giá TB' },
                { value: '5K+', label: 'Đơn hàng' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Hero visual */}
          <div className="flex-shrink-0">
            <div className="relative h-64 w-64 md:h-80 md:w-80">
              <div className="absolute inset-0 flex items-center justify-center text-[180px] animate-pulse">
                🧋
              </div>
              <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground rounded-full px-3 py-1 text-sm font-bold shadow-lg">
                -20%
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-primary rounded-xl px-4 py-2 shadow-xl">
                <div className="text-xs text-muted-foreground">Miễn phí ship</div>
                <div className="text-sm font-bold">Đơn từ 50k</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES STRIP
          ============================================================ */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Truck className="h-5 w-5 text-primary" />, title: 'Giao nhanh 30 phút', desc: 'Trong phạm vi 5km' },
              { icon: <Star className="h-5 w-5 text-accent" />, title: 'Tích điểm', desc: '1 điểm / 10.000đ' },
              { icon: <ShoppingBag className="h-5 w-5 text-primary" />, title: 'Thanh toán dễ', desc: 'VNPay, Momo, COD' },
              { icon: <TrendingUp className="h-5 w-5 text-accent" />, title: 'Ưu đãi mỗi ngày', desc: 'Voucher hot hàng ngày' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background shadow-sm">
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold">{f.title}</div>
                  <div className="text-xs text-muted-foreground">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          CATEGORIES
          ============================================================ */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Danh mục</h2>
              <p className="text-muted-foreground text-sm mt-1">Chọn danh mục yêu thích của bạn</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/menu">
                Xem tất cả
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoadingCategories ? (
             <div className="flex justify-center items-center py-10">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat: Category, idx: number) => {
                const color = CAT_COLORS[idx % CAT_COLORS.length];
                const icon = CAT_ICONS[idx % CAT_ICONS.length];
                
                return (
                  <Link
                    key={cat.id}
                    to={`/menu?category=${cat.id}`}
                    className="group flex flex-col items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-300 hover:-translate-y-1 card-hover"
                    aria-label={`Xem danh mục ${cat.tenDanhMuc}`}
                  >
                    <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                      {icon}
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{cat.tenDanhMuc}</div>
                      <div className="text-xs text-muted-foreground">{cat.soLuongSanPham || 0} món</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          PROMOTIONS BANNER
          ============================================================ */}
      <section className="py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-4">
            {PROMOTIONS.map((promo) => (
              <div
                key={promo.code}
                className={`relative rounded-xl bg-gradient-to-r ${promo.color} p-6 text-white overflow-hidden`}
              >
                <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <Badge className="bg-white/20 text-white border-none mb-2 text-xs">VOUCHER</Badge>
                  <div className="text-2xl font-bold mb-1">{promo.code}</div>
                  <div className="text-sm text-white/80 mb-3">{promo.desc}</div>
                  <div className="text-xs text-white/60">HSD: {promo.expire}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED PRODUCTS
          ============================================================ */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
              <p className="text-muted-foreground text-sm mt-1">Được yêu thích nhất tuần này</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/menu">
                Xem tất cả
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoadingProducts ? (
             <div className="flex justify-center items-center py-10">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product: Product) => {
                const hasVariants = product.bienTheList && product.bienTheList.length > 0;
                const price = hasVariants ? Math.min(...product.bienTheList.map(v => v.giaBan)) : product.giaTu;

                return (
                  <Link key={product.id} to={`/menu/${product.id}`} aria-label={`Xem ${product.tenSanPham}`}>
                    <Card className="group overflow-hidden card-hover cursor-pointer h-full flex flex-col">
                      <div className="relative h-40 bg-secondary flex items-center justify-center overflow-hidden">
                        {product.hinhAnh ? (
                          <img src={product.hinhAnh} alt={product.tenSanPham} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🧋</span>
                        )}
                        {!product.trangThai && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <Badge variant="secondary">Hết hàng</Badge>
                          </div>
                        )}
                        {/* Example badge for mock new products */}
                        {product.id % 3 === 0 && (
                          <Badge className="absolute top-2 left-2 text-[10px]" variant="destructive">
                            Hot
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3 flex-1 flex flex-col">
                        <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.tenSanPham}</h3>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="font-bold text-primary">{formatCurrency(price)}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            <span>{product.danhGiaTrungBinh?.toFixed(1) || '0.0'}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {product.soLuongBan?.toLocaleString() || 0} đã bán
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          CTA SECTION
          ============================================================ */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-2xl font-bold mb-3">Đăng ký và nhận 20% giảm giá</h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Tạo tài khoản ngay để tích điểm và nhận nhiều ưu đãi đặc biệt
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">Đăng ký miễn phí</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/menu">Xem thực đơn</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
