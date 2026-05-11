import { MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "../features/contacts/components/ContactForm";
import { ContactInfo } from "../features/contacts/components/ContactInfo";

export function ContactPage() {
  return (
    <section className="section-wrap">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h1 className="text-5xl font-semibold leading-tight text-brand-900">Đăng ký tư vấn</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Chia sẻ nhu cầu của bạn, AMG Land sẽ liên hệ với bảng hàng và thông tin dự án phù hợp.
          </p>
          <div className="mt-8 grid gap-4">
            <ContactInfo icon={<Phone size={20} />} label="Hotline" value="0900 000 000" />
            <ContactInfo icon={<MapPin size={20} />} label="Văn phòng" value="Hà Nội, Việt Nam" />
            <ContactInfo icon={<MessageCircle size={20} />} label="Thời gian" value="08:30 - 18:00" />
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
