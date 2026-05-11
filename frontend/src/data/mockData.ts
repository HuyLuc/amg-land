import type { Post, Project } from "../types/domain";

export const projects: Project[] = [
  {
    id: "p1",
    slug: "the-aurora-riverside",
    name: "The Aurora Riverside",
    district: "Tay Ho",
    city: "Ha Noi",
    location: "Vo Chi Cong, Tay Ho, Ha Noi",
    priceFrom: 4200000000,
    status: "Dang mo ban",
    summary:
      "Cum can ho ven song voi mat do xay dung thap, tam nhin mo va he tien ich noi khu gan nhu khep kin.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: ["Ho boi vo cuc", "Sky lounge", "Phong gym", "Vuon noi khu", "Truong mam non"],
    apartments: [
      {
        id: "a101",
        code: "A-1208",
        floor: 12,
        area: 78,
        bedrooms: 2,
        bathrooms: 2,
        direction: "Dong Nam",
        price: 4680000000,
        status: "available",
        fengShui: ["Moc", "Thuy", "Hoa"]
      },
      {
        id: "a102",
        code: "B-1803",
        floor: 18,
        area: 96,
        bedrooms: 3,
        bathrooms: 2,
        direction: "Tay Bac",
        price: 6250000000,
        status: "reserved",
        fengShui: ["Kim", "Tho"]
      }
    ]
  },
  {
    id: "p2",
    slug: "amg-sky-garden",
    name: "AMG Sky Garden",
    district: "Nam Tu Liem",
    city: "Ha Noi",
    location: "Dai lo Thang Long, Nam Tu Liem, Ha Noi",
    priceFrom: 3100000000,
    status: "Sap mo ban",
    summary:
      "Toa thap can ho hien dai gan trung tam hanh chinh moi, phu hop gia dinh tre va nha dau tu dai han.",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: ["Cong vien noi khu", "Khu BBQ", "Thu vien", "Co-working", "San choi tre em"],
    apartments: [
      {
        id: "b201",
        code: "S-0906",
        floor: 9,
        area: 62,
        bedrooms: 2,
        bathrooms: 2,
        direction: "Nam",
        price: 3350000000,
        status: "available",
        fengShui: ["Moc", "Hoa"]
      },
      {
        id: "b202",
        code: "S-2102",
        floor: 21,
        area: 112,
        bedrooms: 3,
        bathrooms: 2,
        direction: "Tay Nam",
        price: 5980000000,
        status: "available",
        fengShui: ["Kim", "Tho"]
      }
    ]
  },
  {
    id: "p3",
    slug: "lotus-residence",
    name: "Lotus Residence",
    district: "Long Bien",
    city: "Ha Noi",
    location: "Ngoc Thuy, Long Bien, Ha Noi",
    priceFrom: 2800000000,
    status: "Dang mo ban",
    summary:
      "Khu can ho xanh tai cua ngo phia Dong, ket noi nhanh vao pho co va cac tuyen cau lon.",
    image:
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: ["Duong dao bo", "Ho dieu hoa", "Shophouse", "Phong sinh hoat", "An ninh 24/7"],
    apartments: [
      {
        id: "c301",
        code: "L-1501",
        floor: 15,
        area: 71,
        bedrooms: 2,
        bathrooms: 2,
        direction: "Bac",
        price: 2980000000,
        status: "sold",
        fengShui: ["Thuy"]
      },
      {
        id: "c302",
        code: "L-2605",
        floor: 26,
        area: 88,
        bedrooms: 3,
        bathrooms: 2,
        direction: "Dong",
        price: 3860000000,
        status: "available",
        fengShui: ["Moc", "Thuy", "Hoa"]
      }
    ]
  }
];

export const posts: Post[] = [
  {
    id: "n1",
    title: "Can ho ven song tiep tuc hut nhu cau o thuc tai Ha Noi",
    category: "Thi truong",
    excerpt: "Nguoi mua uu tien khong gian song thoang, ket noi giao thong va tien ich gan nha.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    date: "18/03/2026"
  },
  {
    id: "n2",
    title: "Cach doc bang gia can ho de tranh bo sot chi phi",
    category: "Huong dan",
    excerpt: "Ngoai gia niem yet, khach hang can quan tam phi bao tri, noi that va tien do thanh toan.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
    date: "16/03/2026"
  },
  {
    id: "n3",
    title: "Huong nha va yeu to phong thuy trong quyet dinh mua can ho",
    category: "Phong thuy",
    excerpt: "Huong can ho nen duoc xem cung ngan sach, nhu cau su dung va kha nang thanh khoan.",
    image:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=80",
    date: "12/03/2026"
  }
];
