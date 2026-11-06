import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  Printer,
  Layers,
  CalendarRange,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { PeriodicRevenueMatrix } from './periodic-revenue-matrix';
import { exportToExcel } from '@/shared/libs/excel-helper';

export function ReportDashboard() {
  const user = useAuthStore((state) => state.user);
  const allowed = user?.vaiTro === 'ADMIN' || user?.vaiTro === 'MANAGER';
  const [activeMainTab, setActiveMainTab] = useState<'DATE_RANGE' | 'PERIODIC_MATRIX'>('DATE_RANGE');
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

  // Xuất file Excel báo cáo theo khoảng ngày
  const handleExportRangeExcel = () => {
    if (!report) return;
    try {
      exportToExcel({
        filename: `BaoCao_DoanhThu_${range.from}_den_${range.to}`,
        sheetName: 'Doanh thu theo ngày',
        data: report.daily,
        columns: [
          { header: 'Ngày', key: 'date', width: 16 },
          { header: 'Số lượng đơn', key: 'orders', width: 16 },
          { header: 'Doanh thu (₫)', key: 'revenue', width: 20, format: (v) => Number(v || 0) },
        ],
      });
      toast.success('Đã xuất báo cáo doanh thu theo ngày ra file Excel!');
    } catch {
      toast.error('Có lỗi xảy ra khi xuất file Excel');
    }
  };

  return (
    <section className="min-w-0 space-y-6 animate-fade-in print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo & Thống kê kinh doanh</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tổng hợp doanh thu theo khoảng ngày, phân tích theo Tháng/Quý/Năm và Ma trận Sản phẩm
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeMainTab === 'DATE_RANGE' && report && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportRangeExcel}
                className="gap-1.5 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Xuất Excel</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 text-xs font-semibold"
              >
                <Printer className="h-4 w-4" />
                <span>In báo cáo / PDF</span>
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
            className="text-xs"
          >
            Tải lại
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex gap-2 border-b pb-3 print:hidden">
        <Button
          type="button"
          variant={activeMainTab === 'DATE_RANGE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveMainTab('DATE_RANGE')}
          className="gap-1.5 text-xs font-bold"
        >
          <CalendarRange className="h-4 w-4" />
          1. Tính tổng tiền từ ngày A đến ngày B & Biểu đồ
        </Button>

        <Button
          type="button"
          variant={activeMainTab === 'PERIODIC_MATRIX' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveMainTab('PERIODIC_MATRIX')}
          className="gap-1.5 text-xs font-bold"
        >
          <Layers className="h-4 w-4" />
          2. Thống kê theo Tháng / Quý & Ma trận Sản phẩm
        </Button>
      </div>

      {/* TAB 1: DATE RANGE AGGREGATION & CHARTS */}
      {activeMainTab === 'DATE_RANGE' && (
        <div className="space-y-6">
          {/* Printable Header (Visible only when Printing) */}
          <div className="hidden print:block border-b pb-4 mb-6">
            <p className="text-xs font-bold uppercase">CÔNG TY CỔ PHẦN F&B KOI THÉ VIỆT NAM</p>
            <h1 className="text-xl font-bold uppercase mt-2">BÁO CÁO DOANH THU BÁN HÀNG</h1>
            <p className="text-xs mt-1">
              Kỳ báo cáo: Từ ngày {dateLabel(range.from)} đến ngày {dateLabel(range.to)}
            </p>
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-4 print:hidden">
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
                  size="sm"
                  variant={preset === value ? 'default' : 'outline'}
                  aria-pressed={preset === value}
                  onClick={() => choose(value)}
                  className="text-xs font-medium"
                >
                  {label}
                </Button>
              ))}
            </div>

            <form onSubmit={submit} noValidate className="flex flex-wrap items-end gap-3">
              <label className="min-w-0 space-y-1 text-xs font-semibold">
                <span>Từ ngày (Ngày A)</span>
                <input
                  type="date"
                  value={draft.from}
                  className="block w-full rounded-lg border bg-background px-3 py-1.5 text-xs"
                  onChange={(event) => {
                    setDraft((old) => ({ ...old, from: event.target.value }));
                    setPreset(null);
                    setValidation(null);
                  }}
                />
              </label>

              <label className="min-w-0 space-y-1 text-xs font-semibold">
                <span>Đến ngày (Ngày B)</span>
                <input
                  type="date"
                  value={draft.to}
                  className="block w-full rounded-lg border bg-background px-3 py-1.5 text-xs"
                  onChange={(event) => {
                    setDraft((old) => ({ ...old, to: event.target.value }));
                    setPreset(null);
                    setValidation(null);
                  }}
                />
              </label>

              <Button type="submit" size="sm" className="text-xs font-bold">
                Tính tổng tiền & Báo cáo
              </Button>
            </form>

            {validation && (
              <p role="alert" className="text-xs text-destructive">
                {validation}
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground print:hidden">
            Khoảng thời gian đối soát: <strong>{dateLabel(range.from)}</strong> –{' '}
            <strong>{dateLabel(range.to)}</strong> (giờ Việt Nam).
          </p>

          {query.isPending ? (
            <div role="status" className="grid gap-4 sm:grid-cols-3" aria-label="Đang tải báo cáo">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 animate-pulse rounded-xl bg-muted" />
              ))}
              <p className="text-xs text-muted-foreground">Đang tính toán doanh thu...</p>
            </div>
          ) : query.isError ? (
            <div role="alert" className="space-y-3">
              <p className="text-destructive text-sm">{reportError(query.error)}</p>
              <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
                Thử lại
              </Button>
            </div>
          ) : (
            report && (
              <>
                {query.isFetching && (
                  <p role="status" className="text-xs text-muted-foreground">
                    Đang cập nhật báo cáo...
                  </p>
                )}

                {/* 3 Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ['Tổng doanh thu hóa đơn', money(report.revenue)],
                    ['Tổng số đơn hàng', count(report.orders)],
                    ['Tổng số ly đã bán', count(report.cups)],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0 rounded-xl border bg-card p-5 shadow-2xs">
                      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                      <p className="mt-1.5 break-words text-2xl font-black text-primary">{value}</p>
                    </div>
                  ))}
                </div>

                {report.orders === 0 && report.revenue === 0 && report.cups === 0 && (
                  <p className="rounded-xl border p-4 text-xs text-muted-foreground">
                    Chưa có dữ liệu kinh doanh trong khoảng thời gian đã chọn.
                  </p>
                )}

                <div className="print:hidden">
                  <ReportCharts report={report} />
                </div>

                {/* Top 5 Best Sellers */}
                <section className="space-y-4 rounded-xl border bg-card p-4">
                  <h2 className="text-base font-bold">Top sản phẩm bán chạy nhất</h2>
                  <p className="text-xs text-muted-foreground">
                    Thống kê theo biến thể size dựa trên doanh số thực tế
                  </p>
                  {!report.topProducts.length ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      Chưa có dữ liệu sản phẩm bán chạy.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            {['Hạng', 'Sản phẩm', 'Size', 'Số lượng', 'Doanh thu'].map((label) => (
                              <th key={label} className="whitespace-nowrap p-2.5 font-semibold text-muted-foreground">
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {report.topProducts.map((item, index) => (
                            <tr key={item.id}>
                              <td className="p-2.5">
                                <span
                                  className={
                                    index < 3
                                      ? 'inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 font-bold text-primary text-[11px]'
                                      : 'px-2.5 text-[11px]'
                                  }
                                >
                                  Top {index + 1}
                                </span>
                              </td>
                              <td className="p-2.5 font-bold text-foreground">{item.name}</td>
                              <td className="p-2.5">{item.size || '—'}</td>
                              <td className="p-2.5 font-semibold">{count(item.quantity)}</td>
                              <td className="whitespace-nowrap p-2.5 font-mono font-bold text-primary">
                                {money(item.revenue)}
                              </td>
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
        </div>
      )}

      {/* TAB 2: PERIODIC REVENUE & MATRIX TABLE (Tháng / Quý / Năm & Ma trận Sản phẩm) */}
      {activeMainTab === 'PERIODIC_MATRIX' && <PeriodicRevenueMatrix />}
    </section>
  );
}
