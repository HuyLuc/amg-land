import {
  ArrowRight,
  Bath,
  BedDouble,
  Bot,
  Building2,
  Check,
  ChevronDown,
  Home,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  SquareStack,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { posts, projects } from "./data/mockData";
import type { Apartment, Project } from "./types/domain";

type Page = "home" | "projects" | "news" | "contact";

const formatPrice = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(value % 1_000_000_000 === 0 ? 0 : 1)} ty`;
  }

  return `${Math.round(value / 1_000_000)} trieu`;
};

const statusLabel: Record<Apartment["status"], string> = {
  available: "Con trong",
  reserved: "Da dat",
  sold: "Da ban"
};

const navItems: { label: string; page: Page }[] = [
  { label: "Trang chu", page: "home" },
  { label: "Du an", page: "projects" },
  { label: "Tin tuc", page: "news" },
  { label: "Lien he", page: "contact" }
];

export function App() {
  const [page, setPage] = useState<Page>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [district, setDistrict] = useState("Tat ca");
  const [budget, setBudget] = useState("Tat ca");
  const [bedrooms, setBedrooms] = useState("Tat ca");
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);
  const [chatOpen, setChatOpen] = useState(false);

  const districts = useMemo(() => ["Tat ca", ...new Set(projects.map((project) => project.district))], []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const districtMatch = district === "Tat ca" || project.district === district;
      const budgetMatch =
        budget === "Tat ca" ||
        (budget === "Duoi 3 ty" && project.priceFrom < 3_000_000_000) ||
        (budget === "3 - 5 ty" && project.priceFrom >= 3_000_000_000 && project.priceFrom <= 5_000_000_000) ||
        (budget === "Tren 5 ty" && project.priceFrom > 5_000_000_000);
      const bedroomMatch =
        bedrooms === "Tat ca" ||
        project.apartments.some((apartment) => `${apartment.bedrooms} PN` === bedrooms);

      return districtMatch && budgetMatch && bedroomMatch;
    });
  }, [bedrooms, budget, district]);

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setPage("projects");
    setTimeout(() => document.getElementById("project-detail")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header page={page} onNavigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main>
        {page === "home" && (
          <>
            <Hero onExplore={() => navigate("projects")} onContact={() => navigate("contact")} />
            <QuickSearch
              districts={districts}
              district={district}
              budget={budget}
              bedrooms={bedrooms}
              onDistrictChange={setDistrict}
              onBudgetChange={setBudget}
              onBedroomsChange={setBedrooms}
              onSearch={() => navigate("projects")}
            />
            <FeaturedProjects onOpenProject={openProject} />
            <FengShuiSection onExplore={() => navigate("projects")} />
            <NewsPreview onNavigateNews={() => navigate("news")} />
            <ContactBand onContact={() => navigate("contact")} />
          </>
        )}

        {page === "projects" && (
          <ProjectsPage
            districts={districts}
            district={district}
            budget={budget}
            bedrooms={bedrooms}
            projects={filteredProjects}
            selectedProject={selectedProject}
            onDistrictChange={setDistrict}
            onBudgetChange={setBudget}
            onBedroomsChange={setBedrooms}
            onSelectProject={setSelectedProject}
            onContact={() => navigate("contact")}
          />
        )}

        {page === "news" && <NewsPage />}
        {page === "contact" && <ContactPage />}
      </main>

      <Footer onNavigate={navigate} />
      <Chatbot open={chatOpen} onToggle={() => setChatOpen((current) => !current)} />
    </div>
  );
}

function Header({
  page,
  onNavigate,
  mobileOpen,
  setMobileOpen
}: {
  page: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <button className="flex items-center gap-3" onClick={() => onNavigate("home")} type="button">
          <span className="grid h-11 w-11 place-items-center rounded bg-brand-900 text-white shadow-soft">
            <Building2 size={23} strokeWidth={1.9} />
          </span>
          <span className="text-left">
            <span className="block text-lg font-semibold leading-5 text-brand-900">AMG News</span>
            <span className="block text-xs font-medium text-slate-500">AMG Land</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              className={`rounded px-4 py-2 text-sm font-semibold transition ${
                page === item.page ? "bg-brand-50 text-brand-900" : "text-slate-600 hover:bg-slate-100"
              }`}
              key={item.page}
              onClick={() => onNavigate(item.page)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a className="text-sm font-semibold text-brand-900" href="tel:0900000000">
            0900 000 000
          </a>
          <button className="btn-primary" onClick={() => onNavigate("contact")} type="button">
            Dang ky tu van
          </button>
        </div>

        <button
          aria-label="Mo menu"
          className="grid h-11 w-11 place-items-center rounded border border-slate-200 text-brand-900 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-5 pb-5 md:hidden">
          <div className="grid gap-2 pt-4">
            {navItems.map((item) => (
              <button
                className={`rounded px-4 py-3 text-left text-sm font-semibold ${
                  page === item.page ? "bg-brand-50 text-brand-900" : "text-slate-700"
                }`}
                key={item.page}
                onClick={() => onNavigate(item.page)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function Hero({ onExplore, onContact }: { onExplore: () => void; onContact: () => void }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-brand-900 lg:block" />
      <div className="mx-auto grid min-h-[690px] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-normal text-brand-900 md:text-7xl">
            AMG News
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-8 text-slate-600">
            Nen tang thong tin bat dong san chinh thong cua AMG Land, ket noi khach hang voi du an va can ho phu hop.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button className="btn-primary h-12 px-6" onClick={onExplore} type="button">
              Xem du an
              <ArrowRight size={18} />
            </button>
            <button className="btn-secondary h-12 px-6" onClick={onContact} type="button">
              Dat lich tu van
            </button>
          </div>
        </div>

        <div className="relative z-10">
          <div className="hero-media">
            <img
              alt="Can ho cao cap AMG Land"
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1500&q=90"
            />
            <div className="absolute bottom-5 left-5 right-5 grid gap-3 rounded bg-white/94 p-4 shadow-soft backdrop-blur md:grid-cols-3">
              <Metric label="Du an" value="12+" />
              <Metric label="Can ho" value="480+" />
              <Metric label="Quan tam" value="2.4k" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold text-brand-900">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
    </div>
  );
}

function QuickSearch({
  districts,
  district,
  budget,
  bedrooms,
  onDistrictChange,
  onBudgetChange,
  onBedroomsChange,
  onSearch
}: {
  districts: string[];
  district: string;
  budget: string;
  bedrooms: string;
  onDistrictChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onBedroomsChange: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <section className="relative z-20 mx-auto -mt-10 max-w-7xl px-5 lg:px-8">
      <div className="grid gap-4 rounded bg-white p-4 shadow-soft md:grid-cols-[1fr_1fr_1fr_auto]">
        <SelectField icon={<MapPin size={18} />} label="Khu vuc" onChange={onDistrictChange} options={districts} value={district} />
        <SelectField
          icon={<SlidersHorizontal size={18} />}
          label="Ngan sach"
          onChange={onBudgetChange}
          options={["Tat ca", "Duoi 3 ty", "3 - 5 ty", "Tren 5 ty"]}
          value={budget}
        />
        <SelectField
          icon={<Home size={18} />}
          label="So phong"
          onChange={onBedroomsChange}
          options={["Tat ca", "2 PN", "3 PN"]}
          value={bedrooms}
        />
        <button className="btn-primary min-h-16 justify-center px-7" onClick={onSearch} type="button">
          <Search size={18} />
          Tim kiem
        </button>
      </div>
    </section>
  );
}

function SelectField({
  icon,
  label,
  options,
  value,
  onChange
}: {
  icon: React.ReactNode;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-h-16 items-center gap-3 rounded border border-slate-200 bg-slate-50 px-4">
      <span className="text-brand-900">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <select
          className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </span>
      <ChevronDown className="text-slate-400" size={17} />
    </label>
  );
}

function FeaturedProjects({ onOpenProject }: { onOpenProject: (project: Project) => void }) {
  return (
    <section className="section-wrap">
      <div className="section-heading">
        <h2>Du an noi bat</h2>
        <p>Danh sach du an dang duoc AMG Land phan phoi va cap nhat thong tin moi nhat.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onOpen={() => onOpenProject(project)} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <article className="group overflow-hidden rounded bg-white shadow-soft">
      <div className="aspect-[4/3] overflow-hidden">
        <img alt={project.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={project.image} />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-900">{project.status}</span>
          <span className="text-sm font-semibold text-gold-500">Tu {formatPrice(project.priceFrom)}</span>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-950">{project.name}</h3>
        <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-600">
          <MapPin className="mt-1 shrink-0 text-brand-900" size={16} />
          {project.location}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{project.summary}</p>
        <button className="mt-5 flex items-center gap-2 text-sm font-semibold text-brand-900" onClick={onOpen} type="button">
          Xem chi tiet
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}

function FengShuiSection({ onExplore }: { onExplore: () => void }) {
  return (
    <section className="bg-brand-900 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <h2 className="text-4xl font-semibold leading-tight md:text-5xl">Goi y can ho theo phong thuy</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-brand-100">
            Bo loc theo ngay sinh, ngan sach va huong nha giup khach hang rut ngan thoi gian chon can ho phu hop.
          </p>
          <button className="mt-8 inline-flex h-12 items-center gap-2 rounded bg-white px-6 text-sm font-semibold text-brand-900" onClick={onExplore} type="button">
            Thu bo loc
            <Sparkles size={18} />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Kim", "Tay, Tay Bac, Tay Nam"],
            ["Moc", "Dong, Dong Nam, Nam"],
            ["Thuy", "Bac, Dong, Dong Nam"],
            ["Hoa", "Nam, Dong, Dong Nam"]
          ].map(([element, directions]) => (
            <div className="rounded border border-white/15 bg-white/8 p-5 backdrop-blur" key={element}>
              <div className="text-2xl font-semibold">{element}</div>
              <div className="mt-3 text-sm leading-6 text-brand-100">{directions}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsPreview({ onNavigateNews }: { onNavigateNews: () => void }) {
  return (
    <section className="section-wrap">
      <div className="section-heading">
        <h2>Tin tuc moi</h2>
        <p>Cap nhat thi truong, kinh nghiem mua can ho va goc nhin phong thuy ung dung.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <NewsCard key={post.id} post={post} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <button className="btn-secondary" onClick={onNavigateNews} type="button">
          Xem tat ca tin tuc
        </button>
      </div>
    </section>
  );
}

function NewsCard({ post }: { post: (typeof posts)[number] }) {
  return (
    <article className="overflow-hidden rounded bg-white shadow-soft">
      <img alt={post.title} className="h-52 w-full object-cover" src={post.image} />
      <div className="p-5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          <span>{post.category}</span>
          <span>{post.date}</span>
        </div>
        <h3 className="mt-4 text-lg font-semibold leading-7 text-slate-950">{post.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
      </div>
    </article>
  );
}

function ContactBand({ onContact }: { onContact: () => void }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
      <div className="grid items-center gap-8 rounded bg-white p-8 shadow-soft md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-3xl font-semibold text-brand-900">Can tu van du an phu hop?</h2>
          <p className="mt-3 max-w-2xl text-slate-600">De lai thong tin, doi ngu AMG Land se lien he va gui bang hang phu hop nhu cau.</p>
        </div>
        <button className="btn-primary h-12 px-6" onClick={onContact} type="button">
          Gui thong tin
          <Send size={18} />
        </button>
      </div>
    </section>
  );
}

function ProjectsPage({
  districts,
  district,
  budget,
  bedrooms,
  projects: visibleProjects,
  selectedProject,
  onDistrictChange,
  onBudgetChange,
  onBedroomsChange,
  onSelectProject,
  onContact
}: {
  districts: string[];
  district: string;
  budget: string;
  bedrooms: string;
  projects: Project[];
  selectedProject: Project;
  onDistrictChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onBedroomsChange: (value: string) => void;
  onSelectProject: (project: Project) => void;
  onContact: () => void;
}) {
  return (
    <section className="section-wrap">
      <div className="section-heading">
        <h1>Danh sach du an</h1>
        <p>Loc nhanh theo khu vuc, ngan sach va so phong ngu de tim can ho phu hop.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
        <aside className="h-fit rounded bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-lg font-semibold text-brand-900">
            <SlidersHorizontal size={20} />
            Bo loc
          </div>
          <div className="mt-5 grid gap-4">
            <SelectField icon={<MapPin size={18} />} label="Khu vuc" onChange={onDistrictChange} options={districts} value={district} />
            <SelectField
              icon={<SlidersHorizontal size={18} />}
              label="Ngan sach"
              onChange={onBudgetChange}
              options={["Tat ca", "Duoi 3 ty", "3 - 5 ty", "Tren 5 ty"]}
              value={budget}
            />
            <SelectField
              icon={<Home size={18} />}
              label="So phong"
              onChange={onBedroomsChange}
              options={["Tat ca", "2 PN", "3 PN"]}
              value={bedrooms}
            />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-600">{visibleProjects.length} du an phu hop</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={() => onSelectProject(project)} />
            ))}
          </div>
        </div>
      </div>

      <ProjectDetail project={selectedProject} onContact={onContact} />
    </section>
  );
}

function ProjectDetail({ project, onContact }: { project: Project; onContact: () => void }) {
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
          <h2 className="mt-7 text-3xl font-semibold text-brand-900">{project.name}</h2>
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
              <span className="text-sm font-semibold text-slate-500">Gia tu</span>
              <span className="text-2xl font-semibold text-gold-500">{formatPrice(project.priceFrom)}</span>
            </div>
            <button className="btn-primary mt-5 w-full justify-center" onClick={onContact} type="button">
              Dang ky tu van
            </button>
          </div>
          <div className="mt-5 overflow-hidden rounded border border-slate-200">
            <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr] bg-brand-900 px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white">
              <span>Can</span>
              <span>DT</span>
              <span>Huong</span>
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

function ApartmentRow({ apartment }: { apartment: Apartment }) {
  return (
    <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr] items-center border-t border-slate-200 px-4 py-4 text-sm">
      <div>
        <div className="font-semibold text-slate-950">{apartment.code}</div>
        <div className="mt-1 flex gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <BedDouble size={14} />
            {apartment.bedrooms}
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath size={14} />
            {apartment.bathrooms}
          </span>
        </div>
      </div>
      <span>{apartment.area} m2</span>
      <span>{apartment.direction}</span>
      <span
        className={`rounded px-2 py-1 text-xs font-semibold ${
          apartment.status === "available"
            ? "bg-emerald-50 text-emerald-700"
            : apartment.status === "reserved"
              ? "bg-amber-50 text-amber-700"
              : "bg-slate-100 text-slate-500"
        }`}
      >
        {statusLabel[apartment.status]}
      </span>
    </div>
  );
}

function NewsPage() {
  return (
    <section className="section-wrap">
      <div className="section-heading">
        <h1>Tin tuc bat dong san</h1>
        <p>Thong tin thi truong va kinh nghiem lua chon can ho duoc bien tap cho khach hang AMG Land.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <NewsCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

function ContactPage() {
  return (
    <section className="section-wrap">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h1 className="text-5xl font-semibold leading-tight text-brand-900">Dang ky tu van</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Chia se nhu cau cua ban, AMG Land se lien he voi bang hang va thong tin du an phu hop.
          </p>
          <div className="mt-8 grid gap-4">
            <ContactInfo icon={<Phone size={20} />} label="Hotline" value="0900 000 000" />
            <ContactInfo icon={<MapPin size={20} />} label="Van phong" value="Ha Noi, Viet Nam" />
            <ContactInfo icon={<MessageCircle size={20} />} label="Thoi gian" value="08:30 - 18:00" />
          </div>
        </div>
        <form className="rounded bg-white p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Ho ten" placeholder="Nguyen Van A" />
            <Input label="So dien thoai" placeholder="0900 000 000" />
            <Input label="Email" placeholder="email@example.com" />
            <Input label="Du an quan tam" placeholder="The Aurora Riverside" />
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-slate-700">Nhu cau</span>
            <textarea
              className="mt-2 min-h-32 w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              placeholder="Ngan sach, khu vuc, so phong ngu mong muon..."
            />
          </label>
          <button className="btn-primary mt-5 h-12 px-6" type="button">
            Gui yeu cau
            <Send size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}

function ContactInfo({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded bg-white p-4 shadow-soft">
      <span className="grid h-11 w-11 place-items-center rounded bg-brand-50 text-brand-900">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <span className="mt-1 block font-semibold text-slate-950">{value}</span>
      </span>
    </div>
  );
}

function Input({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand-500"
        placeholder={placeholder}
      />
    </label>
  );
}

function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="bg-slate-950 py-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <div className="text-xl font-semibold">AMG News</div>
          <p className="mt-2 text-sm text-slate-400">Website thong tin bat dong san va tim kiem khach hang AMG Land.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <button className="rounded px-3 py-2 text-sm text-slate-300 hover:bg-white/10" key={item.page} onClick={() => onNavigate(item.page)} type="button">
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

function Chatbot({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-4 w-[calc(100vw-40px)] max-w-sm overflow-hidden rounded bg-white shadow-soft ring-1 ring-slate-200">
          <div className="flex items-center justify-between bg-brand-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <Bot size={19} />
              Tu van AMG AI
            </div>
            <button aria-label="Dong chat" onClick={onToggle} type="button">
              <X size={19} />
            </button>
          </div>
          <div className="grid gap-3 p-4">
            <div className="max-w-[85%] rounded bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
              Chao ban, ban dang tim can ho theo ngan sach hay theo huong phong thuy?
            </div>
            <div className="ml-auto max-w-[85%] rounded bg-brand-900 px-4 py-3 text-sm leading-6 text-white">
              Toi muon can 2 phong ngu tai Ha Noi.
            </div>
            <div className="rounded border border-slate-200 p-3">
              <div className="text-sm font-semibold text-slate-950">Goi y nhanh</div>
              <div className="mt-2 text-sm text-slate-600">The Aurora Riverside - can A-1208, huong Dong Nam, 78 m2.</div>
            </div>
          </div>
          <div className="flex gap-2 border-t border-slate-100 p-3">
            <input className="h-10 flex-1 rounded border border-slate-200 px-3 text-sm outline-none" placeholder="Nhap cau hoi..." />
            <button className="grid h-10 w-10 place-items-center rounded bg-brand-900 text-white" type="button">
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
      <button
        aria-label="Mo chatbot"
        className="grid h-14 w-14 place-items-center rounded-full bg-brand-900 text-white shadow-soft transition hover:-translate-y-1"
        onClick={onToggle}
        type="button"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
