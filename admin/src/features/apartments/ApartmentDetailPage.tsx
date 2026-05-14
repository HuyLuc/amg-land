import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, Pencil, PlayCircle, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { SelectMenu } from "@/components/SelectMenu";
import { StatusBadge } from "@/components/StatusBadge";
import {
  deleteApartmentMedia,
  getApartment,
  listApartmentMedia,
  updateApartment,
  updateApartmentMedia,
  uploadApartmentMedia,
  type ApartmentPayload,
} from "@/features/apartments/apartmentsApi";
import { formatDirection } from "@/features/apartments/directions";
import { listProjects } from "@/features/projects/projectsApi";
import { listUsers } from "@/features/users/usersApi";
import { getAuthUser } from "@/services/authStorage";
import { isAdminRole } from "@/services/permissions";
import type { Apartment } from "@/services/types";
import type { ApartmentMedia } from "@/services/types";

const statusOptions = [
  { value: "available", label: "Còn trống" },
  { value: "reserved", label: "Đã giữ chỗ" },
  { value: "sold", label: "Đã bán" },
];

const directionOptions = [
  { value: "N", label: "Bắc" },
  { value: "S", label: "Nam" },
  { value: "E", label: "Đông" },
  { value: "W", label: "Tây" },
  { value: "NE", label: "Đông Bắc" },
  { value: "NW", label: "Tây Bắc" },
  { value: "SE", label: "Đông Nam" },
  { value: "SW", label: "Tây Nam" },
];

const emptyForm: ApartmentPayload = {
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

function formatCurrency(value: number): string {
  return `${value.toLocaleString("vi-VN")} VND`;
}

function toForm(apartment: Apartment): ApartmentPayload {
  return {
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
  };
}

export function ApartmentDetailPage(): JSX.Element {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canManageApartments = isAdminRole(getAuthUser()?.role);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ApartmentPayload>(emptyForm);
  const [captionDraft, setCaptionDraft] = useState("");
  const [captionMedia, setCaptionMedia] = useState<ApartmentMedia | null>(null);
  const [previewMedia, setPreviewMedia] = useState<ApartmentMedia | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const apartmentQuery = useQuery({
    queryKey: ["apartment", id],
    queryFn: () => getApartment(id),
    enabled: Boolean(id),
  });

  const mediaQuery = useQuery({
    queryKey: ["apartment-media", id],
    queryFn: () => listApartmentMedia(id),
    enabled: Boolean(id),
  });

  const projectsQuery = useQuery({
    queryKey: ["projects", "apartment-detail"],
    queryFn: () => listProjects({ limit: 100 }),
  });
  const usersQuery = useQuery({
    queryKey: ["users", "consultants-for-apartment-detail"],
    queryFn: () => listUsers({ limit: 100, role: "consultant", isActive: "true" }),
    enabled: canManageApartments,
  });

  const apartment = apartmentQuery.data ?? null;
  const projects = projectsQuery.data?.items ?? [];
  const projectName = useMemo(() => projects.find((project) => project.id === apartment?.project_id)?.name ?? "Dự án", [apartment?.project_id, projects]);
  const projectOptions = useMemo(() => projects.map((project) => ({ value: project.id, label: project.name })), [projects]);
  const consultantOptions = useMemo(
    () => [
      { value: "", label: "Theo nhân viên phụ trách dự án" },
      ...(usersQuery.data?.items ?? [])
        .filter((user) => user.role === "consultant")
        .map((user) => ({ value: user.id, label: user.full_name })),
    ],
    [usersQuery.data?.items],
  );

  useEffect(() => {
    if (apartment && formOpen) {
      setForm(toForm(apartment));
    }
  }, [apartment, formOpen]);

  useEffect(() => {
    if (!previewMedia) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setPreviewMedia(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewMedia]);

  function showToast(message: string): void {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  const saveMutation = useMutation({
    mutationFn: () => (apartment ? updateApartment(apartment.id, form) : Promise.reject(new Error("Chưa chọn căn hộ"))),
    onSuccess: () => {
      showToast("Đã cập nhật căn hộ.");
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["apartment", id] });
      queryClient.invalidateQueries({ queryKey: ["apartments"] });
      queryClient.invalidateQueries({ queryKey: ["project-apartments"] });
    },
  });

  const uploadMediaMutation = useMutation({
    mutationFn: ({ mediaType, file }: { mediaType: "image" | "video"; file: File }) => uploadApartmentMedia(id, mediaType, file),
    onSuccess: () => {
      showToast("Đã tải media căn hộ.");
      queryClient.invalidateQueries({ queryKey: ["apartment-media", id] });
    },
  });

  const updateMediaMutation = useMutation({
    mutationFn: ({ mediaId, caption }: { mediaId: string; caption?: string | null }) => updateApartmentMedia(mediaId, { caption }),
    onSuccess: () => {
      showToast("Đã cập nhật media căn hộ.");
      queryClient.invalidateQueries({ queryKey: ["apartment-media", id] });
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: deleteApartmentMedia,
    onSuccess: () => {
      showToast("Đã xóa media căn hộ.");
      queryClient.invalidateQueries({ queryKey: ["apartment-media", id] });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    saveMutation.mutate();
  }

  if (apartmentQuery.isLoading) {
    return <div className="panel empty-state">Đang tải chi tiết căn hộ...</div>;
  }

  if (!apartment) {
    return <div className="panel empty-state">Không tìm thấy căn hộ.</div>;
  }

  return (
    <section className="page-stack apartments-page">
      <button className="secondary-button back-button" type="button" onClick={() => navigate("/apartments")}>
        <ArrowLeft size={16} />
        Quay lại danh sách
      </button>

      <section className="panel apartment-detail-panel">
        <div className="apartment-detail-head">
          <div>
            <span className="detail-kicker">Chi tiết căn hộ</span>
            <h2>{apartment.code}</h2>
            <p>{projectName}</p>
          </div>
          {canManageApartments ? <button
            className="primary-button"
            type="button"
            onClick={() => {
              setForm(toForm(apartment));
              setFormOpen(true);
            }}
          >
            <Pencil size={16} />
            Sửa thông tin
          </button> : null}
        </div>

        <div className="apartment-detail-grid">
          <dl className="project-overview-list">
            <div>
              <dt>Trạng thái</dt>
              <dd>
                <StatusBadge value={apartment.status} />
              </dd>
            </div>
            <div>
              <dt>Dự án</dt>
              <dd>{projectName}</dd>
            </div>
            <div>
              <dt>Tầng</dt>
              <dd>{apartment.floor}</dd>
            </div>
            <div>
              <dt>Diện tích</dt>
              <dd>{Number(apartment.area).toLocaleString("vi-VN")} m2</dd>
            </div>
            <div>
              <dt>PN/WC</dt>
              <dd>
                {apartment.bedrooms}PN / {apartment.bathrooms}WC
              </dd>
            </div>
            <div>
              <dt>Hướng</dt>
              <dd>{formatDirection(apartment.direction)}</dd>
            </div>
            <div>
              <dt>Giá</dt>
              <dd>{formatCurrency(apartment.price)}</dd>
            </div>
            <div>
              <dt>Mệnh phong thủy</dt>
              <dd>{apartment.feng_shui_element ?? "Chưa có"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="panel apartment-media-panel">
        <div className="panel-header apartment-list-header">
          <div>
            <h2>Ảnh & video căn hộ</h2>
            <p>{mediaQuery.data?.length ?? 0} media đang gắn với căn hộ này</p>
          </div>
        </div>
        {canManageApartments ? <div className="apartment-media-upload detail-media-upload">
          <label>
            <ImagePlus size={16} />
            <span>Upload ảnh</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  uploadMediaMutation.mutate({ mediaType: "image", file });
                }
                event.currentTarget.value = "";
              }}
            />
          </label>
          <label>
            <PlayCircle size={16} />
            <span>Upload video</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  uploadMediaMutation.mutate({ mediaType: "video", file });
                }
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div> : null}
        <div className="apartment-media-grid detail-media-grid">
          {(mediaQuery.data ?? []).map((media) => (
            <figure key={media.id} className="apartment-media-item">
              <button className="media-preview-trigger" type="button" onClick={() => setPreviewMedia(media)}>
                {media.media_type === "image" ? <img src={media.url} alt={media.caption ?? "Ảnh căn hộ"} /> : <video src={media.url} muted preload="metadata" />}
              </button>
              <figcaption>
                <strong>{media.caption || (media.media_type === "image" ? "Ảnh căn hộ" : "Video căn hộ")}</strong>
                <span>{media.media_type === "image" ? "Ảnh" : "Video"}</span>
                {canManageApartments ? <div className="apartment-media-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setCaptionMedia(media);
                      setCaptionDraft(media.caption ?? "");
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    className="danger-text-button"
                    type="button"
                    onClick={() => {
                      if (window.confirm("Xóa media này khỏi căn hộ?")) {
                        deleteMediaMutation.mutate(media.id);
                      }
                    }}
                  >
                    <Trash2 size={13} />
                    Xóa
                  </button>
                </div> : null}
              </figcaption>
            </figure>
          ))}
        </div>
        {mediaQuery.isLoading ? <div className="empty-state">Đang tải media...</div> : null}
        {!mediaQuery.isLoading && !(mediaQuery.data ?? []).length ? <div className="empty-state">Chưa có ảnh hoặc video cho căn hộ này.</div> : null}
      </section>

      {formOpen && canManageApartments ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setFormOpen(false)}>
          <section className="modal-panel apartment-form-modal" role="dialog" aria-modal="true" aria-labelledby="apartment-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="apartment-form-title">Sửa căn hộ</h2>
                <p>Cập nhật thông tin vận hành và bán hàng.</p>
              </div>
              <button className="icon-button" type="button" aria-label="Đóng form" onClick={() => setFormOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form className="project-form" onSubmit={handleSubmit}>
              <SelectMenu label="Dự án" value={form.project_id} options={projectOptions} onChange={(value) => setForm((current) => ({ ...current, project_id: value }))} />
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
                <SelectMenu label="Hướng" value={form.direction} options={directionOptions} onChange={(value) => setForm((current) => ({ ...current, direction: value }))} />
                <SelectMenu label="Trạng thái" value={form.status} options={statusOptions} onChange={(value) => setForm((current) => ({ ...current, status: value as Apartment["status"] }))} />
              </div>
              <label>
                <span>Mệnh phong thủy</span>
                <input value={form.feng_shui_element ?? ""} onChange={(event) => setForm((current) => ({ ...current, feng_shui_element: event.target.value }))} placeholder="Kim, Mộc, Thủy, Hỏa, Thổ" />
              </label>
              <SelectMenu label="Nhân viên tư vấn phụ trách" value={form.consultant_id ?? ""} options={consultantOptions} onChange={(value) => setForm((current) => ({ ...current, consultant_id: value || null }))} />
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

      {captionMedia && canManageApartments ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setCaptionMedia(null)}>
          <section className="modal-panel media-caption-modal" role="dialog" aria-modal="true" aria-labelledby="media-caption-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="media-caption-title">Sửa caption media</h2>
                <p>{captionMedia.media_type === "image" ? "Cập nhật mô tả ảnh căn hộ." : "Cập nhật mô tả video căn hộ."}</p>
              </div>
              <button className="icon-button" type="button" aria-label="Đóng form" onClick={() => setCaptionMedia(null)}>
                <X size={18} />
              </button>
            </div>
            <form
              className="project-form"
              onSubmit={(event) => {
                event.preventDefault();
                updateMediaMutation.mutate({ mediaId: captionMedia.id, caption: captionDraft.trim() || null });
                setCaptionMedia(null);
              }}
            >
              <label>
                <span>Caption</span>
                <input value={captionDraft} onChange={(event) => setCaptionDraft(event.target.value)} autoFocus />
              </label>
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={() => setCaptionMedia(null)}>
                  Hủy
                </button>
                <button className="primary-button" type="submit" disabled={updateMediaMutation.isPending}>
                  {updateMediaMutation.isPending ? "Đang lưu..." : "Lưu caption"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {previewMedia ? (
        <div className="media-lightbox" role="presentation" onMouseDown={() => setPreviewMedia(null)}>
          <section className="media-lightbox-panel" role="dialog" aria-modal="true" aria-label="Xem media căn hộ" onMouseDown={(event) => event.stopPropagation()}>
            <div className="media-lightbox-head">
              <div>
                <strong>{previewMedia.caption || (previewMedia.media_type === "image" ? "Ảnh căn hộ" : "Video căn hộ")}</strong>
                <span>{previewMedia.media_type === "image" ? "Ảnh" : "Video"}</span>
              </div>
              <button className="icon-button" type="button" aria-label="Đóng xem media" onClick={() => setPreviewMedia(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="media-lightbox-body">
              {previewMedia.media_type === "image" ? <img src={previewMedia.url} alt={previewMedia.caption ?? "Ảnh căn hộ"} /> : <video src={previewMedia.url} controls autoPlay />}
            </div>
          </section>
        </div>
      ) : null}

      {toast ? <div className="toast-message">{toast}</div> : null}
    </section>
  );
}
