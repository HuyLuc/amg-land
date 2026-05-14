import type { ReactNode } from "react";
import { ArrowRight, HeartHandshake, Phone, Sparkles, Target, UsersRound } from "lucide-react";
import { companyAssets, companyInfo } from "../app/company";

type AboutPageProps = {
  onContact: () => void;
};

const missionItems = [
  {
    title: "Đối với thị trường",
    icon: <Target size={20} />,
    text:
      "Mang đến sự rõ ràng, đáng tin cậy và giá trị đích thực trong mọi giao dịch bất động sản; góp phần xây dựng một thị trường vững mạnh và phát triển bền vững."
  },
  {
    title: "Đối với khách hàng",
    icon: <HeartHandshake size={20} />,
    text:
      "Khách hàng là ưu tiên hàng đầu. AMG Land đồng hành, lắng nghe và cung cấp dịch vụ môi giới chuyên nghiệp để tạo ra giá trị thực cho từng nhu cầu mua bán."
  },
  {
    title: "Đối với đối tác và nhân viên",
    icon: <UsersRound size={20} />,
    text:
      "Tạo môi trường làm việc lý tưởng, nhiều cơ hội phát triển và trở thành đối tác tin cậy giúp chủ đầu tư nâng tầm dự án."
  },
  {
    title: "Đối với xã hội",
    icon: <Sparkles size={20} />,
    text:
      "Đóng góp cho cộng đồng thông qua các hoạt động từ thiện, hỗ trợ giáo dục và bảo vệ môi trường, hướng đến những tác động tích cực lâu dài."
  }
];

const coreValues = [
  {
    letter: "A",
    title: "Ambition",
    subtitle: "Hoài bão lớn lao, khát vọng chinh phục",
    text: "AMG Land mang hoài bão chinh phục những thị trường bất động sản biến động và những khách hàng khó tính nhất."
  },
  {
    letter: "M",
    title: "Master",
    subtitle: "Bậc thầy",
    text: "AMG Land quy tụ những chuyên gia có bề dày kinh nghiệm trong lĩnh vực bất động sản, tự tin mang đến giá trị cao nhất cho khách hàng."
  },
  {
    letter: "G",
    title: "Good",
    subtitle: "Chất lượng",
    text: "Mỗi dự án được giới thiệu đều cần đáp ứng tiêu chuẩn chất lượng cao, minh bạch và hướng tới trải nghiệm tốt nhất cho khách hàng."
  }
];

const leaders = [
  { name: "ÔNG LÊ MINH KHÔI", role: "Chủ tịch HĐQT", image: companyAssets.leaders.leMinhKhoi },
  { name: "TRỊNH THỊ TRANG", role: "Kế toán trưởng", image: companyAssets.leaders.trinhThiTrang },
  { name: "LƯU QUỐC TRANG", role: "Giám đốc Kinh doanh", image: companyAssets.leaders.luuQuocTrang },
  { name: "VŨ HÀ PHƯƠNG", role: "Trợ lý Tổng Giám đốc", image: companyAssets.leaders.vuHaPhuong },
  { name: "NGUYỄN THÙY LINH", role: "Admin", image: companyAssets.leaders.nguyenThuyLinh }
];

export function AboutPage({ onContact }: AboutPageProps) {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-slate-50">
        <div className="absolute inset-0 opacity-60 luxury-grid" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <img alt={companyInfo.brandName} className="h-24 w-auto" src={companyAssets.logo} />
            <h1 className="font-display mt-8 text-5xl font-bold leading-tight text-brand-900 md:text-6xl">{companyInfo.brandName}</h1>
            <p className="mt-4 text-2xl font-semibold text-gold-500">{companyInfo.tagline}</p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              AMG Land là đơn vị tiên phong trong lĩnh vực phân phối và phát triển bất động sản tại Việt Nam, kết nối khách hàng đến những sản phẩm uy tín, pháp lý minh bạch và tiềm năng sinh lời cao.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={onContact} type="button">
                Liên hệ tư vấn
                <ArrowRight size={17} />
              </button>
              <a className="btn-secondary" href={`tel:${companyInfo.phone}`}>
                <Phone size={17} />
                {companyInfo.phone}
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
            <img alt="Đội ngũ AMG Land trong buổi đào tạo dự án" className="h-[430px] w-full rounded object-cover shadow-lift sm:row-span-2" src={companyAssets.office} />
            <img alt="Tập thể AMG Land tại sự kiện khởi động" className="h-52 w-full rounded object-cover shadow-soft" src={companyAssets.teamKickoff} />
            <img alt="AMG Land tại lễ vinh danh dự án" className="h-52 w-full rounded object-cover shadow-soft" src={companyAssets.teamAward} />
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionIntro title="Về chúng tôi" />
          <div className="grid gap-5 text-base leading-8 text-slate-700">
            <p>
              Với sứ mệnh kết nối khách hàng đến những giá trị sống đích thực, AMG Land không ngừng mở rộng mạng lưới và nâng cao chất lượng dịch vụ, mang đến những sản phẩm bất động sản uy tín, pháp lý minh bạch và tiềm năng sinh lời cao.
            </p>
            <p>
              Chúng tôi tự hào khẳng định mình trong thị trường môi giới bất động sản với sứ mệnh vượt qua những thách thức của giai đoạn khó khăn, nhằm lan tỏa những giá trị đích thực tới khách hàng, chủ đầu tư, đối tác và đội ngũ nhân viên làm việc tại công ty.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-900 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8">
          <div>
            <SectionIntro inverted title="Tầm nhìn" />
            <p className="mt-6 text-base leading-8 text-brand-100">
              Bằng khát vọng tiên phong cùng chiến lược luôn đổi mới để đáp ứng những biến đổi của thị trường, AMG Land định hướng phát triển thành công ty môi giới và phát triển dự án bất động sản hàng đầu cả nước; được công nhận về chất lượng dịch vụ và sự chuyên nghiệp.
            </p>
            <p className="mt-4 text-base leading-8 text-brand-100">
              Chúng tôi góp phần mang đến những giá trị đích thực cho khách hàng trong việc lựa chọn sản phẩm bất động sản, đồng thời nâng cao giá trị sản phẩm mà chủ đầu tư kiến tạo.
            </p>
          </div>
          <img alt="AMG Land nhận chứng nhận phân phối dự án" className="h-[360px] w-full rounded object-cover shadow-lift" src={companyAssets.ceremony} />
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-heading">
          <h2>Sứ mệnh</h2>
          <p>AMG Land lan tỏa giá trị đích thực tới thị trường, khách hàng, đối tác, nhân viên và cộng đồng.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {missionItems.map((item) => (
            <InfoPanel icon={item.icon} key={item.title} title={item.title}>
              {item.text}
            </InfoPanel>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="section-heading">
            <h2>Giá trị cốt lõi</h2>
            <p>Ba chữ AMG đại diện cho tinh thần làm nghề: khát vọng, chuyên môn và chất lượng.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {coreValues.map((value) => (
              <article className="rounded bg-white p-6 shadow-soft" key={value.letter}>
                <span className="grid h-14 w-14 place-items-center rounded bg-brand-900 text-2xl font-bold text-white shadow-gold">{value.letter}</span>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-gold-500">{value.title}</p>
                <h3 className="mt-2 text-xl font-bold text-brand-900">{value.subtitle}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-heading mx-auto text-center">
          <h2>Đội ngũ lãnh đạo</h2>
          <p>Những nhân sự nòng cốt dẫn dắt AMG Land bằng kinh nghiệm, trách nhiệm và tinh thần chuyên nghiệp.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {leaders.map((leader) => (
            <article className="surface-card group rounded p-5 text-center" key={leader.name}>
              <span className="mx-auto block h-36 w-36 overflow-hidden rounded-full bg-brand-50 shadow-soft ring-4 ring-white">
                <img alt={leader.name} className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" src={leader.image} />
              </span>
              <h3 className="mt-5 text-base font-bold uppercase leading-snug text-brand-900">{leader.name}</h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{leader.role}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionIntro({ title, inverted = false }: { title: string; inverted?: boolean }) {
  return (
    <div>
      <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${inverted ? "text-gold-400" : "text-gold-500"}`}>AMG Land</p>
      <h2 className={`font-display mt-3 text-4xl font-bold leading-tight md:text-5xl ${inverted ? "text-white" : "text-brand-900"}`}>{title}</h2>
    </div>
  );
}

function InfoPanel({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <article className="rounded border border-slate-200 bg-white p-6 shadow-soft">
      <span className="grid h-11 w-11 place-items-center rounded bg-brand-50 text-brand-900">{icon}</span>
      <h3 className="mt-5 text-xl font-bold text-brand-900">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{children}</p>
    </article>
  );
}
