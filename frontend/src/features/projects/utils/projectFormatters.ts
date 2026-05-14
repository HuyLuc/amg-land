import type { Apartment } from "../../../types/domain";

export const budgetOptions = ["Tất cả", "Dưới 3 tỷ", "3 - 5 tỷ", "Trên 5 tỷ"];
export const bedroomOptions = ["Tất cả", "1 PN", "2 PN", "3 PN", "4 PN"];

export const apartmentStatusLabel: Record<Apartment["status"], string> = {
  available: "Còn trống",
  reserved: "Đã đặt",
  sold: "Đã bán"
};

export function formatPrice(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(value % 1_000_000_000 === 0 ? 0 : 1)} tỷ`;
  }

  return `${Math.round(value / 1_000_000)} triệu`;
}
