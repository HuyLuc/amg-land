import { useState } from "react";
import { projects } from "../assets/data/mockData";
import { Chatbot } from "../features/chat/components/Chatbot";
import { useProjectFilters } from "../features/projects/hooks/useProjectFilters";
import { ContactPage } from "../pages/ContactPage";
import { HomePage } from "../pages/HomePage";
import { NewsPage } from "../pages/NewsPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import type { Project } from "../types/domain";
import { AppLayout } from "../components/layout/AppLayout";
import type { Page } from "./types";

export function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);
  const [chatOpen, setChatOpen] = useState(false);

  const projectFilters = useProjectFilters(projects);

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setPage("projects");
    setTimeout(() => document.getElementById("project-detail")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <AppLayout currentPage={page} onNavigate={navigate}>
      {page === "home" && (
        <HomePage
          filters={projectFilters}
          onContact={() => navigate("contact")}
          onExploreProjects={() => navigate("projects")}
          onNavigateNews={() => navigate("news")}
          onOpenProject={openProject}
        />
      )}

      {page === "projects" && (
        <ProjectsPage
          filters={projectFilters}
          selectedProject={selectedProject}
          onContact={() => navigate("contact")}
          onSelectProject={setSelectedProject}
        />
      )}

      {page === "news" && <NewsPage />}
      {page === "contact" && <ContactPage />}

      <Chatbot open={chatOpen} onToggle={() => setChatOpen((current) => !current)} />
    </AppLayout>
  );
}

