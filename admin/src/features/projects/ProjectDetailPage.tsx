import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, MapPin, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { SelectMenu } from "@/components/SelectMenu";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectFormModal } from "@/features/projects/ProjectFormModal";
import {
  assignAmenity,
  createAmenity,
  deleteAmenity,
  deleteProject,
  deleteProjectImage,
  getProjectDetail,
  listAmenities,
  listProjectApartments,
  unassignAmenity,
  updateAmenity,
  updateProject,
  updateProjectImage,
  uploadProjectImages,
  type AmenityPayload,
} from "@/features/projects/projectsApi";
import type { Amenity, Project, ProjectImage } from "@/services/types";

type DetailTab = "overview" | "images" | "amenities" | "apartments";

const amenityCategoryOptions = [
  { value: "internal", label: "Nội khu" },
  { value: "external", label: "Ngoại khu" },
  { value: "other", label: "Khác" },
];

const initialAmenityForm: AmenityPayload = {
  name: "",
  icon: "",
  category: "internal",
  description: "",
};

function formatCurrency(value: number): string {
  return `${value.toLocaleString("vi-VN")} VND`;
}

function projectStatusValue(status: Project["status"]): string {
  return status === "active" ? "active_project" : status;
}

function amenityCategoryLabel(category: Amenity["category"]): string {
  if (category === "internal") {
    return "Nội khu";
  }
  if (category === "external") {
    return "Ngoại khu";
  }
  return "Khác";
}

export function ProjectDetailPage(): JSX.Element {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [formOpen, setFormOpen] = useState(false);
  const [amenityFormOpen, setAmenityFormOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [amenityForm, setAmenityForm] = useState<AmenityPayload>(initialAmenityForm);
  const [previewImage, setPreviewImage] = useState<ProjectImage | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ["project-detail", slug],
    queryFn: () => getProjectDetail(slug),
    enabled: Boolean(slug),
  });

  const project = detailQuery.data?.project_detail ?? null;
  const amenitiesQuery = useQuery({ queryKey: ["amenities"], queryFn: listAmenities });

  const apartmentsQuery = useQuery({
    queryKey: ["project-apartments", project?.id],
    queryFn: () => listProjectApartments(project?.id ?? ""),
    enabled: Boolean(project?.id),
  });

  function showToast(message: string): void {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  const closeProjectMutation = useMutation({
    mutationFn: (target: Project) => updateProject(target.id, { status: "closed" }),
    onSuccess: () => {
      showToast("Đã đóng dự án.");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-detail", slug] });
    },
  });

  const reopenProjectMutation = useMutation({
    mutationFn: (target: Project) => updateProject(target.id, { status: "active" }),
    onSuccess: () => {
      showToast("Đã mở lại dự án.");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-detail", slug] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (target: Project) => deleteProject(target.id),
    onSuccess: () => {
      showToast("Đã xóa dự án.");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/projects");
    },
  });

  const uploadImagesMutation = useMutation({
    mutationFn: (files: FileList) => (project ? uploadProjectImages(project.id, files) : Promise.reject(new Error("Chưa chọn dự án"))),
    onSuccess: () => {
      showToast("Đã tải ảnh dự án.");
      queryClient.invalidateQueries({ queryKey: ["project-detail", slug] });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: ({ imageId, caption, isThumbnail }: { imageId: string; caption?: string | null; isThumbnail?: boolean }) =>
      updateProjectImage(imageId, { caption, is_thumbnail: isThumbnail }),
    onSuccess: () => {
      showToast("Đã cập nhật ảnh dự án.");
      queryClient.invalidateQueries({ queryKey: ["project-detail", slug] });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: deleteProjectImage,
    onSuccess: () => {
      showToast("Đã xóa ảnh dự án.");
      queryClient.invalidateQueries({ queryKey: ["project-detail", slug] });
    },
  });

  const saveAmenityMutation = useMutation({
    mutationFn: () => {
      const payload: AmenityPayload = {
        name: amenityForm.name.trim(),
        icon: amenityForm.icon?.trim() || null,
        category: amenityForm.category,
        description: amenityForm.description?.trim() || null,
      };
      return editingAmenity ? updateAmenity(editingAmenity.id, payload) : createAmenity(payload);
    },
    onSuccess: () => {
      showToast(editingAmenity ? "Đã cập nhật tiện ích." : "Đã thêm tiện ích.");
      setAmenityFormOpen(false);
      setEditingAmenity(null);
      setAmenityForm(initialAmenityForm);
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      queryClient.invalidateQueries({ queryKey: ["project-detail", slug] });
    },
  });

  const deleteAmenityMutation = useMutation({
    mutationFn: deleteAmenity,
    onSuccess: () => {
      showToast("Đã xóa tiện ích.");
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      queryClient.invalidateQueries({ queryKey: ["project-detail", slug] });
    },
  });

  const assignAmenityMutation = useMutation({
    mutationFn: (amenityId: string) => (project ? assignAmenity(project.id, amenityId) : Promise.reject(new Error("Chưa chọn dự án"))),
    onSuccess: () => {
      showToast("Đã thêm tiện ích vào dự án.");
      queryClient.invalidateQueries({ queryKey: ["project-detail", slug] });
    },
  });

  const unassignAmenityMutation = useMutation({
    mutationFn: (amenityId: string) => (project ? unassignAmenity(project.id, amenityId) : Promise.reject(new Error("Chưa chọn dự án"))),
    onSuccess: () => {
      showToast("Đã bỏ tiện ích khỏi dự án.");
      queryClient.invalidateQueries({ queryKey: ["project-detail", slug] });
    },
  });

  function openCreateAmenity(): void {
    setEditingAmenity(null);
    setAmenityForm(initialAmenityForm);
    setAmenityFormOpen(true);
  }

  function openEditAmenity(amenity: Amenity): void {
    setEditingAmenity(amenity);
    setAmenityForm({
      name: amenity.name,
      icon: amenity.icon ?? "",
      category: amenity.category,
      description: amenity.description ?? "",
    });
    setAmenityFormOpen(true);
  }

  if (detailQuery.isLoading) {
    return <div className="panel empty-state">Đang tải chi tiết dự án...</div>;
  }

  if (!project) {
    return <div className="panel empty-state">Không tìm thấy dự án.</div>;
  }

  const detail = detailQuery.data;
  const apartments = apartmentsQuery.data?.items ?? [];

  return (
    <section className="page-stack projects-page">
      <button className="secondary-button back-button" type="button" onClick={() => navigate("/projects")}>
        <ArrowLeft size={16} />
        Quay lại danh sách
      </button>

      <section className="panel project-detail-panel">
        <div className="project-detail-head">
          <div>
            <span className="detail-kicker">Chi tiết dự án</span>
            <h2>{project.name}</h2>
            <p>
              <MapPin size={15} />
              {project.location}
            </p>
          </div>
          <div className="project-actions">
            <button className="secondary-button" type="button" onClick={() => setFormOpen(true)}>
              <Pencil size={16} />
              Sửa thông tin
            </button>
            <button
              className="secondary-button"
              type="button"
              disabled={closeProjectMutation.isPending || reopenProjectMutation.isPending}
              onClick={() => {
                if (project.status === "closed") {
                  if (window.confirm(`Mở lại dự án "${project.name}"? Dự án sẽ chuyển sang trạng thái đang mở.`)) {
                    reopenProjectMutation.mutate(project);
                  }
                  return;
                }

                if (window.confirm(`Đóng dự án "${project.name}"? Dự án sẽ chuyển sang trạng thái đã đóng.`)) {
                  closeProjectMutation.mutate(project);
                }
              }}
            >
              {project.status === "closed" ? "Mở lại dự án" : "Đóng dự án"}
            </button>
            <button
              className="danger-button"
              type="button"
              disabled={deleteProjectMutation.isPending}
              onClick={() => {
                if (window.confirm(`Xóa dự án "${project.name}"? Dự án sẽ bị ẩn khỏi danh sách.`)) {
                  deleteProjectMutation.mutate(project);
                }
              }}
            >
              <Trash2 size={16} />
              Xóa
            </button>
          </div>
        </div>

        <div className="tabs" role="tablist" aria-label="Chi tiết dự án">
          {[
            ["overview", "Thông tin chung"],
            ["images", "Ảnh/Gallery"],
            ["amenities", "Tiện ích"],
            ["apartments", "Căn hộ"],
          ].map(([tab, label]) => (
            <button key={tab} className={activeTab === tab ? "active" : ""} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab as DetailTab)}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <div className="project-overview">
            <dl className="project-overview-list">
              <div>
                <dt>Trạng thái</dt>
                <dd>
                  <StatusBadge value={projectStatusValue(project.status)} />
                </dd>
              </div>
              <div>
                <dt>Khu vực</dt>
                <dd>
                  {project.district}, {project.city}
                </dd>
              </div>
              <div>
                <dt>Giá từ</dt>
                <dd>{formatCurrency(project.price_from)}</dd>
              </div>
              <div>
                <dt>Slug</dt>
                <dd>{project.slug}</dd>
              </div>
              <div>
                <dt>Gallery</dt>
                <dd>{detail?.images.length ?? 0} ảnh</dd>
              </div>
              <div>
                <dt>Căn hộ</dt>
                <dd>{apartmentsQuery.data?.total ?? apartments.length} căn</dd>
              </div>
              <div className="project-overview-text-row">
                <dt>Mô tả ngắn</dt>
                <dd>
                  <p>{project.short_description ?? "Chưa có mô tả ngắn."}</p>
                </dd>
              </div>
              <div className="project-overview-text-row">
                <dt>Mô tả chi tiết</dt>
                <dd>
                  <p>{project.description ?? "Chưa có mô tả."}</p>
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        {activeTab === "images" ? (
          <div className="project-tab-stack">
            <label className="upload-dropzone">
              <ImagePlus size={22} />
              <strong>Tải ảnh dự án hoặc gallery</strong>
              <span>Hỗ trợ JPG, PNG, WEBP. Ảnh đầu tiên trong lượt tải sẽ được đánh dấu đại diện.</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => event.target.files && uploadImagesMutation.mutate(event.target.files)} />
            </label>
            <div className="image-grid">
              {(detail?.images ?? []).map((image) => (
                <figure key={image.id} className="project-image-card" onClick={() => setPreviewImage(image)}>
                  <img src={image.image_url} alt="Ảnh dự án" />
                  <figcaption onClick={(event) => event.stopPropagation()}>
                    <div>
                      <strong>{image.caption || (image.is_thumbnail ? "Ảnh đại diện" : "Gallery")}</strong>
                      <span>{image.is_thumbnail ? "Đang là ảnh đại diện" : "Ảnh gallery"}</span>
                    </div>
                    <div className="image-card-actions">
                      <button
                        type="button"
                        onClick={() => {
                          const caption = window.prompt("Nhập tên/caption cho ảnh", image.caption ?? "");
                          if (caption !== null) {
                            updateImageMutation.mutate({ imageId: image.id, caption: caption.trim() || null });
                          }
                        }}
                      >
                        Sửa
                      </button>
                      {!image.is_thumbnail ? (
                        <button type="button" onClick={() => updateImageMutation.mutate({ imageId: image.id, isThumbnail: true })}>
                          Đặt đại diện
                        </button>
                      ) : null}
                      <button
                        className="danger-text-button"
                        type="button"
                        onClick={() => {
                          if (window.confirm("Xóa ảnh này khỏi dự án? File trong MinIO cũng sẽ được xóa nếu thuộc bucket hiện tại.")) {
                            deleteImageMutation.mutate(image.id);
                          }
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
            {!detail?.images.length ? <div className="empty-state">Chưa có ảnh dự án.</div> : null}
          </div>
        ) : null}

        {activeTab === "amenities" ? (
          <div className="project-tab-stack">
            <div className="amenity-toolbar">
              <button className="primary-button" type="button" onClick={openCreateAmenity}>
                Thêm tiện ích
              </button>
            </div>
            <div className="table-wrap amenity-table-wrap">
              <table className="amenity-table">
                <thead>
                  <tr>
                    <th>Tiện ích</th>
                    <th>Loại</th>
                    <th>Ghi chú</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(amenitiesQuery.data ?? []).map((amenity) => {
                    const assigned = Boolean(detail?.amenities.some((item) => item.id === amenity.id));
                    return (
                      <tr key={amenity.id} className={assigned ? "selected-row" : ""}>
                        <td>
                          <button
                            className="table-link-button"
                            type="button"
                            onClick={() => {
                              if (assigned) {
                                unassignAmenityMutation.mutate(amenity.id);
                              } else {
                                assignAmenityMutation.mutate(amenity.id);
                              }
                            }}
                          >
                            {amenity.name}
                          </button>
                        </td>
                        <td>{amenityCategoryLabel(amenity.category)}</td>
                        <td>{amenity.description ?? "Không có mô tả"}</td>
                        <td>
                          <div className="amenity-actions">
                            <button type="button" onClick={() => openEditAmenity(amenity)}>
                              Sửa
                            </button>
                            <button
                              className="danger-text-button"
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Xóa tiện ích "${amenity.name}"? Tiện ích này sẽ bị bỏ khỏi các dự án đang gán.`)) {
                                  deleteAmenityMutation.mutate(amenity.id);
                                }
                              }}
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {activeTab === "apartments" ? (
          <div className="table-wrap apartment-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã căn</th>
                  <th>Tầng</th>
                  <th>Diện tích</th>
                  <th>Phòng ngủ</th>
                  <th>Hướng</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {apartments.map((apartment) => (
                  <tr key={apartment.id}>
                    <td>
                      <strong>{apartment.code}</strong>
                    </td>
                    <td>{apartment.floor}</td>
                    <td>{apartment.area} m2</td>
                    <td>{apartment.bedrooms}</td>
                    <td>{apartment.direction}</td>
                    <td>{formatCurrency(apartment.price)}</td>
                    <td>
                      <StatusBadge value={apartment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {apartmentsQuery.isLoading ? <div className="empty-state">Đang tải căn hộ...</div> : null}
            {!apartmentsQuery.isLoading && !apartments.length ? <div className="empty-state">Dự án này chưa có căn hộ.</div> : null}
          </div>
        ) : null}
      </section>

      <ProjectFormModal
        open={formOpen}
        project={project}
        onClose={() => setFormOpen(false)}
        onSaved={(savedProject, message) => {
          showToast(message);
          if (savedProject.slug !== slug) {
            navigate(`/projects/${savedProject.slug}`, { replace: true });
          }
        }}
      />

      {amenityFormOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setAmenityFormOpen(false)}>
          <section className="modal-panel amenity-form-modal" role="dialog" aria-modal="true" aria-labelledby="amenity-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="amenity-form-title">{editingAmenity ? "Sửa tiện ích" : "Thêm tiện ích"}</h2>
                <p>Quản lý danh mục tiện ích dùng chung cho các dự án.</p>
              </div>
              <button className="icon-button" type="button" aria-label="Đóng form" onClick={() => setAmenityFormOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form
              className="project-form"
              onSubmit={(event) => {
                event.preventDefault();
                saveAmenityMutation.mutate();
              }}
            >
              <label>
                <span>Tên tiện ích</span>
                <input value={amenityForm.name} onChange={(event) => setAmenityForm((current) => ({ ...current, name: event.target.value }))} required />
              </label>
              <SelectMenu label="Loại tiện ích" value={amenityForm.category} options={amenityCategoryOptions} onChange={(value) => setAmenityForm((current) => ({ ...current, category: value as Amenity["category"] }))} />
              <label>
                <span>Mô tả</span>
                <textarea value={amenityForm.description ?? ""} onChange={(event) => setAmenityForm((current) => ({ ...current, description: event.target.value }))} />
              </label>
              {saveAmenityMutation.error ? <div className="form-error">Không lưu được tiện ích. Vui lòng kiểm tra dữ liệu.</div> : null}
              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={() => setAmenityFormOpen(false)}>
                  Hủy
                </button>
                <button className="primary-button" type="submit" disabled={saveAmenityMutation.isPending}>
                  {saveAmenityMutation.isPending ? "Đang lưu..." : "Lưu tiện ích"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {previewImage ? (
        <div className="image-lightbox-backdrop" role="presentation" onMouseDown={() => setPreviewImage(null)}>
          <section className="image-lightbox" role="dialog" aria-modal="true" aria-label="Xem ảnh dự án" onMouseDown={(event) => event.stopPropagation()}>
            <div className="image-lightbox-header">
              <strong>{previewImage.caption || "Ảnh dự án"}</strong>
              <button className="icon-button" type="button" aria-label="Đóng ảnh" onClick={() => setPreviewImage(null)}>
                <X size={18} />
              </button>
            </div>
            <img src={previewImage.image_url} alt={previewImage.caption || "Ảnh dự án"} />
          </section>
        </div>
      ) : null}

      {toast ? <div className="toast-message">{toast}</div> : null}
    </section>
  );
}
