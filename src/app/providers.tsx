import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { queryClient } from './query-client';
import { env } from '@/shared/libs/env';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        {children}
      </TooltipProvider>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            fontFamily: 'Be Vietnam Pro, Inter, system-ui, sans-serif',
          },
        }}
      />

      {/* React Query Devtools - chỉ hiện trong dev */}
      {env.VITE_ENABLE_QUERY_DEVTOOLS && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
