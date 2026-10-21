import { httpClient } from '@/shared/api/http-client';
import type { StoreTable, TableStatus } from '@/shared/types/admin.types';

interface BackendTable {
  id: number;
  soBan: string;
  maQrToken?: string;
  trangThai: string;
}

const STATUS_MAP: Record<string, TableStatus> = {
  TRONG: 'AVAILABLE',
  DANG_CO_KHACH: 'OCCUPIED',
  DA_DAT_TRUOC: 'RESERVED',
};

function mapTable(table: BackendTable): StoreTable {
  return {
    id: table.id,
    soBan: table.soBan,
    khuVuc: '',
    soGhe: 0,
    trangThai: STATUS_MAP[table.trangThai] ?? 'AVAILABLE',
    qrCodeUrl: table.maQrToken ? `/qr/${table.maQrToken}` : undefined,
  };
}

export const tableApi = {
  getTables: async (): Promise<StoreTable[]> => {
    const tables = (await httpClient.get('/tables')) as unknown as BackendTable[];
    return tables.map(mapTable);
  },

  createTable: async (data: Partial<StoreTable>): Promise<StoreTable> => {
    const table = (await httpClient.post('/tables', { soBan: data.soBan })) as unknown as BackendTable;
    return mapTable(table);
  },

  updateTableStatus: async (id: number, trangThai: StoreTable['trangThai']): Promise<StoreTable> => {
    const table = (await httpClient.patch(`/tables/${id}/status`, { trangThai })) as unknown as BackendTable;
    return mapTable(table);
  },
};
