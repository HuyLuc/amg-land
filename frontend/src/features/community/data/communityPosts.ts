import type { CommunityPost } from "../types";

export const seedCommunityPosts: CommunityPost[] = [
  {
    id: "community-1",
    author: "AMG Land",
    avatar: "AM",
    role: "Đội ngũ biên tập",
    title: "Cập nhật giỏ căn 2 phòng ngủ view sông tại The Aurora Riverside",
    content:
      "Tuần này dự án The Aurora Riverside có thêm một số căn 2 phòng ngủ diện tích 76-82 m2, hướng Đông Nam, phù hợp nhóm khách mua ở thực và ưu tiên phong thủy mệnh Mộc/Thủy.",
    category: "Tin dự án",
    createdAt: "12 phút trước",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    liked: false,
    bookmarked: false,
    likes: 128,
    shares: 18,
    comments: [
      {
        id: "comment-1",
        author: "Minh Anh",
        content: "Cho mình xin bảng giá căn 2PN còn trống nhé.",
        createdAt: "5 phút trước"
      }
    ]
  },
  {
    id: "community-2",
    author: "Nguyễn Hoàng",
    avatar: "NH",
    role: "Khách hàng quan tâm",
    title: "Nên chọn tầng trung hay tầng cao nếu mua để ở lâu dài?",
    content:
      "Mình đang cân nhắc căn 3 phòng ngủ tại Nam Từ Liêm. Gia đình có trẻ nhỏ nên muốn hỏi mọi người nên ưu tiên tầng trung hay tầng cao, đặc biệt về gió, tiếng ồn và thang máy giờ cao điểm.",
    category: "Hỏi đáp",
    createdAt: "38 phút trước",
    liked: true,
    bookmarked: false,
    likes: 46,
    shares: 4,
    comments: [
      {
        id: "comment-2",
        author: "AMG Land",
        content: "Nếu có trẻ nhỏ, tầng trung thường cân bằng hơn về di chuyển và độ thoáng. Bạn có thể xem thêm hướng căn và khoảng cách thang máy.",
        createdAt: "21 phút trước"
      },
      {
        id: "comment-3",
        author: "Thu Trang",
        content: "Nhà mình ở tầng 18 thấy ổn, quan trọng là mật độ căn/tầng và số thang.",
        createdAt: "9 phút trước"
      }
    ]
  },
  {
    id: "community-3",
    author: "Lê Quang",
    avatar: "LQ",
    role: "Nhà đầu tư",
    title: "Khu Đông Hà Nội đang có lợi thế gì cho thuê căn hộ?",
    content:
      "Mình thấy Long Biên và khu vực ven cầu đang được quan tâm hơn. Anh chị nào có dữ liệu thực tế về tỷ lệ lấp đầy hoặc giá thuê căn 2PN chia sẻ giúp mình với.",
    category: "Thị trường",
    createdAt: "1 giờ trước",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
    liked: false,
    bookmarked: true,
    likes: 73,
    shares: 9,
    comments: []
  }
];

