import { Sparkles } from "lucide-react";

type FengShuiSectionProps = {
  onExplore: () => void;
};

export function FengShuiSection({ onExplore }: FengShuiSectionProps) {
  return (
    <section className="bg-brand-900 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <h2 className="text-4xl font-semibold leading-tight md:text-5xl">Gợi ý căn hộ theo phong thủy</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-brand-100">
            Bộ lọc theo ngày sinh, ngân sách và hướng nhà giúp khách hàng rút ngắn thời gian chọn căn hộ phù hợp.
          </p>
          <button className="mt-8 inline-flex h-12 items-center gap-2 rounded bg-white px-6 text-sm font-semibold text-brand-900" onClick={onExplore} type="button">
            Thử bộ lọc
            <Sparkles size={18} />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Kim", "Tây, Tây Bắc, Tây Nam"],
            ["Mộc", "Đông, Đông Nam, Nam"],
            ["Thủy", "Bắc, Đông, Đông Nam"],
            ["Hỏa", "Nam, Đông, Đông Nam"]
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

