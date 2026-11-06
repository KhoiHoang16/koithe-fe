import * as XLSX from 'xlsx';

export interface ExcelColumn<T> {
  header: string;
  key: keyof T | string;
  width?: number;
  format?: (value: any, row: T) => string | number;
}

/**
 * Xuất dữ liệu mảng đối tượng ra file Excel (.xlsx)
 */
export function exportToExcel<T extends Record<string, any>>({
  filename,
  sheetName = 'Dữ liệu',
  data,
  columns,
}: {
  filename: string;
  sheetName?: string;
  data: T[];
  columns: ExcelColumn<T>[];
}) {
  const formattedRows = data.map((row) => {
    const obj: Record<string, any> = {};
    columns.forEach((col) => {
      const rawValue = (row as any)[col.key];
      obj[col.header] = col.format ? col.format(rawValue, row) : (rawValue ?? '');
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);

  // Thiết lập độ rộng cột tự động
  worksheet['!cols'] = columns.map((col) => ({
    wch: col.width || Math.max(col.header.length + 4, 12),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const cleanFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, cleanFilename);
}

/**
 * Đọc file Excel (.xlsx / .xls) tải lên từ máy và chuyển thành mảng JSON
 */
export function readExcelFile<T = any>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<T>(worksheet);
        resolve(jsonData);
      } catch (err) {
        reject(new Error('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.'));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc file'));
    reader.readAsBinaryString(file);
  });
}

