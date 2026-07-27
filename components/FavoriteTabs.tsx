'use client';

import { Favorite } from '@/types/database';
import { Plus, Heart, Trash2 } from 'lucide-react';

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
    <div className="w-full bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-16 z-30">
      <div className="max-w-4xl mx-auto px-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
        {favorites.map((fav) => {
          const isActive = fav.id === activeId;
          return (
            <div key={fav.id} className="relative group shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => onSelectTab(fav.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'fill-white text-white' : 'text-slate-500'
                  }`}
                />
                <span>{fav.name}</span>
                {fav.category_or_group && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-700/60 text-slate-400'
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
                  className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-full transition-all shadow-md"
                  title="推しを削除"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}

        {/* 追加ボタン */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="shrink-0 px-3.5 py-2 rounded-2xl text-xs font-semibold bg-slate-800/40 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 transition-all flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>推しを追加</span>
        </button>
      </div>
    </div>
  );
}
