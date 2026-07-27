'use client';

import { useState } from 'react';
import { FavoriteCandidate } from '@/types/database';
import { Search, Sparkles, X, UserCheck, Globe, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/85 backdrop-blur-2xl animate-fadeIn">
      <div className="w-full max-w-xl bg-[#0d1322] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-[0_32px_80px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* 背景光彩アクセント */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">推し人物を追加</h2>
              <p className="text-xs text-slate-400 mt-0.5">Gemini AI が同姓同名や表記揺れを高度分析・識別</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 検索フォーム */}
        <form onSubmit={handleSearchSubmit} className="mt-6 relative">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="人物名・グループ名を入力 (例: 有村架純, HIKAKIN)"
                className="w-full bg-slate-950/80 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-xs sm:text-sm flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>AI候補検索</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* エラーアラート */}
        {errorMsg && (
          <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* コンテンツエリア (検索中 / 候補表示) */}
        <div className="mt-6 flex-1 overflow-y-auto pr-1 space-y-3.5 min-h-[180px]">
          {searching && (
            <div className="py-14 text-center space-y-4">
              <div className="inline-flex p-4 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl text-blue-400 shadow-inner">
                <Sparkles className="w-9 h-9 animate-spin" />
              </div>
              <p className="text-base font-bold text-white tracking-wide">Gemini AI が人物情報を分析中...</p>
              <p className="text-xs text-slate-400">同姓同名の識別キーワードと肩書をリアルタイム特定しています</p>
            </div>
          )}

          {!searching && candidates && candidates.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              該当する人物候補が見つかりませんでした。正確な名前で再検索をお試しください。
            </div>
          )}

          {!searching && candidates && candidates.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 px-1">
                AIが特定した候補一覧 (当てはまる人物を選択してください):
              </p>

              {candidates.map((candidate, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-white/5 hover:border-blue-500/40 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-white group-hover:text-blue-300 transition-colors">
                          {candidate.name}
                        </h3>
                        <span className="text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                          {candidate.category_or_group}
                        </span>
                      </div>

                      {candidate.description && (
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                          {candidate.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectCandidate(candidate, idx)}
                      disabled={addingIndex !== null}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 shrink-0 shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
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

                  {/* メタデータタグ ＆ 公式HP */}
                  <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {candidate.keywords.map((kw, kIdx) => (
                        <span
                          key={kIdx}
                          className="bg-slate-900 text-slate-300 text-[10px] px-2.5 py-0.5 rounded-md font-medium border border-white/5"
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
                        className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
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
