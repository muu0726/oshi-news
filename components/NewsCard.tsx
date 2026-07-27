'use client';

import { NewsItem } from '@/types/database';
import { Sparkles, ExternalLink, Clock, Newspaper, ArrowRight } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  // 3行要約を配列に分割
  const summaryLines = (news.summary || '')
    .split('\n')
    .map((line) => line.replace(/^[・\-\*0-9\.]+\s*/, '').trim())
    .filter((line) => line.length > 0);

  // 発行・取得日時のフォーマット
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '日時不明';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours < 1) return 'たった今';
      if (diffHours < 24) return `${diffHours}時間前`;
      return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <article className="glass-panel-interactive rounded-[28px] p-6 sm:p-7 relative overflow-hidden group flex flex-col justify-between">
      {/* 背景ホバー微細グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div>
        {/* 出典 ＆ 日時 */}
        <div className="flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-white/10 text-slate-300 px-3 py-1.5 rounded-xl font-medium shadow-sm">
            <Newspaper className="w-3.5 h-3.5 text-blue-400" />
            <span>{news.source || '主要メディア'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatDate(news.published_at || news.created_at)}</span>
          </div>
        </div>

        {/* ニュースタイトル */}
        <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-blue-300 transition-colors leading-snug tracking-tight">
          <a href={news.url} target="_blank" rel="noreferrer" className="focus:outline-none">
            {news.title}
          </a>
        </h3>

        {/* AI 3行要約セクション (特製ハイライトボックス) */}
        <div className="mt-5 p-4 sm:p-5 bg-[#0b101d]/90 border-l-4 border-l-blue-500 border border-white/5 rounded-2xl relative shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>AI 3行サマリー</span>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            {summaryLines.map((line, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 shrink-0 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 外部記事へのリンクボタン */}
      <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
        <a
          href={news.url}
          target="_blank"
          rel="noreferrer"
          className="group/btn inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all duration-300 cursor-pointer"
        >
          <span>元記事を読む</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </a>
      </div>
    </article>
  );
}
