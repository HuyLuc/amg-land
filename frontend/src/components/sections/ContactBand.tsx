import { Send } from "lucide-react";

type ContactBandProps = {
  onContact: () => void;
};

export function ContactBand({ onContact }: ContactBandProps) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
      <div className="grid items-center gap-8 rounded bg-white p-8 shadow-soft md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-3xl font-semibold text-brand-900">Cần tư vấn dự án phù hợp?</h2>
          <p className="mt-3 max-w-2xl text-slate-600">Để lại thông tin, đội ngũ AMG Land sẽ liên hệ và gửi bảng hàng phù hợp nhu cầu.</p>
        </div>
        <button className="btn-primary h-12 px-6" onClick={onContact} type="button">
          Gửi thông tin
          <Send size={18} />
        </button>
      </div>
    </section>
  );
}

