import { useRef, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, Upload, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { supplierApi } from '../api/supplier-api';
import type { PurchaseInput } from '../api/purchase-order-api';
import { buildLines, purchaseTotal, type DraftLine } from '../lib/purchase';
import { ProductPicker } from './product-picker';
import { ErrorNotice } from './shared';
import { control, money } from '../lib/presentation';
import { exportToExcel, readExcelFile } from '@/shared/libs/excel-helper';

export function PurchaseForm({
  scope,
  pending,
  error,
  save,
}: {
  scope: number | undefined;
  pending: boolean;
  error: unknown;
  save: (input: PurchaseInput) => void;
}) {
  const nextKey = useRef(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<DraftLine[]>([
    { key: 0, variantId: '', quantity: '1', price: '' },
  ]);
  const [validation, setValidation] = useState<Error | null>(null);

  const suppliers = useQuery({
    queryKey: ['inventory', scope, 'supplier-options'],
    queryFn: supplierApi.options,
    retry: false,
  });

  function change(key: number, patch: Partial<DraftLine>) {
    setRows((items) => items.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    setValidation(null);
  }

  let total: number | null = null;
  try {
    total = purchaseTotal(buildLines(rows));
  } catch {
    /* Tổng chỉ hiển thị khi các dòng hợp lệ. */
  }

  // Tải file Excel mẫu để nhập hàng
  const handleDownloadTemplate = () => {
    exportToExcel({
      filename: 'Mau_Nhap_Kho_KOITHE',
      sheetName: 'DanhSachNhapHang',
      data: [
        {
          maBienThe: 1,
          tenSanPham: 'Trà sữa trân châu hoàng kim (Size M)',
          soLuong: 50,
          donGiaNhap: 25000,
        },
        {
          maBienThe: 2,
          tenSanPham: 'Hồng trà Macchiato (Size L)',
          soLuong: 30,
          donGiaNhap: 28000,
        },
        {
          maBienThe: 3,
          tenSanPham: 'Trân châu hoàng kim (Gói 1kg)',
          soLuong: 20,
          donGiaNhap: 45000,
        },
      ],
      columns: [
        { header: 'Mã biến thể (ID)', key: 'maBienThe', width: 18 },
        { header: 'Tên sản phẩm / Ghi chú', key: 'tenSanPham', width: 35 },
        { header: 'Số lượng nhập', key: 'soLuong', width: 16 },
        { header: 'Đơn giá nhập (VNĐ)', key: 'donGiaNhap', width: 20 },
      ],
    });
    toast.info('Đã tải xuống file Excel mẫu. Vui lòng điền thông tin và bấm "Nhập từ file Excel"');
  };

  // Đọc dữ liệu từ file Excel (.xlsx / .xls) do người dùng tải lên
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readExcelFile<Record<string, any>>(file);
      if (!data || data.length === 0) {
        toast.error('File Excel không có dữ liệu');
        return;
      }

      const importedRows: DraftLine[] = [];
      data.forEach((item) => {
        // Tìm các key tương ứng dù tiêu đề có dấu hay không dấu
        const variantId =
          item['Mã biến thể (ID)'] ?? item['maBienThe'] ?? item['variantId'] ?? item['ID'];
        const quantity =
          item['Số lượng nhập'] ?? item['soLuong'] ?? item['quantity'] ?? item['SL'] ?? 1;
        const price =
          item['Đơn giá nhập (VNĐ)'] ?? item['donGiaNhap'] ?? item['price'] ?? item['Đơn giá'] ?? '';

        if (variantId) {
          importedRows.push({
            key: nextKey.current++,
            variantId: String(variantId).trim(),
            quantity: String(quantity).trim(),
            price: String(price).trim(),
          });
        }
      });

      if (importedRows.length === 0) {
        toast.error('Không tìm thấy cột "Mã biến thể (ID)" hợp lệ trong file Excel');
        return;
      }

      setRows(importedRows);
      setValidation(null);
      toast.success(`Đã đọc thành công ${importedRows.length} mặt hàng từ file Excel!`);
    } catch (err) {
      toast.error('Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidation(null);
    try {
      const data = new FormData(event.currentTarget);
      const supplierId = Number(data.get('supplier'));
      if (!suppliers.data?.some((s) => s.id === supplierId && s.dangHopTac))
        throw new Error('Cần chọn nhà cung cấp đang hợp tác.');
      const chiTiet = buildLines(rows);
      save({
        maNhaCungCap: supplierId,
        maPhieuNhap: String(data.get('code') ?? '').trim(),
        ghiChu: String(data.get('note') ?? '').trim(),
        chiTiet,
        tongTien: purchaseTotal(chiTiet),
      });
    } catch (e) {
      setValidation(e instanceof Error ? e : new Error('Dữ liệu chưa hợp lệ.'));
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={pending} className="space-y-4">
        {/* Thanh công cụ Đọc / Ghi file Excel */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/40 border text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-stone-700">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Nhập danh sách nhanh từ Excel</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="h-7 text-xs gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              Tải file mẫu
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 text-xs gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              <Upload className="h-3.5 w-3.5" />
              Đọc file Excel (.xlsx)
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <label className="block">
          Mã phiếu
          <input
            name="code"
            maxLength={50}
            className={control}
            placeholder="Để trống để hệ thống tự sinh"
          />
        </label>
        {suppliers.isPending ? (
          <p role="status">Đang tải nhà cung cấp...</p>
        ) : suppliers.isError ? (
          <ErrorNotice error={suppliers.error} retry={() => void suppliers.refetch()} />
        ) : (
          <>
            <label className="block">
              Nhà cung cấp *
              <select required name="supplier" defaultValue="" className={control}>
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.data
                  .filter((s) => s.dangHopTac)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.tenNhaCungCap}
                    </option>
                  ))}
              </select>
            </label>
            {!suppliers.data.some((s) => s.dangHopTac) && (
              <p>Cần thêm nhà cung cấp đang hợp tác trước khi tạo phiếu.</p>
            )}
          </>
        )}
        {rows.map((row, index) => (
          <div className="space-y-3 rounded-lg border p-4" key={row.key}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs sm:text-sm">Mặt hàng {index + 1}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={rows.length === 1}
                onClick={() => {
                  setRows((items) => items.filter((r) => r.key !== row.key));
                  setValidation(null);
                }}
              >
                Bỏ dòng
              </Button>
            </div>
            <ProductPicker scope={scope} choose={(variantId) => change(row.key, { variantId })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs">
                Số lượng *
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  className={control}
                  value={row.quantity}
                  onChange={(e) => change(row.key, { quantity: e.target.value })}
                />
              </label>
              <label className="text-xs">
                Đơn giá nhập (đồng) *
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  className={control}
                  value={row.price}
                  onChange={(e) => change(row.key, { price: e.target.value })}
                />
              </label>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setRows((items) => [
              ...items,
              { key: nextKey.current++, variantId: '', quantity: '1', price: '' },
            ])
          }
          className="gap-1 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm dòng sản phẩm
        </Button>
        <label className="block text-xs">
          Ghi chú
          <textarea name="note" maxLength={2000} className={control} />
        </label>
        <p className="font-bold text-sm">
          Tổng tiền:{' '}
          {total === null ? (
            <span className="text-muted-foreground font-normal">Nhập đầy đủ mặt hàng để tính tổng</span>
          ) : (
            <span className="text-primary">{money(total)}</span>
          )}
        </p>
      </fieldset>
      {!!(validation || error) && <ErrorNotice error={validation || error} />}
      <Button type="submit" disabled={pending || !suppliers.data?.some((s) => s.dangHopTac)}>
        {pending ? 'Đang tạo...' : 'Tạo phiếu chờ duyệt'}
      </Button>
    </form>
  );
}
