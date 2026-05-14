import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Bath, BedDouble, Building2, Compass, Home, ImageIcon, Layers, Ruler, Sparkles } from "lucide-react";
import { fetchApartmentMedia } from "../features/projects/api";
import { apartmentStatusLabel, formatPrice } from "../features/projects/utils/projectFormatters";
import type { Apartment, ApartmentMedia, Project } from "../types/domain";

type ApartmentDetailPageProps = {
  project: Project;
  apartment: Apartment;
  onBack: () => void;
  onContact: () => void;
};

export function ApartmentDetailPage({ project, apartment, onBack, onContact }: ApartmentDetailPageProps) {
  const [media, setMedia] = useState<ApartmentMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState("");

  useEffect(() => {
    let mounted = true;
    setMediaLoading(true);
    setMediaError("");

    fetchApartmentMedia(apartment.id)
      .then((items) => {
        if (mounted) {
          setMedia(items);
        }
      })
      .catch((error) => {
        if (mounted) {
          setMediaError(error instanceof Error ? error.message : "Không thể tải ảnh căn hộ.");
        }
      })
      .finally(() => {
        if (mounted) {
          setMediaLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [apartment.id]);

  const images = media.filter((item) => item.mediaType === "image");
  const heroImage = images.find((item) => item.isThumbnail)?.url ?? images[0]?.url ?? project.image;

  return (
    <main>
      <section className="relative overflow-hidden bg-brand-900 text-white">
        {heroImage && <img alt={apartment.code} className="absolute inset-0 h-full w-full object-cover opacity-30" src={heroImage} />}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/88 to-brand-900/55" />

        <div className="relative mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
          <button className="inline-flex items-center gap-2 text-sm font-semibold text-brand-100 transition hover:text-white" onClick={onBack} type="button">
            <ArrowLeft size={17} />
            Quay lại chi tiết dự án
          </button>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_390px]">
            <div>
              <span className="inline-flex rounded bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300 ring-1 ring-white/15">
                {project.name}
              </span>
              <h1 className="font-display mt-5 text-5xl font-bold leading-tight md:text-6xl">Căn {apartment.code}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-50">
                {apartment.bedrooms} phòng ngủ, diện tích {apartment.area} m2, hướng {apartment.direction}.
              </p>
            </div>

            <aside className="h-fit rounded bg-white p-5 text-slate-950 shadow-lift">
              <p className="text-sm font-semibold text-slate-500">Giá bán</p>
              <p className="mt-2 text-3xl font-bold text-brand-900">{formatPrice(apartment.price)}</p>
              <div className="mt-5 grid gap-3">
                <ApartmentMetric icon={<Building2 size={18} />} label="Dự án" value={project.name} />
                <ApartmentMetric icon={<Layers size={18} />} label="Tầng" value={String(apartment.floor)} />
                <ApartmentMetric icon={<Sparkles size={18} />} label="Trạng thái" value={apartmentStatusLabel[apartment.status]} />
              </div>
              <button className="btn-primary mt-6 w-full justify-center" onClick={onContact} type="button">
                Nhận tư vấn căn hộ
                <ArrowRight size={17} />
              </button>
            </aside>
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="rounded bg-white p-6 shadow-soft">
              <h2 className="font-display text-3xl font-bold text-brand-900">Thông tin căn hộ</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ApartmentStat icon={<Ruler size={20} />} label="Diện tích" value={`${apartment.area} m2`} />
                <ApartmentStat icon={<BedDouble size={20} />} label="Phòng ngủ" value={`${apartment.bedrooms} phòng`} />
                <ApartmentStat icon={<Bath size={20} />} label="Phòng tắm" value={`${apartment.bathrooms} phòng`} />
                <ApartmentStat icon={<Compass size={20} />} label="Hướng" value={apartment.direction} />
                <ApartmentStat icon={<Home size={20} />} label="Mã căn" value={apartment.code} />
                <ApartmentStat icon={<Sparkles size={20} />} label="Phong thủy" value={apartment.fengShui.join(", ") || "Đang cập nhật"} />
              </div>
            </div>
          </div>

          <div className="rounded bg-white p-6 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-brand-900">Ảnh căn hộ</h2>
            {mediaLoading ? <div className="mt-5 rounded border border-slate-200 p-5 text-sm font-semibold text-slate-500">Đang tải ảnh căn hộ...</div> : null}
            {mediaError ? <div className="mt-5 rounded border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{mediaError}</div> : null}
            {!mediaLoading && !mediaError && !images.length ? (
              <div className="mt-5 grid h-64 place-items-center rounded border border-dashed border-slate-300 text-slate-500">
                <div className="text-center">
                  <ImageIcon className="mx-auto" size={42} />
                  <p className="mt-3 text-sm font-semibold">Chưa có ảnh căn hộ</p>
                </div>
              </div>
            ) : null}
            {images.length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {images.map((item) => (
                  <figure className="overflow-hidden rounded border border-slate-200" key={item.id}>
                    <img alt={item.caption ?? apartment.code} className="h-48 w-full object-cover" src={item.url} />
                    {item.caption ? <figcaption className="px-3 py-2 text-sm font-medium text-slate-600">{item.caption}</figcaption> : null}
                  </figure>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function ApartmentMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded bg-slate-50 px-4 py-3">
      <span className="grid h-9 w-9 place-items-center rounded bg-brand-900 text-white">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <span className="mt-1 block font-semibold text-slate-950">{value}</span>
      </span>
    </div>
  );
}

function ApartmentStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 p-4">
      <span className="text-brand-900">{icon}</span>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  );
}
