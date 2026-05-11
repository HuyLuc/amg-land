import { ArrowRight, MapPin } from "lucide-react";
import type { Project } from "../../../types/domain";
import { formatPrice } from "../utils/projectFormatters";

type ProjectCardProps = {
  project: Project;
  onOpen: () => void;
};

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <article className="group overflow-hidden rounded bg-white shadow-soft">
      <div className="aspect-[4/3] overflow-hidden">
        <img alt={project.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={project.image} />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-900">{project.status}</span>
          <span className="text-sm font-semibold text-gold-500">Từ {formatPrice(project.priceFrom)}</span>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-950">{project.name}</h3>
        <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-600">
          <MapPin className="mt-1 shrink-0 text-brand-900" size={16} />
          {project.location}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{project.summary}</p>
        <button className="mt-5 flex items-center gap-2 text-sm font-semibold text-brand-900" onClick={onOpen} type="button">
          Xem chi tiết
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}

