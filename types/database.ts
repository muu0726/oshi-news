export interface Favorite {
  id: string;
  user_id: string;
  name: string;
  category_or_group: string | null;
  official_url: string | null;
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
  keywords: string[];
  description: string;
}
