interface StatusBadgeProps {
  value: string;
}

const labelMap: Record<string, string> = {
  active: "Hoạt động",
  inactive: "Tạm khóa",
  admin: "Quản lý",
  editor: "Nhân viên tư vấn",
  consultant: "Nhân viên tư vấn",
  content: "Nhân viên đăng bài",
  viewer: "Chỉ xem",
  customer: "Khách hàng",
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
