import type { ReactNode } from 'react';
import { errorText } from '../lib/presentation';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';

export function ErrorNotice({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div role="alert" className="space-y-2 text-destructive">
      <p>{errorText(error)}</p>
      {retry && (
        <Button type="button" variant="outline" onClick={retry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
export function Pager({
  page,
  total,
  pending,
  change,
}: {
  page: number;
  total: number;
  pending?: boolean;
  change: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-3 py-3">
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
export function Modal({
  title,
  description,
  children,
  close,
  busy,
}: {
  title: string;
  description: string;
  children: ReactNode;
  close: () => void;
  busy?: boolean;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) close();
      }}
    >
      <DialogContent
        className="max-h-[90vh] max-w-4xl overflow-y-auto"
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
