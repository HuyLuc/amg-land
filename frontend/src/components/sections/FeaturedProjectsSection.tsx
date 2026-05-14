import { ProjectCard } from "../../features/projects/components/ProjectCard";
import type { Project } from "../../types/domain";

type FeaturedProjectsSectionProps = {
  projects: Project[];
  onOpenProject: (project: Project) => void;
};

export function FeaturedProjectsSection({ projects, onOpenProject }: FeaturedProjectsSectionProps) {
  return (
    <section className="section-wrap">
      <div className="section-heading">
        <h2>Dự án nổi bật</h2>
        <p>Danh sách dự án đang được AMG Land phân phối và cập nhật thông tin mới nhất.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {projects.slice(0, 3).map((project) => (
          <ProjectCard key={project.id} project={project} onOpen={() => onOpenProject(project)} />
        ))}
      </div>
    </section>
  );
}
