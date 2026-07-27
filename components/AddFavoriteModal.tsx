'use client';

import { useState } from 'react';
import { FavoriteCandidate } from '@/types/database';
import { Search, Sparkles, X, UserCheck, Globe, Tag, AlertCircle } from 'lucide-react';

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
      // リセットして閉じる
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">推し人物を追加</h2>
              <p className="text-xs text-slate-400">Gemini AI が同姓同名を分析・識別します</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 検索フォーム */}
        <form onSubmit={handleSearchSubmit} className="mt-6">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="人物名・グループ名を入力 (例: 有村架純, HIKAKIN)"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                '候補を検索'
              )}
            </button>
          </div>
        </form>

        {/* エラーメッセージ */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* コンテンツエリア (検索中 / 候補表示) */}
        <div className="mt-6 flex-1 overflow-y-auto pr-1 space-y-4 min-h-[160px]">
          {searching && (
            <div className="py-12 text-center space-y-3">
              <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl text-blue-400 mb-1">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-white">Gemini AI が人物情報を特定中...</p>
              <p className="text-xs text-slate-400">同姓同名の判定用キーワードと肩書を解析しています</p>
            </div>
          )}

          {!searching && candidates && candidates.length === 0 && (
            <div className="py-10 text-center text-slate-400 text-sm">
              該当する人物候補が見つかりませんでした。
            </div>
          )}

          {!searching && candidates && candidates.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 px-1">
                候補一覧 (該当する人物を選択してください):
              </p>

              {candidates.map((candidate, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                          {candidate.name}
                        </h3>
                        <span className="text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                          {candidate.category_or_group}
                        </span>
                      </div>

                      {candidate.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {candidate.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectCandidate(candidate, idx)}
                      disabled={addingIndex !== null}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 shrink-0 shadow-md shadow-blue-500/20 disabled:opacity-50"
                    >
                      {addingIndex === idx ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          登録する
                        </>
                      )}
                    </button>
                  </div>

                  {/* メタデータタグ ＆ 公式HP */}
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {/* キーワードタグ */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag className="w-3 h-3 text-slate-500 shrink-0" />
                      {candidate.keywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>

                    {/* 公式HP */}
                    {candidate.official_url && (
                      <a
                        href={candidate.official_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        公式HP
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
