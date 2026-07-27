'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import { NewsCard } from '@/components/NewsCard';
import { ArrowLeft, Bookmark, Sparkles, Trash2, Heart } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const { bookmarks, loading: bookmarksLoading, isBookmarked, toggleBookmark } = useBookmarks();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || (bookmarksLoading && bookmarks.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ナビゲーションバー */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              title="ダッシュボードへ戻る"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shadow-xs">
                <Bookmark className="w-5 h-5 fill-amber-500" />
              </div>
              <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                後で見るリスト
              </h1>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                {bookmarks.length} 件
              </span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3.5 py-2 rounded-2xl transition-all"
          >
            ダッシュボード
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        {bookmarks.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-[32px] p-8 sm:p-12 text-center space-y-4 shadow-sm animate-fadeIn">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 border border-amber-100 text-amber-600 rounded-3xl mb-2">
              <Bookmark className="w-10 h-10 fill-amber-400 text-amber-500" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              保存した「後で見る」記事はありません
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              ダッシュボードのニュースカード右上のブックマークアイコン（🔖）をタップすると、気になった記事をここに保存して後でまとめて閲覧できます！
            </p>

            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 rounded-2xl shadow-md shadow-blue-500/20 transition-all text-sm"
              >
                <Sparkles className="w-4 h-4" />
                ダッシュボードへ戻る
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {bookmarks.map((item) => (
              <NewsCard
                key={item.id}
                news={item}
                isBookmarked={true}
                onToggleBookmark={() => toggleBookmark(item)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
