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
import { Sparkles, LogOut, Plus, RefreshCw, CheckCircle2, AlertCircle, Heart, ShieldCheck } from 'lucide-react';

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
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
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
      {/* ナビゲーションバー (すりガラス) */}
      <header className="border-b border-white/10 bg-[#090d16]/90 backdrop-blur-2xl sticky top-0 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl text-white tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                推しニュース
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {favorites.length > 0 && (
              <button
                onClick={handleManualSync}
                disabled={isCronRunning}
                className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all duration-200 flex items-center gap-1.5 border border-white/10 shadow-sm disabled:opacity-50 cursor-pointer"
                title="ニュースを今すぐ手動集約"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCronRunning ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">今すぐAIニュース同期</span>
              </button>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all duration-300 flex items-center gap-1.5 shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">推しを追加</span>
            </button>

            <button
              onClick={signOut}
              className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white p-2.5 sm:px-3.5 sm:py-2.5 rounded-2xl border border-white/10 transition-all cursor-pointer"
              title="ログアウト"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
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
          className={`fixed top-20 right-4 z-50 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce ${
            toastMsg.type === 'error' ? 'bg-rose-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600'
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
              <div key={n} className="glass-panel rounded-[28px] p-6 space-y-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded-full w-1/4" />
                <div className="h-7 bg-slate-800 rounded-xl w-3/4" />
                <div className="h-24 bg-slate-900/80 rounded-2xl" />
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
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-300 font-bold border border-blue-500/30 px-6 py-3 rounded-2xl transition-all duration-300 text-xs shadow-lg cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isCronRunning ? 'animate-spin' : ''}`} />
                「{activeFavorite?.name}」の最新ニュースを今すぐAI集約・3行要約する
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
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
