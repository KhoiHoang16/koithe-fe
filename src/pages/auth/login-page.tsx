import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAuthStore } from '@/shared/stores/auth-store';
import { authApi } from '@/features/auth/api/auth-api';

const loginSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
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
      const session = await authApi.login(data.username, data.password);
      login({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
      });
      toast.success('Đăng nhập thành công!');
      if (session.user.vaiTro === 'ADMIN' || session.user.vaiTro === 'MANAGER') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      toast.error('Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
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
          <Label htmlFor="login-username" className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Tên đăng nhập
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              id="login-username"
              type="text"
              placeholder="Tên đăng nhập"
              className="pl-10 h-11 rounded-xl border-neutral-200 bg-neutral-50/70 focus:bg-white focus-visible:ring-1 focus-visible:ring-primary transition-all"
              autoComplete="username"
              {...register('username')}
            />
          </div>
          {errors.username && (
            <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
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
              {...register('password')}
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
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
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
