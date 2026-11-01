import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Report } from '../lib/report-data';
import { dateLabel, money } from '../lib/presentation';

const colors = ['#398e70', '#d9a441', '#527abd', '#b3638d'];
export function ReportCharts({ report }: { report: Report }) {
  const channels = report.channels.filter((row) => row.revenue > 0);
  const total = channels.reduce((sum, row) => sum + row.revenue, 0);
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-2">
      <section className="min-w-0 space-y-4 rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">Doanh thu theo ngày</h2>
        {!report.daily.length ? (
          <p className="py-12 text-center text-muted-foreground">
            Chưa có dữ liệu doanh thu theo ngày.
          </p>
        ) : (
          <>
            <div className="h-72 min-w-0" role="img" aria-label="Biểu đồ đường doanh thu theo ngày">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={report.daily}
                  margin={{ left: 16, right: 16, top: 8, bottom: 8 }}
                  accessibilityLayer
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) => dateLabel(value).slice(0, 5)}
                    minTickGap={24}
                  />
                  <YAxis
                    width={80}
                    tickFormatter={(value: number) =>
                      new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(value)
                    }
                  />
                  <Tooltip
                    labelFormatter={(label) => dateLabel(String(label))}
                    formatter={(value) => [money(Number(value)), 'Doanh thu']}
                  />
                  <Line
                    type="linear"
                    dataKey="revenue"
                    name="Doanh thu"
                    stroke="#398e70"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <details>
              <summary className="cursor-pointer text-sm text-primary">
                Xem số liệu theo ngày
              </summary>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="py-2">Ngày</th>
                      <th>Doanh thu</th>
                      <th>Số đơn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.daily.map((row) => (
                      <tr key={row.date} className="border-t">
                        <td className="py-2">{dateLabel(row.date)}</td>
                        <td>{money(row.revenue)}</td>
                        <td>{row.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
      </section>
      <section className="min-w-0 space-y-4 rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold">Tỷ trọng doanh thu theo kênh</h2>
        {!channels.length ? (
          <p className="py-12 text-center text-muted-foreground">
            Chưa có doanh thu để tính tỷ trọng.
          </p>
        ) : (
          <>
            <div
              className="h-72 min-w-0"
              role="img"
              aria-label="Biểu đồ tròn tỷ trọng doanh thu theo kênh"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart accessibilityLayer>
                  <Pie
                    data={channels}
                    dataKey="revenue"
                    nameKey="name"
                    innerRadius="45%"
                    outerRadius="70%"
                    isAnimationActive={false}
                  >
                    {channels.map((row, i) => (
                      <Cell key={row.code} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => money(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        <ul className="space-y-2 text-sm">
          {report.channels.map((row) => (
            <li key={row.code} className="flex flex-wrap justify-between gap-2">
              <span>{row.name}</span>
              <span>
                {money(row.revenue)} ·{' '}
                {total > 0
                  ? `${((row.revenue / total) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`
                  : '—'}
              </span>
            </li>
          ))}
        </ul>
        {report.channels.some((row) => row.code === 'ONLINE_WEB') && (
          <p className="text-sm text-muted-foreground">
            Website và QR bàn hiện được hệ thống gộp chung một kênh.
          </p>
        )}
      </section>
    </div>
  );
}
