import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Check, ChevronDown, Send } from "lucide-react";
import { TextInput } from "../../../components/ui/TextInput";
import { createContact } from "../api";
import type { ContactContext } from "../../../pages/ContactPage";
import { fetchProjectOptions, type ProjectOption } from "../../projects/api";
import type { AuthUser } from "../../auth/types";
import type { Project } from "../../../types/domain";

type ContactFormProps = {
  context?: ContactContext | null;
  projects?: Project[];
  user?: AuthUser | null;
};

export function ContactForm({ context, projects = [], user = null }: ContactFormProps) {
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone && user.phone !== "Chưa cập nhật" ? user.phone : "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectOptionsFromApi, setProjectOptionsFromApi] = useState<ProjectOption[]>([]);
  const [projectOptionsLoading, setProjectOptionsLoading] = useState(false);
  const projectMenuRef = useRef<HTMLDivElement | null>(null);

  const defaultMessage = useMemo(() => {
    if (context?.apartment && context.project) {
      return `Tôi quan tâm căn ${context.apartment.code.toUpperCase()} thuộc dự án ${context.project.name}.`;
    }
    if (context?.project) {
      return `Tôi quan tâm dự án ${context.project.name}.`;
    }
    return "";
  }, [context]);

  const availableProjects = projects.length > 0 ? projects : projectOptionsFromApi;
  const selectedProject = context?.project ?? availableProjects.find((project) => project.id === selectedProjectId) ?? null;
  const projectOptions = [{ id: "", name: "Chưa chọn dự án" }, ...availableProjects];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
        setProjectMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (context?.project || projects.length > 0) {
      return;
    }

    let mounted = true;
    setProjectOptionsLoading(true);

    fetchProjectOptions()
      .then((items) => {
        if (!mounted) return;
        setProjectOptionsFromApi(items);
      })
      .catch(() => {
        if (!mounted) return;
        setProjectOptionsFromApi([]);
      })
      .finally(() => {
        if (mounted) setProjectOptionsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [context?.project, projects.length]);

  useEffect(() => {
    if (!user) {
      return;
    }
    setFullName((current) => current || user.name || "");
    setPhone((current) => current || (user.phone && user.phone !== "Chưa cập nhật" ? user.phone : ""));
    setEmail((current) => current || user.email || "");
  }, [user]);

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      await createContact({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        project_id: selectedProject?.id ?? null,
        apartment_id: context?.apartment?.id ?? null,
        message: message.trim() || defaultMessage || null,
      });
      setFormSuccess("Đã gửi yêu cầu tư vấn. AMG Land sẽ liên hệ lại trong thời gian sớm nhất.");
      setFullName(user?.name ?? "");
      setPhone(user?.phone && user.phone !== "Chưa cập nhật" ? user.phone : "");
      setEmail(user?.email ?? "");
      setSelectedProjectId("");
      setMessage("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Không thể gửi yêu cầu tư vấn lúc này.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="rounded bg-white p-6 shadow-soft" onSubmit={submitContact}>
      {context?.project ? (
        <div className="mb-5 rounded border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          <p className="font-semibold">{context.apartment ? "Tư vấn căn hộ" : "Tư vấn dự án"}</p>
          <p className="mt-1">{context.project.name}{context.apartment ? ` - Căn ${context.apartment.code.toUpperCase()}` : ""}</p>
        </div>
      ) : null}

      {formError ? <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{formError}</div> : null}
      {formSuccess ? <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{formSuccess}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Họ tên" onChange={setFullName} placeholder="Nguyễn Văn A" required value={fullName} />
        <TextInput label="Số điện thoại" minLength={8} onChange={setPhone} placeholder="0942 319 933" required type="tel" value={phone} />
        <TextInput label="Email" onChange={setEmail} placeholder="email@example.com" type="email" value={email} />
        {context?.project ? (
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Dự án quan tâm</span>
            <input
              className="mt-2 h-12 w-full rounded border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-700 outline-none"
              readOnly
              value={`${context.project.name}${context.apartment ? ` - Căn ${context.apartment.code.toUpperCase()}` : ""}`}
            />
          </label>
        ) : (
          <div className="relative block" ref={projectMenuRef}>
            <span className="text-sm font-semibold text-slate-700">Dự án quan tâm</span>
            <button
              className={`mt-2 flex h-12 w-full items-center justify-between rounded border bg-slate-50 px-4 text-left text-sm outline-none transition ${
                projectMenuOpen ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200 hover:border-brand-300"
              }`}
              onClick={() => setProjectMenuOpen((current) => !current)}
              type="button"
            >
              <span className={selectedProject ? "font-semibold text-slate-900" : "text-slate-500"}>{selectedProject?.name ?? "Chưa chọn dự án"}</span>
              <ChevronDown className={`text-slate-500 transition ${projectMenuOpen ? "rotate-180" : ""}`} size={17} />
            </button>
            {projectMenuOpen ? (
              <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded border border-slate-200 bg-white p-1 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                {projectOptionsLoading ? <div className="px-3 py-2.5 text-sm font-semibold text-slate-500">Đang tải dự án...</div> : null}
                {!projectOptionsLoading && projectOptions.length === 1 ? <div className="px-3 py-2.5 text-sm font-semibold text-slate-500">Chưa có dự án đang mở bán.</div> : null}
                {projectOptions.map((project) => (
                  <button
                    className={`flex w-full items-center justify-between rounded px-3 py-2.5 text-left text-sm font-semibold transition ${
                      project.id === selectedProjectId ? "bg-brand-900 text-white" : "text-slate-700 hover:bg-brand-50 hover:text-brand-900"
                    }`}
                    key={project.id || "empty"}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setProjectMenuOpen(false);
                    }}
                    type="button"
                  >
                    <span>{project.name}</span>
                    {project.id === selectedProjectId ? <Check size={16} /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-semibold text-slate-700">Nhu cầu</span>
        <textarea
          className="mt-2 min-h-32 w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          onChange={(event) => setMessage(event.target.value)}
          placeholder={defaultMessage || "Ngân sách, khu vực, số phòng ngủ mong muốn..."}
          value={message}
        />
      </label>
      <button className="btn-primary mt-5 h-12 w-full px-6 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto" disabled={submitting} type="submit">
        {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
        <Send size={18} />
      </button>
    </form>
  );
}
