import { Check, MapPin } from "lucide-react";
import type { Project } from "../../../types/domain";
import { formatPrice } from "../utils/projectFormatters";
import { ApartmentRow } from "./ApartmentRow";

type ProjectDetailProps = {
  project: Project;
  onContact: () => void;
};

export function ProjectDetail({ project, onContact }: ProjectDetailProps) {
  return (
    <section className="mt-14 scroll-mt-28" id="project-detail">
      <div className="grid gap-8 rounded bg-white p-5 shadow-soft lg:grid-cols-[1.1fr_0.9fr] lg:p-7">
        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            <img alt={project.name} className="h-72 w-full rounded object-cover sm:col-span-2" src={project.gallery[0]} />
            <div className="grid gap-3">
              {project.gallery.slice(1, 3).map((image) => (
                <img alt={project.name} className="h-[132px] w-full rounded object-cover" key={image} src={image} />
              ))}
            </div>
          </div>
          <h2 className="font-display mt-7 text-4xl font-bold leading-tight text-brand-900">{project.name}</h2>
          <p className="mt-3 flex items-start gap-2 text-slate-600">
            <MapPin className="mt-1 shrink-0 text-brand-900" size={18} />
            {project.location}
          </p>
          <p className="mt-4 leading-8 text-slate-600">{project.summary}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {project.amenities.map((amenity) => (
              <div className="flex items-center gap-3 rounded border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700" key={amenity}>
                <Check className="text-brand-900" size={17} />
                {amenity}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="rounded bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-500">Giá từ</span>
              <span className="text-2xl font-semibold text-gold-500">{formatPrice(project.priceFrom)}</span>
            </div>
            <button className="btn-primary mt-5 w-full justify-center" onClick={onContact} type="button">
              Đăng ký tư vấn
            </button>
          </div>
          <div className="mt-5 overflow-hidden rounded border border-slate-200">
            <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr] bg-brand-900 px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white">
              <span>Căn</span>
              <span>DT</span>
              <span>Hướng</span>
              <span>TT</span>
            </div>
            {project.apartments.map((apartment) => (
              <ApartmentRow apartment={apartment} key={apartment.id} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
