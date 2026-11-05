import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Shield,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
} from 'lucide-react';
import { ApiError } from '@/shared/api/http-client';
import { useAuthStore } from '@/shared/stores/auth-store';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import {
  userApi,
  userKeys,
  type ManagedUser,
  type CreateUserInput,
  type UpdateUserInput,
} from '../api/user-api';

const ROLE_META: Record<
  string,
  { label: string; variant: 'default' | 'success' | 'warning' | 'info' | 'secondary' }
> = {
  ADMIN: { label: 'Quản trị viên (Admin)', variant: 'default' },
  MANAGER: { label: 'Quản lý (Manager)', variant: 'info' },
  CASHIER: { label: 'Thu ngân (Cashier)', variant: 'success' },
  BARISTA: { label: 'Pha chế (Barista)', variant: 'warning' },
  CUSTOMER: { label: 'Khách hàng (Customer)', variant: 'secondary' },
};

const ROLE_FILTER_TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'ADMIN', label: 'Quản trị viên' },
  { id: 'MANAGER', label: 'Quản lý' },
  { id: 'CASHIER', label: 'Thu ngân' },
  { id: 'BARISTA', label: 'Pha chế' },
  { id: 'CUSTOMER', label: 'Khách hàng' },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError && [400, 404, 409].includes(error.code)) {
    return error.message;
  }
  if (error instanceof ApiError && error.code === 403) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }
  return 'Không thể thực hiện thao tác. Vui lòng thử lại.';
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

interface UserFormModalProps {
  editingUser: ManagedUser | null;
  availableRoles: string[];
  pending: boolean;
  error: string | null;
  onSubmitCreate: (input: CreateUserInput) => void;
  onSubmitUpdate: (id: number, input: UpdateUserInput) => void;
  onCancel: () => void;
}

function UserFormContent({
  editingUser,
  availableRoles,
  pending,
  error,
  onSubmitCreate,
  onSubmitUpdate,
  onCancel,
}: UserFormModalProps) {
  const [username, setUsername] = useState(editingUser?.username ?? '');
  const [fullName, setFullName] = useState(editingUser?.fullName ?? '');
  const [phone, setPhone] = useState(editingUser?.phone ?? '');
  const [role, setRole] = useState(editingUser?.role ?? 'CASHIER');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(editingUser?.isActive ?? true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanUsername = username.trim();

    if (!cleanFullName) {
      setValidationError('Họ và tên không được để trống.');
      return;
    }

    if (cleanPhone && !/^0\d{9,10}$/.test(cleanPhone)) {
      setValidationError('Số điện thoại không hợp lệ (10–11 chữ số, bắt đầu bằng 0).');
      return;
    }

    if (!editingUser) {
      if (cleanUsername.length < 3 || cleanUsername.length > 50) {
        setValidationError('Tên đăng nhập phải từ 3 đến 50 ký tự.');
        return;
      }
      if (password.trim().length < 6) {
        setValidationError('Mật khẩu khởi tạo tối thiểu 6 ký tự.');
        return;
      }
      onSubmitCreate({
        username: cleanUsername,
        password: password.trim(),
        fullName: cleanFullName,
        phone: cleanPhone || undefined,
        role,
      });
    } else {
      if (password.trim() && password.trim().length < 6) {
        setValidationError('Mật khẩu mới tối thiểu 6 ký tự.');
        return;
      }
      onSubmitUpdate(editingUser.id, {
        fullName: cleanFullName,
        phone: cleanPhone || undefined,
        role,
        isActive,
        password: password.trim() || undefined,
      });
    }
  };

  const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {displayError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="emp-username">Tên đăng nhập *</Label>
        <Input
          id="emp-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={!!editingUser || pending}
          placeholder="VD: cashier02, barista02..."
        />
        {editingUser && (
          <p className="text-xs text-muted-foreground">Tên đăng nhập là định danh cố định.</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="emp-fullname">Họ và tên *</Label>
        <Input
          id="emp-fullname"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={pending}
          placeholder="VD: Nguyễn Văn A"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="emp-phone">Số điện thoại</Label>
          <Input
            id="emp-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={pending}
            placeholder="0901234567"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="emp-role">Vai trò (Role) *</Label>
          <select
            id="emp-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={pending || editingUser?.username === 'admin'}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {ROLE_META[r]?.label ?? r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="emp-password">
          {editingUser ? 'Đặt lại mật khẩu mới (để trống nếu giữ nguyên)' : 'Mật khẩu khởi tạo *'}
        </Label>
        <Input
          id="emp-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
          placeholder={editingUser ? 'Nhập tối thiểu 6 ký tự để đổi mật khẩu' : 'Tối thiểu 6 ký tự'}
        />
      </div>

      {editingUser && editingUser.username !== 'admin' && (
        <div className="flex items-center gap-2 pt-1">
          <input
            id="emp-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={pending}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor="emp-active" className="cursor-pointer font-normal">
            Tài khoản đang hoạt động (cho phép đăng nhập)
          </Label>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" isLoading={pending}>
          {editingUser ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}
        </Button>
      </div>
    </form>
  );
}

export function EmployeeManagement() {
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.vaiTro === 'ADMIN';
  const canManage = currentUser?.vaiTro === 'ADMIN' || currentUser?.vaiTro === 'MANAGER';
  const queryClient = useQueryClient();

  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [editor, setEditor] = useState<{ user: ManagedUser | null } | null>(null);
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);

  const usersQuery = useQuery({
    queryKey: userKeys.list(selectedRole, keyword.trim()),
    queryFn: ({ signal }) =>
      userApi.getAll({ role: selectedRole, keyword: keyword.trim() }, signal),
    enabled: canManage,
  });

  const rolesQuery = useQuery({
    queryKey: userKeys.roles(),
    queryFn: () => userApi.getRoles(),
    enabled: canManage,
  });

  const availableRoles =
    rolesQuery.data && rolesQuery.data.length > 0
      ? rolesQuery.data.map((r) => r.roleName)
      : ['ADMIN', 'MANAGER', 'CASHIER', 'BARISTA', 'CUSTOMER'];

  const createMutation = useMutation({
    mutationFn: (input: CreateUserInput) => userApi.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      setEditor(null);
      toast.success('Đã tạo tài khoản nhân viên mới!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateUserInput }) =>
      userApi.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      setEditor(null);
      toast.success('Đã cập nhật thông tin tài khoản!');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      userApi.updateStatus(id, isActive),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success(
        updated.isActive
          ? `Đã mở khóa tài khoản ${updated.username}`
          : `Đã khóa tài khoản ${updated.username}`,
      );
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deletingUser) return;
      await userApi.delete(deletingUser.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      setDeletingUser(null);
      toast.success('Đã xóa tài khoản nhân viên.');
    },
  });

  const users = usersQuery.data ?? [];
  const activeCount = users.filter((u) => u.isActive).length;
  const lockedCount = users.length - activeCount;
  const staffCount = users.filter((u) => u.role !== 'CUSTOMER').length;

  const isFormPending = createMutation.isPending || updateMutation.isPending;
  const formError = createMutation.isError
    ? getErrorMessage(createMutation.error)
    : updateMutation.isError
      ? getErrorMessage(updateMutation.error)
      : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhân viên & Tài khoản</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Danh sách tài khoản hệ thống, phân quyền vai trò (Admin, Quản lý, Thu ngân, Pha chế) và trạng thái hoạt động
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void usersQuery.refetch()}
            disabled={usersQuery.isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${usersQuery.isFetching ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          {canManage && (
            <Button
              onClick={() => {
                createMutation.reset();
                updateMutation.reset();
                setEditor({ user: null });
              }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Thêm tài khoản
            </Button>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Tổng tài khoản hiển thị</p>
            <p className="text-2xl font-bold mt-1">{users.length}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Nhân sự nội bộ</p>
            <p className="text-2xl font-bold mt-1">{staffCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{activeCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-green-500/15 text-green-600 flex items-center justify-center">
            <UserCheck className="h-5 w-5" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Đang tạm khóa</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">{lockedCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
            <UserX className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between">
          {/* Role filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {ROLE_FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRole(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedRole === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm tên đăng nhập, họ tên, SĐT..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Content states */}
        {usersQuery.isPending ? (
          <div role="status" className="py-12 text-center text-muted-foreground">
            Đang tải danh sách nhân viên và tài khoản...
          </div>
        ) : usersQuery.isError ? (
          <div role="alert" className="py-10 space-y-3 text-center">
            <p className="text-destructive">{getErrorMessage(usersQuery.error)}</p>
            <Button variant="outline" onClick={() => void usersQuery.refetch()}>
              Thử lại
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div role="status" className="py-12 text-center text-muted-foreground">
            Không tìm thấy tài khoản nào khớp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto" data-lenis-prevent>
            <table className="w-full text-sm text-left">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium whitespace-nowrap">ID</th>
                  <th className="p-3 font-medium whitespace-nowrap">Tên đăng nhập</th>
                  <th className="p-3 font-medium whitespace-nowrap">Họ và tên</th>
                  <th className="p-3 font-medium whitespace-nowrap">Số điện thoại</th>
                  <th className="p-3 font-medium whitespace-nowrap">Vai trò</th>
                  <th className="p-3 font-medium whitespace-nowrap text-center">Trạng thái</th>
                  <th className="p-3 font-medium whitespace-nowrap">Ngày tạo</th>
                  <th className="p-3 font-medium whitespace-nowrap text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => {
                  const roleInfo = ROLE_META[item.role] ?? {
                    label: item.role,
                    variant: 'secondary' as const,
                  };
                  const isProtectedAdmin =
                    item.id === 1 || item.username.toLowerCase() === 'admin';
                  const isSelf = currentUser?.id === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3 font-mono text-xs text-muted-foreground">#{item.id}</td>
                      <td className="p-3 font-mono font-semibold">{item.username}</td>
                      <td className="p-3 font-medium">{item.fullName}</td>
                      <td className="p-3 whitespace-nowrap">{item.phone || '—'}</td>
                      <td className="p-3 whitespace-nowrap">
                        <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <Badge variant={item.isActive ? 'success' : 'destructive'}>
                          {item.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap text-muted-foreground text-xs">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              createMutation.reset();
                              updateMutation.reset();
                              setEditor({ user: item });
                            }}
                            title="Chỉnh sửa thông tin / phân quyền"
                          >
                            <Edit3 className="h-3.5 w-3.5 mr-1" />
                            Sửa
                          </Button>

                          {!isProtectedAdmin && !isSelf && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={toggleStatusMutation.isPending}
                              onClick={() =>
                                toggleStatusMutation.mutate({
                                  id: item.id,
                                  isActive: !item.isActive,
                                })
                              }
                              title={item.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              {item.isActive ? (
                                <Lock className="h-3.5 w-3.5 text-amber-600" />
                              ) : (
                                <Unlock className="h-3.5 w-3.5 text-green-600" />
                              )}
                            </Button>
                          )}

                          {isAdmin && !isProtectedAdmin && !isSelf && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                deleteMutation.reset();
                                setDeletingUser(item);
                              }}
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Dialog
        open={!!editor}
        onOpenChange={(open) => {
          if (!open && !isFormPending) setEditor(null);
        }}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] max-w-lg"
          data-lenis-prevent
        >
          <DialogHeader>
            <DialogTitle>
              {editor?.user ? `Cập nhật tài khoản @${editor.user.username}` : 'Thêm tài khoản mới'}
            </DialogTitle>
            <DialogDescription>
              Thiết lập thông tin cá nhân, vai trò phân quyền và mật khẩu đăng nhập.
            </DialogDescription>
          </DialogHeader>
          {editor && (
            <UserFormContent
              key={editor.user?.id ?? 'create-new'}
              editingUser={editor.user}
              availableRoles={availableRoles}
              pending={isFormPending}
              error={formError}
              onSubmitCreate={(input) => createMutation.mutate(input)}
              onSubmitUpdate={(id, input) => updateMutation.mutate({ id, input })}
              onCancel={() => setEditor(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deletingUser}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeletingUser(null);
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{deletingUser?.fullName}</strong> (@
              {deletingUser?.username})? Tài khoản sau khi xóa sẽ bị vô hiệu hóa quyền đăng nhập.
            </DialogDescription>
          </DialogHeader>
          {deleteMutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {getErrorMessage(deleteMutation.error)}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setDeletingUser(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Xác nhận xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

