export type ProjectStatus = "Đang mở bán" | "Sắp mở bán" | "Đã bàn giao";
export type ApartmentStatus = "available" | "reserved" | "sold";

export type Apartment = {
  id: string;
  code: string;
  floor: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  direction: string;
  price: number;
  status: ApartmentStatus;
  fengShui: string[];
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  district: string;
  city: string;
  location: string;
  priceFrom: number;
  status: ProjectStatus;
  summary: string;
  image: string;
  gallery: string[];
  amenities: string[];
  apartments: Apartment[];
};

export type Post = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
};
