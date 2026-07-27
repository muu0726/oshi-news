'use client';

import { useState } from 'react';
import { FavoriteCandidate } from '@/types/database';
import { Search, Sparkles, X, UserCheck, Globe, Tag, AlertCircle, Video, Camera, AtSign } from 'lucide-react';

interface AddFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<FavoriteCandidate[]>;
  onAdd: (candidate: FavoriteCandidate) => Promise<void>;
}

export function AddFavoriteModal({ isOpen, onClose, onSearch, onAdd }: AddFavoriteModalProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [candidates, setCandidates] = useState<FavoriteCandidate[] | null>(null);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setErrorMsg(null);
    setCandidates(null);

    try {
      const results = await onSearch(query.trim());
      setCandidates(results);
    } catch (err: any) {
      setErrorMsg(err.message || '候補の同定に失敗しました');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCandidate = async (candidate: FavoriteCandidate, index: number) => {
    setAddingIndex(index);
    setErrorMsg(null);
    try {
      await onAdd(candidate);
      setQuery('');
      setCandidates(null);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '登録に失敗しました');
    } finally {
      setAddingIndex(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">推し人物 ＆ 公式SNSを追加</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Gemini AI が公式X・Instagram・YouTubeを自動特定</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 検索フォーム */}
        <form onSubmit={handleSearchSubmit} className="mt-6">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="人物名・グループ名を入力 (例: 有村架純, HIKAKIN)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-2xl shadow-md shadow-blue-500/20 transition-all text-xs sm:text-sm flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI候補検索</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* エラー表示 */}
        {errorMsg && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-600 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 検索中 / 候補表示 */}
        <div className="mt-6 flex-1 overflow-y-auto pr-1 space-y-3 min-h-[180px]">
          {searching && (
            <div className="py-12 text-center space-y-3">
              <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-3xl mb-1">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <p className="text-base font-bold text-slate-900">Gemini AI が人物 ＆ 公式SNSを特定中...</p>
              <p className="text-xs text-slate-500 font-medium">公式X、Instagram、YouTubeチャンネルを調べています</p>
            </div>
          )}

          {!searching && candidates && candidates.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm font-medium">
              該当する人物候補が見つかりませんでした。
            </div>
          )}

          {!searching && candidates && candidates.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 px-1">
                AIが特定した候補一覧 (公式SNS情報も含む):
              </p>

              {candidates.map((candidate, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-2xl p-4 sm:p-5 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {candidate.name}
                        </h3>
                        <span className="text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full">
                          {candidate.category_or_group}
                        </span>
                      </div>

                      {candidate.description && (
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium line-clamp-2">
                          {candidate.description}
                        </p>
                      )}

                      {/* 公式SNS アカウント検出タグ */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
                        {candidate.social_accounts?.x_handle && (
                          <span className="inline-flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded-md font-bold">
                            <AtSign className="w-3 h-3 text-blue-400" />
                            {candidate.social_accounts.x_handle}
                          </span>
                        )}
                        {candidate.social_accounts?.instagram_handle && (
                          <span className="inline-flex items-center gap-1 bg-pink-100 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-md font-bold">
                            <Camera className="w-3 h-3 text-pink-600" />
                            @{candidate.social_accounts.instagram_handle.replace(/^@/, '')}
                          </span>
                        )}
                        {candidate.social_accounts?.youtube_channel_id && (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-bold">
                            <Video className="w-3 h-3 text-rose-600" />
                            YouTube公式
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectCandidate(candidate, idx)}
                      disabled={addingIndex !== null}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {addingIndex === idx ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          登録する
                        </>
                      )}
                    </button>
                  </div>

                  {/* キーワードタグ ＆ 公式サイト */}
                  <div className="mt-3.5 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {candidate.keywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="bg-white text-slate-700 text-[10px] px-2.5 py-0.5 rounded-md font-bold border border-slate-200 shadow-2xs"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>

                    {candidate.official_url && (
                      <a
                        href={candidate.official_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
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
        </div>
      </div>
    </div>
  );
}
