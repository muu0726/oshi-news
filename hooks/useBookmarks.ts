'use client';

import { useEffect, useState, useCallback } from 'react';
import { BookmarkItem, NewsItem } from '@/types/database';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookmarks');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ブックマークの取得に失敗しました');
      setBookmarks(data.bookmarks || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // URL が保存済みかチェック
  const isBookmarked = useCallback(
    (url: string) => {
      return bookmarks.some((b) => b.url === url);
    },
    [bookmarks]
  );

  // ブックマークのトグル (保存 / 解除)
  const toggleBookmark = async (news: NewsItem | BookmarkItem) => {
    const bookmarked = isBookmarked(news.url);

    if (bookmarked) {
      // 削除
      const res = await fetch(`/api/bookmarks?url=${encodeURIComponent(news.url)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ブックマークの削除に失敗しました');
      setBookmarks((prev) => prev.filter((b) => b.url !== news.url));
      return false;
    } else {
      // 保存
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          news_id: 'id' in news ? news.id : null,
          title: news.title,
          url: news.url,
          source: news.source,
          summary: news.summary,
          published_at: news.published_at,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ブックマークの保存に失敗しました');
      setBookmarks((prev) => [data.bookmark, ...prev]);
      return true;
    }
  };

  return {
    bookmarks,
    loading,
    error,
    refreshBookmarks: fetchBookmarks,
    isBookmarked,
    toggleBookmark,
  };
}
