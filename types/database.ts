export interface SocialAccounts {
  x_handle?: string | null;
  instagram_handle?: string | null;
  youtube_channel_id?: string | null;
}

export interface Favorite {
  id: string;
  user_id: string;
  name: string;
  category_or_group: string | null;
  official_url: string | null;
  social_accounts?: SocialAccounts | null;
  keywords: string[];
  created_at: string;
}

export interface NewsItem {
  id: string;
  favorite_id: string;
  title: string;
  url: string;
  source: string | null;
  summary: string;
  published_at: string | null;
  created_at: string;
}

export interface FavoriteCandidate {
  name: string;
  category_or_group: string;
  official_url?: string;
  social_accounts?: SocialAccounts;
  keywords: string[];
  description: string;
}
