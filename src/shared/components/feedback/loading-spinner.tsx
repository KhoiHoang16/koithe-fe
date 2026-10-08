import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/libs/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <Loader2 className={cn('animate-spin text-primary', sizeMap[size], className)} />
  );
}

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Đang tải...' }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🧋</span>
        </div>
      </div>
      <p className="text-muted-foreground text-sm animate-pulse">{message}</p>
    </div>
  );
}
