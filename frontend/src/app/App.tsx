import { useState } from "react";
import { projects } from "../assets/data/mockData";
import { Chatbot } from "../features/chat/components/Chatbot";
import type { AuthUser } from "../features/auth/types";
import { useProjectFilters } from "../features/projects/hooks/useProjectFilters";
import { ContactPage } from "../pages/ContactPage";
import { CommunityPage } from "../pages/CommunityPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { NewsPage } from "../pages/NewsPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { RegisterPage } from "../pages/RegisterPage";
import type { Project } from "../types/domain";
import { AppLayout } from "../components/layout/AppLayout";
import { PageTransition } from "../components/layout/PageTransition";
import type { Page } from "./types";

export function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const projectFilters = useProjectFilters(projects);

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setPage("projectDetail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const completeAuth = (nextUser: AuthUser) => {
    setUser(nextUser);
    navigate("profile");
  };

  const logout = () => {
    setUser(null);
    navigate("home");
  };

  return (
    <AppLayout currentPage={page} user={user} onLogout={logout} onNavigate={navigate}>
      <PageTransition key={page} page={page}>
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
            onOpenProject={openProject}
          />
        )}

        {page === "projectDetail" && (
          <ProjectDetailPage
            project={selectedProject}
            onBack={() => navigate("projects")}
            onContact={() => navigate("contact")}
            onOpenProject={openProject}
          />
        )}

        {page === "news" && <NewsPage />}
        {page === "community" && <CommunityPage />}
        {page === "contact" && <ContactPage />}
        {page === "login" && <LoginPage onLogin={completeAuth} onNavigate={navigate} />}
        {page === "register" && <RegisterPage onRegister={completeAuth} onNavigate={navigate} />}
        {page === "profile" && <ProfilePage user={user} onLogout={logout} onNavigate={navigate} />}
      </PageTransition>

      <Chatbot open={chatOpen} onToggle={() => setChatOpen((current) => !current)} />
    </AppLayout>
  );
}
