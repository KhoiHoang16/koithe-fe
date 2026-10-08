import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Eye, EyeOff, Lock, Phone, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { httpClient } from '@/shared/api/http-client';

const registerSchema = z
  .object({
    hoTen: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
    soDienThoai: z.string().min(10, 'Số điện thoại không hợp lệ'),
    email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
    matKhau: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    xacNhanMatKhau: z.string(),
  })
  .refine((data) => data.matKhau === data.xacNhanMatKhau, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['xacNhanMatKhau'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await httpClient.post('/auth/register', {
        hoTen: data.hoTen,
        soDienThoai: data.soDienThoai,
        email: data.email || undefined,
        matKhau: data.matKhau,
      });
      setSuccess(true);
      toast.success('Đăng ký thành công!');
    } catch {
      toast.error('Số điện thoại đã được đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold">Đăng ký thành công!</h2>
        <p className="text-muted-foreground">Tài khoản của bạn đã được tạo.</p>
        <Button asChild className="w-full">
          <Link to="/login">Đăng nhập ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="reg-name">Họ và tên</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="reg-name" placeholder="Nguyễn Văn A" className="pl-10" {...register('hoTen')} />
          </div>
          {errors.hoTen && <p className="text-xs text-destructive">{errors.hoTen.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-phone">Số điện thoại</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="reg-phone" type="tel" placeholder="0xxxxxxxxx" className="pl-10" {...register('soDienThoai')} />
          </div>
          {errors.soDienThoai && <p className="text-xs text-destructive">{errors.soDienThoai.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password">
            Mật khẩu
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register('matKhau')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.matKhau && <p className="text-xs text-destructive">{errors.matKhau.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-confirm">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="reg-confirm"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              {...register('xacNhanMatKhau')}
            />
          </div>
          {errors.xacNhanMatKhau && <p className="text-xs text-destructive">{errors.xacNhanMatKhau.message}</p>}
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
          Đăng ký
        </Button>
      </form>
    </div>
  );
}
