import { ArrowRight } from "lucide-react";

type HeroSectionProps = {
  onContact: () => void;
  onExplore: () => void;
};

export function HeroSection({ onExplore, onContact }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-brand-900 lg:block" />
      <div className="mx-auto grid min-h-[690px] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-normal text-brand-900 md:text-7xl">
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

        <div className="relative z-10">
          <div className="hero-media">
            <img
              alt="Căn hộ cao cấp AMG Land"
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1500&q=90"
            />
            <div className="absolute bottom-5 left-5 right-5 grid gap-3 rounded bg-white/94 p-4 shadow-soft backdrop-blur md:grid-cols-3">
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
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div>
    </div>
  );
}

