import { useEffect, useState } from "react";
import { Chatbot } from "../features/chat/components/Chatbot";
import type { AuthUser } from "../features/auth/types";
import { fetchProjects } from "../features/projects/api";
import { useProjectFilters } from "../features/projects/hooks/useProjectFilters";
import { AboutPage } from "../pages/AboutPage";
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

const AUTH_STORAGE_KEY = "amg_customer_auth";
const pageByHash: Record<string, Page> = {
  home: "home",
  about: "about",
  projects: "projects",
  news: "news",
  community: "community",
  contact: "contact",
  login: "login",
  register: "register",
  profile: "profile",
};

function readStoredUser() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function readInitialPage(): Page {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return pageByHash[hash] ?? "home";
}

export function App() {
  const [page, setPage] = useState<Page>(() => readInitialPage());
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [chatOpen, setChatOpen] = useState(false);

  const projectFilters = useProjectFilters(projects);

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    if (nextPage !== "projectDetail") {
      window.history.replaceState(null, "", `#/${nextPage}`);
    }
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setPage("projectDetail");
  };

  const completeAuth = (nextUser: AuthUser) => {
    setUser(nextUser);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    navigate("profile");
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    navigate("home");
  };

  useEffect(() => {
    let mounted = true;

    fetchProjects()
      .then((items) => {
        if (!mounted) {
          return;
        }
        setProjects(items);
        setSelectedProject((current) => current ?? items[0] ?? null);
        setProjectsError("");
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }
        setProjectsError(error instanceof Error ? error.message : "Không thể tải dữ liệu dự án.");
      })
      .finally(() => {
        if (mounted) {
          setProjectsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, selectedProject?.id]);

  return (
    <AppLayout currentPage={page} user={user} onLogout={logout} onNavigate={navigate}>
      <PageTransition key={page} page={page}>
        {page === "home" && (
          <HomePage
            filters={projectFilters}
            projects={projects}
            onContact={() => navigate("contact")}
            onExploreProjects={() => navigate("projects")}
            onNavigateNews={() => navigate("news")}
            onOpenProject={openProject}
          />
        )}

        {page === "projects" && (
          <ProjectsPage
            filters={projectFilters}
            loading={projectsLoading}
            error={projectsError}
            onOpenProject={openProject}
          />
        )}

        {page === "projectDetail" && selectedProject && (
          <ProjectDetailPage
            project={selectedProject}
            projects={projects}
            onBack={() => navigate("projects")}
            onContact={() => navigate("contact")}
            onOpenProject={openProject}
          />
        )}

        {page === "projectDetail" && !selectedProject && (
          <ProjectsPage filters={projectFilters} loading={projectsLoading} error={projectsError} onOpenProject={openProject} />
        )}

        {page === "about" && <AboutPage onContact={() => navigate("contact")} />}
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
