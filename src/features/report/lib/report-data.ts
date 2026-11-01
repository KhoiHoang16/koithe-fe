export interface ReportRange {
  from: string;
  to: string;
}
export type ReportPreset = 'today' | 'week' | 'month';
export function vietnamDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function presetRange(preset: ReportPreset, now = new Date()): ReportRange {
  const to = vietnamDate(now);
  if (preset === 'today') return { from: to, to };
  if (preset === 'month') return { from: `${to.slice(0, 7)}-01`, to };
  const start = new Date(`${to}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 6);
  return { from: start.toISOString().slice(0, 10), to };
}
export function validateRange(range: ReportRange): ReportRange {
  for (const value of [range.from, range.to]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
      throw new Error('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc.');
    const parsed = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value)
      throw new Error('Ngày không hợp lệ.');
  }
  if (range.from > range.to) throw new Error('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
  return range;
}
export interface BackendReport {
  tuNgay: string;
  denNgay: string;
  tongDoanhThu: number;
  tongSoDonHang: number;
  tongSoLyDaBan: number;
  doanhThuTheoNgay: { ngay: string; doanhThu: number; soDon: number }[];
  doanhThuTheoKenh: { maKenh: string; tenKenh: string; doanhThu: number; soDon: number }[];
  doanhThuTheoPhuongThuc: {
    phuongThuc: string;
    tenPhuongThuc: string;
    tongTien: number;
    soGiaoDich: number;
  }[];
  topSanPhamBanChay: {
    bienTheId: number;
    tenSanPham: string;
    kichCo: string;
    soLuongDaBan: number;
    tongTien: number;
  }[];
}
export function mapReport(data: BackendReport) {
  return {
    from: data.tuNgay,
    to: data.denNgay,
    revenue: data.tongDoanhThu,
    orders: data.tongSoDonHang,
    cups: data.tongSoLyDaBan,
    daily: data.doanhThuTheoNgay
      .map((row) => ({ date: row.ngay, revenue: row.doanhThu, orders: row.soDon }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    channels: data.doanhThuTheoKenh.map((row) => ({
      code: row.maKenh,
      name: row.tenKenh || row.maKenh,
      revenue: row.doanhThu,
      orders: row.soDon,
    })),
    topProducts: data.topSanPhamBanChay
      .slice(0, 5)
      .map((row) => ({
        id: row.bienTheId,
        name: row.tenSanPham,
        size: row.kichCo,
        quantity: row.soLuongDaBan,
        revenue: row.tongTien,
      })),
  };
}
export type Report = ReturnType<typeof mapReport>;
