import type { Post, Project } from "../../types/domain";

export const projects: Project[] = [
  {
    id: "p1",
    slug: "the-aurora-riverside",
    name: "The Aurora Riverside",
    district: "Tây Hồ",
    city: "Hà Nội",
    location: "Võ Chí Công, Tây Hồ, Hà Nội",
    priceFrom: 4200000000,
    status: "Đang mở bán",
    summary:
      "Cụm căn hộ ven sông với mật độ xây dựng thấp, tầm nhìn mở và hệ tiện ích nội khu gần như khép kín.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: ["Hồ bơi vô cực", "Sky lounge", "Phòng gym", "Vườn nội khu", "Trường mầm non"],
    apartments: [
      {
        id: "a101",
        code: "A-1208",
        floor: 12,
        area: 78,
        bedrooms: 2,
        bathrooms: 2,
        direction: "Đông Nam",
        price: 4680000000,
        status: "available",
        fengShui: ["Mộc", "Thủy", "Hỏa"]
      },
      {
        id: "a102",
        code: "B-1803",
        floor: 18,
        area: 96,
        bedrooms: 3,
        bathrooms: 2,
        direction: "Tây Bắc",
        price: 6250000000,
        status: "reserved",
        fengShui: ["Kim", "Thổ"]
      }
    ]
  },
  {
    id: "p2",
    slug: "amg-sky-garden",
    name: "AMG Sky Garden",
    district: "Nam Từ Liêm",
    city: "Hà Nội",
    location: "Đại lộ Thăng Long, Nam Từ Liêm, Hà Nội",
    priceFrom: 3100000000,
    status: "Sắp mở bán",
    summary:
      "Tòa tháp căn hộ hiện đại gần trung tâm hành chính mới, phù hợp gia đình trẻ và nhà đầu tư dài hạn.",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: ["Công viên nội khu", "Khu BBQ", "Thư viện", "Co-working", "Sân chơi trẻ em"],
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
        fengShui: ["Mộc", "Hỏa"]
      },
      {
        id: "b202",
        code: "S-2102",
        floor: 21,
        area: 112,
        bedrooms: 3,
        bathrooms: 2,
        direction: "Tây Nam",
        price: 5980000000,
        status: "available",
        fengShui: ["Kim", "Thổ"]
      }
    ]
  },
  {
    id: "p3",
    slug: "lotus-residence",
    name: "Lotus Residence",
    district: "Long Biên",
    city: "Hà Nội",
    location: "Ngọc Thụy, Long Biên, Hà Nội",
    priceFrom: 2800000000,
    status: "Đang mở bán",
    summary:
      "Khu căn hộ xanh tại cửa ngõ phía Đông, kết nối nhanh vào phố cổ và các tuyến cầu lớn.",
    image:
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: ["Đường dạo bộ", "Hồ điều hòa", "Shophouse", "Phòng sinh hoạt", "An ninh 24/7"],
    apartments: [
      {
        id: "c301",
        code: "L-1501",
        floor: 15,
        area: 71,
        bedrooms: 2,
        bathrooms: 2,
        direction: "Bắc",
        price: 2980000000,
        status: "sold",
        fengShui: ["Thủy"]
      },
      {
        id: "c302",
        code: "L-2605",
        floor: 26,
        area: 88,
        bedrooms: 3,
        bathrooms: 2,
        direction: "Đông",
        price: 3860000000,
        status: "available",
        fengShui: ["Mộc", "Thủy", "Hỏa"]
      }
    ]
  }
];

export const posts: Post[] = [
  {
    id: "n1",
    title: "Căn hộ ven sông tiếp tục hút nhu cầu ở thực tại Hà Nội",
    category: "Thị trường",
    excerpt: "Người mua ưu tiên không gian sống thoáng, kết nối giao thông và tiện ích gần nhà.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    date: "18/03/2026"
  },
  {
    id: "n2",
    title: "Cách đọc bảng giá căn hộ để tránh bỏ sót chi phí",
    category: "Hướng dẫn",
    excerpt: "Ngoài giá niêm yết, khách hàng cần quan tâm phí bảo trì, nội thất và tiến độ thanh toán.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
    date: "16/03/2026"
  },
  {
    id: "n3",
    title: "Hướng nhà và yếu tố phong thủy trong quyết định mua căn hộ",
    category: "Phong thủy",
    excerpt: "Hướng căn hộ nên được xem cùng ngân sách, nhu cầu sử dụng và khả năng thanh khoản.",
    image:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=80",
    date: "12/03/2026"
  }
];

