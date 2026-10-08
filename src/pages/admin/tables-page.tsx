import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { tableApi } from '@/features/tables/api/table-api';
import { LoadingScreen } from '@/shared/components/feedback/loading-spinner';

export function TablesPage() {
  const queryClient = useQueryClient();
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [soBan, setSoBan] = useState('');
  const [khuVuc, setKhuVuc] = useState('Tầng 1');
  const [soGhe, setSoGhe] = useState('4');

  const { data: tables, isLoading } = useQuery({
    queryKey: ['admin', 'tables'],
    queryFn: () => tableApi.getTables(),
  });

  const createMutation = useMutation({
    mutationFn: () => tableApi.createTable({ soBan, khuVuc, soGhe: Number(soGhe), trangThai: 'AVAILABLE' }),
    onSuccess: () => {
      toast.success('Đã thêm bàn mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin', 'tables'] });
      setIsModalOpen(false);
      setSoBan('');
    },
  });

  const filteredTables = (tables || []).filter((t) => selectedArea === 'ALL' || t.khuVuc === selectedArea);

  if (isLoading) return <LoadingScreen message="Đang tải sơ đồ bàn..." />;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Bàn & Mã QR Gọi món tại bàn</h1>
          <p className="text-muted-foreground text-xs">Sơ đồ vị trí bàn, trạng thái phục vụ và xuất mã QR order cho từng bàn</p>
        </div>
        <Button size="sm" className="gap-2 text-xs font-bold" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" /> Thêm bàn mới
        </Button>
      </div>

      {/* Area Filter */}
      <Card className="p-3 border">
        <div className="flex gap-2">
          {['ALL', 'Tầng 1', 'Tầng 2', 'Sân thượng'].map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedArea === area ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {area === 'ALL' ? 'Tất cả khu vực' : area}
            </button>
          ))}
        </div>
      </Card>

      {isModalOpen && (
        <Card className="p-5 border space-y-4 bg-muted/20">
          <h3 className="font-bold text-sm border-b pb-2">Tạo bàn mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold">Tên bàn *</label>
              <Input value={soBan} onChange={(e) => setSoBan(e.target.value)} className="mt-1 text-xs" placeholder="VD: Bàn 06..." />
            </div>
            <div>
              <label className="text-xs font-semibold">Khu vực *</label>
              <select value={khuVuc} onChange={(e) => setKhuVuc(e.target.value)} className="w-full mt-1 h-9 rounded-lg border bg-background px-3 text-xs">
                <option value="Tầng 1">Tầng 1</option>
                <option value="Tầng 2">Tầng 2</option>
                <option value="Sân thượng">Sân thượng</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold">Số ghế *</label>
              <Input type="number" value={soGhe} onChange={(e) => setSoGhe(e.target.value)} className="mt-1 text-xs" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button size="sm" className="text-xs font-bold" onClick={() => createMutation.mutate()} isLoading={createMutation.isPending}>Tạo bàn</Button>
          </div>
        </Card>
      )}

      {/* Table Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const isOccupied = table.trangThai === 'OCCUPIED';
          const isReserved = table.trangThai === 'RESERVED';

          return (
            <Card
              key={table.id}
              className={`p-4 border transition-all ${
                isOccupied
                  ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                  : isReserved
                  ? 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/20'
                  : 'hover:border-primary'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-base">{table.soBan}</h3>
                  <p className="text-[11px] text-muted-foreground">{table.khuVuc} • {table.soGhe} ghế</p>
                </div>
                <Badge
                  className={
                    isOccupied
                      ? 'bg-amber-500 text-white'
                      : isReserved
                      ? 'bg-purple-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }
                >
                  {isOccupied ? 'Có khách' : isReserved ? 'Đã đặt' : 'Bàn trống'}
                </Badge>
              </div>

              <div className="flex justify-center my-3 p-2 bg-white rounded-lg border">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=KOI_TABLE_${table.soBan}`}
                  alt="QR Order"
                  className="h-20 w-20"
                />
              </div>

              <div className="flex justify-between items-center text-[11px] pt-2 border-t text-muted-foreground">
                <span className="font-mono">QR: KOI_{table.soBan}</span>
                <Button variant="ghost" size="icon-sm" onClick={() => toast.success(`Đã tải mã QR cho ${table.soBan}`)}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
