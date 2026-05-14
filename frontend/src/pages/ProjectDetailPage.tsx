import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Bath, BedDouble, Building2, Check, Compass, MapPin, Ruler, ShieldCheck, Sparkles } from "lucide-react";
import { ProjectCard } from "../features/projects/components/ProjectCard";
import { apartmentStatusLabel, formatPrice } from "../features/projects/utils/projectFormatters";
import type { Apartment, Project } from "../types/domain";

type ProjectDetailPageProps = {
  project: Project;
  projects: Project[];
  onBack: () => void;
  onContact: () => void;
  onOpenApartment: (project: Project, apartment: Apartment) => void;
  onOpenProject: (project: Project) => void;
};

export function ProjectDetailPage({ project, projects, onBack, onContact, onOpenApartment, onOpenProject }: ProjectDetailPageProps) {
  const relatedProjects = projects.filter((item) => item.id !== project.id).slice(0, 2);
  const availableApartments = project.apartments.filter((apartment) => apartment.status === "available").length;
  const areas = project.apartments.map((item) => item.area);
  const bedroomCounts = project.apartments.map((item) => item.bedrooms);
  const areaRange = areas.length ? `${Math.min(...areas)}-${Math.max(...areas)} m2` : "Đang cập nhật";
  const bedroomRange = bedroomCounts.length ? `${Math.min(...bedroomCounts)}-${Math.max(...bedroomCounts)} phòng ngủ` : "Đang cập nhật";
  const directionSummary = [...new Set(project.apartments.map((item) => item.direction))].join(", ") || "Đang cập nhật";
  const overviewText = project.description?.trim() || project.summary;
  const gallery = project.gallery;

  return (
    <main>
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="absolute inset-0 opacity-[0.08] luxury-grid" />
        {project.image && <img alt={project.name} className="absolute inset-0 h-full w-full object-cover opacity-35" src={project.image} />}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/82 to-brand-900/40" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1fr_390px] lg:px-8 lg:py-16">
          <div>
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-brand-100 transition hover:text-white" onClick={onBack} type="button">
              <ArrowLeft size={17} />
              Quay lại danh sách dự án
            </button>

            <div className="mt-10 max-w-3xl">
              <span className="inline-flex rounded bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300 ring-1 ring-white/15">
                {project.status}
              </span>
              <h1 className="font-display mt-5 text-5xl font-bold leading-tight md:text-6xl">{project.name}</h1>
              <p className="mt-5 flex items-start gap-2 text-base leading-7 text-brand-100">
                <MapPin className="mt-1 shrink-0 text-gold-300" size={19} />
                {project.location}
              </p>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-50">{project.summary}</p>
            </div>
          </div>

          <aside className="h-fit rounded bg-white p-5 text-slate-950 shadow-lift">
            <p className="text-sm font-semibold text-slate-500">Giá tham khảo từ</p>
            <p className="mt-2 text-3xl font-bold text-brand-900">{formatPrice(project.priceFrom)}</p>
            <div className="mt-5 grid gap-3">
              <ProjectMetric icon={<Building2 size={18} />} label="Khu vực" value={project.district} />
              <ProjectMetric icon={<ShieldCheck size={18} />} label="Trạng thái" value={project.status} />
              <ProjectMetric icon={<Sparkles size={18} />} label="Căn còn mở" value={`${availableApartments} căn`} />
            </div>
          </aside>
        </div>
      </section>

      <section className="section-wrap">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="grid gap-3 sm:grid-cols-3">
              {gallery.length > 0 ? (
                <>
                  <img alt={project.name} className="h-80 w-full rounded object-cover shadow-soft sm:col-span-2" src={gallery[0]} />
                  <div className="grid gap-3">
                    {gallery.slice(1, 3).map((image) => (
                      <img alt={project.name} className="h-[154px] w-full rounded object-cover shadow-soft" key={image} src={image} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid h-80 place-items-center rounded border border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-500 shadow-soft sm:col-span-3">
                  Chưa có ảnh dự án
                </div>
              )}
            </div>

            <div className="mt-8 rounded bg-white p-6 shadow-soft">
              <h2 className="font-display text-3xl font-bold text-brand-900">Tổng quan dự án</h2>
              <p className="mt-4 leading-8 text-slate-700">{overviewText}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <ProjectStat icon={<Ruler size={20} />} label="Diện tích căn" value={areaRange} />
                <ProjectStat icon={<BedDouble size={20} />} label="Cấu hình" value={bedroomRange} />
                <ProjectStat icon={<Compass size={20} />} label="Hướng căn hộ" value={directionSummary} />
              </div>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded bg-white p-6 shadow-soft">
              <h2 className="font-display text-2xl font-bold text-brand-900">Tiện ích nổi bật</h2>
              <div className="mt-5 grid gap-3">
                {project.amenities.map((amenity) => (
                  <div className="flex items-center gap-3 rounded border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700" key={amenity}>
                    <Check className="text-brand-900" size={17} />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded bg-brand-900 p-6 text-white shadow-lift">
              <h2 className="font-display text-2xl font-bold">Tư vấn chọn căn</h2>
              <p className="mt-3 text-sm leading-7 text-brand-100">
                Đội ngũ AMG Land hỗ trợ so sánh căn theo ngân sách, hướng nhà, tầng, phong thủy và tiến độ thanh toán.
              </p>
              <button className="mt-5 inline-flex h-11 items-center gap-2 rounded bg-gold-400 px-4 text-sm font-semibold text-brand-900 transition hover:-translate-y-0.5 hover:bg-gold-500" onClick={onContact} type="button">
                Nhận tư vấn riêng
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrap pt-0">
        <div className="section-heading">
          <h2>Danh sách căn hộ</h2>
          <p>Thông tin căn hộ mẫu để khách hàng tham khảo nhanh trước khi liên hệ tư vấn chi tiết.</p>
        </div>
        <div className="overflow-hidden rounded bg-white shadow-soft">
          <div className="hidden grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] bg-brand-900 px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-white md:grid">
            <span>Mã căn</span>
            <span>Diện tích</span>
            <span>Phòng</span>
            <span>Hướng</span>
            <span>Tình trạng</span>
          </div>
          {project.apartments.map((apartment) => (
            <button
              className="grid w-full gap-3 border-t border-slate-200 px-5 py-5 text-left text-sm transition hover:bg-brand-50/70 md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] md:items-center"
              key={apartment.id}
              onClick={() => onOpenApartment(project, apartment)}
              type="button"
            >
              <div>
                <div className="font-semibold text-slate-950">{apartment.code}</div>
                <div className="mt-1 text-xs text-slate-500">Tầng {apartment.floor}</div>
              </div>
              <span>{apartment.area} m2</span>
              <span className="inline-flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><BedDouble size={14} />{apartment.bedrooms}</span>
                <span className="inline-flex items-center gap-1"><Bath size={14} />{apartment.bathrooms}</span>
              </span>
              <span>{apartment.direction}</span>
              <span className={`w-fit rounded px-3 py-1 text-xs font-semibold ${
                apartment.status === "available"
                  ? "bg-emerald-50 text-emerald-700"
                  : apartment.status === "reserved"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-slate-100 text-slate-500"
              }`}>
                {apartmentStatusLabel[apartment.status]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="section-wrap pt-0">
        <div className="section-heading">
          <h2>Dự án liên quan</h2>
          <p>Một số lựa chọn khác có vị trí, ngân sách hoặc nhóm khách hàng tương đồng.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {relatedProjects.map((item) => (
            <ProjectCard key={item.id} project={item} onOpen={() => onOpenProject(item)} />
          ))}
        </div>
      </section>
    </main>
  );
}

function ProjectMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded bg-slate-50 px-4 py-3">
      <span className="grid h-9 w-9 place-items-center rounded bg-brand-900 text-white">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <span className="mt-1 block font-semibold text-slate-950">{value}</span>
      </span>
    </div>
  );
}

function ProjectStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 p-4">
      <span className="text-brand-900">{icon}</span>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
