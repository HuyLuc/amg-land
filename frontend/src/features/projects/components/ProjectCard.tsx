import { ArrowRight, Building2, MapPin } from "lucide-react";
import type { Project } from "../../../types/domain";
import { formatPrice } from "../utils/projectFormatters";

type ProjectCardProps = {
  project: Project;
  onOpen: () => void;
};

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <article className="surface-card group overflow-hidden rounded">
      <div className="image-sheen aspect-[4/3] overflow-hidden">
        {project.image ? (
          <img alt={project.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={project.image} />
        ) : (
          <div className="grid h-full place-items-center bg-slate-100 text-brand-900">
            <div className="text-center">
              <Building2 className="mx-auto" size={42} />
              <p className="mt-3 text-sm font-semibold">Chưa có ảnh dự án</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-900 ring-1 ring-brand-100">{project.status}</span>
          <span className="text-sm font-semibold text-gold-500">Từ {formatPrice(project.priceFrom)}</span>
        </div>
        <h3 className="font-display mt-4 text-2xl font-bold leading-7 text-slate-950">{project.name}</h3>
        <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-700">
          <MapPin className="mt-1 shrink-0 text-brand-900" size={16} />
          {project.location}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-700">{project.summary}</p>
        <button className="mt-5 flex items-center gap-2 text-sm font-semibold text-brand-900 transition group-hover:gap-3" onClick={onOpen} type="button">
          Xem chi tiết
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}
