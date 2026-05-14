import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { SelectMenu } from "@/components/SelectMenu";
import { StatusBadge } from "@/components/StatusBadge";
import {
  createApartment,
  deleteApartment,
  listApartments,
  updateApartment,
  type ApartmentPayload,
} from "@/features/apartments/apartmentsApi";
import { formatDirection } from "@/features/apartments/directions";
import { listProjects } from "@/features/projects/projectsApi";
import { listUsers } from "@/features/users/usersApi";
import { getAuthUser } from "@/services/authStorage";
import { isAdminRole } from "@/services/permissions";
import type { Apartment } from "@/services/types";

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "available", label: "Còn trống" },
  { value: "reserved", label: "Đã giữ chỗ" },
  { value: "sold", label: "Đã bán" },
];

const apartmentStatusOptions = statusOptions.slice(1);

const pageSizeOptions = [
  { value: "10", label: "10 / trang" },
  { value: "20", label: "20 / trang" },
  { value: "50", label: "50 / trang" },
];

const directionOptions = [
  { value: "", label: "Tất cả hướng" },
  { value: "N", label: "Bắc" },
  { value: "S", label: "Nam" },
  { value: "E", label: "Đông" },
  { value: "W", label: "Tây" },
  { value: "NE", label: "Đông Bắc" },
  { value: "NW", label: "Tây Bắc" },
  { value: "SE", label: "Đông Nam" },
  { value: "SW", label: "Tây Nam" },
];

const formDirectionOptions = directionOptions.slice(1);

const initialForm: ApartmentPayload = {
  project_id: "",
  code: "",
  floor: 1,
  area: 60,
  bedrooms: 2,
  bathrooms: 1,
  direction: "SE",
  price: 1000000000,
  status: "available",
  feng_shui_element: "",
  consultant_id: null,
};

interface ConfirmState {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("vi-VN")} VND`;
}

export function ApartmentsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const canManageApartments = isAdminRole(getAuthUser()?.role);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectId = searchParams.get("projectId") ?? "";
  const [projectId, setProjectId] = useState(initialProjectId);
  const [status, setStatus] = useState("");
  const [floor, setFloor] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [direction, setDirection] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [formOpen, setFormOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [form, setForm] = useState<ApartmentPayload>({ ...initialForm, project_id: initialProjectId });
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState | null>(null);

  const projectsQuery = useQuery({
    queryKey: ["projects", "apartment-filter"],
    queryFn: () => listProjects({ limit: 100 }),
  });
  const usersQuery = useQuery({
    queryKey: ["users", "consultants-for-apartment-form"],
    queryFn: () => listUsers({ limit: 100, role: "consultant", isActive: "true" }),
    enabled: canManageApartments,
  });

  const apartmentsQuery = useQuery({
    queryKey: ["apartments", page, pageSize, projectId, status, floor, bedrooms, direction, priceMin, priceMax, areaMin, areaMax],
    queryFn: () => listApartments({ page, limit: pageSize, projectId, status, floor, bedrooms, direction, priceMin, priceMax, areaMin, areaMax }),
  });

  const allApartmentsQuery = useQuery({
    queryKey: ["apartments", "summary", projectId, floor, bedrooms, direction, priceMin, priceMax, areaMin, areaMax],
    queryFn: () => listApartments({ limit: 100, projectId, floor, bedrooms, direction, priceMin, priceMax, areaMin, areaMax }),
  });

  const projects = projectsQuery.data?.items ?? [];
  const apartments = apartmentsQuery.data?.items ?? [];
  const allApartments = allApartmentsQuery.data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((apartmentsQuery.data?.total ?? 0) / (apartmentsQuery.data?.limit ?? pageSize)));

  const projectOptions = useMemo(() => [{ value: "", label: "Tất cả dự án" }, ...projects.map((project) => ({ value: project.id, label: project.name }))], [projects]);
  const formProjectOptions = useMemo(() => projects.map((project) => ({ value: project.id, label: project.name })), [projects]);
  const projectNameById = useMemo(() => new Map(projects.map((project) => [project.id, project.name])), [projects]);
  const consultantOptions = useMemo(
    () => [
      { value: "", label: "Theo nhân viên phụ trách dự án" },
      ...(usersQuery.data?.items ?? [])
        .filter((user) => user.role === "consultant")
        .map((user) => ({ value: user.id, label: user.full_name })),
    ],
    [usersQuery.data?.items],
  );

  const summary = useMemo(
    () => ({
      total: allApartmentsQuery.data?.total ?? allApartments.length,
      available: allApartments.filter((apartment) => apartment.status === "available").length,
      reserved: allApartments.filter((apartment) => apartment.status === "reserved").length,
      sold: allApartments.filter((apartment) => apartment.status === "sold").length,
    }),
    [allApartments, allApartmentsQuery.data?.total],
  );

  useEffect(() => {
    setPage(1);
  }, [projectId, status, floor, bedrooms, direction, priceMin, priceMax, areaMin, areaMax, pageSize]);

  useEffect(() => {
    if (projectId) {
      setSearchParams({ projectId });
    } else {
      setSearchParams({});
    }
  }, [projectId, setSearchParams]);

  function showToast(message: string): void {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  function openCreateForm(): void {
    setEditingApartment(null);
    setForm({ ...initialForm, project_id: projectId || projects[0]?.id || "" });
    setFormOpen(true);
  }

  function openEditForm(apartment: Apartment): void {
    setEditingApartment(apartment);
    setForm({
      project_id: apartment.project_id,
      code: apartment.code,
      floor: apartment.floor,
      area: Number(apartment.area),
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      direction: apartment.direction,
      price: apartment.price,
      status: apartment.status,
      feng_shui_element: apartment.feng_shui_element ?? "",
      consultant_id: apartment.consultant_id,
    });
    setFormOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => (form.project_id ? (editingApartment ? updateApartment(editingApartment.id, form) : createApartment(form)) : Promise.reject(new Error("Chưa chọn dự án"))),
    onSuccess: () => {
      showToast(editingApartment ? "Đã cập nhật căn hộ." : "Đã thêm căn hộ.");
      setFormOpen(false);
      setEditingApartment(null);
      queryClient.invalidateQueries({ queryKey: ["apartments"] });
      queryClient.invalidateQueries({ queryKey: ["project-apartments"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApartment,
    onSuccess: () => {
      showToast("Đã xóa căn hộ.");
      queryClient.invalidateQueries({ queryKey: ["apartments"] });
      queryClient.invalidateQueries({ queryKey: ["project-apartments"] });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    saveMutation.mutate();
  }

  return (
    <section className="page-stack apartments-page">
      <PageHeader
        title="Căn hộ"
        description="Quản lý toàn bộ giỏ hàng căn hộ theo dự án, trạng thái và thông tin bán hàng."
        action={canManageApartments ? (
          <button className="primary-button" type="button" onClick={openCreateForm}>
            <Plus size={17} />
            Thêm căn hộ
          </button>
        ) : undefined}
      />

      <section className="filter-panel">
        <div className="filter-title">
          <Search size={18} />
          <span>Bộ lọc căn hộ</span>
        </div>
        <div className="apartments-filter-grid">
          <SelectMenu label="Dự án" value={projectId} options={projectOptions} onChange={setProjectId} />
          <SelectMenu label="Trạng thái" value={status} options={statusOptions} onChange={setStatus} />
          <label className="compact-input-control">
            <span>Tầng</span>
            <input value={floor} onChange={(event) => setFloor(event.target.value)} placeholder="Tất cả" />
          </label>
          <label className="compact-input-control">
            <span>Phòng ngủ</span>
            <input value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} placeholder="Tất cả" />
          </label>
          <SelectMenu label="Hướng" value={direction} options={directionOptions} onChange={setDirection} />
          <label className="compact-input-control">
            <span>Giá từ</span>
            <input inputMode="numeric" value={priceMin} onChange={(event) => setPriceMin(event.target.value)} placeholder="VNĐ" />
          </label>
          <label className="compact-input-control">
            <span>Giá đến</span>
            <input inputMode="numeric" value={priceMax} onChange={(event) => setPriceMax(event.target.value)} placeholder="VNĐ" />
          </label>
          <label className="compact-input-control">
            <span>DT từ</span>
            <input inputMode="decimal" value={areaMin} onChange={(event) => setAreaMin(event.target.value)} placeholder="m2" />
          </label>
          <label className="compact-input-control">
            <span>DT đến</span>
            <input inputMode="decimal" value={areaMax} onChange={(event) => setAreaMax(event.target.value)} placeholder="m2" />
          </label>
          <button
            className="secondary-button filter-reset"
            type="button"
            onClick={() => {
              setProjectId("");
              setStatus("");
              setFloor("");
              setBedrooms("");
              setDirection("");
              setPriceMin("");
              setPriceMax("");
              setAreaMin("");
              setAreaMax("");
            }}
          >
            Xóa lọc
          </button>
        </div>
      </section>

      <section className="panel apartments-list-panel">
        <div className="panel-header apartment-list-header">
          <div>
            <h2>Danh sách căn hộ</h2>
            <p>{apartmentsQuery.data?.total ?? apartments.length} căn hộ phù hợp</p>
          </div>
          <div className="apartment-list-stats" aria-label="Lọc nhanh theo trạng thái căn hộ">
            <button className={status === "" ? "active" : ""} type="button" onClick={() => setStatus("")}>
              <span>Tổng</span>
              <strong>{summary.total}</strong>
            </button>
            <button className={status === "available" ? "active" : ""} type="button" onClick={() => setStatus("available")}>
              <span>Còn trống</span>
              <strong>{summary.available}</strong>
            </button>
            <button className={status === "reserved" ? "active" : ""} type="button" onClick={() => setStatus("reserved")}>
              <span>Đã giữ</span>
              <strong>{summary.reserved}</strong>
            </button>
            <button className={status === "sold" ? "active" : ""} type="button" onClick={() => setStatus("sold")}>
              <span>Đã bán</span>
              <strong>{summary.sold}</strong>
            </button>
          </div>
        </div>
        <div className="table-wrap apartment-management-table-wrap">
          <table className="apartment-management-table">
            <thead>
              <tr>
                <th>Mã căn</th>
                <th>Dự án</th>
                <th>Tầng</th>
                <th>Diện tích</th>
                <th>PN/WC</th>
                <th>Hướng</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                  {canManageApartments ? <th></th> : null}
              </tr>
            </thead>
            <tbody>
              {apartments.map((apartment) => (
                <tr key={apartment.id} onClick={() => navigate(`/apartments/${apartment.id}`)}>
                  <td>
                    <strong>{apartment.code}</strong>
                  </td>
                  <td className="apartment-project-cell">{projectNameById.get(apartment.project_id) ?? "Dự án"}</td>
                  <td>{apartment.floor}</td>
                  <td>{Number(apartment.area).toLocaleString("vi-VN")} m2</td>
                  <td>
                    {apartment.bedrooms}PN / {apartment.bathrooms}WC
                  </td>
                  <td>{formatDirection(apartment.direction)}</td>
                  <td className="money-cell">{formatCurrency(apartment.price)}</td>
                  <td>
                    <StatusBadge value={apartment.status} />
                  </td>
                  {canManageApartments ? <td>
                    <div className="amenity-actions">
                      <button
                        type="button"
                        title="Sửa căn hộ"
                        aria-label="Sửa căn hộ"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditForm(apartment);
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="danger-text-button"
                        type="button"
                        title="Xóa căn hộ"
                        aria-label="Xóa căn hộ"
                        onClick={(event) => {
                          event.stopPropagation();
                          setConfirmDialog({
                            title: "Xóa căn hộ",
                            description: `Bạn chắc chắn muốn xóa căn hộ "${apartment.code}"? Thao tác này sẽ gỡ căn hộ khỏi danh sách quản lý.`,
                            confirmLabel: "Xóa căn hộ",
                            onConfirm: () => {
                              setConfirmDialog(null);
                              deleteMutation.mutate(apartment.id);
                            },
                          });
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {apartmentsQuery.isLoading ? <div className="empty-state">Đang tải dữ liệu...</div> : null}
        {!apartmentsQuery.isLoading && !apartments.length ? <div className="empty-state">Chưa có căn hộ phù hợp.</div> : null}
        <div className="pagination-bar">
          <div className="pagination-summary">
            Hiển thị <strong>{apartments.length}</strong> / <strong>{apartmentsQuery.data?.total ?? 0}</strong> căn hộ
          </div>
          <div className="pagination-controls">
            <SelectMenu label="Số dòng" value={String(pageSize)} options={pageSizeOptions} onChange={(value) => setPageSize(Number(value))} />
            <button className="pagination-nav" type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              <ChevronLeft size={16} />
              <span>Trước</span>
            </button>
            <button className="active" type="button">
              {page}
            </button>
            <button className="pagination-nav" type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
              <span>Sau</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {formOpen && canManageApartments ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setFormOpen(false)}>
          <section className="modal-panel apartment-form-modal" role="dialog" aria-modal="true" aria-labelledby="apartment-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="apartment-form-title">{editingApartment ? "Sửa căn hộ" : "Thêm căn hộ"}</h2>
                <p>{editingApartment ? "Cập nhật thông tin căn hộ." : "Tạo căn hộ mới trong giỏ hàng."}</p>
              </div>
              <button className="icon-button" type="button" aria-label="Đóng form" onClick={() => setFormOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form className="project-form" onSubmit={handleSubmit}>
              <SelectMenu label="Dự án" value={form.project_id} options={formProjectOptions} onChange={(value) => setForm((current) => ({ ...current, project_id: value }))} />
              <div className="form-grid-two">
                <label>
                  <span>Mã căn</span>
                  <input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} required />
                </label>
                <label>
                  <span>Tầng</span>
                  <input type="number" min={1} value={form.floor} onChange={(event) => setForm((current) => ({ ...current, floor: Number(event.target.value) }))} required />
                </label>
              </div>
              <div className="form-grid-two">
                <label>
                  <span>Diện tích</span>
                  <input type="number" min={1} step="0.01" value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: Number(event.target.value) }))} required />
                </label>
                <label>
                  <span>Giá</span>
                  <input type="number" min={1} value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} required />
                </label>
              </div>
              <div className="form-grid-two">
                <label>
                  <span>Phòng ngủ</span>
                  <input type="number" min={0} value={form.bedrooms} onChange={(event) => setForm((current) => ({ ...current, bedrooms: Number(event.target.value) }))} required />
                </label>
                <label>
                  <span>Phòng tắm</span>
                  <input type="number" min={1} value={form.bathrooms} onChange={(event) => setForm((current) => ({ ...current, bathrooms: Number(event.target.value) }))} required />
                </label>
              </div>
              <div className="form-grid-two">
                <SelectMenu label="Hướng" value={form.direction} options={formDirectionOptions} onChange={(value) => setForm((current) => ({ ...current, direction: value }))} />
                <SelectMenu label="Trạng thái" value={form.status} options={apartmentStatusOptions} onChange={(value) => setForm((current) => ({ ...current, status: value as Apartment["status"] }))} />
              </div>
              <label>
                <span>Mệnh phong thủy</span>
                <input value={form.feng_shui_element ?? ""} onChange={(event) => setForm((current) => ({ ...current, feng_shui_element: event.target.value }))} placeholder="Kim, Mộc, Thủy, Hỏa, Thổ" />
              </label>
              <SelectMenu label="Nhân viên tư vấn phụ trách" value={form.consultant_id ?? ""} options={consultantOptions} onChange={(value) => setForm((current) => ({ ...current, consultant_id: value || null }))} />
              {!form.project_id ? <div className="form-error">Vui lòng chọn dự án trước khi lưu căn hộ.</div> : null}
              {saveMutation.error ? <div className="form-error">Không lưu được căn hộ. Vui lòng kiểm tra dữ liệu.</div> : null}
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={() => setFormOpen(false)}>
                  Hủy
                </button>
                <button className="primary-button" type="submit" disabled={saveMutation.isPending || !form.project_id}>
                  {saveMutation.isPending ? "Đang lưu..." : "Lưu căn hộ"}
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
        loading={deleteMutation.isPending}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => confirmDialog?.onConfirm()}
      />

      {toast ? <div className="toast-message">{toast}</div> : null}
    </section>
  );
}
