import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { SelectMenu } from "@/components/SelectMenu";
import { createProject, updateProject, type ProjectPayload } from "@/features/projects/projectsApi";
import type { Project } from "@/services/types";

const projectStatusOptions = [
  { value: "draft", label: "Bản nháp" },
  { value: "active", label: "Đang mở" },
  { value: "closed", label: "Đã đóng" },
];

const initialForm: ProjectPayload = {
  name: "",
  description: "",
  location: "",
  district: "",
  city: "Hà Nội",
  price_from: 1000000000,
  status: "draft",
};

interface ProjectFormModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSaved: (project: Project, message: string) => void;
}

export function ProjectFormModal({ open, project, onClose, onSaved }: ProjectFormModalProps): JSX.Element | null {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProjectPayload>(initialForm);
  const mode = project ? "edit" : "create";

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(
      project
        ? {
            name: project.name,
            description: project.description ?? "",
            location: project.location,
            district: project.district,
            city: project.city,
            price_from: project.price_from,
            status: project.status,
          }
        : initialForm,
    );
  }, [open, project]);

  const saveMutation = useMutation({
    mutationFn: () => (project ? updateProject(project.id, form) : createProject(form)),
    onSuccess: (savedProject) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-detail"] });
      onSaved(savedProject, mode === "edit" ? "Đã cập nhật dự án." : "Đã tạo dự án mới.");
      onClose();
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    saveMutation.mutate();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-panel project-form-modal" role="dialog" aria-modal="true" aria-labelledby="project-form-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 id="project-form-title">{mode === "edit" ? "Sửa dự án" : "Tạo dự án"}</h2>
            <p>{mode === "edit" ? "Cập nhật thông tin vận hành và bán hàng." : "Tạo hồ sơ dự án mới."}</p>
          </div>
          <button className="icon-button" type="button" aria-label="Đóng form" onClick={onClose}>
            <XCircle size={18} />
          </button>
        </div>
        <form className="project-form" onSubmit={handleSubmit}>
          <label>
            <span>Tên dự án</span>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          </label>
          <label>
            <span>Mô tả</span>
            <textarea value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </label>
          <label>
            <span>Địa chỉ</span>
            <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} required />
          </label>
          <div className="form-grid-two">
            <label>
              <span>Quận/Khu vực</span>
              <input value={form.district} onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))} required />
            </label>
            <label>
              <span>Thành phố</span>
              <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} required />
            </label>
          </div>
          <div className="form-grid-two">
            <label>
              <span>Giá từ</span>
              <input type="number" min={1} value={form.price_from} onChange={(event) => setForm((current) => ({ ...current, price_from: Number(event.target.value) }))} required />
            </label>
            <SelectMenu label="Trạng thái" value={form.status} options={projectStatusOptions} onChange={(value) => setForm((current) => ({ ...current, status: value as Project["status"] }))} />
          </div>
          {saveMutation.error ? <div className="form-error">Không lưu được dự án. Vui lòng kiểm tra dữ liệu.</div> : null}
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              Hủy
            </button>
            <button className="primary-button" type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Đang lưu..." : "Lưu dự án"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
