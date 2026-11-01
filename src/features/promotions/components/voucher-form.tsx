import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { promotionManagementApi } from '../api/promotion-api';
import {
  validateVoucher,
  programStatus,
  type ManagedVoucher,
  type VoucherInput,
} from '../lib/admin-promotion';
import { control, when } from '../lib/admin-presentation';
import { PromotionError } from './admin-shared';

export function VoucherForm({
  userId,
  voucher,
  busy,
  error,
  save,
}: {
  userId: number;
  voucher: ManagedVoucher | null;
  busy: boolean;
  error: unknown;
  save: (input: VoucherInput) => void;
}) {
  const [programId, setProgramId] = useState(String(voucher?.maChuongTrinh ?? ''));
  const [type, setType] = useState<'PHAN_TRAM' | 'TIEN_CO_DINH'>(
    voucher?.loaiGiamGia ?? 'PHAN_TRAM',
  );
  const [validation, setValidation] = useState<Error | null>(null);
  const programs = useQuery({
    queryKey: ['promotion-management', userId, 'program-options'],
    queryFn: promotionManagementApi.programOptions,
    retry: false,
  });
  const selected = programs.data?.find((row) => row.id === Number(programId));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidation(null);
    const data = new FormData(event.currentTarget);
    const get = (name: string) => String(data.get(name) ?? '').trim();
    try {
      if (!selected) throw new Error('Cần chọn chương trình khuyến mãi hợp lệ.');
      const result = validateVoucher({
        maChuongTrinh: selected.id,
        maCode: get('code'),
        loaiGiamGia: type,
        giaTriGiam: Number(get('value')),
        donHangToiThieu: Number(get('minimum')),
        mucGiamToiDa: get('maximum') ? Number(get('maximum')) : null,
        gioiHanSuDung: get('limit') ? Number(get('limit')) : null,
      });
      if (result.gioiHanSuDung !== null && result.gioiHanSuDung < (voucher?.soLuotDaDung ?? 0))
        throw new Error('Số lượng phát hành không được nhỏ hơn số lượt đã dùng.');
      save(result);
    } catch (err) {
      setValidation(err instanceof Error ? err : new Error('Dữ liệu không hợp lệ.'));
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4">
        <label className="block">
          Mã voucher *
          <input
            autoFocus
            required
            name="code"
            maxLength={50}
            defaultValue={voucher?.maCode ?? ''}
            className={control}
          />
        </label>
        {programs.isPending ? (
          <p role="status">Đang tải chương trình...</p>
        ) : programs.isError ? (
          <PromotionError error={programs.error} retry={() => void programs.refetch()} />
        ) : (
          <>
            <label className="block">
              Chương trình khuyến mãi *
              <select
                required
                className={control}
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
              >
                <option value="">Chọn chương trình</option>
                {programs.data.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.tenChuongTrinh} — {programStatus(program)}
                  </option>
                ))}
              </select>
            </label>
            {!programs.data.length && (
              <p>Cần tạo chương trình tại trang Khuyến mãi trước khi tạo voucher.</p>
            )}
          </>
        )}
        {selected && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <p>
              Thời hạn: {when(selected.ngayBatDau)} – {when(selected.ngayKetThuc)} (giờ Việt Nam)
            </p>
            <p>Trạng thái: {programStatus(selected)}</p>
            <p>
              Voucher dùng thời hạn của chương trình; đổi thời hạn chương trình sẽ ảnh hưởng các
              voucher liên kết.
            </p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            Loại giảm giá *
            <select
              className={control}
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
            >
              <option value="PHAN_TRAM">Phần trăm (%)</option>
              <option value="TIEN_CO_DINH">Số tiền (đồng)</option>
            </select>
          </label>
          <label>
            Giá trị giảm *
            <input
              required
              name="value"
              type="number"
              min={type === 'PHAN_TRAM' ? '0.01' : '1'}
              step={type === 'PHAN_TRAM' ? '0.01' : '1'}
              defaultValue={voucher?.giaTriGiam ?? ''}
              className={control}
            />
          </label>
          <label>
            Đơn hàng tối thiểu (đồng) *
            <input
              required
              name="minimum"
              type="number"
              min="0"
              step="1"
              defaultValue={voucher?.donHangToiThieu ?? '0'}
              className={control}
            />
          </label>
          <label>
            Giảm tối đa (đồng)
            <input
              name="maximum"
              type="number"
              min="0"
              step="1"
              defaultValue={voucher?.mucGiamToiDa ?? ''}
              className={control}
            />
          </label>
          <label>
            Số lượng phát hành
            <input
              name="limit"
              type="number"
              min="1"
              step="1"
              max="2147483647"
              defaultValue={voucher?.gioiHanSuDung ?? ''}
              className={control}
            />
            <span className="text-xs text-muted-foreground">Để trống nếu không giới hạn.</span>
          </label>
        </div>
        {voucher && (
          <>
            <p>Số lượt đã dùng: {voucher.soLuotDaDung} (chỉ đọc)</p>
            <p className="text-sm text-muted-foreground">
              Để bảo toàn lượt dùng trên POS, hiện chỉ sửa voucher thuộc chương trình sắp diễn ra,
              hết hạn hoặc tạm ngưng.
            </p>
          </>
        )}
      </fieldset>
      {validation && <PromotionError error={validation} />}
      {!!error && <PromotionError error={error} />}
      <Button type="submit" disabled={busy || !selected || programs.isError}>
        {busy ? 'Đang lưu...' : 'Lưu voucher'}
      </Button>
    </form>
  );
}
