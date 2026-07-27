'use client';

import { useEffect, useState, useCallback } from 'react';
import { NewsItem } from '@/types/database';

export function useNews(favoriteId: string | null) {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (!favoriteId) {
      setNewsList([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/news?favorite_id=${favoriteId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'ニュースの取得に失敗しました');
      setNewsList(data.news || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [favoriteId]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    newsList,
    loading,
    error,
    refreshNews: fetchNews,
  };
}
