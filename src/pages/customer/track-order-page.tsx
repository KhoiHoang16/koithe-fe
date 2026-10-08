import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

export function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<null | { found: boolean }>(null);

  const handleSearch = () => {
    // TODO: Gọi API /orders/track
    setResult({ found: true });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">📦</div>
        <h1 className="text-2xl font-bold">Theo dõi đơn hàng</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Nhập mã đơn hàng và số điện thoại để kiểm tra trạng thái
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="track-order-id">Mã đơn hàng</Label>
            <Input
              id="track-order-id"
              placeholder="VD: DH001234"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="track-phone">Số điện thoại</Label>
            <Input
              id="track-phone"
              type="tel"
              placeholder="0xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSearch} disabled={!orderId || !phone}>
            <Search className="mr-2 h-4 w-4" />
            Kiểm tra đơn hàng
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-6 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono font-bold">#DH{orderId}</span>
              <Badge variant="warning">Đang chuẩn bị</Badge>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Đặt hàng', done: true },
                { label: 'Xác nhận', done: true },
                { label: 'Đang chuẩn bị', done: false },
                { label: 'Đang giao', done: false },
                { label: 'Hoàn thành', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full border-2 ${
                      step.done
                        ? 'bg-primary border-primary'
                        : 'bg-background border-muted-foreground/30'
                    }`}
                  />
                  <span
                    className={`text-sm ${step.done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
