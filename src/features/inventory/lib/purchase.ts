export interface DraftLine {
  key: number;
  variantId: string;
  quantity: string;
  price: string;
}
export function canEditPurchase(status: string) {
  return status === 'CHO_DUYET';
}
export function purchaseStatus(status: string) {
  return (
    (
      {
        CHO_DUYET: 'Chờ duyệt',
        DA_NHAP_KHO: 'Đã nhập kho',
        DA_NHAP: 'Đã nhập kho',
        DA_HUY: 'Đã hủy',
      } as Record<string, string>
    )[status] ?? status
  );
}
export function buildLines(rows: DraftLine[]) {
  if (!rows.length) throw new Error('Cần ít nhất một mặt hàng.');
  const seen = new Set<number>();
  return rows.map((row, index) => {
    const id = Number(row.variantId),
      qty = Number(row.quantity),
      price = Number(row.price);
    if (!Number.isSafeInteger(id) || id <= 0)
      throw new Error(`Dòng ${index + 1}: cần chọn biến thể.`);
    if (seen.has(id)) throw new Error('Biến thể bị trùng. Hãy gộp số lượng vào một dòng.');
    seen.add(id);
    if (!row.quantity.trim() || !Number.isSafeInteger(qty) || qty <= 0)
      throw new Error(`Dòng ${index + 1}: số lượng phải là số nguyên dương.`);
    if (
      !row.price.trim() ||
      !Number.isSafeInteger(price) ||
      price < 0 ||
      !Number.isSafeInteger(qty * price)
    )
      throw new Error(
        `Dòng ${index + 1}: đơn giá phải là số nguyên không âm trong giới hạn cho phép.`,
      );
    return { maBienThe: id, soLuong: qty, donGiaNhap: price };
  });
}
export function purchaseTotal(lines: { soLuong: number; donGiaNhap: number }[]) {
  const total = lines.reduce((sum, line) => sum + line.soLuong * line.donGiaNhap, 0);
  if (!Number.isSafeInteger(total)) throw new Error('Tổng tiền vượt giới hạn cho phép.');
  return total;
}
export function dateBounds(from: string, to: string) {
  if (from && to && from > to) throw new Error('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
  return {
    from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined,
  };
}
