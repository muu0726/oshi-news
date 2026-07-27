'use client';

import { Heart, Clock, Plus, Sparkles, Wand2 } from 'lucide-react';

interface EmptyNewsStateProps {
  favoriteName?: string;
  onOpenAddModal: () => void;
}

export function EmptyNewsState({ favoriteName, onOpenAddModal }: EmptyNewsStateProps) {
  if (!favoriteName) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-[32px] p-8 sm:p-12 text-center space-y-4 shadow-sm animate-fadeIn">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 border border-blue-100 text-blue-600 rounded-3xl mb-2">
          <Heart className="w-10 h-10 text-blue-600" />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          あなたの「推し」を登録しましょう
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
          「推し人物を追加」ボタンから名前を入力すると、Gemini AI が同姓同名や表記揺れキーワードを自動分析して登録します。
        </p>

        <div className="pt-2">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-2xl shadow-md shadow-blue-500/20 transition-all text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            推し人物を追加する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-[32px] p-8 sm:p-12 text-center space-y-4 shadow-sm animate-fadeIn">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-3xl mb-2 shadow-md shadow-blue-500/20">
        <Wand2 className="w-9 h-9" />
      </div>

      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
        「{favoriteName}」のニュースを毎朝AIが自動集約
      </h2>

      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
        毎朝 5:00（JST）に Web および公式HPから最新記事を収集し、Gemini AI が同姓同名を除外して「3行要約」を作成しお届けします！
      </p>

      <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 py-3 px-5 rounded-2xl max-w-xs mx-auto">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span>毎朝 5:00 定時自動要約</span>
      </div>
    </div>
  );
}
