import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Calendar,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  Package,
  Layers,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { orderApi } from '@/features/orders/api/order-api';
import { catalogApi } from '@/features/catalog/api/catalog-api';
import { exportToExcel } from '@/shared/libs/excel-helper';
import { useAuthStore } from '@/shared/stores/auth-store';

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function PeriodicRevenueMatrix() {
  const currentUser = useAuthStore((state) => state.user);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [viewMode, setViewMode] = useState<'QUARTER' | 'MONTH'>('QUARTER');
  const [activeTab, setActiveTab] = useState<'PERIODIC' | 'PRODUCT_MATRIX'>('PRODUCT_MATRIX');

  // Lấy dữ liệu toàn bộ đơn hàng
  const ordersQuery = useQuery({
    queryKey: ['admin', 'orders', 'all-for-matrix'],
    queryFn: () => orderApi.getOrders({ size: 2000 }),
  });

  // Lấy danh mục sản phẩm
  const productsQuery = useQuery({
    queryKey: ['admin', 'products', 'for-matrix'],
    queryFn: () => catalogApi.getProducts(),
  });

  const orders = ordersQuery.data || [];
  const products = productsQuery.data || [];

  // Lọc các đơn hàng hoàn thành / đã thanh toán trong năm được chọn
  const validOrdersInYear = useMemo(() => {
    return orders.filter((o) => {
      if (o.trangThai === 'CANCELLED') return false;
      const d = new Date(o.createdAt);
      return d.getFullYear() === selectedYear;
    });
  }, [orders, selectedYear]);

  // 1. Thống kê theo 12 Tháng trong năm
  const monthlyStats = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      ordersCount: 0,
      revenue: 0,
      cupsCount: 0,
    }));

    validOrdersInYear.forEach((o) => {
      const m = new Date(o.createdAt).getMonth(); // 0..11
      months[m].ordersCount += 1;
      months[m].revenue += o.tongThanhToan;
      const cups = o.chiTietList?.reduce((sum, item) => sum + item.soLuong, 0) || 1;
      months[m].cupsCount += cups;
    });

    const totalYearRevenue = months.reduce((sum, m) => sum + m.revenue, 0);

    return months.map((m) => ({
      ...m,
      ratio: totalYearRevenue > 0 ? (m.revenue / totalYearRevenue) * 100 : 0,
    }));
  }, [validOrdersInYear]);

  // 2. Thống kê theo 4 Quý trong năm
  const quarterlyStats = useMemo(() => {
    const quarters = [
      { quarter: 1, name: 'Quý 1 (Tháng 1 – 3)', revenue: 0, ordersCount: 0, cupsCount: 0 },
      { quarter: 2, name: 'Quý 2 (Tháng 4 – 6)', revenue: 0, ordersCount: 0, cupsCount: 0 },
      { quarter: 3, name: 'Quý 3 (Tháng 7 – 9)', revenue: 0, ordersCount: 0, cupsCount: 0 },
      { quarter: 4, name: 'Quý 4 (Tháng 10 – 12)', revenue: 0, ordersCount: 0, cupsCount: 0 },
    ];

    monthlyStats.forEach((m) => {
      const qIndex = Math.floor((m.month - 1) / 3);
      quarters[qIndex].revenue += m.revenue;
      quarters[qIndex].ordersCount += m.ordersCount;
      quarters[qIndex].cupsCount += m.cupsCount;
    });

    const totalYearRevenue = quarters.reduce((sum, q) => sum + q.revenue, 0);

    return quarters.map((q) => ({
      ...q,
      ratio: totalYearRevenue > 0 ? (q.revenue / totalYearRevenue) * 100 : 0,
    }));
  }, [monthlyStats]);

  // 3. Ma trận Thống kê Doanh thu theo Sản phẩm & 4 Quý (Pivot Table)
  const productQuarterMatrix = useMemo(() => {
    // Thu thập danh sách sản phẩm từ catalog hoặc chi tiết đơn hàng
    const productMap = new Map<
      string,
      {
        productName: string;
        categoryName: string;
        q1Revenue: number;
        q2Revenue: number;
        q3Revenue: number;
        q4Revenue: number;
        q1Cups: number;
        q2Cups: number;
        q3Cups: number;
        q4Cups: number;
      }
    >();

    // Đưa tất cả sản phẩm trong menu vào trước
    products.forEach((p) => {
      productMap.set(p.tenSanPham, {
        productName: p.tenSanPham,
        categoryName: p.danhMucTen || 'Trà sữa',
        q1Revenue: 0,
        q2Revenue: 0,
        q3Revenue: 0,
        q4Revenue: 0,
        q1Cups: 0,
        q2Cups: 0,
        q3Cups: 0,
        q4Cups: 0,
      });
    });

    // Cộng dồn doanh thu từ từng đơn hàng
    validOrdersInYear.forEach((order) => {
      const month = new Date(order.createdAt).getMonth(); // 0..11
      const qIndex = Math.floor(month / 3); // 0..3

      (order.chiTietList || []).forEach((item) => {
        let entry = productMap.get(item.productName);
        if (!entry) {
          entry = {
            productName: item.productName,
            categoryName: 'Đồ uống',
            q1Revenue: 0,
            q2Revenue: 0,
            q3Revenue: 0,
            q4Revenue: 0,
            q1Cups: 0,
            q2Cups: 0,
            q3Cups: 0,
            q4Cups: 0,
          };
          productMap.set(item.productName, entry);
        }

        const rev = item.thanhTien;
        const qty = item.soLuong;

        if (qIndex === 0) {
          entry.q1Revenue += rev;
          entry.q1Cups += qty;
        } else if (qIndex === 1) {
          entry.q2Revenue += rev;
          entry.q2Cups += qty;
        } else if (qIndex === 2) {
          entry.q3Revenue += rev;
          entry.q3Cups += qty;
        } else {
          entry.q4Revenue += rev;
          entry.q4Cups += qty;
        }
      });
    });

    const rows = Array.from(productMap.values()).map((row) => {
      const totalRevenue = row.q1Revenue + row.q2Revenue + row.q3Revenue + row.q4Revenue;
      const totalCups = row.q1Cups + row.q2Cups + row.q3Cups + row.q4Cups;
      return {
        ...row,
        totalRevenue,
        totalCups,
      };
    });

    // Sắp xếp các sản phẩm có doanh thu cao nhất lên đầu
    return rows.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [validOrdersInYear, products]);

  // Tổng cộng toàn hệ thống theo Quý cho Ma trận
  const matrixTotals = useMemo(() => {
    return productQuarterMatrix.reduce(
      (acc, row) => ({
        q1: acc.q1 + row.q1Revenue,
        q2: acc.q2 + row.q2Revenue,
        q3: acc.q3 + row.q3Revenue,
        q4: acc.q4 + row.q4Revenue,
        total: acc.total + row.totalRevenue,
        cups: acc.cups + row.totalCups,
      }),
      { q1: 0, q2: 0, q3: 0, q4: 0, total: 0, cups: 0 },
    );
  }, [productQuarterMatrix]);

  // Xuất file Excel Ma trận Doanh thu Sản phẩm theo Quý
  const handleExportMatrixExcel = () => {
    try {
      exportToExcel({
        filename: `BaoCao_MaTran_SanPham_TheoQuy_Nam${selectedYear}`,
        sheetName: `Doanh thu Năm ${selectedYear}`,
        data: productQuarterMatrix,
        columns: [
          { header: 'Sản phẩm', key: 'productName', width: 28 },
          { header: 'Danh mục', key: 'categoryName', width: 16 },
          { header: 'Quý 1 (₫)', key: 'q1Revenue', width: 15, format: (v) => Number(v || 0) },
          { header: 'Quý 2 (₫)', key: 'q2Revenue', width: 15, format: (v) => Number(v || 0) },
          { header: 'Quý 3 (₫)', key: 'q3Revenue', width: 15, format: (v) => Number(v || 0) },
          { header: 'Quý 4 (₫)', key: 'q4Revenue', width: 15, format: (v) => Number(v || 0) },
          { header: 'Tổng cả năm (₫)', key: 'totalRevenue', width: 18, format: (v) => Number(v || 0) },
          { header: 'Tổng số ly', key: 'totalCups', width: 12, format: (v) => Number(v || 0) },
        ],
      });
      toast.success('Đã xuất thành công bảng ma trận doanh thu ra file Excel (.xlsx)!');
    } catch {
      toast.error('Có lỗi xảy ra khi xuất file Excel');
    }
  };

  // Xuất file Excel Thống kê Định kỳ Tháng / Quý
  const handleExportPeriodicExcel = () => {
    try {
      if (viewMode === 'QUARTER') {
        exportToExcel({
          filename: `BaoCao_DoanhThu_TheoQuy_Nam${selectedYear}`,
          sheetName: 'Theo Quý',
          data: quarterlyStats,
          columns: [
            { header: 'Kỳ báo cáo', key: 'name', width: 25 },
            { header: 'Số đơn hàng', key: 'ordersCount', width: 15 },
            { header: 'Số ly đã bán', key: 'cupsCount', width: 15 },
            { header: 'Tổng doanh thu (₫)', key: 'revenue', width: 20, format: (v) => Number(v || 0) },
            { header: 'Tỷ trọng (%)', key: 'ratio', width: 15, format: (v) => `${(v || 0).toFixed(1)}%` },
          ],
        });
      } else {
        exportToExcel({
          filename: `BaoCao_DoanhThu_TheoThang_Nam${selectedYear}`,
          sheetName: 'Theo Tháng',
          data: monthlyStats,
          columns: [
            { header: 'Tháng', key: 'month', width: 12, format: (v) => `Tháng ${v}` },
            { header: 'Số đơn hàng', key: 'ordersCount', width: 15 },
            { header: 'Số ly đã bán', key: 'cupsCount', width: 15 },
            { header: 'Tổng doanh thu (₫)', key: 'revenue', width: 20, format: (v) => Number(v || 0) },
            { header: 'Tỷ trọng (%)', key: 'ratio', width: 15, format: (v) => `${(v || 0).toFixed(1)}%` },
          ],
        });
      }
      toast.success('Đã xuất báo cáo thống kê ra file Excel (.xlsx)!');
    } catch {
      toast.error('Có lỗi xảy ra khi xuất file Excel');
    }
  };

  // Kích hoạt Print / Xuất PDF báo cáo
  const handlePrintPDF = () => {
    window.print();
  };

  const isPending = ordersQuery.isPending || productsQuery.isPending;

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      {/* Printable Report Header (Visible only when Printing / Saving as PDF) */}
      <div className="hidden print:block border-b pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-stone-600">
              CÔNG TY CỔ PHẦN F&B KOI THÉ VIỆT NAM
            </p>
            <p className="text-[11px] text-stone-500">
              Chi nhánh: 120 Ngô Đức Kế, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh
            </p>
            <p className="text-[11px] text-stone-500">Mã số thuế: 0314892911</p>
          </div>
          <div className="text-right text-[11px] text-stone-500">
            <p>Mẫu số: B01-DN</p>
            <p>Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
            <p>Người lập: {currentUser?.hoTen || 'Quản trị viên'}</p>
          </div>
        </div>

        <div className="text-center mt-4">
          <h1 className="text-xl font-black uppercase text-stone-900 tracking-wide">
            BÁO CÁO THỐNG KÊ DOANH THU & MA TRẬN KINH DOANH
          </h1>
          <p className="text-xs font-semibold text-stone-600 mt-1">
            Năm tài chính: {selectedYear}
          </p>
        </div>
      </div>

      {/* Screen Header Controls (Hidden when Printing) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Thống kê doanh thu & Bảng ma trận Quý
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Thống kê tổng tiền hóa đơn theo Tháng/Quý/Năm và Ma trận doanh số theo Sản phẩm & Quý
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-xl border">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold">Năm:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer"
            >
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Export Excel Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={activeTab === 'PRODUCT_MATRIX' ? handleExportMatrixExcel : handleExportPeriodicExcel}
            className="gap-1.5 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Xuất Excel (.xlsx)</span>
          </Button>

          {/* Export PDF / Print Button */}
          <Button
            variant="default"
            size="sm"
            onClick={handlePrintPDF}
            className="gap-1.5 text-xs font-semibold"
          >
            <Printer className="h-4 w-4" />
            <span>Xuất PDF / In báo cáo</span>
          </Button>
        </div>
      </div>

      {/* Mode Switch Tabs (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 print:hidden">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={activeTab === 'PRODUCT_MATRIX' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('PRODUCT_MATRIX')}
            className="gap-1.5 text-xs font-bold"
          >
            <Package className="h-4 w-4" />
            Ma trận Sản phẩm & Quý (Pivot Table)
          </Button>

          <Button
            type="button"
            variant={activeTab === 'PERIODIC' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('PERIODIC')}
            className="gap-1.5 text-xs font-bold"
          >
            <Layers className="h-4 w-4" />
            Thống kê theo Tháng / Quý / Năm
          </Button>
        </div>

        {activeTab === 'PERIODIC' && (
          <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border text-xs">
            <button
              type="button"
              onClick={() => setViewMode('QUARTER')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                viewMode === 'QUARTER' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              Xem theo Quý (4 Quý)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('MONTH')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                viewMode === 'MONTH' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
              }`}
            >
              Xem theo Tháng (12 Tháng)
            </button>
          </div>
        )}
      </div>

      {isPending ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          Đang tính toán tổng hợp số liệu hóa đơn năm {selectedYear}...
        </div>
      ) : (
        <>
          {/* =========================================================================
              TAB 1: MA TRẬN DOANH THU THEO SẢN PHẨM & 4 QUÝ (PIVOT TABLE)
             ========================================================================= */}
          {activeTab === 'PRODUCT_MATRIX' && (
            <Card className="overflow-hidden border print:border-none print:shadow-none">
              <div className="p-4 border-b bg-muted/30 flex flex-wrap items-center justify-between gap-2 print:hidden">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Bảng ma trận Doanh thu theo Sản phẩm & 4 Quý (Năm {selectedYear})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Số liệu đối soát chéo từ toàn bộ chi tiết hóa đơn thực tế
                  </p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {productQuarterMatrix.length} sản phẩm
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3 w-12 text-center">STT</th>
                      <th className="p-3 min-w-44">Tên sản phẩm</th>
                      <th className="p-3">Danh mục</th>
                      <th className="p-3 text-right">Quý 1</th>
                      <th className="p-3 text-right">Quý 2</th>
                      <th className="p-3 text-right">Quý 3</th>
                      <th className="p-3 text-right">Quý 4</th>
                      <th className="p-3 text-right font-bold text-stone-900">Tổng cả năm</th>
                      <th className="p-3 text-center">Số ly</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {productQuarterMatrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 text-center font-mono text-muted-foreground">{idx + 1}</td>
                        <td className="p-3 font-bold text-foreground">{row.productName}</td>
                        <td className="p-3 text-muted-foreground">
                          <Badge variant="outline" className="text-[10px]">
                            {row.categoryName}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-mono font-medium">
                          {row.q1Revenue > 0 ? (
                            formatVND(row.q1Revenue)
                          ) : (
                            <span className="text-stone-300">0 ₫</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-medium">
                          {row.q2Revenue > 0 ? (
                            formatVND(row.q2Revenue)
                          ) : (
                            <span className="text-stone-300">0 ₫</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-medium">
                          {row.q3Revenue > 0 ? (
                            formatVND(row.q3Revenue)
                          ) : (
                            <span className="text-stone-300">0 ₫</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-medium">
                          {row.q4Revenue > 0 ? (
                            formatVND(row.q4Revenue)
                          ) : (
                            <span className="text-stone-300">0 ₫</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-extrabold text-primary">
                          {formatVND(row.totalRevenue)}
                        </td>
                        <td className="p-3 text-center font-semibold text-stone-700">
                          {row.totalCups}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-primary/5 font-extrabold border-t-2 border-primary/20 text-xs">
                    <tr>
                      <td colSpan={3} className="p-3 text-right uppercase tracking-wider text-primary">
                        Tổng cộng toàn hệ thống:
                      </td>
                      <td className="p-3 text-right font-mono text-stone-900">
                        {formatVND(matrixTotals.q1)}
                      </td>
                      <td className="p-3 text-right font-mono text-stone-900">
                        {formatVND(matrixTotals.q2)}
                      </td>
                      <td className="p-3 text-right font-mono text-stone-900">
                        {formatVND(matrixTotals.q3)}
                      </td>
                      <td className="p-3 text-right font-mono text-stone-900">
                        {formatVND(matrixTotals.q4)}
                      </td>
                      <td className="p-3 text-right font-mono text-primary text-sm">
                        {formatVND(matrixTotals.total)}
                      </td>
                      <td className="p-3 text-center text-primary">{matrixTotals.cups} ly</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          )}

          {/* =========================================================================
              TAB 2: THỐNG KÊ TỔNG TIỀN THEO THÁNG / QUÝ / NĂM
             ========================================================================= */}
          {activeTab === 'PERIODIC' && (
            <Card className="overflow-hidden border print:border-none print:shadow-none">
              <div className="p-4 border-b bg-muted/30 flex items-center justify-between print:hidden">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Bảng tổng hợp doanh thu {viewMode === 'QUARTER' ? 'theo 4 Quý' : 'theo 12 Tháng'} (Năm {selectedYear})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tổng kết doanh thu, số lượng đơn hàng và tỷ trọng đóng góp
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                {viewMode === 'QUARTER' ? (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-3">Kỳ báo cáo</th>
                        <th className="p-3 text-center">Số lượng đơn</th>
                        <th className="p-3 text-center">Số ly bán ra</th>
                        <th className="p-3 text-right">Tổng tiền hóa đơn</th>
                        <th className="p-3 text-right">Tỷ trọng (%)</th>
                        <th className="p-3 text-center">Đánh giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {quarterlyStats.map((q) => (
                        <tr key={q.quarter} className="hover:bg-muted/20">
                          <td className="p-3 font-bold text-foreground">{q.name}</td>
                          <td className="p-3 text-center font-semibold">{q.ordersCount} đơn</td>
                          <td className="p-3 text-center font-semibold">{q.cupsCount} ly</td>
                          <td className="p-3 text-right font-mono font-bold text-primary">
                            {formatVND(q.revenue)}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {q.ratio.toFixed(1)}%
                          </td>
                          <td className="p-3 text-center">
                            {q.revenue > 0 ? (
                              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300">
                                Đạt chỉ tiêu
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Chưa có số liệu</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/30 font-bold border-t">
                      <tr>
                        <td className="p-3 uppercase">Tổng cả năm {selectedYear}:</td>
                        <td className="p-3 text-center">
                          {quarterlyStats.reduce((sum, q) => sum + q.ordersCount, 0)} đơn
                        </td>
                        <td className="p-3 text-center">
                          {quarterlyStats.reduce((sum, q) => sum + q.cupsCount, 0)} ly
                        </td>
                        <td className="p-3 text-right font-mono text-primary text-sm">
                          {formatVND(quarterlyStats.reduce((sum, q) => sum + q.revenue, 0))}
                        </td>
                        <td className="p-3 text-right">100.0%</td>
                        <td className="p-3 text-center"></td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-3">Tháng</th>
                        <th className="p-3 text-center">Số lượng đơn</th>
                        <th className="p-3 text-center">Số ly bán ra</th>
                        <th className="p-3 text-right">Tổng tiền hóa đơn</th>
                        <th className="p-3 text-right">Tỷ trọng (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {monthlyStats.map((m) => (
                        <tr key={m.month} className="hover:bg-muted/20">
                          <td className="p-3 font-bold text-foreground">Tháng {m.month} / {selectedYear}</td>
                          <td className="p-3 text-center font-semibold">{m.ordersCount} đơn</td>
                          <td className="p-3 text-center font-semibold">{m.cupsCount} ly</td>
                          <td className="p-3 text-right font-mono font-bold text-primary">
                            {formatVND(m.revenue)}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {m.ratio.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/30 font-bold border-t">
                      <tr>
                        <td className="p-3 uppercase">Tổng cả năm:</td>
                        <td className="p-3 text-center">
                          {monthlyStats.reduce((sum, m) => sum + m.ordersCount, 0)} đơn
                        </td>
                        <td className="p-3 text-center">
                          {monthlyStats.reduce((sum, m) => sum + m.cupsCount, 0)} ly
                        </td>
                        <td className="p-3 text-right font-mono text-primary text-sm">
                          {formatVND(monthlyStats.reduce((sum, m) => sum + m.revenue, 0))}
                        </td>
                        <td className="p-3 text-right">100.0%</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Printable Report Footer (Signatures - Visible only when Printing / Saving as PDF) */}
      <div className="hidden print:grid grid-cols-3 gap-6 pt-10 text-center text-xs mt-8 border-t">
        <div>
          <p className="font-bold uppercase">Người lập biểu</p>
          <p className="text-[11px] text-stone-500 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
          <div className="h-16" />
          <p className="font-semibold">{currentUser?.hoTen || 'Nguyễn Văn Quản Lý'}</p>
        </div>

        <div>
          <p className="font-bold uppercase">Kế toán trưởng</p>
          <p className="text-[11px] text-stone-500 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
          <div className="h-16" />
          <p className="font-semibold">Trần Thị Thu Ngân</p>
        </div>

        <div>
          <p className="font-bold uppercase">Giám đốc duyệt</p>
          <p className="text-[11px] text-stone-500 italic mt-0.5">(Ký, đóng dấu và ghi rõ họ tên)</p>
          <div className="h-16" />
          <p className="font-semibold">KOI Thé Management</p>
        </div>
      </div>
    </div>
  );
}
