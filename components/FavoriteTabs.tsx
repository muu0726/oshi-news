'use client';

import { Favorite } from '@/types/database';
import { Plus, Heart, Trash2, Sparkles } from 'lucide-react';

interface FavoriteTabsProps {
  favorites: Favorite[];
  activeId: string | null;
  onSelectTab: (id: string) => void;
  onOpenAddModal: () => void;
  onDeleteFavorite?: (id: string, name: string) => void;
}

export function FavoriteTabs({
  favorites,
  activeId,
  onSelectTab,
  onOpenAddModal,
  onDeleteFavorite,
}: FavoriteTabsProps) {
  return (
    <div className="w-full bg-[#090d16]/80 border-b border-white/10 backdrop-blur-2xl sticky top-16 z-30 transition-all duration-300">
      <div className="max-w-4xl mx-auto px-4 flex items-center gap-2.5 overflow-x-auto no-scrollbar py-3">
        {favorites.map((fav) => {
          const isActive = fav.id === activeId;
          return (
            <div key={fav.id} className="relative group shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => onSelectTab(fav.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 select-none cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-[0_4px_20px_rgba(59,130,246,0.35)] scale-[1.02]'
                    : 'bg-slate-900/70 text-slate-400 border border-white/5 hover:border-white/20 hover:text-white hover:bg-slate-800/90'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    isActive ? 'fill-white text-white scale-110' : 'text-slate-500 group-hover:text-rose-400'
                  }`}
                />
                <span className="tracking-wide">{fav.name}</span>

                {fav.category_or_group && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-white/25 text-white backdrop-blur-md'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {fav.category_or_group}
                  </span>
                )}
              </button>

              {/* タブ削除ボタン (ホバー時に表示) */}
              {onDeleteFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFavorite(fav.id, fav.name);
                  }}
                  className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-full transition-all duration-200 shadow-lg cursor-pointer"
                  title="推しを削除"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* 推し追加ボタン */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:border-blue-400 transition-all duration-300 flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-400" />
          <span>推しを追加</span>
        </button>
      </div>
    </div>
  );
}
