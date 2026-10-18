import { useState } from 'react';
import { toast } from 'sonner';
import { User, Mail, Phone, Save } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useAuthStore } from '@/shared/stores/auth-store';
import { getInitials } from '@/shared/libs/utils';

export function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const [hoTen, setHoTen] = useState(user?.hoTen || 'Nguyễn Văn A');
  const [email, setEmail] = useState(user?.email || 'nguyenvana@gmail.com');
  const [soDienThoai, setSoDienThoai] = useState(user?.soDienThoai || '0901234567');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      if (user) {
        setUser({ ...user, hoTen, email, soDienThoai });
      }
      toast.success('Đã cập nhật thông tin cá nhân thành công!');
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed py-8 sm:py-12 animate-fade-in">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mb-1.5">Tài khoản của tôi</h1>
          <p className="text-stone-600 text-xs sm:text-sm">Quản lý thông tin hồ sơ và bảo mật tài khoản</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex items-center gap-4 border-b border-stone-100 pb-6 mb-6">
            <Avatar className="h-16 w-16 border-2 border-primary shadow-xs">
              <AvatarImage src={user?.anhDaiDien} alt={hoTen} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">{getInitials(hoTen)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold text-stone-900">{hoTen}</h2>
              <p className="text-xs text-muted-foreground">{email}</p>
              <span className="inline-block mt-1 text-[11px] bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
                Thành viên Vàng (Gold Member)
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="hoTen" className="text-xs font-semibold text-stone-700">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="hoTen" value={hoTen} onChange={(e) => setHoTen(e.target.value)} className="pl-9 text-xs sm:text-sm h-10 rounded-xl border-stone-200 bg-stone-50/50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-stone-700">Email liên hệ</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 text-xs sm:text-sm h-10 rounded-xl border-stone-200 bg-stone-50/50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="soDienThoai" className="text-xs font-semibold text-stone-700">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="soDienThoai" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className="pl-9 text-xs sm:text-sm h-10 rounded-xl border-stone-200 bg-stone-50/50" />
              </div>
            </div>

            <Button type="submit" size="sm" className="gap-2 font-bold h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer mt-3" isLoading={isSaving}>
              <Save className="h-4 w-4" /> Lưu thay đổi
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
