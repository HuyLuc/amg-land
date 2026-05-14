import { Send } from "lucide-react";

type ContactBandProps = {
  onContact: () => void;
};

export function ContactBand({ onContact }: ContactBandProps) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
      <div className="relative overflow-hidden rounded bg-brand-900 p-8 text-white shadow-lift md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8">
        <div className="absolute inset-0 opacity-[0.08] luxury-grid" />
        <div>
          <h2 className="font-display relative text-4xl font-bold leading-tight text-white">Cần tư vấn dự án phù hợp?</h2>
          <p className="relative mt-3 max-w-2xl text-brand-100">Để lại thông tin, đội ngũ AMG Land sẽ liên hệ và gửi bảng hàng phù hợp nhu cầu.</p>
        </div>
        <button className="relative mt-7 inline-flex h-12 items-center justify-center gap-2 rounded bg-white px-6 text-sm font-semibold text-brand-900 shadow-gold transition duration-300 hover:-translate-y-0.5 md:mt-0" onClick={onContact} type="button">
          Gửi thông tin
          <Send size={18} />
        </button>
      </div>
    </section>
  );
}
