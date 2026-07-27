'use client';

import { Heart, Clock, Plus, Sparkles } from 'lucide-react';

interface EmptyNewsStateProps {
  favoriteName?: string;
  onOpenAddModal: () => void;
}

export function EmptyNewsState({ favoriteName, onOpenAddModal }: EmptyNewsStateProps) {
  if (!favoriteName) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl mb-2">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">推し人物を登録しましょう</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          「推し人物を追加」ボタンから名前を入力すると、Gemini AI が同姓同名や表記揺れキーワードを特定して登録します。
        </p>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          推し人物を追加する
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-2xl mb-2 shadow-lg shadow-blue-500/20">
        <Clock className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold text-white">
        「{favoriteName}」のニュースを準備中
      </h2>

      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
        毎朝 5:00（JST）の自動実行バッチにて、Webおよび公式HPから最新ニュースを自動収集し、Gemini AI が3行要約を作成してここにお届けします！
      </p>

      <div className="pt-2 flex items-center justify-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 py-2.5 px-4 rounded-xl max-w-xs mx-auto">
        <Sparkles className="w-4 h-4" />
        <span>毎朝 5:00 自動更新</span>
      </div>
    </div>
  );
}
