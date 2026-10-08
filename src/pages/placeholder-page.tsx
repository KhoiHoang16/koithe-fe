import { Construction } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

/** Placeholder cho trang chưa implement */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
        <Construction className="h-10 w-10 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          {description ?? 'Tính năng này đang được phát triển. Vui lòng quay lại sau!'}
        </p>
      </div>
      <Badge variant="outline" className="text-xs">
        🚧 Coming Soon
      </Badge>
      <Button variant="outline" asChild>
        <Link to="/">Về trang chủ</Link>
      </Button>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; variant?: string; className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className ?? ''}`}>{children}</span>;
}
