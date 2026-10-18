import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { useCartStore } from '@/shared/stores/cart-store';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';
import type { SelectedTopping } from '@/shared/types/order.types';

const SUGAR_LEVELS = [
  { value: '70%', label: '70%', hint: 'Chuẩn vị (Khuyên dùng)' },
  { value: '100%', label: '100%', hint: 'Đậm ngọt' },
  { value: '50%', label: '50%', hint: 'Ngọt vừa' },
  { value: '30%', label: '30%', hint: 'Ít đường' },
  { value: '0%', label: '0%', hint: 'Không đường' },
];

const ICE_LEVELS = [
  { value: '50%', label: '50%', hint: 'Vừa đá (Khuyên dùng)' },
  { value: '100%', label: '100%', hint: 'Đầy đá' },
  { value: '70%', label: '70%', hint: 'Nhiều đá' },
  { value: '30%', label: '30%', hint: 'Ít đá' },
  { value: '0%', label: '0%', hint: 'Không đá' },
];

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function getVariantVolume(name: string) {
  const lower = name.toLowerCase().trim();
  if (/\bs\b|size\s*s\b/.test(lower)) return '360ml';
  if (/\bm\b|size\s*m\b/.test(lower)) return '500ml';
  if (/\bl\b|size\s*l\b/.test(lower)) return '700ml';
  return 'Ly tiêu chuẩn';
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const productId = Number(id) || 1;

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => catalogApi.getProductById(productId),
  });

  // Local state for options
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [sugarLevel, setSugarLevel] = useState('70%');
  const [iceLevel, setIceLevel] = useState('50%');
  const [selectedToppings, setSelectedToppings] = useState<SelectedTopping[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  // Default to first variant if none selected
  const currentVariant = useMemo(() => {
    if (!product?.bienTheList || product.bienTheList.length === 0) {
      return { id: 0, tenBienThe: 'Size M', giaBan: product?.giaTu || 45000 };
    }
    return product.bienTheList.find((v) => v.id === selectedVariantId) || product.bienTheList[0];
  }, [product, selectedVariantId]);

  // Calculate unit price & total
  const unitPrice = useMemo(() => {
    const toppingTotal = selectedToppings.reduce((sum, t) => sum + t.giaBan, 0);
    return currentVariant.giaBan + toppingTotal;
  }, [currentVariant, selectedToppings]);

  const totalPrice = unitPrice * quantity;

  const handleToppingToggle = (topping: { id: number; tenTopping: string; giaBan: number }) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, { id: topping.id, tenTopping: topping.tenTopping, giaBan: topping.giaBan }];
      }
    });
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      productName: product.tenSanPham,
      productImage: product.hinhAnh,
      variantId: currentVariant.id,
      variantName: currentVariant.tenBienThe,
      price: currentVariant.giaBan,
      sugarLevel,
      iceLevel,
      toppings: selectedToppings,
      quantity,
      note,
    });

    toast.success(`Đã thêm ${quantity}x ${product.tenSanPham} vào giỏ hàng!`, {
      action: {
        label: 'Xem giỏ hàng',
        onClick: () => navigate('/cart'),
      },
    });
  };

  if (isLoading || !product) {
    return <LoadingScreen message="Đang tải thông tin đồ uống..." />;
  }

  return (
    <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed pb-20 lg:pb-12 animate-fade-in flex flex-col justify-between">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-6xl">
        {/* Single Unified Product & Customization Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-6 sm:p-8 lg:p-9 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
            {/* =========================================================================
                LEFT SIDE: Square Product Image & Introduction (CHAGEE inspired)
               ========================================================================= */}
            <div className="lg:col-span-6 flex flex-col lg:border-r lg:border-stone-100 lg:pr-10">
              {/* Product Image Container (Square Shape: aspect-square, moderate size, static) */}
              <div className="relative rounded-2xl bg-[#F8F5F1] overflow-hidden flex items-center justify-center p-4 w-full aspect-square max-h-[320px] sm:max-h-[340px] mx-auto mb-4">
                {/* Badges on image */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                  {product.noiBat && (
                    <Badge className="bg-primary text-white gap-1 px-2.5 py-0.5 text-[11px] font-semibold shadow-2xs">
                      <Sparkles className="h-3 w-3" /> Nổi Bật
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-white/90 text-stone-700 border-stone-300 text-[10px] font-medium px-2 py-0.5">
                    KOI Thé
                  </Badge>
                </div>

                {/* Static Square Image (Crisp, centered, no zoom) */}
                {product.hinhAnh ? (
                  <img
                    src={product.hinhAnh}
                    alt={product.tenSanPham}
                    className="w-full h-full object-contain max-h-[92%] drop-shadow-md select-none"
                  />
                ) : (
                  <span className="text-7xl">🧋</span>
                )}
              </div>

              {/* Text Information Directly Below the Square Image */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    {product.danhMucTen || 'Trà Sữa Thủ Công'}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="text-xs text-muted-foreground">KOI Handcrafted</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 uppercase">
                  {product.tenSanPham}
                </h1>

                {/* Rating & Sold Stats */}
                <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground pb-2.5 border-b border-stone-100">
                  <div className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span>{product.danhGiaTrungBinh || 4.9}</span>
                    <span className="text-stone-400">({product.soLuotDanhGia || 186})</span>
                  </div>
                  <span>•</span>
                  <span>Đã bán {product.soLuongBan || 1200}+ ly</span>
                </div>

                {/* Story / Description Text (Concise & crisp) */}
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line line-clamp-3">
                  {product.moTa ||
                    'Dòng trà sữa trứ danh làm nên thương hiệu KOI Thé trên toàn cầu. Cốt trà được ủ tươi mỗi 4 giờ từ búp trà nguyên lá hảo hạng, hòa quyện cùng sữa thanh khiết và trân châu hoàng kim dai giòn óng ả.'}
                </p>

                <div className="pt-1 text-[11px] text-stone-400">
                  * Hình ảnh minh họa. Vị ngọt & đá được tùy chỉnh theo yêu cầu của bạn.
                </div>
              </div>
            </div>

            {/* =========================================================================
                RIGHT SIDE: Compact Customization Controls with Dropdown Selects
               ========================================================================= */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                {/* Price & Summary Header */}
                <div className="flex items-baseline justify-between border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                      Đơn giá hiện tại
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight mt-0.5">
                      {formatVND(currentVariant.giaBan)}
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 text-xs sm:text-sm font-semibold px-3 py-1">
                    {currentVariant.tenBienThe} ({getVariantVolume(currentVariant.tenBienThe)})
                  </Badge>
                </div>

                {/* Option 1: Size Variant Dropdown Select */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    1. Chọn Kích Cỡ (Size) <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={String(currentVariant.id)}
                    onValueChange={(val) => setSelectedVariantId(Number(val))}
                  >
                    <SelectTrigger className="w-full h-10 bg-stone-50/70 border-stone-200 hover:border-primary/50 focus:ring-primary rounded-xl text-stone-800 text-xs sm:text-sm font-medium">
                      <SelectValue placeholder="Chọn kích cỡ" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-stone-200">
                      {(product.bienTheList || []).map((v) => {
                        const volume = getVariantVolume(v.tenBienThe);
                        return (
                          <SelectItem key={v.id} value={String(v.id)} className="cursor-pointer py-2 text-xs sm:text-sm">
                            <div className="flex items-center justify-between w-full gap-4">
                              <span className="font-semibold text-stone-800">
                                {v.tenBienThe} <span className="text-muted-foreground font-normal">({volume})</span>
                              </span>
                              <span className="font-bold text-primary">{formatVND(v.giaBan)}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Option 2: Sugar Level Dropdown Select */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                      2. Lượng Đường
                    </label>
                    <span className="text-[10px] text-muted-foreground">Mặc định 70%</span>
                  </div>
                  <Select value={sugarLevel} onValueChange={setSugarLevel}>
                    <SelectTrigger className="w-full h-10 bg-stone-50/70 border-stone-200 hover:border-primary/50 focus:ring-primary rounded-xl text-stone-800 text-xs sm:text-sm font-medium">
                      <SelectValue placeholder="Chọn lượng đường" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-stone-200">
                      {SUGAR_LEVELS.map((item) => (
                        <SelectItem key={item.value} value={item.value} className="cursor-pointer py-2 text-xs sm:text-sm">
                          <span className="font-semibold text-stone-800">{item.label}</span>
                          <span className="text-stone-400 text-[11px] ml-2">— {item.hint}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Option 3: Ice Level Dropdown Select */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                      3. Lượng Đá
                    </label>
                    <span className="text-[10px] text-muted-foreground">Mặc định 50%</span>
                  </div>
                  <Select value={iceLevel} onValueChange={setIceLevel}>
                    <SelectTrigger className="w-full h-10 bg-stone-50/70 border-stone-200 hover:border-primary/50 focus:ring-primary rounded-xl text-stone-800 text-xs sm:text-sm font-medium">
                      <SelectValue placeholder="Chọn lượng đá" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-stone-200">
                      {ICE_LEVELS.map((item) => (
                        <SelectItem key={item.value} value={item.value} className="cursor-pointer py-2 text-xs sm:text-sm">
                          <span className="font-semibold text-stone-800">{item.label}</span>
                          <span className="text-stone-400 text-[11px] ml-2">— {item.hint}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Option 4: Toppings Selection (Clean 2-column Grid - No scrollbar needed & Lenis safe) */}
                {product.toppingList && product.toppingList.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                        4. Thêm Topping
                      </label>
                      <span className="text-[10px] text-muted-foreground">Tùy chọn (chọn nhiều)</span>
                    </div>

                    <div
                      data-lenis-prevent
                      className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-0.5"
                    >
                      {product.toppingList.map((topping) => {
                        const selected = selectedToppings.some((t) => t.id === topping.id);
                        return (
                          <button
                            key={topping.id}
                            type="button"
                            onClick={() => handleToppingToggle(topping)}
                            className={`flex items-center justify-between px-2.5 py-2 rounded-xl border text-xs transition-all cursor-pointer text-left ${
                              selected
                                ? 'border-primary bg-primary/5 text-stone-900 font-semibold shadow-2xs'
                                : 'border-stone-200/90 bg-stone-50/60 hover:bg-stone-100/70 hover:border-stone-300 text-stone-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center transition-colors ${
                                  selected
                                    ? 'bg-primary border-primary text-white'
                                    : 'border-stone-300 bg-white'
                                }`}
                              >
                                {selected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-medium truncate">{topping.tenTopping}</span>
                            </div>
                            <span
                              className={`text-[11px] font-semibold shrink-0 ml-1.5 ${
                                selected ? 'text-primary' : 'text-stone-500'
                              }`}
                            >
                              +{formatVND(topping.giaBan)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Option 5: Special Note */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    5. Ghi Chú Cho Barista
                  </label>
                  <Input
                    placeholder="VD: Không lấy ống hút, giao đá riêng..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="text-xs sm:text-sm h-10 rounded-xl border-stone-200 bg-stone-50/50 focus-visible:ring-primary"
                  />
                </div>
              </div>

              {/* Desktop Stepper & Add to Cart Action */}
              <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-stone-200 rounded-xl p-0.5 bg-stone-50 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="h-9 w-9 rounded-lg hover:bg-stone-200/60"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-9 text-center font-bold text-sm text-stone-800">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-9 w-9 rounded-lg hover:bg-stone-200/60"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Add to Cart Submit Button */}
                <Button
                  size="lg"
                  className="flex-1 h-11 text-sm sm:text-base font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Thêm vào giỏ • {formatVND(totalPrice)}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-stone-200 rounded-xl p-0.5 bg-stone-50 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="h-8 w-8 rounded-lg"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-8 text-center font-bold text-xs">{quantity}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuantity((q) => q + 1)}
              className="h-8 w-8 rounded-lg"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            className="flex-1 h-11 text-sm font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md active:scale-[0.99]"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Thêm giỏ • {formatVND(totalPrice)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
