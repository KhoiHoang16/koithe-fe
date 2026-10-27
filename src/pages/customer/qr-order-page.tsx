import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, QrCode } from 'lucide-react';
import { tableApi } from '@/features/tables/api/table-api';
import { useTableSessionStore } from '@/features/tables/stores/table-session-store';
import { ApiError } from '@/shared/api/http-client';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';

export function QrOrderPage() {
  const { tableToken = '' } = useParams<{ tableToken: string }>();
  const setTable = useTableSessionStore((state) => state.setTable);
  const clearTable = useTableSessionStore((state) => state.clearTable);
  const table = useQuery({
    queryKey: ['tables', 'qr', tableToken],
    queryFn: () => tableApi.getByQrToken(tableToken),
    enabled: !!tableToken,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Clear the previous table even while a different QR is being verified.
  useEffect(() => {
    clearTable();
  }, [tableToken, clearTable]);

  useEffect(() => {
    if (table.isSuccess && !table.isFetching) {
      setTable({ tableId: table.data.id, tableName: table.data.soBan, token: tableToken });
    } else {
      clearTable();
    }
  }, [table.data, table.isSuccess, table.isFetching, tableToken, setTable, clearTable]);

  const ready = table.isSuccess && !table.isFetching;
  const invalid = !tableToken || (table.error instanceof ApiError && [400, 404].includes(table.error.code));

  return (
    <div className="min-h-screen bg-[url('/checkout-bg.png')] bg-cover bg-center py-12 px-4">
      <Card className="mx-auto max-w-lg rounded-3xl bg-white/95 p-6 sm:p-8 text-center space-y-5">
        <QrCode className="mx-auto h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold">Gọi món tại bàn</h1>
        {table.isFetching ? (
          <p role="status" className="text-sm text-stone-600">Đang kiểm tra mã QR bàn...</p>
        ) : ready ? (
          <>
            <p className="text-sm text-stone-600 break-words">
              Chào mừng! Bạn đang ngồi tại <strong className="text-primary">{table.data.soBan}</strong>.
            </p>
            <p className="text-sm text-stone-600">Chọn món từ thực đơn. Thông tin bàn sẽ được điền sẵn khi đặt hàng.</p>
            <Button asChild className="w-full rounded-xl"><Link to="/menu">Xem thực đơn</Link></Button>
          </>
        ) : (
          <div role="alert" className="space-y-4">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
            <p className="text-sm text-stone-600">
              {invalid ? 'Mã QR không hợp lệ hoặc đã hết hạn. Vui lòng quét lại mã tại bàn.' : 'Không thể kiểm tra mã QR lúc này. Vui lòng thử lại.'}
            </p>
            {!!tableToken && <Button variant="outline" onClick={() => void table.refetch()}>Thử lại</Button>}
          </div>
        )}
      </Card>
    </div>
  );
}
