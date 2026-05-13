import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronLeft, ChevronRight, Edit3, Filter, LockKeyhole, Plus, Search, UserRound, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { SelectMenu } from "@/components/SelectMenu";
import { StatusBadge } from "@/components/StatusBadge";
import { createUser, deactivateUser, listUsers, updateUser, updateUserPassword } from "@/features/users/usersApi";
import { getAuthUser } from "@/services/authStorage";
import type { User } from "@/services/types";

type UserRole = User["role"];

interface UserFormState {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
}

interface ConfirmState {
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
}

const emptyForm: UserFormState = {
  email: "",
  password: "",
  full_name: "",
  phone: "",
  role: "editor",
  is_active: true,
};

const roleOptions = [
  { value: "", label: "Tất cả vai trò" },
  { value: "admin", label: "Quản lý" },
  { value: "editor", label: "Nhân viên" },
  { value: "customer", label: "Khách hàng" },
  { value: "viewer", label: "Chỉ xem" },
];

const formRoleOptions = roleOptions.filter((option) => option.value !== "" && option.value !== "viewer");

const activeOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Tạm khóa" },
];

const pageSizeOptions = [
  { value: "10", label: "10 / trang" },
  { value: "20", label: "20 / trang" },
  { value: "50", label: "50 / trang" },
];

function formatDate(value: string | null): string {
  if (!value) {
    return "Chưa đăng nhập";
  }
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function getRoleLabel(role: UserRole): string {
  return roleOptions.find((option) => option.value === role)?.label ?? role;
}

export function UsersPage(): JSX.Element {
  const queryClient = useQueryClient();
  const currentUser = getAuthUser();
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => setKeyword(keywordInput.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [keywordInput]);

  useEffect(() => {
    setPage(1);
  }, [keyword, role, isActive, pageSize]);

  const usersQuery = useQuery({
    queryKey: ["users", page, pageSize, keyword, role, isActive],
    queryFn: () => listUsers({ page, limit: pageSize, keyword, role, isActive }),
  });

  const allUsersQuery = useQuery({
    queryKey: ["users", "summary"],
    queryFn: () => listUsers({ limit: 100 }),
  });

  const users = usersQuery.data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((usersQuery.data?.total ?? 0) / (usersQuery.data?.limit ?? pageSize)));
  const summaryUsers = allUsersQuery.data?.items ?? [];
  const stats = useMemo(
    () => ({
      total: summaryUsers.length,
      admin: summaryUsers.filter((item) => item.role === "admin").length,
      staff: summaryUsers.filter((item) => item.role === "editor").length,
      customer: summaryUsers.filter((item) => item.role === "customer").length,
      inactive: summaryUsers.filter((item) => !item.is_active).length,
    }),
    [summaryUsers],
  );

  function showToast(message: string): void {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  function openCreateForm(): void {
    setEditingUser(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(user: User): void {
    setEditingUser(user);
    setForm({
      email: user.email,
      password: "",
      full_name: user.full_name,
      phone: user.phone ?? "",
      role: user.role === "viewer" ? "editor" : user.role,
      is_active: user.is_active,
    });
    setFormOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      setFormOpen(false);
      showToast("Đã tạo tài khoản.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: Partial<Omit<UserFormState, "password" | "phone">> & { phone?: string | null } }) => updateUser(userId, payload),
    onSuccess: () => {
      showToast("Đã cập nhật tài khoản.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) => updateUserPassword(userId, password),
    onSuccess: () => {
      showToast("Đã cập nhật mật khẩu.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      showToast("Đã khóa tài khoản.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (userId: string) => updateUser(userId, { is_active: true }),
    onSuccess: () => {
      showToast("Đã mở khóa tài khoản.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const payload = {
      email: form.email.trim(),
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      role: form.role,
      is_active: form.is_active,
    };

    if (editingUser) {
      await updateMutation.mutateAsync({ userId: editingUser.id, payload });
      if (form.password.trim()) {
        await passwordMutation.mutateAsync({ userId: editingUser.id, password: form.password.trim() });
      }
      setFormOpen(false);
      return;
    }

    await createMutation.mutateAsync({ ...payload, password: form.password.trim() });
  }

  const saving = createMutation.isPending || updateMutation.isPending || passwordMutation.isPending;
  const actionLoading = deactivateMutation.isPending || activateMutation.isPending;

  return (
    <section className="page-stack accounts-page">
      <PageHeader
        title="Quản lý tài khoản"
        description="Quản lý tài khoản admin, nhân viên và khách hàng."
        action={
          <button className="primary-button" type="button" onClick={openCreateForm}>
            <Plus size={17} />
            Thêm tài khoản
          </button>
        }
      />

      <div className="account-summary-strip" aria-label="Tổng quan tài khoản">
        <button className={role === "" && isActive === "" ? "active" : ""} type="button" onClick={() => { setRole(""); setIsActive(""); }}>
          Tổng <strong>{stats.total}</strong>
        </button>
        <button className={role === "admin" ? "active" : ""} type="button" onClick={() => setRole("admin")}>
          Quản lý <strong>{stats.admin}</strong>
        </button>
        <button className={role === "editor" ? "active" : ""} type="button" onClick={() => setRole("editor")}>
          Nhân viên <strong>{stats.staff}</strong>
        </button>
        <button className={role === "customer" ? "active" : ""} type="button" onClick={() => setRole("customer")}>
          Khách hàng <strong>{stats.customer}</strong>
        </button>
        <button className={isActive === "false" ? "active" : ""} type="button" onClick={() => setIsActive("false")}>
          Tạm khóa <strong>{stats.inactive}</strong>
        </button>
      </div>

      <section className="filter-panel">
        <div className="filter-title">
          <Filter size={18} />
          <span>Bộ lọc tài khoản</span>
        </div>
        <div className="accounts-filter-grid">
          <label className="search-control">
            <Search size={17} />
            <input value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="Tìm theo tên, email hoặc SĐT..." />
          </label>
          <SelectMenu label="Vai trò" value={role} options={roleOptions} onChange={setRole} />
          <SelectMenu label="Trạng thái" value={isActive} options={activeOptions} onChange={setIsActive} />
          <button
            className="secondary-button filter-reset"
            type="button"
            onClick={() => {
              setKeywordInput("");
              setKeyword("");
              setRole("");
              setIsActive("");
            }}
          >
            Xóa lọc
          </button>
        </div>
      </section>

      <section className="panel accounts-list-panel">
        <div className="panel-header">
          <div>
            <h2>Danh sách tài khoản</h2>
            <p>{usersQuery.data?.total ?? 0} tài khoản phù hợp với bộ lọc hiện tại</p>
          </div>
        </div>

        {usersQuery.error ? <div className="alert-error">Không tải được danh sách tài khoản.</div> : null}

        <div className="table-wrap account-table-wrap">
          <table className="account-table">
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Đăng nhập gần nhất</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = currentUser?.id === user.id;
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="account-identity">
                        <span className="account-avatar"><UserRound size={17} /></span>
                        <div>
                          <strong>{user.full_name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.phone || "Chưa có"}</td>
                    <td><StatusBadge value={user.role} /></td>
                    <td><StatusBadge value={user.is_active ? "active" : "inactive"} /></td>
                    <td>{formatDate(user.last_login)}</td>
                    <td>
                      <div className="account-actions">
                        <button type="button" title="Sửa tài khoản" aria-label={`Sửa ${user.full_name}`} onClick={() => openEditForm(user)}>
                          <Edit3 size={15} />
                        </button>
                        {user.is_active ? (
                          <button
                            className="danger-text-button"
                            type="button"
                            title="Khóa tài khoản"
                            aria-label={`Khóa ${user.full_name}`}
                            disabled={isSelf}
                            onClick={() =>
                              setConfirmDialog({
                                title: "Khóa tài khoản",
                                description: `Bạn chắc chắn muốn khóa tài khoản ${user.full_name}? Tài khoản này sẽ không thể đăng nhập cho đến khi được mở lại.`,
                                confirmLabel: "Khóa tài khoản",
                                onConfirm: () => {
                                  setConfirmDialog(null);
                                  deactivateMutation.mutate(user.id);
                                },
                              })
                            }
                          >
                            <LockKeyhole size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            title="Mở khóa tài khoản"
                            aria-label={`Mở khóa ${user.full_name}`}
                            onClick={() => activateMutation.mutate(user.id)}
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {usersQuery.isLoading ? <div className="empty-state">Đang tải dữ liệu...</div> : null}
        {!usersQuery.isLoading && !users.length ? <div className="empty-state">Chưa có tài khoản phù hợp.</div> : null}

        <div className="pagination-bar">
          <div className="pagination-summary">
            Hiển thị <strong>{users.length}</strong> / <strong>{usersQuery.data?.total ?? 0}</strong> tài khoản
          </div>
          <div className="pagination-controls">
            <SelectMenu label="Số dòng" value={String(pageSize)} options={pageSizeOptions} onChange={(value) => setPageSize(Number(value))} />
            <button className="pagination-nav" type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              <ChevronLeft size={16} />
              <span>Trước</span>
            </button>
            <button className="active" type="button">{page}</button>
            <button className="pagination-nav" type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
              <span>Sau</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {formOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setFormOpen(false)}>
          <section className="modal-panel account-form-modal" role="dialog" aria-modal="true" aria-labelledby="account-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="account-form-title">{editingUser ? "Sửa tài khoản" : "Thêm tài khoản"}</h2>
                <p>{editingUser ? "Cập nhật thông tin đăng nhập, vai trò và trạng thái." : "Tạo tài khoản admin, nhân viên hoặc khách hàng."}</p>
              </div>
              <button className="icon-button" type="button" aria-label="Đóng form" onClick={() => setFormOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="account-form" onSubmit={handleSubmit}>
              <div className="form-grid two-columns">
                <label>
                  <span>Họ tên</span>
                  <input value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} required />
                </label>
                <label>
                  <span>Email</span>
                  <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
                </label>
                <label>
                  <span>Số điện thoại</span>
                  <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="VD: 0912345678" />
                </label>
                <SelectMenu label="Vai trò" value={form.role} options={formRoleOptions} onChange={(value) => setForm((current) => ({ ...current, role: value as UserRole }))} />
                <label>
                  <span>{editingUser ? "Mật khẩu mới" : "Mật khẩu"}</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    required={!editingUser}
                    minLength={6}
                    placeholder={editingUser ? "Để trống nếu không đổi" : "Tối thiểu 6 ký tự"}
                  />
                </label>
                <label className="toggle-row">
                  <input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} />
                  <span>Tài khoản đang hoạt động</span>
                </label>
              </div>

              {createMutation.error || updateMutation.error || passwordMutation.error ? <div className="form-error">Không lưu được tài khoản. Vui lòng kiểm tra email, mật khẩu hoặc quyền thao tác.</div> : null}

              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={() => setFormOpen(false)} disabled={saving}>
                  Hủy
                </button>
                <button className="primary-button" type="submit" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu tài khoản"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title ?? ""}
        description={confirmDialog?.description ?? ""}
        confirmLabel={confirmDialog?.confirmLabel}
        tone={confirmDialog?.tone ?? "danger"}
        loading={actionLoading}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => confirmDialog?.onConfirm()}
      />

      {toast ? <div className="toast-message">{toast}</div> : null}
    </section>
  );
}
