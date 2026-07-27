/**
 * 共有 API クライアント層 (Next.js / Expo 両用設計)
 * 
 * 本モジュールは Next.js 特有の Server Actions やヘッダーに依存せず、
 * 将来的に Expo (React Native) アプリからも共通して呼び出し可能な設計になっています。
 */

import { Favorite, FavoriteCandidate, NewsItem } from '@/types/database';

export class OshiNewsApiClient {
  private baseUrl: string;
  private getToken?: () => Promise<string | null>;

  constructor(baseUrl: string = '', getToken?: () => Promise<string | null>) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    return res;
  }

  // 1. 人物候補の検索 (Gemini AI 同定)
  async searchCandidates(query: string): Promise<FavoriteCandidate[]> {
    const res = await this.fetchWithAuth('/api/favorites/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '候補の検索に失敗しました');
    return data.candidates || [];
  }

  // 2. 推し人物一覧の取得
  async getFavorites(): Promise<Favorite[]> {
    const res = await this.fetchWithAuth('/api/favorites');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '推しリストの取得に失敗しました');
    return data.favorites || [];
  }

  // 3. 推し人物の登録
  async addFavorite(candidate: FavoriteCandidate): Promise<Favorite> {
    const res = await this.fetchWithAuth('/api/favorites', {
      method: 'POST',
      body: JSON.stringify(candidate),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '登録に失敗しました');
    return data.favorite;
  }

  // 4. 推し人物の削除
  async deleteFavorite(id: string): Promise<void> {
    const res = await this.fetchWithAuth(`/api/favorites?id=${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '削除に失敗しました');
  }

  // 5. ニュース一覧の取得
  async getNews(favoriteId: string): Promise<NewsItem[]> {
    const res = await this.fetchWithAuth(`/api/news?favorite_id=${favoriteId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ニュースの取得に失敗しました');
    return data.news || [];
  }
}

// デフォルトインスタンス
export const apiClient = new OshiNewsApiClient();
