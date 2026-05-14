import { useEffect, useState } from "react";
import { Chatbot } from "../features/chat/components/Chatbot";
import type { AuthUser } from "../features/auth/types";
import { fetchProjects } from "../features/projects/api";
import { fetchPost } from "../features/posts/api";
import { useProjectFilters } from "../features/projects/hooks/useProjectFilters";
import { AboutPage } from "../pages/AboutPage";
import { ApartmentDetailPage } from "../pages/ApartmentDetailPage";
import { ContactPage } from "../pages/ContactPage";
import type { ContactContext } from "../pages/ContactPage";
import { CommunityPage } from "../pages/CommunityPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { NewsPage } from "../pages/NewsPage";
import { NewsDetailPage } from "../pages/NewsDetailPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { RegisterPage } from "../pages/RegisterPage";
import type { Apartment, Post, Project } from "../types/domain";
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
  if (/^projects\/[^/]+\/apartments\/[^/]+$/.test(hash)) {
    return "apartmentDetail";
  }
  if (hash.startsWith("projects/")) {
    return "projectDetail";
  }
  if (hash.startsWith("news/")) {
    return "newsDetail";
  }
  return pageByHash[hash] ?? "home";
}

function readProjectSlugFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const match = hash.match(/^projects\/([^/]+)/);
  return match?.[1] ?? null;
}

function readApartmentIdFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const match = hash.match(/^projects\/[^/]+\/apartments\/([^/]+)$/);
  return match?.[1] ?? null;
}

function readPostSlugFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const match = hash.match(/^news\/([^/]+)$/);
  return match?.[1] ?? null;
}

function pageToHash(nextPage: Page) {
  return nextPage === "projectDetail" || nextPage === "apartmentDetail" || nextPage === "newsDetail" ? null : `#/${nextPage}`;
}

export function App() {
  const [page, setPage] = useState<Page>(() => readInitialPage());
  const [routeProjectSlug, setRouteProjectSlug] = useState<string | null>(() => readProjectSlugFromHash());
  const [routeApartmentId, setRouteApartmentId] = useState<string | null>(() => readApartmentIdFromHash());
  const [routePostSlug, setRoutePostSlug] = useState<string | null>(() => readPostSlugFromHash());
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [contactContext, setContactContext] = useState<ContactContext | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState("");
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [chatOpen, setChatOpen] = useState(false);

  const projectFilters = useProjectFilters(projects);

  const navigate = (nextPage: Page, keepContactContext = false) => {
    if (!keepContactContext) {
      setContactContext(null);
    }
    setPage(nextPage);
    setRouteProjectSlug(null);
    setRouteApartmentId(null);
    setRoutePostSlug(null);
    const nextHash = pageToHash(nextPage);
    if (nextHash && window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }
  };

  const openPost = (post: Post) => {
    if (!post.slug) return;
    setSelectedPost(post);
    setRoutePostSlug(post.slug);
    setPage("newsDetail");
    const nextHash = `#/news/${post.slug}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }
  };

  const openContact = (context: ContactContext | null = null) => {
    setContactContext(context);
    navigate("contact", true);
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setSelectedApartment(null);
    setRouteProjectSlug(project.slug);
    setRouteApartmentId(null);
    setPage("projectDetail");
    const nextHash = `#/projects/${project.slug}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }
  };

  const openApartment = (project: Project, apartment: Apartment) => {
    setSelectedProject(project);
    setSelectedApartment(apartment);
    setRouteProjectSlug(project.slug);
    setRouteApartmentId(apartment.id);
    setPage("apartmentDetail");
    const nextHash = `#/projects/${project.slug}/apartments/${apartment.id}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }
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
    const handlePopState = () => {
      setPage(readInitialPage());
      setRouteProjectSlug(readProjectSlugFromHash());
      setRouteApartmentId(readApartmentIdFromHash());
      setRoutePostSlug(readPostSlugFromHash());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (page !== "projectDetail" && page !== "apartmentDetail") {
      return;
    }

    if (!routeProjectSlug) {
      setPage("projects");
      return;
    }

    const project = projects.find((item) => item.slug === routeProjectSlug);
    if (project) {
      setSelectedProject(project);
      if (page === "apartmentDetail") {
        const apartment = project.apartments.find((item) => item.id === routeApartmentId);
        setSelectedApartment(apartment ?? null);
        if (!apartment && !projectsLoading) {
          setPage("projectDetail");
          setRouteApartmentId(null);
          window.history.replaceState(null, "", `#/projects/${project.slug}`);
        }
      }
      return;
    }

    if (!projectsLoading && projects.length > 0) {
      setSelectedProject(null);
      setPage("projects");
      setRouteProjectSlug(null);
      window.history.replaceState(null, "", "#/projects");
    }
  }, [page, projects, projectsLoading, routeApartmentId, routeProjectSlug]);

  useEffect(() => {
    if (page !== "newsDetail") {
      return;
    }

    if (!routePostSlug) {
      setPage("news");
      return;
    }

    if (selectedPost?.slug === routePostSlug && selectedPost.content !== undefined) {
      return;
    }

    let mounted = true;
    setPostLoading(true);
    setPostError("");

    fetchPost(routePostSlug)
      .then((post) => {
        if (!mounted) return;
        setSelectedPost(post);
      })
      .catch((error) => {
        if (!mounted) return;
        setPostError(error instanceof Error ? error.message : "Không thể tải chi tiết tin tức.");
      })
      .finally(() => {
        if (mounted) setPostLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [page, routePostSlug, selectedPost?.content, selectedPost?.slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, selectedApartment?.id, selectedProject?.id]);

  return (
    <AppLayout currentPage={page} user={user} onLogout={logout} onNavigate={navigate}>
      <PageTransition key={page} page={page}>
        {page === "home" && (
          <HomePage
            filters={projectFilters}
            projects={projects}
            onContact={() => openContact()}
            onExploreProjects={() => navigate("projects")}
            onNavigateNews={() => navigate("news")}
            onOpenPost={openPost}
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
            onContact={() => openContact({ project: selectedProject, apartment: null })}
            onOpenApartment={openApartment}
            onOpenProject={openProject}
          />
        )}

        {page === "projectDetail" && !selectedProject && (
          <ProjectsPage filters={projectFilters} loading={projectsLoading} error={projectsError} onOpenProject={openProject} />
        )}

        {page === "apartmentDetail" && selectedProject && selectedApartment && (
          <ApartmentDetailPage
            project={selectedProject}
            apartment={selectedApartment}
            onBack={() => openProject(selectedProject)}
            onContact={() => openContact({ project: selectedProject, apartment: selectedApartment })}
          />
        )}

        {page === "apartmentDetail" && (!selectedProject || !selectedApartment) && (
          <ProjectsPage filters={projectFilters} loading={projectsLoading} error={projectsError} onOpenProject={openProject} />
        )}

        {page === "about" && <AboutPage onContact={() => openContact()} />}
        {page === "news" && <NewsPage onOpenPost={openPost} />}
        {page === "newsDetail" && selectedPost && <NewsDetailPage post={selectedPost} onBack={() => navigate("news")} />}
        {page === "newsDetail" && !selectedPost && (
          <section className="section-wrap">
            {postLoading ? <div className="surface-card rounded p-6 text-center text-slate-600">Đang tải chi tiết tin tức...</div> : null}
            {postError ? <div className="rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{postError}</div> : null}
          </section>
        )}
        {page === "community" && <CommunityPage user={user} onNavigate={navigate} />}
        {page === "contact" && <ContactPage context={contactContext} projects={projects} />}
        {page === "login" && <LoginPage onLogin={completeAuth} onNavigate={navigate} />}
        {page === "register" && <RegisterPage onRegister={completeAuth} onNavigate={navigate} />}
        {page === "profile" && <ProfilePage user={user} onLogout={logout} onNavigate={navigate} />}
      </PageTransition>

      <Chatbot open={chatOpen} onToggle={() => setChatOpen((current) => !current)} />
    </AppLayout>
  );
}
