import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Phone, Sparkles, UserCheck, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAuthStore } from '@/shared/stores/auth-store';
import { httpClient } from '@/shared/api/http-client';
import type { LoginResponse } from '@/shared/stores/auth-store';

const loginSchema = z.object({
  soDienThoai: z.string().min(10, 'Số điện thoại không hợp lệ'),
  matKhau: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await httpClient.post<LoginResponse>('/auth/login', data);
      login(res as unknown as LoginResponse);
      toast.success('Đăng nhập thành công!');
      // Redirect về trang trước hoặc admin nếu là staff
      const user = (res as unknown as LoginResponse).user;
      if (user.vaiTro === 'ADMIN' || user.vaiTro === 'MANAGER') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      toast.error('Số điện thoại hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Đăng nhập giả lập nhanh phục vụ quá trình phát triển & kiểm thử giao diện
   * (Xóa hàm này khi tích hợp hoàn chỉnh và lên production)
   */
  const handleDemoLogin = (role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER') => {
    login({
      accessToken: 'demo-token-' + Date.now(),
      refreshToken: 'demo-refresh-token-' + Date.now(),
      user: {
        id: role === 'CUSTOMER' ? 1 : 99,
        hoTen: role === 'CUSTOMER' ? 'Nguyễn Văn A' : 'Quản trị viên KOI',
        email: role === 'CUSTOMER' ? 'nguyenvana@gmail.com' : 'admin@koithe.vn',
        soDienThoai: role === 'CUSTOMER' ? '0901234567' : '0988888888',
        vaiTro: role,
        anhDaiDien:
          role === 'CUSTOMER'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            : undefined,
        trangThai: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    });
    toast.success(
      `Đăng nhập thành công tài khoản ${role === 'CUSTOMER' ? 'Khách hàng' : 'Quản trị viên'} (Demo)!`,
    );
    if (role === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else {
      const targetPath =
        from === '/' || from === '/login' || from === '/register' ? '/profile' : from;
      navigate(targetPath, { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-black text-foreground tracking-tight">Đăng nhập</h1>
        <p className="text-neutral-500 text-xs sm:text-sm mt-1 font-light">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="login-phone" className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Số điện thoại
          </Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="login-phone"
              type="tel"
              placeholder="0xxxxxxxxx"
              className="pl-10 h-11 rounded-xl border-neutral-200 bg-neutral-50/70 focus:bg-white focus-visible:ring-1 focus-visible:ring-primary transition-all"
              autoComplete="tel"
              {...register('soDienThoai')}
            />
          </div>
          {errors.soDienThoai && (
            <p className="text-xs text-destructive mt-1">{errors.soDienThoai.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Mật khẩu
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs text-neutral-400 hover:text-primary transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10 h-11 rounded-xl border-neutral-200 bg-neutral-50/70 focus:bg-white focus-visible:ring-1 focus-visible:ring-primary transition-all"
              autoComplete="current-password"
              {...register('matKhau')}
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.matKhau && (
            <p className="text-xs text-destructive mt-1">{errors.matKhau.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-sm"
          isLoading={isLoading}
        >
          Đăng nhập
        </Button>
      </form>

      {/* ============================================================== */}
      {/* DEV / DEMO QUICK LOGIN (Dễ dàng xóa bỏ khi lên Production)      */}
      {/* ============================================================== */}
      <div className="pt-1">
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Đăng nhập nhanh (Demo)
            </span>
            <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
              Test UI
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Chọn vai trò bên dưới để kiểm tra giao diện không cần qua backend:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('CUSTOMER')}
              className="h-9 text-xs font-semibold rounded-xl border-primary/30 bg-white hover:bg-primary hover:text-white hover:border-primary transition-all text-primary gap-1.5"
            >
              <UserCheck className="h-3.5 w-3.5" /> Khách hàng
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin('ADMIN')}
              className="h-9 text-xs font-semibold rounded-xl border-neutral-300 bg-white hover:bg-neutral-800 hover:text-white hover:border-neutral-800 transition-all text-neutral-700 gap-1.5"
            >
              <Shield className="h-3.5 w-3.5" /> Quản trị viên
            </Button>
          </div>
        </div>
      </div>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-white/95 px-3 text-neutral-400 font-medium">Hoặc</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full h-10 rounded-xl border border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary hover:bg-primary/5 font-medium transition-all"
        asChild
      >
        <Link to="/menu">Tiếp tục không đăng nhập</Link>
      </Button>
    </div>
  );
}
