import { httpClient } from '@/shared/api/http-client';
import type { StoreTable } from '@/shared/types/admin.types';

export const MOCK_TABLES: StoreTable[] = [
  { id: 1, soBan: 'Bàn 01', khuVuc: 'Tầng 1', soGhe: 4, trangThai: 'AVAILABLE' },
  { id: 2, soBan: 'Bàn 02', khuVuc: 'Tầng 1', soGhe: 2, trangThai: 'OCCUPIED', donHangHienTaiId: 1001 },
  { id: 3, soBan: 'Bàn 03', khuVuc: 'Tầng 1', soGhe: 6, trangThai: 'RESERVED' },
  { id: 4, soBan: 'Bàn 04', khuVuc: 'Tầng 2', soGhe: 4, trangThai: 'AVAILABLE' },
  { id: 5, soBan: 'Bàn 05', khuVuc: 'Tầng 2', soGhe: 4, trangThai: 'AVAILABLE' },
  { id: 6, soBan: 'Bàn VIP 01', khuVuc: 'Sân thượng', soGhe: 8, trangThai: 'AVAILABLE' },
];

export const tableApi = {
  getTables: async (): Promise<StoreTable[]> => {
    try {
      return (await httpClient.get('/admin/tables')) as StoreTable[];
    } catch {
      return MOCK_TABLES;
    }
  },

  createTable: async (data: Partial<StoreTable>): Promise<StoreTable> => {
    try {
      return (await httpClient.post('/admin/tables', data)) as StoreTable;
    } catch {
      return { id: Date.now(), soBan: data.soBan || 'Bàn Mới', khuVuc: data.khuVuc || 'Tầng 1', soGhe: data.soGhe || 4, trangThai: 'AVAILABLE' };
    }
  },

  updateTableStatus: async (id: number, trangThai: StoreTable['trangThai']): Promise<StoreTable> => {
    try {
      return (await httpClient.patch(`/admin/tables/${id}/status`, { trangThai })) as StoreTable;
    } catch {
      const t = MOCK_TABLES.find((table) => table.id === id);
      if (t) t.trangThai = trangThai;
      return t || MOCK_TABLES[0];
    }
  },
};
