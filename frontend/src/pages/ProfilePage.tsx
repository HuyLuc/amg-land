import type { ReactNode } from "react";
import { ArrowRight, Bell, CalendarDays, Heart, LogOut, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { projects } from "../assets/data/mockData";
import type { Page } from "../app/types";
import type { AuthUser } from "../features/auth/types";
import { formatPrice } from "../features/projects/utils/projectFormatters";

type ProfilePageProps = {
  user: AuthUser | null;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
};

const activities = [
  "Đã lưu dự án The Aurora Riverside",
  "Đã gửi yêu cầu tư vấn căn 2 phòng ngủ",
  "Đã bình luận trong cộng đồng AMG Land"
];

export function ProfilePage({ user, onLogout, onNavigate }: ProfilePageProps) {
  if (!user) {
    return (
      <section className="section-wrap">
        <div className="mx-auto max-w-xl rounded bg-white p-8 text-center shadow-soft">
          <UserRound className="mx-auto text-brand-900" size={42} />
          <h1 className="font-display mt-5 text-4xl font-bold text-brand-900">Bạn chưa đăng nhập</h1>
          <p className="mt-3 text-slate-600">Đăng nhập để xem hồ sơ, dự án đã lưu và lịch tư vấn cá nhân.</p>
          <button className="btn-primary mx-auto mt-6" onClick={() => onNavigate("login")} type="button">
            Đăng nhập ngay
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section-wrap">
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="h-fit overflow-hidden rounded bg-white shadow-soft">
          <div className="bg-brand-900 p-6 text-white">
            <div className="grid h-20 w-20 place-items-center rounded bg-white text-2xl font-bold text-brand-900 shadow-gold">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <h1 className="font-display mt-5 text-3xl font-bold">{user.name}</h1>
            <p className="mt-1 text-sm text-brand-100">{user.role}</p>
          </div>

          <div className="grid gap-4 p-6 text-sm text-slate-700">
            <ProfileLine icon={<Mail size={17} />} label="Email" value={user.email} />
            <ProfileLine icon={<Phone size={17} />} label="Điện thoại" value={user.phone} />
            <ProfileLine icon={<ShieldCheck size={17} />} label="Trạng thái" value="Đã xác thực demo" />
            <button className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded border border-slate-200 px-4 font-semibold text-slate-700 transition hover:border-brand-900 hover:text-brand-900" onClick={onLogout} type="button">
              <LogOut size={17} />
              Đăng xuất
            </button>
          </div>
        </aside>

        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <ProfileStat icon={<Heart size={20} />} label="Dự án đã lưu" value="3" />
            <ProfileStat icon={<CalendarDays size={20} />} label="Lịch tư vấn" value="2" />
            <ProfileStat icon={<Bell size={20} />} label="Thông báo mới" value="5" />
          </div>

          <section className="rounded bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl font-bold text-brand-900">Dự án quan tâm</h2>
                <p className="mt-2 text-sm text-slate-600">Danh sách dự án được lưu trong hồ sơ khách hàng.</p>
              </div>
              <button className="btn-secondary" onClick={() => onNavigate("projects")} type="button">
                Xem thêm
                <ArrowRight size={17} />
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {projects.slice(0, 3).map((project) => (
                <article className="grid gap-4 rounded border border-slate-200 p-4 md:grid-cols-[128px_1fr_auto] md:items-center" key={project.id}>
                  <img alt={project.name} className="h-24 w-full rounded object-cover md:w-32" src={project.image} />
                  <div>
                    <h3 className="font-semibold text-slate-950">{project.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{project.location}</p>
                    <p className="mt-2 text-sm font-semibold text-gold-500">Từ {formatPrice(project.priceFrom)}</p>
                  </div>
                  <button className="text-sm font-semibold text-brand-900 transition hover:text-gold-500" onClick={() => onNavigate("projects")} type="button">
                    Xem dự án
                  </button>
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded bg-white p-6 shadow-soft">
              <h2 className="font-display text-2xl font-bold text-brand-900">Lịch tư vấn</h2>
              <div className="mt-5 grid gap-3">
                <ScheduleItem date="14/05/2026" title="Tư vấn căn hộ 2 phòng ngủ" />
                <ScheduleItem date="18/05/2026" title="So sánh bảng hàng dự án Tây Hồ" />
              </div>
            </section>

            <section className="rounded bg-white p-6 shadow-soft">
              <h2 className="font-display text-2xl font-bold text-brand-900">Hoạt động gần đây</h2>
              <div className="mt-5 grid gap-3">
                {activities.map((item) => (
                  <div className="flex items-start gap-3 text-sm leading-6 text-slate-700" key={item}>
                    <span className="mt-2 h-2 w-2 rounded-full bg-gold-400" />
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
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

function ScheduleItem({ date, title }: { date: string; title: string }) {
  return (
    <div className="rounded border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold-500">
        <CalendarDays size={15} />
        {date}
      </div>
      <p className="mt-2 font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">Chuyên viên AMG Land sẽ liên hệ xác nhận trước lịch hẹn.</p>
    </div>
  );
}
