'use client';

import { Favorite } from '@/types/database';
import { Plus, Heart } from 'lucide-react';

interface FavoriteTabsProps {
  favorites: Favorite[];
  activeId: string | null;
  onSelectTab: (id: string) => void;
  onOpenAddModal: () => void;
}

export function FavoriteTabs({
  favorites,
  activeId,
  onSelectTab,
  onOpenAddModal,
}: FavoriteTabsProps) {
  return (
    <div className="w-full bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 flex items-center gap-2.5 overflow-x-auto no-scrollbar py-3">
        {favorites.map((fav) => {
          const isActive = fav.id === activeId;
          return (
            <button
              key={fav.id}
              type="button"
              onClick={() => onSelectTab(fav.id)}
              className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 select-none cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isActive ? 'fill-white text-white' : 'text-slate-400 group-hover:text-rose-500'
                }`}
              />
              <span className="tracking-wide">{fav.name}</span>

              {fav.category_or_group && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {fav.category_or_group}
                </span>
              )}
            </button>
          );
        })}

        {/* 推し追加ボタン */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          <span>推しを追加</span>
        </button>
      </div>
    </div>
  );
}
