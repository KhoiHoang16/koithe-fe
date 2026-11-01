import { api } from '@/shared/api/http-client';
import { mapReport, validateRange, type BackendReport, type ReportRange } from '../lib/report-data';

export const reportApi = {
  summary: async (range: ReportRange, signal?: AbortSignal) => {
    const dates = validateRange(range);
    const data = await api.get<BackendReport>('/reports', { params: { ...dates, top: 5 }, signal });
    return mapReport(data);
  },
};
