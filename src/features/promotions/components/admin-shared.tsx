import type { ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { promotionError } from '../lib/admin-presentation';
export function PromotionError({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div role="alert" className="space-y-2 text-destructive">
      <p>{promotionError(error)}</p>
      {retry && (
        <Button type="button" variant="outline" onClick={retry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
export function PromotionPager({
  page,
  total,
  pending,
  change,
}: {
  page: number;
  total: number;
  pending: boolean;
  change: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 py-3">
      <Button
        type="button"
        variant="outline"
        disabled={page === 0 || pending}
        onClick={() => change(page - 1)}
      >
        Trước
      </Button>
      <span>
        Trang {page + 1} / {Math.max(1, total)}
      </span>
      <Button
        type="button"
        variant="outline"
        disabled={page + 1 >= total || pending}
        onClick={() => change(page + 1)}
      >
        Sau
      </Button>
    </div>
  );
}
export function PromotionModal({
  title,
  description,
  busy,
  close,
  children,
}: {
  title: string;
  description: string;
  busy: boolean;
  close: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) close();
      }}
    >
      <DialogContent
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (busy) e.preventDefault();
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
