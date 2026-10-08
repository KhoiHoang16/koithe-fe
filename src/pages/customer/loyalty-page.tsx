import { Crown, Gift, History } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

export function LoyaltyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Điểm thưởng & Hạng thành viên</h1>
        <p className="text-muted-foreground text-sm">Tích điểm nhận quà độc quyền từ MilkTea Omnichannel</p>
      </div>

      {/* Member Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-accent/80 text-white p-6 shadow-xl mb-8">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="bg-white/20 text-white border-0 gap-1 mb-2">
              <Crown className="h-3.5 w-3.5 text-yellow-300" /> Hạng Vàng (Gold Tier)
            </Badge>
            <h2 className="text-2xl font-bold">Nguyễn Văn A</h2>
            <p className="text-xs text-accent-foreground/80 mt-0.5">Thành viên từ tháng 01/2026</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-amber-100 uppercase font-semibold block">Điểm tích lũy</span>
            <span className="text-4xl font-extrabold">1,250</span>
            <span className="text-xs text-amber-200 block mt-0.5">~ 125.000đ quy đổi</span>
          </div>
        </div>

        {/* Progress Bar to next tier */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between text-xs text-accent-foreground font-medium">
            <span>Tiến trình nâng hạng Kim Cương</span>
            <span>1,250 / 2,000 điểm</span>
          </div>
          <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-300 rounded-full transition-all duration-500" style={{ width: '62.5%' }} />
          </div>
          <p className="text-[11px] text-accent-foreground/80">Cần tích lũy thêm 750 điểm nữa để đạt hạng Kim Cương (Giảm 10% mọi đơn hàng)</p>
        </div>
      </div>

      {/* Point Benefits */}
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Gift className="h-5 w-5 text-primary" /> Quyền lợi hạng Vàng
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 border">
          <div className="text-2xl mb-2">🎁</div>
          <h3 className="font-bold text-sm">Quà sinh nhật</h3>
          <p className="text-xs text-muted-foreground mt-1">Tặng 1 ly trà sữa Size L miễn phí vào tháng sinh nhật.</p>
        </Card>
        <Card className="p-4 border">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="font-bold text-sm">Tích điểm x1.5</h3>
          <p className="text-xs text-muted-foreground mt-1">Tích 15 điểm cho mỗi 10.000đ chi tiêu.</p>
        </Card>
        <Card className="p-4 border">
          <div className="text-2xl mb-2">🚚</div>
          <h3 className="font-bold text-sm">Free Shipping</h3>
          <p className="text-xs text-muted-foreground mt-1">Tặng 4 voucher miễn phí giao hàng hàng tháng.</p>
        </Card>
      </div>

      {/* Point History */}
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-primary" /> Lịch sử tích / đổi điểm
      </h2>
      <Card className="p-4 space-y-3">
        {[
          { title: 'Tích điểm đơn hàng #KOI-20261008-01', points: '+115 điểm', date: '08/10/2026', type: 'plus' },
          { title: 'Đổi Voucher Giảm 20k', points: '-200 điểm', date: '05/10/2026', type: 'minus' },
          { title: 'Tích điểm đơn hàng #KOI-20261001-05', points: '+98 điểm', date: '01/10/2026', type: 'plus' },
        ].map((log, idx) => (
          <div key={idx} className="flex justify-between items-center text-xs border-b last:border-0 pb-2 last:pb-0">
            <div>
              <div className="font-semibold">{log.title}</div>
              <div className="text-muted-foreground text-[11px]">{log.date}</div>
            </div>
            <div className={`font-bold text-sm ${log.type === 'plus' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {log.points}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
