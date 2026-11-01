import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/components/ui/button';
import { reportApi } from '../api/report-api';
import {
  presetRange,
  validateRange,
  type ReportPreset,
  type ReportRange,
} from '../lib/report-data';
import { money, count, dateLabel, reportError } from '../lib/presentation';
import { ReportCharts } from './report-charts';

export function ReportDashboard() {
  const user = useAuthStore((state) => state.user);
  const allowed = user?.vaiTro === 'ADMIN' || user?.vaiTro === 'MANAGER';
  const [range, setRange] = useState<ReportRange>(() => presetRange('today'));
  const [draft, setDraft] = useState(range);
  const [preset, setPreset] = useState<ReportPreset | null>('today');
  const [validation, setValidation] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ['reports', user?.id, range],
    queryFn: ({ signal }) => reportApi.summary(range, signal),
    enabled: allowed,
    retry: false,
  });
  function choose(value: ReportPreset) {
    const next = presetRange(value);
    setRange(next);
    setDraft(next);
    setPreset(value);
    setValidation(null);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    setValidation(null);
    try {
      const next = validateRange(draft);
      if (next.from === range.from && next.to === range.to) void query.refetch();
      else setRange({ ...next });
      setPreset(null);
    } catch (error) {
      setValidation(reportError(error));
    }
  }
  if (!allowed) return <p role="alert">Bạn không có quyền xem báo cáo.</p>;
  const report = query.data;
  return (
    <section className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Báo cáo & Thống kê</h1>
        <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>
          Tải lại báo cáo
        </Button>
      </div>
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['today', 'Hôm nay'],
              ['week', '7 ngày qua'],
              ['month', 'Tháng này'],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              variant={preset === value ? 'default' : 'outline'}
              aria-pressed={preset === value}
              onClick={() => choose(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        <form onSubmit={submit} noValidate className="flex flex-wrap items-end gap-3">
          <label className="min-w-0 space-y-1">
            Ngày bắt đầu
            <input
              type="date"
              value={draft.from}
              className="block w-full rounded-md border bg-background px-3 py-2"
              onChange={(event) => {
                setDraft((old) => ({ ...old, from: event.target.value }));
                setPreset(null);
                setValidation(null);
              }}
            />
          </label>
          <label className="min-w-0 space-y-1">
            Ngày kết thúc
            <input
              type="date"
              value={draft.to}
              className="block w-full rounded-md border bg-background px-3 py-2"
              onChange={(event) => {
                setDraft((old) => ({ ...old, to: event.target.value }));
                setPreset(null);
                setValidation(null);
              }}
            />
          </label>
          <Button type="submit">Xem báo cáo</Button>
        </form>
        {validation && (
          <p role="alert" className="text-sm text-destructive">
            {validation}
          </p>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Kỳ báo cáo: {dateLabel(range.from)} – {dateLabel(range.to)} (giờ Việt Nam).
      </p>
      {query.isPending ? (
        <div role="status" className="grid gap-4 sm:grid-cols-3" aria-label="Đang tải báo cáo">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
          <p>Đang tải báo cáo...</p>
        </div>
      ) : query.isError ? (
        <div role="alert" className="space-y-3">
          <p className="text-destructive">{reportError(query.error)}</p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : (
        report && (
          <>
            {query.isFetching && (
              <p role="status" className="text-sm">
                Đang cập nhật báo cáo...
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Tổng doanh thu', money(report.revenue)],
                ['Tổng số đơn hàng', count(report.orders)],
                ['Tổng số ly đã bán', count(report.cups)],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-xl border bg-card p-5">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 break-words text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>
            {report.orders === 0 && report.revenue === 0 && report.cups === 0 && (
              <p className="rounded-xl border p-4">
                Chưa có dữ liệu kinh doanh trong khoảng thời gian đã chọn.
              </p>
            )}
            <ReportCharts report={report} />
            <section className="space-y-4 rounded-xl border bg-card p-4">
              <h2 className="text-lg font-semibold">Top 5 sản phẩm bán chạy</h2>
              <p className="text-sm text-muted-foreground">
                Hệ thống hiện xếp hạng theo biến thể (size), dựa trên số lượng đã bán.
              </p>
              {!report.topProducts.length ? (
                <p className="py-8 text-center text-muted-foreground">
                  Chưa có dữ liệu sản phẩm bán chạy.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        {['Hạng', 'Sản phẩm', 'Size', 'Số lượng', 'Doanh thu'].map((label) => (
                          <th key={label} className="whitespace-nowrap p-3">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {report.topProducts.map((item, index) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">
                            <span
                              aria-label={`Hạng ${index + 1}`}
                              className={
                                index < 3
                                  ? 'inline-flex rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary'
                                  : 'px-3'
                              }
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="p-3 font-medium">{item.name}</td>
                          <td className="p-3">{item.size || '—'}</td>
                          <td className="p-3">{count(item.quantity)}</td>
                          <td className="whitespace-nowrap p-3">{money(item.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )
      )}
    </section>
  );
}
