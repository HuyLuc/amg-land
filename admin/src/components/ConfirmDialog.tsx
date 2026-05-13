import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  loading = false,
  tone = "danger",
  onConfirm,
  onClose,
}: ConfirmDialogProps): JSX.Element | null {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop confirm-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description" onMouseDown={(event) => event.stopPropagation()}>
        <button className="confirm-close-button" type="button" aria-label="Đóng" onClick={onClose}>
          <X size={18} />
        </button>
        <div className={`confirm-dialog-icon confirm-dialog-icon-${tone}`}>
          <AlertTriangle size={22} />
        </div>
        <div>
          <h2 id="confirm-dialog-title">{title}</h2>
          <p id="confirm-dialog-description">{description}</p>
        </div>
        <div className="confirm-dialog-actions">
          <button className="secondary-button" type="button" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button className={tone === "danger" ? "confirm-danger-button" : "primary-button"} type="button" onClick={onConfirm} disabled={loading}>
            {loading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
