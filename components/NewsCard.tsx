'use client';

import { NewsItem } from '@/types/database';
import { Sparkles, ExternalLink, Clock, Newspaper } from 'lucide-react';

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
    <article className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group flex flex-col justify-between">
      <div>
        {/* 出典 ＆ 日時 */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <div className="flex items-center gap-1.5 font-medium bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-lg">
            <Newspaper className="w-3.5 h-3.5 text-blue-400" />
            <span>{news.source || '主要メディア'}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(news.published_at || news.created_at)}</span>
          </div>
        </div>

        {/* ニュースタイトル */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
          <a href={news.url} target="_blank" rel="noreferrer" className="focus:outline-none">
            {news.title}
          </a>
        </h3>

        {/* AI 3行要約セクション */}
        <div className="mt-4 p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 mb-2.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI 3行サマリー</span>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {summaryLines.map((line, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 外部記事へのリンクボタン */}
      <div className="mt-5 pt-4 border-t border-slate-800/60 flex justify-end">
        <a
          href={news.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl transition-all"
        >
          <span>元記事を読む</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}
