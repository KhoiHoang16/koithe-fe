import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface TableSession {
  tableId: number;
  tableName: string;
  token: string;
}

interface TableSessionState {
  table: TableSession | null;
  setTable: (table: TableSession) => void;
  clearTable: () => void;
}

export const useTableSessionStore = create<TableSessionState>()(
  persist(
    (set) => ({
      table: null,
      setTable: (table) => set({ table }),
      clearTable: () => set({ table: null }),
    }),
    {
      name: 'koithe-table-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ table: state.table }),
    },
  ),
);
