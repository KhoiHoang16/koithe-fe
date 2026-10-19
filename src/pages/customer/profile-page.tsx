import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Save,
  ShoppingBag,
  ShieldCheck,
  KeyRound,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  Crown,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { useAuthStore } from '@/shared/stores/auth-store';
import { getInitials } from '@/shared/libs/utils';

export function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();

  // Form states
  const [hoTen, setHoTen] = useState(user?.hoTen || 'FRIEND');
  const [email, setEmail] = useState(user?.email || 'nguyenvana@gmail.com');
  const [soDienThoai, setSoDienThoai] = useState(user?.soDienThoai || '0901234567');
  const [ngaySinh, setNgaySinh] = useState('1998-08-18');
  const [gioiTinh, setGioiTinh] = useState<'NAM' | 'NU' | 'KHAC'>('NAM');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.anhDaiDien ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  );

  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI modal states
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Masked phone format (e.g. +84 918****18)
  const formatMaskedPhone = (phone: string) => {
    if (!phone) return '+84 918****18';
    const clean = phone.replace(/\s+/g, '');
    if (clean.length >= 9) {
      const prefix = clean.startsWith('0') ? '+84 ' + clean.slice(1, 4) : clean.slice(0, 4);
      const suffix = clean.slice(-2);
      return `${prefix}****${suffix}`;
    }
    return phone;
  };

  // Cập nhật thông tin cá nhân
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      if (user) {
        setUser({ ...user, hoTen, email, soDienThoai, anhDaiDien: avatarUrl });
      }
      toast.success('Đã cập nhật thông tin cá nhân thành công');
      setIsSaving(false);
    }, 600);
  };

  // Đổi avatar mẫu ngẫu nhiên
  const handleChangeAvatar = () => {
    const sampleAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    ];
    const nextAvatar = sampleAvatars[(sampleAvatars.indexOf(avatarUrl) + 1) % sampleAvatars.length];
    setAvatarUrl(nextAvatar);
    if (user) {
      setUser({ ...user, anhDaiDien: nextAvatar });
    }
    toast.success('Đã thay đổi ảnh đại diện');
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ các trường mật khẩu');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    setIsChangingPassword(true);
    setTimeout(() => {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      toast.success('Mật khẩu đã được thay đổi thành công');
    }, 700);
  };

  // Đăng xuất
  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất tài khoản thành công');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center bg-fixed py-6 sm:py-10 animate-fade-in">
      <div className="container mx-auto px-4 max-w-6xl space-y-6 sm:space-y-8">
        {/* ============================================================== */}
        {/* TOP BOTANICAL ART BANNER (VINTAGE TEA & FRUITS ARTWORK)       */}
        {/* ============================================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/80 bg-white">
          {/* Ảnh nền tranh vẽ thực vật hoa quả & lá trà */}
          <div className="h-44 sm:h-56 md:h-64 w-full bg-[url('/profile-botanical-banner.jpg')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/15 to-black/10" />

            {/* Thông tin hội viên góc dưới bên trái của Banner */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-end gap-3.5 sm:gap-4 z-10 text-white">
              {/* Avatar tròn với viền ring sang trọng */}
              <div className="relative group shrink-0">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-3 ring-white shadow-lg bg-stone-100">
                  <AvatarImage src={avatarUrl} alt={hoTen} />
                  <AvatarFallback className="text-xl font-bold bg-primary/20 text-white">
                    {getInitials(hoTen)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={handleChangeAvatar}
                  title="Thay đổi ảnh đại diện"
                  className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>

              {/* Tên & Số điện thoại đã che */}
              <div className="space-y-0.5 pb-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-black tracking-wide uppercase drop-shadow-md">
                    {hoTen || 'FRIEND'}
                  </h1>
                  <Badge className="bg-amber-400/90 text-stone-950 font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 border-none shadow-xs">
                    TEA SEEKER
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm font-mono text-stone-200 drop-shadow-sm">
                  {formatMaskedPhone(soDienThoai)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN 2-COLUMN STUDIO LAYOUT                                    */}
        {/* CỘT TRÁI: THẺ HỘI VIÊN SAGE + MENU TIỆN ÍCH TÀI KHOẢN CỦA TÔI */}
        {/* CỘT PHẢI: FORM CHỈNH SỬA HỒ SƠ & BẢO MẬT                       */}
        {/* ============================================================== */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* ============================================================ */}
          {/* CỘT TRÁI (LEFT COLUMN - 40%): PHONG CÁCH CHAGEE PROFILE     */}
          {/* ============================================================ */}
          <aside className="w-full lg:w-[410px] shrink-0 space-y-6">
            {/* THẺ HỘI VIÊN MÀU XANH RÊU / MATCHA SAGE ("CHA SEEKER / TEA SEEKER") */}
            <div className="relative overflow-hidden rounded-3xl bg-[#8E9A86] text-stone-900 p-6 sm:p-7 shadow-md border border-[#7D8C76]/60">
              {/* Họa tiết hoa văn hoa trà / lá trà chìm góc trên bên phải */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-28 h-28 pointer-events-none opacity-20 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-white flex items-center justify-center">
                  <Crown className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Biểu tượng logo quý cô trà mờ phong cách CHAGEE */}
              <div className="absolute right-5 top-5 w-20 h-20 rounded-full border border-white/30 bg-white/10 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <Sparkles className="h-6 w-6 text-white/80 mx-auto mb-0.5" />
                  <span className="text-[8px] font-black tracking-widest text-white/90 uppercase block">
                    KOI TEA
                  </span>
                </div>
              </div>

              <div className="relative z-10 space-y-4">
                {/* Tên hạng thành viên chữ Serif sang trọng */}
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-wide text-[#1B291D]">
                    TEA Seeker
                  </h2>
                  <p className="text-xs font-medium text-[#2E4031] mt-1">
                    9 Cup để thăng hạng!
                  </p>
                </div>

                {/* Thanh tiến trình thăng hạng (Progress bar kiểu CHAGEE) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 bg-black/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1B291D] rounded-full transition-all duration-700"
                        style={{ width: '10%' }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#1B291D] shrink-0">1/10</span>
                  </div>
                  <p className="text-[11px] text-[#2E4031]/80">
                    Tích thêm 9 ly đồ uống để nâng cấp đặc quyền <strong className="font-semibold text-[#1B291D]">Gold Member</strong>.
                  </p>
                </div>

                {/* Nút xem quyền lợi hội viên (Quyền lợi của tôi >) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBenefitsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B291D] hover:text-black transition-colors cursor-pointer group"
                  >
                    <span>Quyền lợi của tôi</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* DANH SÁCH MENU TIỆN ÍCH: TÀI KHOẢN CỦA TÔI */}
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-black text-stone-900 tracking-wider uppercase px-1">
                Tài khoản của tôi
              </h3>

              <div className="bg-[#FFFDF9] rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
                {/* Lối tắt 1: Những câu hỏi thường gặp */}
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="h-4 w-4 text-stone-500 group-hover:text-primary transition-colors" />
                    <span>Những câu hỏi thường gặp</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Lối tắt 2: Lịch sử đơn hàng */}
                <Link
                  to="/orders"
                  className="flex items-center justify-between px-4 py-3.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="h-4 w-4 text-stone-500 group-hover:text-primary transition-colors" />
                    <span>Lịch sử đơn hàng</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>



                {/* Lối tắt: Đăng xuất tài khoản */}
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-xs font-semibold text-rose-600 hover:bg-rose-50/70 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <LogOut className="h-4 w-4 text-rose-500" />
                    <span>Đăng xuất tài khoản</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-rose-400" />
                </button>
              </div>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* CỘT PHẢI (RIGHT COLUMN - 60%): TRUNG TÂM QUẢN LÝ HỒ SƠ WEB   */}
          {/* ============================================================ */}
          <main className="flex-1 w-full space-y-6">
            <Card className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm">
              <Tabs defaultValue="personal" className="w-full">
                {/* Danh sách 2 tab chuyển đổi: Hồ sơ & Mật khẩu */}
                <TabsList className="grid grid-cols-2 max-w-xs sm:max-w-sm mb-6 h-11 p-1 bg-stone-100/80 rounded-2xl">
                  <TabsTrigger
                    value="personal"
                    className="text-xs font-semibold rounded-xl gap-1.5 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-xs"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Hồ sơ cá nhân</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="text-xs font-semibold rounded-xl gap-1.5 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-xs"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Đổi mật khẩu</span>
                  </TabsTrigger>
                </TabsList>

                {/* ======================================================== */}
                {/* TAB 1: THÔNG TIN HỒ SƠ CÁ NHÂN                           */}
                {/* ======================================================== */}
                <TabsContent value="personal" className="space-y-6 mt-0">
                  <div className="pb-4 border-b border-stone-100">
                    <h3 className="text-base font-bold text-stone-900">
                      Chi tiết hồ sơ hội viên
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Quản lý tên hiển thị, phương thức liên lạc và thông tin ngày sinh
                    </p>
                  </div>

                  <form onSubmit={handleSaveInfo} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Họ và tên */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="hoTen"
                          className="text-xs font-semibold text-stone-700 uppercase tracking-wider"
                        >
                          Họ và tên
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                          <Input
                            id="hoTen"
                            value={hoTen}
                            onChange={(e) => setHoTen(e.target.value)}
                            placeholder="Nguyễn Văn A"
                            className="pl-10 h-11 text-xs sm:text-sm rounded-xl border-stone-200 bg-stone-50/60 focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      {/* Số điện thoại */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="soDienThoai"
                            className="text-xs font-semibold text-stone-700 uppercase tracking-wider"
                          >
                            Số điện thoại
                          </Label>
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Đã liên kết
                          </span>
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                          <Input
                            id="soDienThoai"
                            value={soDienThoai}
                            onChange={(e) => setSoDienThoai(e.target.value)}
                            className="pl-10 h-11 text-xs sm:text-sm rounded-xl border-stone-200 bg-stone-50/60 focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="email"
                            className="text-xs font-semibold text-stone-700 uppercase tracking-wider"
                          >
                            Địa chỉ Email
                          </Label>
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Đã xác thực
                          </span>
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-11 text-xs sm:text-sm rounded-xl border-stone-200 bg-stone-50/60 focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      {/* Ngày sinh */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="ngaySinh"
                          className="text-xs font-semibold text-stone-700 uppercase tracking-wider"
                        >
                          Ngày sinh (Nhận quà sinh nhật)
                        </Label>
                        <Input
                          id="ngaySinh"
                          type="date"
                          value={ngaySinh}
                          onChange={(e) => setNgaySinh(e.target.value)}
                          className="h-11 text-xs sm:text-sm rounded-xl border-stone-200 bg-stone-50/60 focus:bg-white px-3.5"
                        />
                      </div>
                    </div>

                    {/* Giới tính */}
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                        Giới tính
                      </Label>
                      <div className="flex items-center gap-3">
                        {[
                          { value: 'NAM', label: 'Nam' },
                          { value: 'NU', label: 'Nữ' },
                          { value: 'KHAC', label: 'Khác' },
                        ].map((item) => (
                          <label
                            key={item.value}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                              gioiTinh === item.value
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-stone-200 bg-stone-50/60 text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            <input
                              type="radio"
                              name="gender"
                              value={item.value}
                              checked={gioiTinh === item.value}
                              onChange={() => setGioiTinh(item.value as 'NAM' | 'NU' | 'KHAC')}
                              className="sr-only"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3">
                      <Button
                        type="submit"
                        className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-xs cursor-pointer"
                        isLoading={isSaving}
                      >
                        <Save className="h-4 w-4" />
                        <span>Lưu thay đổi hồ sơ</span>
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                {/* ======================================================== */}
                {/* TAB 2: ĐỔI MẬT KHẨU                                      */}
                {/* ======================================================== */}
                <TabsContent value="security" className="space-y-6 mt-0">
                  <div className="pb-4 border-b border-stone-100">
                    <h3 className="text-base font-bold text-stone-900">Bảo mật tài khoản</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Thiết lập mật khẩu mạnh để bảo vệ thông tin và giỏ hàng của bạn
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="oldPassword"
                        className="text-xs font-semibold text-stone-700 uppercase tracking-wider"
                      >
                        Mật khẩu hiện tại
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="oldPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Nhập mật khẩu hiện tại"
                          className="pl-10 pr-10 h-11 text-xs sm:text-sm rounded-xl border-stone-200 bg-stone-50/60 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="newPassword"
                        className="text-xs font-semibold text-stone-700 uppercase tracking-wider"
                      >
                        Mật khẩu mới
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Tối thiểu 6 ký tự"
                          className="pl-10 pr-10 h-11 text-xs sm:text-sm rounded-xl border-stone-200 bg-stone-50/60 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-xs font-semibold text-stone-700 uppercase tracking-wider"
                      >
                        Xác nhận mật khẩu mới
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu mới"
                          className="pl-10 pr-10 h-11 text-xs sm:text-sm rounded-xl border-stone-200 bg-stone-50/60 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-xs cursor-pointer"
                        isLoading={isChangingPassword}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Cập nhật mật khẩu</span>
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          </main>
        </div>
      </div>

      {/* ============================================================== */}
      {/* DIALOG: ĐẶC QUYỀN HỘI VIÊN (TIER BENEFITS MODAL)               */}
      {/* ============================================================== */}
      <Dialog open={isBenefitsModalOpen} onOpenChange={setIsBenefitsModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-6 sm:p-7 border border-stone-200">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-lg font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <span>Đặc Quyền Hội Viên KOI Thé</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Quyền lợi tương ứng với từng cấp độ hội viên Tea Craft Club
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-3 text-xs">
            {/* Hạng 1 */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800">KOI Friend (Hạng Khởi Đầu)</span>
                <span className="text-[10px] font-semibold text-stone-500">0 - 9 Cups</span>
              </div>
              <p className="text-stone-500 text-[11px] leading-relaxed">
                Tích lũy 1 Lá Trà cho mỗi 10.000 VNĐ chi tiêu. Đổi quà trong danh mục ưu đãi.
              </p>
            </div>

            {/* Hạng 2 (Hiện tại) */}
            <div className="p-3.5 rounded-2xl bg-[#8E9A86]/20 border border-[#8E9A86] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1B291D] flex items-center gap-1.5">
                  <span>TEA Seeker (Hạng Hiện Tại)</span>
                  <Badge className="bg-[#8E9A86] text-white text-[9px] px-1.5 py-0 border-none">BẠN ĐANG Ở ĐÂY</Badge>
                </span>
                <span className="text-[10px] font-bold text-[#1B291D]">10 - 29 Cups</span>
              </div>
              <p className="text-[#2E4031] text-[11px] leading-relaxed">
                Giảm 5% vào ngày Hội viên hàng tháng. Tặng voucher sinh nhật trị giá 50.000 VNĐ.
              </p>
            </div>

            {/* Hạng 3 */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">Gold Member (Hạng Vàng)</span>
                <span className="text-[10px] font-semibold text-amber-700">30 - 49 Cups</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Giảm 10% cho mọi đơn hàng. Miễn phí 01 ly trà size M vào tháng sinh nhật.
              </p>
            </div>

            {/* Hạng 4 */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950">Diamond Member (Kim Cương)</span>
                <span className="text-[10px] font-semibold text-emerald-700">50+ Cups</span>
              </div>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Miễn phí giao hàng (Freeship) mọi đơn hàng. Nhận quà tặng giới hạn độc quyền mỗi dịp lễ.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setIsBenefitsModalOpen(false)}
            className="w-full rounded-xl text-xs font-semibold h-10 bg-stone-900 hover:bg-stone-800 text-white"
          >
            Đã hiểu
          </Button>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/* DIALOG: NHỮNG CÂU HỎI THƯỜNG GẶP (FAQ MODAL)                   */}
      {/* ============================================================== */}
      <Dialog open={isFaqModalOpen} onOpenChange={setIsFaqModalOpen}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-6 sm:p-7 border border-stone-200">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-lg font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <span>Những Câu Hỏi Thường Gặp</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Giải đáp thắc mắc về điểm lá trà, thăng hạng và sử dụng voucher
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-3 text-xs divide-y divide-stone-100">
            <div className="space-y-1 pt-1">
              <h4 className="font-bold text-stone-900">
                1. "Lá Trà (Tea Leaves)" được tính như thế nào?
              </h4>
              <p className="text-stone-500 leading-relaxed text-[11px]">
                Với mỗi 10.000 VNĐ chi tiêu tại quầy hoặc đặt qua website, bạn sẽ nhận được 1 Lá Trà. 1 Lá Trà có giá trị quy đổi tương đương 1.000 VNĐ khi thanh toán.
              </p>
            </div>

            <div className="space-y-1 pt-3">
              <h4 className="font-bold text-stone-900">
                2. Làm sao để nâng cấp hạng thẻ (Cup)?
              </h4>
              <p className="text-stone-500 leading-relaxed text-[11px]">
                Mỗi ly đồ uống hoàn thành tương ứng với 1 Cup. Khi đạt đủ số Cup quy định trong chu kỳ xét hạng, hệ thống sẽ tự động nâng cấp bậc thành viên của bạn.
              </p>
            </div>

            <div className="space-y-1 pt-3">
              <h4 className="font-bold text-stone-900">
                3. Làm thế nào để tích điểm khi mua tại quầy?
              </h4>
              <p className="text-stone-500 leading-relaxed text-[11px]">
                Bạn chỉ cần đọc số điện thoại đã đăng ký tài khoản cho nhân viên thu ngân trước khi thanh toán tại bất kỳ cửa hàng KOI Thé nào trên toàn quốc.
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setIsFaqModalOpen(false)}
            className="w-full rounded-xl text-xs font-semibold h-10 border-stone-200"
            variant="outline"
          >
            Đóng câu hỏi
          </Button>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* MODAL XÁC NHẬN ĐĂNG XUẤT TÀI KHOẢN                           */}
      {/* ============================================================ */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="max-w-xs sm:max-w-sm rounded-3xl p-6 border border-stone-200/90 bg-white/95 backdrop-blur-md shadow-2xl text-center">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-base sm:text-lg font-bold text-stone-900 text-center">
              Xác nhận đăng xuất
            </DialogTitle>
            <DialogDescription className="sr-only">
              Xác nhận đăng xuất khỏi tài khoản
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1 h-10 rounded-xl text-xs font-semibold border-stone-200 hover:bg-stone-100 text-stone-700 cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsLogoutModalOpen(false);
                handleLogout();
              }}
              className="flex-1 h-10 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
            >
              Đăng xuất
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
