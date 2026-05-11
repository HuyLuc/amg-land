import { ContactBand } from "../components/sections/ContactBand";
import { FeaturedProjectsSection } from "../components/sections/FeaturedProjectsSection";
import { FengShuiSection } from "../components/sections/FengShuiSection";
import { HeroSection } from "../components/sections/HeroSection";
import { NewsPreviewSection } from "../components/sections/NewsPreviewSection";
import { QuickSearch } from "../features/projects/components/QuickSearch";
import type { ProjectFilters } from "../features/projects/hooks/useProjectFilters";
import type { Project } from "../types/domain";

type HomePageProps = {
  filters: ProjectFilters;
  onContact: () => void;
  onExploreProjects: () => void;
  onNavigateNews: () => void;
  onOpenProject: (project: Project) => void;
};

export function HomePage({ filters, onContact, onExploreProjects, onNavigateNews, onOpenProject }: HomePageProps) {
  return (
    <>
      <HeroSection onContact={onContact} onExplore={onExploreProjects} />
      <QuickSearch
        bedrooms={filters.bedrooms}
        budget={filters.budget}
        district={filters.district}
        districts={filters.districts}
        onBedroomsChange={filters.setBedrooms}
        onBudgetChange={filters.setBudget}
        onDistrictChange={filters.setDistrict}
        onSearch={onExploreProjects}
      />
      <FeaturedProjectsSection onOpenProject={onOpenProject} />
      <FengShuiSection onExplore={onExploreProjects} />
      <NewsPreviewSection onNavigateNews={onNavigateNews} />
      <ContactBand onContact={onContact} />
    </>
  );
}

