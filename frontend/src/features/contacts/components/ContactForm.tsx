import { Send } from "lucide-react";
import { TextInput } from "../../../components/ui/TextInput";

export function ContactForm() {
  return (
    <form className="rounded bg-white p-6 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Họ tên" placeholder="Nguyễn Văn A" />
        <TextInput label="Số điện thoại" placeholder="0942 319 933" />
        <TextInput label="Email" placeholder="email@example.com" />
        <TextInput label="Dự án quan tâm" placeholder="The Aurora Riverside" />
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-semibold text-slate-700">Nhu cầu</span>
        <textarea
          className="mt-2 min-h-32 w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          placeholder="Ngân sách, khu vực, số phòng ngủ mong muốn..."
        />
      </label>
      <button className="btn-primary mt-5 h-12 w-full px-6 md:w-auto" type="button">
        Gửi yêu cầu
        <Send size={18} />
      </button>
    </form>
  );
}
