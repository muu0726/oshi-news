'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useNews } from '@/hooks/useNews';
import { useBookmarks } from '@/hooks/useBookmarks';
import { FavoriteTabs } from '@/components/FavoriteTabs';
import { NewsCard } from '@/components/NewsCard';
import { EmptyNewsState } from '@/components/EmptyNewsState';
import { AddFavoriteModal } from '@/components/AddFavoriteModal';
import { Sparkles, LogOut, Plus, RefreshCw, CheckCircle2, AlertCircle, Bookmark, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { favorites, loading: favLoading, searchCandidates, addFavorite, deleteFavorite } = useFavorites();
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();

  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCronRunning, setIsCronRunning] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // アクティブタブの自動選択
  useEffect(() => {
    if (favorites.length > 0 && (!activeTabId || !favorites.some(f => f.id === activeTabId))) {
      setActiveTabId(favorites[0].id);
    }
  }, [favorites, activeTabId]);

  const { newsList, loading: newsLoading, refreshNews } = useNews(activeTabId);
  const activeFavorite = favorites.find(f => f.id === activeTabId);

  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || (favLoading && favorites.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleAdd = async (candidate: any) => {
    const newFav = await addFavorite(candidate);
    if (newFav && newFav.id) {
      setActiveTabId(newFav.id);
    }
    showToast(`「${candidate.name}」を推しリストに追加しました！`);
  };

  // 手動ニュース同期・取得バッチの実行
  const handleManualSync = async () => {
    setIsCronRunning(true);
    try {
      const res = await fetch('/api/cron/daily-news');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ニュースの取得に失敗しました');

      await refreshNews();
      showToast(`ニュース自動収集完了: 新規 ${data.totalAdded || 0} 件のニュースを要約保存しました！`);
    } catch (err: any) {
      showToast(err.message || 'ニュース同期中にエラーが発生しました', 'error');
    } finally {
      setIsCronRunning(false);
    }
  };

  const handleToggleBookmark = async (newsItem: any) => {
    try {
      const added = await toggleBookmark(newsItem);
      showToast(added ? '「後で見る」リストに追加しました' : '「後で見る」リストから削除しました');
    } catch (err: any) {
      showToast(err.message || 'ブックマークの更新に失敗しました', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ナビゲーションバー */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                推しニュース
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 「後で見る」ボタン */}
            <Link
              href="/bookmarks"
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs px-3 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 border border-amber-200 shadow-2xs relative"
              title="後で見るリストを開く"
            >
              <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              <span className="hidden sm:inline">後で見る</span>
              {bookmarks.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {bookmarks.length}
                </span>
              )}
            </Link>

            {/* 「推しの管理」ボタン */}
            <Link
              href="/manage"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 border border-slate-200 shadow-2xs"
              title="推しの管理画面を開く"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">推しの管理</span>
            </Link>

            {favorites.length > 0 && (
              <button
                onClick={handleManualSync}
                disabled={isCronRunning}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs p-2.5 sm:px-3 sm:py-2.5 rounded-2xl transition-all flex items-center gap-1.5 border border-slate-200 shadow-2xs disabled:opacity-50 cursor-pointer"
                title="ニュースを今すぐ手動集約"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCronRunning ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">AIニュース同期</span>
              </button>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">推しを追加</span>
            </button>

            <button
              onClick={signOut}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 p-2.5 sm:px-3 sm:py-2.5 rounded-2xl border border-slate-200 transition-all cursor-pointer"
              title="ログアウト"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </header>

      {/* 動的推しタブバー */}
      {favorites.length > 0 && (
        <FavoriteTabs
          favorites={favorites}
          activeId={activeTabId}
          onSelectTab={(id) => setActiveTabId(id)}
          onOpenAddModal={() => setIsModalOpen(true)}
        />
      )}

      {/* 通知トースト */}
      {toastMsg && (
        <div
          className={`fixed top-20 right-4 z-50 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce ${
            toastMsg.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {toastMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* メインニュースフィード */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        {favorites.length === 0 ? (
          <EmptyNewsState onOpenAddModal={() => setIsModalOpen(true)} />
        ) : newsLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-[28px] p-6 space-y-4 shadow-xs animate-pulse">
                <div className="h-4 bg-slate-200 rounded-full w-1/4" />
                <div className="h-7 bg-slate-200 rounded-xl w-3/4" />
                <div className="h-24 bg-slate-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : newsList.length === 0 ? (
          <div className="space-y-6">
            <EmptyNewsState
              favoriteName={activeFavorite?.name}
              onOpenAddModal={() => setIsModalOpen(true)}
            />
            {/* 手動取得テスト用CTAボタン */}
            <div className="text-center">
              <button
                onClick={handleManualSync}
                disabled={isCronRunning}
                className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 px-6 py-3 rounded-2xl transition-all text-xs shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isCronRunning ? 'animate-spin' : ''}`} />
                「{activeFavorite?.name}」の最新ニュースを今すぐAI集約・3行要約する
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {newsList.map((item) => (
              <NewsCard
                key={item.id}
                news={item}
                isBookmarked={isBookmarked(item.url)}
                onToggleBookmark={() => handleToggleBookmark(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 推し追加モーダル */}
      <AddFavoriteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSearch={searchCandidates}
        onAdd={handleAdd}
      />
    </div>
  );
}
