export type CommunityAuthor = {
  id: string | null;
  name: string;
  role: string;
  avatar: string;
};

export type CommunityComment = {
  id: string;
  author: CommunityAuthor;
  content: string;
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  author: CommunityAuthor;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  image?: string | null;
  liked: boolean;
  bookmarked: boolean;
  likes: number;
  shares: number;
  comments: CommunityComment[];
};

export type CommunityPostPayload = {
  title: string;
  content: string;
  category: string;
  image_url?: string | null;
};
