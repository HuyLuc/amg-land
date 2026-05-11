import { ArrowRight, Compass, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

type HeroSectionProps = {
  onContact: () => void;
  onExplore: () => void;
};

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1500&q=90",
    area: "Tây Hồ, Hà Nội",
    direction: "Gợi ý hướng Đông Nam"
  },
  {
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1500&q=90",
    area: "Nam Từ Liêm, Hà Nội",
    direction: "Tầm nhìn đại lộ"
  },
  {
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1500&q=90",
    area: "Long Biên, Hà Nội",
    direction: "Không gian xanh ven sông"
  }
];

export function HeroSection({ onExplore, onContact }: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = heroSlides[activeSlide];

  return (
    <section className="luxury-grid relative overflow-hidden bg-white">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(135deg,#1f3864_0%,#173052_100%)] lg:block" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
      <div className="mx-auto grid min-h-[690px] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div className="relative z-10 max-w-2xl animate-fade-up">
          <h1 className="font-display text-balance text-5xl font-bold leading-[0.98] tracking-normal text-brand-900 md:text-7xl">
            AMG News
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-8 text-slate-600">
            Nền tảng thông tin bất động sản chính thống của AMG Land, kết nối khách hàng với dự án và căn hộ phù hợp.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button className="btn-primary h-12 px-6" onClick={onExplore} type="button">
              Xem dự án
              <ArrowRight size={18} />
            </button>
            <button className="btn-secondary h-12 px-6" onClick={onContact} type="button">
              Đặt lịch tư vấn
            </button>
          </div>
        </div>

        <div className="relative z-10 animate-fade-up [animation-delay:140ms]">
          <div className="hero-media">
            {heroSlides.map((slide, index) => (
              <img
                alt={`Không gian dự án AMG Land ${index + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition duration-1000 ${
                  activeSlide === index ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
                }`}
                key={slide.image}
                src={slide.image}
              />
            ))}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-900/40 to-transparent" />
            <div className="absolute left-5 top-5 hidden rounded border border-slate-200 bg-white p-4 shadow-soft md:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded bg-brand-50 text-brand-900">
                  <MapPin size={18} />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Khu vực nổi bật</span>
                  <span className="mt-1 block text-sm font-semibold text-slate-950">{currentSlide.area}</span>
                </span>
              </div>
            </div>
            <div className="absolute right-5 top-28 hidden rounded border border-white/15 bg-brand-900 p-4 text-white shadow-[0_14px_34px_rgba(15,23,42,0.26)] md:block">
              <div className="flex items-center gap-3">
                <Compass size={19} className="text-gold-400" />
                <span className="text-sm font-semibold">{currentSlide.direction}</span>
              </div>
            </div>
            <div className="absolute bottom-[118px] left-5 flex items-center gap-2">
              {heroSlides.map((slide, index) => (
                <button
                  aria-label={`Chuyển ảnh ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/55 hover:bg-white"
                  }`}
                  key={slide.image}
                  onClick={() => setActiveSlide(index)}
                  type="button"
                />
              ))}
            </div>
            <div className="absolute bottom-[104px] left-5 h-0.5 w-32 overflow-hidden rounded-full bg-white/35">
              <span className="hero-progress block h-full rounded-full bg-gold-400" key={activeSlide} />
            </div>
            <div className="absolute bottom-5 left-5 right-5 grid gap-3 rounded border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-3">
              <Metric label="Dự án" value="12+" />
              <Metric label="Căn hộ" value="480+" />
              <Metric label="Quan tâm" value="2.4k" />
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
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">{label}</div>
    </div>
  );
}
