import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Loader2 } from 'lucide-react';
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

  const { data: categories = [] } = useCategories();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts({
    danhMucId: activeCategoryId || undefined,
    search: searchQuery || undefined,
  });


  return (
    <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed">
      {/* ============================================================
          HERO BANNER (Full Screen 100vh - CHAGEE & Homepage Style)
          ============================================================ */}
      <section className="relative w-full h-screen min-h-screen overflow-hidden select-none">
        {/* Raw Original Background Image - No gradient overlay */}
        <img
          src="/menu-banner.jpg"
          alt="Sản phẩm KOI Thé"
          className="w-full h-full object-cover object-center"
        />

        {/* Title at Bottom Left (CHAGEE style) */}
        <div className="absolute inset-x-0 bottom-0 pb-10 sm:pb-14 pointer-events-none z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-[0.15em] sm:tracking-[0.2em] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] font-sans">
              SẢN PHẨM
            </h1>
          </div>
        </div>
      </section>

      {/* ============================================================
          MAIN CONTENT AREA (2-Column CHAGEE Style)
          ============================================================ */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* ============================================================
              LEFT COLUMN: CÁC DÒNG TRÀ CHÍNH & TÌM KIẾM
              ============================================================ */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-24 space-y-8">
              {/* Heading */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight uppercase font-sans">
                  CÁC DÒNG<br />TRÀ CHÍNH
                </h2>
                <div className="w-12 h-0.5 bg-primary mt-3" />
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="menu-search"
                  placeholder="Tìm đồ uống..."
                  className="pl-10 pr-4 py-2.5 rounded-full border-stone-200/90 bg-white/90 focus:bg-white text-sm transition-all focus-visible:ring-1 focus-visible:ring-primary shadow-2xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category List - Vertical Menu (Desktop) */}
              <nav className="hidden lg:flex flex-col space-y-3 pt-2">
                <button
                  onClick={() => setActiveCategoryId(null)}
                  className={`text-left text-base transition-all duration-200 py-1.5 flex items-center justify-between group ${
                    activeCategoryId === null
                      ? 'font-bold text-primary'
                      : 'text-neutral-500 hover:text-primary font-light'
                  }`}
                >
                  <span
                    className={
                      activeCategoryId === null
                        ? 'border-b-2 border-primary pb-0.5'
                        : 'group-hover:translate-x-1 transition-transform'
                    }
                  >
                    Tất cả dòng trà
                  </span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`text-left text-base transition-all duration-200 py-1.5 flex items-center justify-between group ${
                      activeCategoryId === cat.id
                        ? 'font-bold text-primary'
                        : 'text-neutral-500 hover:text-primary font-light'
                    }`}
                  >
                    <span
                      className={
                        activeCategoryId === cat.id
                          ? 'border-b-2 border-primary pb-0.5'
                          : 'group-hover:translate-x-1 transition-transform'
                      }
                    >
                      {cat.tenDanhMuc}
                    </span>
                  </button>
                ))}
              </nav>

              {/* Category List - Horizontal Scrollable (Mobile/Tablet) */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setActiveCategoryId(null)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    activeCategoryId === null
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-white/80 border border-stone-200/80 text-stone-700 hover:bg-white'
                  }`}
                >
                  Tất cả dòng trà
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      activeCategoryId === cat.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-white/80 border border-stone-200/80 text-stone-700 hover:bg-white'
                    }`}
                  >
                    {cat.tenDanhMuc}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ============================================================
              RIGHT COLUMN: LƯỚI SẢN PHẨM
              ============================================================ */}
          <main className="lg:col-span-8 xl:col-span-9">

            {/* Products grid */}
            {isLoadingProducts ? (
              <div className="flex justify-center items-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => {
                  const hasVariants = product.bienTheList && product.bienTheList.length > 0;
                  const price = hasVariants
                    ? Math.min(...product.bienTheList.map((v) => v.giaBan))
                    : product.giaTu;

                  return (
                    <Card
                      key={product.id}
                      className="group overflow-hidden rounded-2xl border border-white/80 bg-white/95 backdrop-blur-md hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col shadow-xs"
                    >
                      <Link
                        to={`/menu/${product.id}`}
                        aria-label={`Xem chi tiết ${product.tenSanPham}`}
                        className="flex-1 flex flex-col"
                      >
                        <div className="relative aspect-[4/3] bg-[#F8F5F1] overflow-hidden flex items-center justify-center border-b border-stone-100">
                          {product.hinhAnh ? (
                            <img
                              src={product.hinhAnh}
                              alt={product.tenSanPham}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
                            />
                          ) : (
                            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                              🧋
                            </span>
                          )}
                          {!product.trangThai && (
                            <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center">
                              <Badge variant="secondary" className="font-medium">
                                Tạm hết hàng
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4 flex-1 flex flex-col">
                          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 mb-1">
                            {product.danhMucTen}
                          </span>
                          <h4 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                            {product.tenSanPham}
                          </h4>
                          <div className="mt-auto pt-2 flex items-center justify-between">
                            <span className="font-black text-base sm:text-lg text-foreground">
                              {formatCurrency(price)}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-neutral-500">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-medium">
                                {product.danhGiaTrungBinh?.toFixed(1) || '5.0'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  );
                })}
              </div>
            )}

            {!isLoadingProducts && products.length === 0 && (
              <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                <div className="text-5xl mb-3">🔍</div>
                <h4 className="text-base font-semibold text-foreground">
                  Không tìm thấy đồ uống phù hợp
                </h4>
                <p className="text-neutral-500 text-sm mt-1">
                  Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn dòng trà khác
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
