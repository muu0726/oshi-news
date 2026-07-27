'use client';

import { useEffect, useState, useCallback } from 'react';
import { Favorite, FavoriteCandidate } from '@/types/database';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '推しリストの取得に失敗しました');
      setFavorites(data.favorites || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const searchCandidates = async (query: string): Promise<FavoriteCandidate[]> => {
    const res = await fetch('/api/favorites/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '候補の検索に失敗しました');
    return data.candidates || [];
  };

  const addFavorite = async (candidate: FavoriteCandidate) => {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidate),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '登録に失敗しました');
    
    setFavorites(prev => [...prev, data.favorite]);
    return data.favorite;
  };

  const deleteFavorite = async (id: string) => {
    const res = await fetch(`/api/favorites?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '削除に失敗しました');

    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  return {
    favorites,
    loading,
    error,
    refreshFavorites: fetchFavorites,
    searchCandidates,
    addFavorite,
    deleteFavorite,
  };
}
