import { Home, MapPin, SlidersHorizontal } from "lucide-react";
import { SelectField } from "../components/ui/SelectField";
import { ProjectCard } from "../features/projects/components/ProjectCard";
import type { ProjectFilters } from "../features/projects/hooks/useProjectFilters";
import { bedroomOptions, budgetOptions } from "../features/projects/utils/projectFormatters";
import type { Project } from "../types/domain";

type ProjectsPageProps = {
  filters: ProjectFilters;
  onOpenProject: (project: Project) => void;
};

export function ProjectsPage({ filters, onOpenProject }: ProjectsPageProps) {
  return (
    <section className="section-wrap">
      <div className="section-heading">
        <h1>Danh sách dự án</h1>
        <p>Lọc nhanh theo khu vực, ngân sách và số phòng ngủ để tìm căn hộ phù hợp.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
        <aside className="h-fit rounded bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-lg font-semibold text-brand-900">
            <SlidersHorizontal size={20} />
            Bộ lọc
          </div>
          <div className="mt-5 grid gap-4">
            <SelectField icon={<MapPin size={18} />} label="Khu vực" onChange={filters.setDistrict} options={filters.districts} value={filters.district} />
            <SelectField icon={<SlidersHorizontal size={18} />} label="Ngân sách" onChange={filters.setBudget} options={budgetOptions} value={filters.budget} />
            <SelectField icon={<Home size={18} />} label="Số phòng" onChange={filters.setBedrooms} options={bedroomOptions} value={filters.bedrooms} />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-600">{filters.filteredProjects.length} dự án phù hợp</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {filters.filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={() => onOpenProject(project)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
