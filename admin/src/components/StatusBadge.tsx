interface StatusBadgeProps {
  value: string;
}

const labelMap: Record<string, string> = {
  active: "Hoạt động",
  inactive: "Tạm khóa",
  admin: "Quản lý",
  editor: "Nhân viên",
  viewer: "Chỉ xem",
  draft: "Bản nháp",
  active_project: "Đang mở",
  closed: "Đã đóng",
  published: "Đã đăng",
  archived: "Lưu trữ",
  available: "Còn trống",
  reserved: "Đã giữ chỗ",
  sold: "Đã bán",
  new: "Mới",
  processing: "Đang xử lý",
  done: "Hoàn tất",
};

export function StatusBadge({ value }: StatusBadgeProps): JSX.Element {
  return <span className={`status-badge status-${value}`}>{labelMap[value] ?? value}</span>;
}
