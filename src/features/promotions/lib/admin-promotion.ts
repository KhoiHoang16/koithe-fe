export interface PromotionProgram {
  id: number;
  tenChuongTrinh: string;
  moTa: string | null;
  ngayBatDau: string;
  ngayKetThuc: string;
  dangHoatDong: boolean;
}
export interface ManagedVoucher {
  id: number;
  maChuongTrinh: number;
  maCode: string;
  loaiGiamGia: 'PHAN_TRAM' | 'TIEN_CO_DINH';
  giaTriGiam: number;
  mucGiamToiDa: number | null;
  donHangToiThieu: number;
  gioiHanSuDung: number | null;
  soLuotDaDung: number;
}
export interface PromotionPage<T> {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}
export interface ProgramInput {
  tenChuongTrinh: string;
  moTa: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  dangHoatDong: boolean;
}
export type VoucherInput = Omit<ManagedVoucher, 'id' | 'soLuotDaDung'>;
export function sameProgram(a: PromotionProgram, b: PromotionProgram) {
  return (
    a.id === b.id &&
    a.tenChuongTrinh === b.tenChuongTrinh &&
    (a.moTa ?? '') === (b.moTa ?? '') &&
    a.dangHoatDong === b.dangHoatDong &&
    Date.parse(a.ngayBatDau) === Date.parse(b.ngayBatDau) &&
    Date.parse(a.ngayKetThuc) === Date.parse(b.ngayKetThuc)
  );
}
export function editedProgramDates(start: string, end: string, original: PromotionProgram | null) {
  const dates = programDates(start, end);
  if (original && start === localVietnamTime(original.ngayBatDau, true))
    dates.ngayBatDau = original.ngayBatDau;
  if (original && end === localVietnamTime(original.ngayKetThuc, true))
    dates.ngayKetThuc = original.ngayKetThuc;
  if (Date.parse(dates.ngayKetThuc) <= Date.parse(dates.ngayBatDau))
    throw new Error('Ngày kết thúc phải sau ngày bắt đầu.');
  return dates;
}
export const promotionPermissions = (role?: string) => ({
  write: role === 'ADMIN' || role === 'MANAGER',
  remove: role === 'ADMIN',
});
export function localVietnamTime(instant: string, includeSeconds = false) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' as const } : {}),
    hourCycle: 'h23',
  }).formatToParts(new Date(instant));
  const get = (type: string) => parts.find((part) => part.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}${includeSeconds ? `:${get('second')}` : ''}`;
}
export function programDates(start: string, end: string) {
  const convert = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value))
      throw new Error('Nhập đầy đủ ngày và giờ.');
    const parsed = new Date(`${value.length === 16 ? `${value}:00` : value}+07:00`);
    if (
      !Number.isFinite(parsed.getTime()) ||
      localVietnamTime(parsed.toISOString(), value.length === 19) !== value
    )
      throw new Error('Ngày giờ không hợp lệ.');
    return parsed.toISOString();
  };
  const ngayBatDau = convert(start),
    ngayKetThuc = convert(end);
  if (ngayKetThuc <= ngayBatDau) throw new Error('Ngày kết thúc phải sau ngày bắt đầu.');
  return { ngayBatDau, ngayKetThuc };
}
export function programStatus(program: PromotionProgram | undefined, now = Date.now()) {
  if (!program) return 'Chưa có thông tin chương trình';
  if (!program.dangHoatDong) return 'Tạm ngưng';
  if (now < Date.parse(program.ngayBatDau)) return 'Sắp diễn ra';
  if (now > Date.parse(program.ngayKetThuc)) return 'Hết hạn';
  return 'Đang diễn ra';
}
export function validateVoucher(input: VoucherInput): VoucherInput {
  const maCode = input.maCode.trim().toUpperCase();
  if (!maCode || maCode.length > 50) throw new Error('Mã voucher bắt buộc và không quá 50 ký tự.');
  if (!Number.isSafeInteger(input.maChuongTrinh) || input.maChuongTrinh <= 0)
    throw new Error('Cần chọn chương trình khuyến mãi.');
  if (!['PHAN_TRAM', 'TIEN_CO_DINH'].includes(input.loaiGiamGia))
    throw new Error('Loại giảm giá không hợp lệ.');
  if (!Number.isFinite(input.giaTriGiam) || input.giaTriGiam <= 0)
    throw new Error('Giá trị giảm phải lớn hơn 0.');
  if (input.loaiGiamGia === 'PHAN_TRAM' && input.giaTriGiam > 100)
    throw new Error('Giá trị giảm theo % không được vượt quá 100%.');
  for (const value of [
    input.donHangToiThieu,
    input.mucGiamToiDa,
    input.loaiGiamGia === 'TIEN_CO_DINH' ? input.giaTriGiam : 0,
  ]) {
    if (value !== null && (!Number.isSafeInteger(value) || value < 0))
      throw new Error('Số tiền phải là số nguyên không âm trong giới hạn cho phép.');
  }
  if (
    input.gioiHanSuDung !== null &&
    (!Number.isInteger(input.gioiHanSuDung) ||
      input.gioiHanSuDung < 1 ||
      input.gioiHanSuDung > 2147483647)
  )
    throw new Error('Số lượng phát hành phải là số nguyên dương, tối đa 2147483647.');
  return { ...input, maCode };
}
