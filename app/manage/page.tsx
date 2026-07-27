'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { AddFavoriteModal } from '@/components/AddFavoriteModal';
import { ArrowLeft, Settings, Trash2, Heart, Plus, Tag, Globe, AtSign, Camera, Video, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ManageFavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading: favLoading, searchCandidates, addFavorite, deleteFavorite } = useFavorites();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    await addFavorite(candidate);
    showToast(`「${candidate.name}」を推しリストに追加しました！`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を推しリストから削除してもよろしいですか？\n※関連する集約ニュースもすべて削除されます。`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteFavorite(id);
      showToast(`「${name}」を推しリストから削除しました`);
    } catch (err: any) {
      showToast(err.message || '削除中にエラーが発生しました', 'error');
    } finally {
      setDeletingId(null);
    }
  };

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
              <div className="w-9 h-9 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center border border-slate-200 shadow-xs">
                <Settings className="w-5 h-5 text-slate-700" />
              </div>
              <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                推しリストの管理
              </h1>
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                {favorites.length} 人
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">推しを追加</span>
          </button>
        </div>
      </header>

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

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        {favorites.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-[32px] p-8 sm:p-12 text-center space-y-4 shadow-sm animate-fadeIn">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 border border-blue-100 text-blue-600 rounded-3xl mb-2">
              <Heart className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              登録済みの推し人物はいません
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
              「推しを追加」ボタンから人物名を入力すると、Gemini AI が公式情報・SNSアカウントを分析して追っかけリストに追加します！
            </p>

            <div className="pt-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 rounded-2xl shadow-md shadow-blue-500/20 transition-all text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                推し人物を追加する
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-500 px-1">
              登録中の推し人物一覧 (削除・公式情報の確認):
            </p>

            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="bg-white border border-slate-200/90 rounded-[24px] p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        {fav.name}
                      </h2>
                      {fav.category_or_group && (
                        <span className="text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full">
                          {fav.category_or_group}
                        </span>
                      )}
                    </div>

                    {/* 公式SNS アカウントタグ */}
                    {fav.social_accounts && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                        {fav.social_accounts.x_handle && (
                          <span className="inline-flex items-center gap-1 bg-slate-900 text-white px-2.5 py-0.5 rounded-md font-bold">
                            <AtSign className="w-3.5 h-3.5 text-blue-400" />
                            {fav.social_accounts.x_handle}
                          </span>
                        )}
                        {fav.social_accounts.instagram_handle && (
                          <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 border border-pink-200 px-2.5 py-0.5 rounded-md font-bold">
                            <Camera className="w-3.5 h-3.5 text-pink-600" />
                            @{fav.social_accounts.instagram_handle.replace(/^@/, '')}
                          </span>
                        )}
                        {fav.social_accounts.youtube_channel_id && (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-md font-bold">
                            <Video className="w-3.5 h-3.5 text-rose-600" />
                            YouTube公式
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 削除ボタン */}
                  <button
                    onClick={() => handleDelete(fav.id, fav.name)}
                    disabled={deletingId === fav.id}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold border border-rose-200 text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {deletingId === fav.id ? (
                      <div className="w-4 h-4 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>推しから外す</span>
                      </>
                    )}
                  </button>
                </div>

                {/* キーワード ＆ 公式サイト */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {Array.isArray(fav.keywords) && fav.keywords.map((kw, kIdx) => (
                      <span
                        key={kIdx}
                        className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-md font-bold border border-slate-200"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  {fav.official_url && (
                    <a
                      href={fav.official_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      公式サイト
                    </a>
                  )}
                </div>
              </div>
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
