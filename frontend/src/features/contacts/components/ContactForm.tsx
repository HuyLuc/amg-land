import { useMemo, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { TextInput } from "../../../components/ui/TextInput";
import { createContact } from "../api";
import type { ContactContext } from "../../../pages/ContactPage";

type ContactFormProps = {
  context?: ContactContext | null;
};

export function ContactForm({ context }: ContactFormProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const defaultMessage = useMemo(() => {
    if (context?.apartment && context.project) {
      return `Tôi quan tâm căn ${context.apartment.code.toUpperCase()} thuộc dự án ${context.project.name}.`;
    }
    if (context?.project) {
      return `Tôi quan tâm dự án ${context.project.name}.`;
    }
    return "";
  }, [context]);

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      await createContact({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        project_id: context?.project?.id ?? null,
        apartment_id: context?.apartment?.id ?? null,
        message: message.trim() || defaultMessage || null,
      });
      setFormSuccess("Đã gửi yêu cầu tư vấn. AMG Land sẽ liên hệ lại trong thời gian sớm nhất.");
      setFullName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Không thể gửi yêu cầu tư vấn lúc này.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="rounded bg-white p-6 shadow-soft" onSubmit={submitContact}>
      {context?.project ? (
        <div className="mb-5 rounded border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          <p className="font-semibold">{context.apartment ? "Tư vấn căn hộ" : "Tư vấn dự án"}</p>
          <p className="mt-1">{context.project.name}{context.apartment ? ` - Căn ${context.apartment.code.toUpperCase()}` : ""}</p>
        </div>
      ) : null}

      {formError ? <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{formError}</div> : null}
      {formSuccess ? <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{formSuccess}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Họ tên" onChange={setFullName} placeholder="Nguyễn Văn A" required value={fullName} />
        <TextInput label="Số điện thoại" minLength={8} onChange={setPhone} placeholder="0942 319 933" required type="tel" value={phone} />
        <TextInput label="Email" onChange={setEmail} placeholder="email@example.com" type="email" value={email} />
        <TextInput label="Dự án quan tâm" onChange={() => undefined} placeholder="Dự án quan tâm" value={context?.project?.name ?? ""} />
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-semibold text-slate-700">Nhu cầu</span>
        <textarea
          className="mt-2 min-h-32 w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          onChange={(event) => setMessage(event.target.value)}
          placeholder={defaultMessage || "Ngân sách, khu vực, số phòng ngủ mong muốn..."}
          value={message}
        />
      </label>
      <button className="btn-primary mt-5 h-12 w-full px-6 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto" disabled={submitting} type="submit">
        {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
        <Send size={18} />
      </button>
    </form>
  );
}
