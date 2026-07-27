'use client';

import { useState } from 'react';
import { FavoriteCandidate } from '@/types/database';
import { Search, Sparkles, X, UserCheck, Globe, Tag, AlertCircle, User, Users, Image as ImageIcon } from 'lucide-react';

interface AddFavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, type?: string) => Promise<FavoriteCandidate[]>;
  onAdd: (candidate: FavoriteCandidate) => Promise<void>;
}

export function AddFavoriteModal({ isOpen, onClose, onSearch, onAdd }: AddFavoriteModalProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'person' | 'group'>('all');
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
      const results = await onSearch(query.trim(), searchType);
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
              <h2 className="text-xl font-extrabold text-slate-900">推し人物 ＆ グループを追加</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">DBキャッシュ ＆ AI解析でアイコンと公式情報を即座に表示</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 検索フォーム ＆ 個人/グループ選択ピル */}
        <form onSubmit={handleSearchSubmit} className="mt-5 space-y-3">
          {/* 種別切替タブ */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold w-fit">
            <button
              type="button"
              onClick={() => setSearchType('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                searchType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              すべて
            </button>
            <button
              type="button"
              onClick={() => setSearchType('person')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                searchType === 'person' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              個人
            </button>
            <button
              type="button"
              onClick={() => setSearchType('group')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                searchType === 'group' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              グループ
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchType === 'group' ? 'グループ名を入力 (例: 乃木坂46, イコラブ)' : '人物名・グループ名を入力 (例: 有村架純, HIKAKIN)'}
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
                  <span>高速候補検索</span>
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
        <div className="mt-5 flex-1 overflow-y-auto pr-1 space-y-3 min-h-[200px]">
          {searching && (
            <div className="py-12 text-center space-y-3">
              <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-3xl mb-1">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <p className="text-base font-bold text-slate-900">マスターDB ＆ アイコン画像を取得中...</p>
              <p className="text-xs text-slate-500 font-medium">DBキャッシュとWikipedia画像から高速抽出しています</p>
            </div>
          )}

          {!searching && candidates && candidates.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm font-medium">
              該当する人物・グループ候補が見つかりませんでした。
            </div>
          )}

          {!searching && candidates && candidates.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 px-1">
                特定された候補一覧 (画像付き・選択して登録):
              </p>

              {candidates.map((candidate, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-2xl p-4 sm:p-5 transition-all duration-200 group flex items-start gap-3.5"
                >
                  {/* 顔写真 / グループアイコン */}
                  {candidate.image_url ? (
                    <img
                      src={candidate.image_url}
                      alt={candidate.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-xs">
                      {candidate.name.substring(0, 1)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {candidate.name}
                          </h3>
                          
                          {/* 種別バッジ (個人 / グループ) */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            candidate.type === 'group'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }`}>
                            {candidate.type === 'group' ? 'グループ' : '個人'}
                          </span>

                          <span className="text-[11px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                            {candidate.category_or_group}
                          </span>
                        </div>

                        {candidate.description && (
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium line-clamp-2">
                            {candidate.description}
                          </p>
                        )}
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

                    {/* タグ ＆ 公式サイト */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {candidate.keywords.map((kw, kIdx) => (
                          <span
                            key={kIdx}
                            className="bg-white text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-bold border border-slate-200 shadow-2xs"
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
