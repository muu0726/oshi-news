'use client';

import { Heart, Clock, Plus, Sparkles, Wand2 } from 'lucide-react';

interface EmptyNewsStateProps {
  favoriteName?: string;
  onOpenAddModal: () => void;
}

export function EmptyNewsState({ favoriteName, onOpenAddModal }: EmptyNewsStateProps) {
  if (!favoriteName) {
    return (
      <div className="glass-panel rounded-[32px] p-8 sm:p-14 text-center space-y-5 border border-white/10 relative overflow-hidden animate-fadeIn">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-400 rounded-3xl mb-2 shadow-inner">
          <Heart className="w-10 h-10 animate-pulse text-blue-400" />
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-wide">
          あなたの「推し」を登録しましょう
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          「推し人物を追加」ボタンから名前を入力すると、Gemini AI が同姓同名や表記揺れキーワードを自動分析して登録します。
        </p>

        <div className="pt-2">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            推し人物を追加する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-[32px] p-8 sm:p-14 text-center space-y-5 border border-white/10 relative overflow-hidden animate-fadeIn">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl mb-2 shadow-xl shadow-blue-500/30">
        <Wand2 className="w-9 h-9 animate-bounce" style={{ animationDuration: '3s' }} />
      </div>

      <h2 className="text-2xl font-extrabold text-white tracking-wide">
        「{favoriteName}」のニュースを毎朝AIが自動集約
      </h2>

      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
        毎朝 5:00（JST）に Web および公式HPから最新記事を収集し、Gemini AI が同姓同名を除外して「3行要約」を作成しお届けします！
      </p>

      <div className="pt-3 flex items-center justify-center gap-2 text-xs font-bold text-blue-300 bg-blue-500/10 border border-blue-500/30 py-3 px-5 rounded-2xl max-w-xs mx-auto shadow-sm">
        <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
        <span>毎朝 5:00 定時自動要約</span>
      </div>
    </div>
  );
}
