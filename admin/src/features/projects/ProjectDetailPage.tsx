import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImagePlus, Layers3, MapPin, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { SelectMenu } from "@/components/SelectMenu";
import { StatusBadge } from "@/components/StatusBadge";
import { ProjectFormModal } from "@/features/projects/ProjectFormModal";
import {
  assignAmenity,
  createFloorPlan,
  deleteFloorPlan,
  deleteProjectImage,
  deleteProject,
  getProjectDetail,
  listAmenities,
  listProjectApartments,
  unassignAmenity,
  updateProject,
  updateProjectImage,
  uploadProjectImages,
} from "@/features/projects/projectsApi";
import type { Project } from "@/services/types";

type DetailTab = "overview" | "images" | "floorPlans" | "amenities" | "apartments";

function formatCurrency(value: number): string {
  return `${value.toLocaleString("vi-VN")} VND`;
}

function projectStatusValue(status: Project["status"]): string {
  return status === "active" ? "active_project" : status;
}

export function ProjectDetailPage(): JSX.Element {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [formOpen, setFormOpen] = useState(false);
  const [floorForm, setFloorForm] = useState({ floor_number: 1, image_url: "", description: "" });
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
      showToast("Đã xóa mềm dự án.");
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

  const createFloorPlanMutation = useMutation({
    mutationFn: () =>
      project
        ? createFloorPlan(project.id, {
            floor_number: floorForm.floor_number,
            image_url: floorForm.image_url,
            description: floorForm.description || null,
          })
        : Promise.reject(new Error("Chưa chọn dự án")),
    onSuccess: () => {
      setFloorForm({ floor_number: 1, image_url: "", description: "" });
      showToast("Đã thêm mặt bằng.");
      queryClient.invalidateQueries({ queryKey: ["project-detail", slug] });
    },
  });

  const deleteFloorPlanMutation = useMutation({
    mutationFn: deleteFloorPlan,
    onSuccess: () => {
      showToast("Đã xóa mặt bằng.");
      queryClient.invalidateQueries({ queryKey: ["project-detail", slug] });
    },
  });

  const assignAmenityMutation = useMutation({
    mutationFn: (amenityId: string) => (project ? assignAmenity(project.id, amenityId) : Promise.reject(new Error("Chưa chọn dự án"))),
    onSuccess: () => {
      showToast("Đã thêm tiện ích.");
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
                if (window.confirm(`Xóa mềm dự án "${project.name}"? Dự án sẽ bị ẩn khỏi danh sách.`)) {
                  deleteProjectMutation.mutate(project);
                }
              }}
            >
              <Trash2 size={16} />
              Xóa mềm
            </button>
          </div>
        </div>

        <div className="tabs" role="tablist" aria-label="Chi tiết dự án">
          {[
            ["overview", "Thông tin chung"],
            ["images", "Ảnh/Gallery"],
            ["floorPlans", "Mặt bằng"],
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
              <div className="project-overview-description-row">
                <dt>Mô tả</dt>
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
                <figure key={image.id} className="project-image-card">
                  <img src={image.image_url} alt="Ảnh dự án" />
                  <figcaption>
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

        {activeTab === "floorPlans" ? (
          <div className="project-tab-stack">
            <div className="inline-form floor-plan-form">
              <input type="number" min={1} value={floorForm.floor_number} onChange={(event) => setFloorForm((current) => ({ ...current, floor_number: Number(event.target.value) }))} placeholder="Tầng" />
              <input value={floorForm.image_url} onChange={(event) => setFloorForm((current) => ({ ...current, image_url: event.target.value }))} placeholder="URL ảnh mặt bằng" />
              <input value={floorForm.description} onChange={(event) => setFloorForm((current) => ({ ...current, description: event.target.value }))} placeholder="Mô tả" />
              <button className="primary-button" type="button" disabled={!floorForm.image_url || createFloorPlanMutation.isPending} onClick={() => createFloorPlanMutation.mutate()}>
                <Layers3 size={16} />
                Thêm
              </button>
            </div>
            <div className="simple-list floor-plan-list">
              {(detail?.floor_plans ?? []).map((floor) => (
                <div key={floor.id}>
                  <span>Tầng {floor.floor_number}</span>
                  <strong>{floor.description ?? floor.image_url}</strong>
                  <a href={floor.image_url} target="_blank" rel="noreferrer">
                    Xem ảnh
                  </a>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Xóa mặt bằng"
                    onClick={() => {
                      if (window.confirm(`Xóa mặt bằng tầng ${floor.floor_number}?`)) {
                        deleteFloorPlanMutation.mutate(floor.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            {!detail?.floor_plans.length ? <div className="empty-state">Chưa có mặt bằng.</div> : null}
          </div>
        ) : null}

        {activeTab === "amenities" ? (
          <div className="amenity-grid">
            {(amenitiesQuery.data ?? []).map((amenity) => {
              const assigned = Boolean(detail?.amenities.some((item) => item.id === amenity.id));
              return (
                <button
                  key={amenity.id}
                  className={`amenity-chip ${assigned ? "assigned" : ""}`}
                  type="button"
                  onClick={() => {
                    if (assigned) {
                      unassignAmenityMutation.mutate(amenity.id);
                    } else {
                      assignAmenityMutation.mutate(amenity.id);
                    }
                  }}
                >
                  <strong>{amenity.name}</strong>
                  <span>{amenity.category === "internal" ? "Nội khu" : "Ngoại khu"}</span>
                </button>
              );
            })}
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

      <ProjectFormModal open={formOpen} project={project} onClose={() => setFormOpen(false)} onSaved={(_, message) => showToast(message)} />

      {toast ? <div className="toast-message">{toast}</div> : null}
    </section>
  );
}
