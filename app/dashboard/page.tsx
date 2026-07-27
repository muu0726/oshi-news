'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useNews } from '@/hooks/useNews';
import { FavoriteTabs } from '@/components/FavoriteTabs';
import { NewsCard } from '@/components/NewsCard';
import { EmptyNewsState } from '@/components/EmptyNewsState';
import { AddFavoriteModal } from '@/components/AddFavoriteModal';
import { Sparkles, LogOut, Plus, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { favorites, loading: favLoading, searchCandidates, addFavorite, deleteFavorite } = useFavorites();

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
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

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`「${name}」を推しリストから削除してもよろしいですか？`)) {
      await deleteFavorite(id);
      if (activeTabId === id) {
        const remaining = favorites.filter(f => f.id !== id);
        setActiveTabId(remaining.length > 0 ? remaining[0].id : null);
      }
      showToast(`「${name}」を削除しました`);
    }
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* ナビゲーションバー */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-wide">推しニュース</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {favorites.length > 0 && (
              <button
                onClick={handleManualSync}
                disabled={isCronRunning}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-slate-700/60 disabled:opacity-50"
                title="ニュースを今すぐ手動集約"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCronRunning ? 'animate-spin text-blue-400' : ''}`} />
                <span className="hidden sm:inline">今すぐニュース取得</span>
              </button>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">推しを追加</span>
            </button>

            <button
              onClick={signOut}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ログアウト</span>
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
          onDeleteFavorite={handleDelete}
        />
      )}

      {/* 通知トースト */}
      {toastMsg && (
        <div
          className={`fixed top-20 right-4 z-50 text-white font-medium text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce ${
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
              <div key={n} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-3 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-1/4" />
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-20 bg-slate-800/60 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : newsList.length === 0 ? (
          <div className="space-y-4">
            <EmptyNewsState
              favoriteName={activeFavorite?.name}
              onOpenAddModal={() => setIsModalOpen(true)}
            />
            {/* 手動取得テスト用CTAボタン */}
            <div className="text-center">
              <button
                onClick={handleManualSync}
                disabled={isCronRunning}
                className="inline-flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-semibold border border-blue-500/30 px-5 py-2.5 rounded-xl transition-all text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCronRunning ? 'animate-spin' : ''}`} />
                「{activeFavorite?.name}」の最新ニュースを今すぐ取得・AI要約する
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {newsList.map((item) => (
              <NewsCard key={item.id} news={item} />
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
