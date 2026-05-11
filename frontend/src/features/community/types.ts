export type CommunityComment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  author: string;
  avatar: string;
  role: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  image?: string;
  liked: boolean;
  bookmarked: boolean;
  likes: number;
  shares: number;
  comments: CommunityComment[];
};

