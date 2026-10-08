import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Minus, Plus, ShoppingBag, Star, Check, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { useCartStore } from '@/shared/stores/cart-store';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';
import type { SelectedTopping } from '@/shared/types/order.types';

const SUGAR_LEVELS = ['0%', '30%', '50%', '70%', '100%'];
const ICE_LEVELS = ['0%', '30%', '50%', '70%', '100%'];

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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

  const { data: relatedProducts } = useQuery({
    queryKey: ['products', 'related'],
    queryFn: () => catalogApi.getProducts({ size: 4 }),
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
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <Link to="/menu" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại Thực đơn
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Product Image & Badges */}
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-muted border shadow-sm h-80 md:h-[450px] flex items-center justify-center">
            {product.hinhAnh ? (
              <img src={product.hinhAnh} alt={product.tenSanPham} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">🧋</span>
            )}
            {product.noiBat && (
              <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground gap-1 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" /> Bán Chạy Nhất
              </Badge>
            )}
          </div>
        </div>

        {/* Right: Product Details & Options */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="text-sm font-medium text-primary mb-1">{product.danhMucTen || 'Đồ uống'}</div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{product.tenSanPham}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 text-accent font-semibold">
                <Star className="h-4 w-4 fill-accent" />
                <span>{product.danhGiaTrungBinh || 4.9}</span>
              </div>
              <span>•</span>
              <span>Đã bán {product.soLuongBan || 500}+ ly</span>
            </div>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">{product.moTa}</p>
          </div>

          <div className="h-px bg-border" />

          {/* Size / Variant Options */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">1. Chọn Size</label>
            <div className="grid grid-cols-3 gap-3">
              {product.bienTheList.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    currentVariant.id === v.id
                      ? 'border-primary bg-primary/10 font-bold text-primary shadow-sm'
                      : 'border-input hover:border-muted-foreground'
                  }`}
                >
                  <div className="text-sm">{v.tenBienThe}</div>
                  <div className="text-xs text-muted-foreground mt-1">{formatVND(v.giaBan)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sugar Level */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">2. Mức Đường</label>
            <div className="flex flex-wrap gap-2">
              {SUGAR_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSugarLevel(level)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                    sugarLevel === level ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Ice Level */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">3. Mức Đá</label>
            <div className="flex flex-wrap gap-2">
              {ICE_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setIceLevel(level)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                    iceLevel === level ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Toppings Selection */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">4. Thêm Topping (Tùy chọn)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.toppingList.map((topping) => {
                const selected = selectedToppings.some((t) => t.id === topping.id);
                return (
                  <button
                    key={topping.id}
                    type="button"
                    onClick={() => handleToppingToggle(topping)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all ${
                      selected ? 'border-primary bg-primary/5 font-medium' : 'border-input hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center ${
                          selected ? 'bg-primary border-primary text-white' : 'border-muted-foreground'
                        }`}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </div>
                      <span>{topping.tenTopping}</span>
                    </div>
                    <span className="text-muted-foreground font-semibold">+{formatVND(topping.giaBan)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barista Note */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Ghi chú cho quán</label>
            <Input
              placeholder="VD: Không lấy ống hút nhựa, giao ly tách rời đá..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="h-px bg-border" />

          {/* Bottom Total & Add to Cart Action */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            {/* Quantity Controls */}
            <div className="flex items-center border rounded-xl p-1 bg-muted/40">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-bold text-sm">{quantity}</span>
              <Button variant="ghost" size="icon-sm" onClick={() => setQuantity((q) => q + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Add to Cart Submit Button */}
            <Button size="lg" className="w-full sm:flex-1 h-12 text-base font-semibold gap-2 btn-primary rounded-xl" onClick={handleAddToCart}>
              <ShoppingBag className="h-5 w-5" />
              Thêm vào giỏ • {formatVND(totalPrice)}
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products Carousel / Grid */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16 pt-12 border-t">
          <h2 className="text-xl font-bold mb-6">Đồ uống thường đi kèm</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((item) => (
              <Link key={item.id} to={`/menu/${item.id}`} className="group">
                <Card className="overflow-hidden card-hover">
                  <div className="h-36 bg-muted flex items-center justify-center overflow-hidden">
                    {item.hinhAnh ? (
                      <img src={item.hinhAnh} alt={item.tenSanPham} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-4xl">🧋</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-xs line-clamp-1 mb-1">{item.tenSanPham}</h3>
                    <p className="text-primary font-bold text-xs">{formatVND(item.giaTu)}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
