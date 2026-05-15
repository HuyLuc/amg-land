import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Bell, CalendarDays, Heart, LogOut, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import type { Page } from "../app/types";
import type { AuthUser } from "../features/auth/types";
import { fetchCustomerProfile, type CustomerProfile, type ProfileConsultation } from "../features/profile/api";
import { formatPrice } from "../features/projects/utils/projectFormatters";
import type { Project } from "../types/domain";

type ProfilePageProps = {
  user: AuthUser | null;
  projects: Project[];
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  onOpenProject: (project: Project) => void;
};

const consultationStatusLabel: Record<ProfileConsultation["status"], string> = {
  new: "Mới",
  processing: "Đang xử lý",
  done: "Hoàn tất",
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Chưa có";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function roleLabel(role: string) {
  if (role === "customer") {
    return "Khách hàng";
  }
  return role;
}

export function ProfilePage({ user, projects, onLogout, onNavigate, onOpenProject }: ProfilePageProps) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.accessToken) {
      setProfile(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError("");

    fetchCustomerProfile(user.accessToken)
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
      })
      .catch((profileError) => {
        if (!mounted) return;
        setError(profileError instanceof Error ? profileError.message : "Không thể tải hồ sơ khách hàng.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.accessToken]);

  if (!user) {
    return (
      <section className="section-wrap">
        <div className="mx-auto max-w-xl rounded bg-white p-8 text-center shadow-soft">
          <UserRound className="mx-auto text-brand-900" size={42} />
          <h1 className="font-display mt-5 text-4xl font-bold text-brand-900">Bạn chưa đăng nhập</h1>
          <p className="mt-3 text-slate-600">Đăng nhập để xem hồ sơ, dự án quan tâm và yêu cầu tư vấn cá nhân.</p>
          <button className="btn-primary mx-auto mt-6" onClick={() => onNavigate("login")} type="button">
            Đăng nhập ngay
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    );
  }

  const profileUser = profile?.user;
  const displayName = profileUser?.fullName ?? user.name;
  const displayEmail = profileUser?.email ?? user.email;
  const displayPhone = profileUser?.phone ?? user.phone ?? "Chưa cập nhật";

  const openProfileProject = (slug: string) => {
    const project = projects.find((item) => item.slug === slug);
    if (project) {
      onOpenProject(project);
      return;
    }
    onNavigate("projects");
  };

  return (
    <section className="section-wrap">
      {error ? <div className="mb-5 rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="h-fit overflow-hidden rounded bg-white shadow-soft">
          <div className="bg-brand-900 p-6 text-white">
            <div className="grid h-20 w-20 place-items-center rounded bg-white text-2xl font-bold text-brand-900 shadow-gold">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <h1 className="font-display mt-5 text-3xl font-bold">{displayName}</h1>
            <p className="mt-1 text-sm text-brand-100">{roleLabel(profileUser?.role ?? "customer")}</p>
          </div>

          <div className="grid gap-4 p-6 text-sm text-slate-700">
            <ProfileLine icon={<Mail size={17} />} label="Email" value={displayEmail} />
            <ProfileLine icon={<Phone size={17} />} label="Điện thoại" value={displayPhone} />
            <ProfileLine icon={<ShieldCheck size={17} />} label="Trạng thái" value={profileUser?.isActive === false ? "Tạm khóa" : "Đang hoạt động"} />
            <button className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded border border-slate-200 px-4 font-semibold text-slate-700 transition hover:border-brand-900 hover:text-brand-900" onClick={onLogout} type="button">
              <LogOut size={17} />
              Đăng xuất
            </button>
          </div>
        </aside>

        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <ProfileStat icon={<Heart size={20} />} label="Dự án quan tâm" value={loading ? "..." : String(profile?.stats.interestedProjects ?? 0)} />
            <ProfileStat icon={<CalendarDays size={20} />} label="Yêu cầu tư vấn" value={loading ? "..." : String(profile?.stats.consultationRequests ?? 0)} />
            <ProfileStat icon={<Bell size={20} />} label="Thông báo mới" value={loading ? "..." : String(profile?.stats.unreadNotifications ?? 0)} />
          </div>

          <section className="rounded bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl font-bold text-brand-900">Dự án quan tâm</h2>
                <p className="mt-2 text-sm text-slate-600">Các dự án được ghi nhận từ yêu cầu tư vấn của bạn.</p>
              </div>
              <button className="btn-secondary" onClick={() => onNavigate("projects")} type="button">
                Xem thêm
                <ArrowRight size={17} />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {loading ? <EmptyState text="Đang tải dự án quan tâm..." /> : null}
              {!loading && profile?.interestedProjects.length === 0 ? <EmptyState text="Bạn chưa có dự án quan tâm nào." /> : null}
              {profile?.interestedProjects.map((project) => (
                <article className="grid gap-4 rounded border border-slate-200 p-4 md:grid-cols-[128px_1fr_auto] md:items-center" key={project.id}>
                  {project.imageUrl ? (
                    <img alt={project.name} className="h-24 w-full rounded object-cover md:w-32" src={project.imageUrl} />
                  ) : (
                    <div className="grid h-24 w-full place-items-center rounded bg-brand-50 text-sm font-semibold text-brand-900 md:w-32">AMG Land</div>
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-950">{project.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{project.location}</p>
                    <p className="mt-2 text-sm font-semibold text-gold-500">Từ {formatPrice(project.priceFrom)}</p>
                  </div>
                  <button className="text-sm font-semibold text-brand-900 transition hover:text-gold-500" onClick={() => openProfileProject(project.slug)} type="button">
                    Xem dự án
                  </button>
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded bg-white p-6 shadow-soft">
              <h2 className="font-display text-2xl font-bold text-brand-900">Yêu cầu tư vấn</h2>
              <div className="mt-5 grid gap-3">
                {profile?.consultations.length ? (
                  profile.consultations.map((item) => (
                    <ScheduleItem
                      key={item.id}
                      date={formatDate(item.createdAt)}
                      title={[item.projectName, item.apartmentCode ? `Căn ${item.apartmentCode}` : null].filter(Boolean).join(" - ") || "Yêu cầu tư vấn"}
                      description={item.message || `Trạng thái: ${consultationStatusLabel[item.status]}`}
                    />
                  ))
                ) : (
                  <EmptyState text={loading ? "Đang tải yêu cầu tư vấn..." : "Bạn chưa gửi yêu cầu tư vấn nào."} />
                )}
              </div>
            </section>

            <section className="rounded bg-white p-6 shadow-soft">
              <h2 className="font-display text-2xl font-bold text-brand-900">Hoạt động gần đây</h2>
              <div className="mt-5 grid gap-3">
                {profile?.activities.length ? (
                  profile.activities.map((item) => (
                    <div className="flex items-start gap-3 text-sm leading-6 text-slate-700" key={item.id}>
                      <span className="mt-2 h-2 w-2 rounded-full bg-gold-400" />
                      <span>
                        <span className="block font-medium text-slate-900">{item.label}</span>
                        <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
                      </span>
                    </div>
                  ))
                ) : (
                  <EmptyState text={loading ? "Đang tải hoạt động..." : "Chưa có hoạt động nào."} />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">{text}</div>;
}

function ProfileLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-brand-900">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <span className="mt-1 block font-medium text-slate-800">{value}</span>
      </span>
    </div>
  );
}

function ProfileStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded bg-white p-5 shadow-soft">
      <span className="grid h-11 w-11 place-items-center rounded bg-brand-50 text-brand-900">{icon}</span>
      <p className="mt-4 text-3xl font-bold text-brand-900">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-600">{label}</p>
    </div>
  );
}

function ScheduleItem({ date, title, description }: { date: string; title: string; description: string }) {
  return (
    <div className="rounded border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold-500">
        <CalendarDays size={15} />
        {date}
      </div>
      <p className="mt-2 font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}
