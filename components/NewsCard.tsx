'use client';

import { NewsItem } from '@/types/database';
import { Sparkles, ExternalLink, Clock, Newspaper, ArrowRight, Video, Camera, AtSign } from 'lucide-react';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  // 3行要約を配列に分割
  const summaryLines = (news.summary || '')
    .split('\n')
    .map((line) => line.replace(/^[・\-\*0-9\.]+\s*/, '').trim())
    .filter((line) => line.length > 0);

  // 出典バッジの判定 (YouTube, X, Instagram, ニュース)
  const renderSourceBadge = () => {
    const src = news.source || '';

    if (src.includes('YouTube')) {
      return (
        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 rounded-xl font-bold">
          <Video className="w-3.5 h-3.5 text-rose-600" />
          <span>YouTube 公式</span>
        </div>
      );
    }

    if (src.includes('Instagram')) {
      return (
        <div className="flex items-center gap-1.5 bg-pink-50 border border-pink-200 text-pink-700 px-3 py-1 rounded-xl font-bold">
          <Camera className="w-3.5 h-3.5 text-pink-600" />
          <span>Instagram 公式</span>
        </div>
      );
    }

    if (src.includes('X') || src.includes('Twitter')) {
      return (
        <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded-xl font-bold">
          <AtSign className="w-3.5 h-3.5 text-blue-400" />
          <span>X (Twitter) 公式</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-100 text-sky-700 px-3 py-1 rounded-xl font-bold">
        <Newspaper className="w-3.5 h-3.5 text-sky-600" />
        <span>{src || '主要ニュース'}</span>
      </div>
    );
  };

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
    <article className="pop-card-interactive rounded-[28px] p-6 sm:p-7 relative overflow-hidden group flex flex-col justify-between">
      <div>
        {/* 出典 ＆ 日時 */}
        <div className="flex items-center justify-between text-xs mb-3.5">
          {renderSourceBadge()}

          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(news.published_at || news.created_at)}</span>
          </div>
        </div>

        {/* タイトル */}
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug tracking-tight">
          <a href={news.url} target="_blank" rel="noreferrer" className="focus:outline-none">
            {news.title}
          </a>
        </h3>

        {/* AI 3行要約セクション */}
        <div className="mt-4 p-4 sm:p-5 bg-blue-50/70 border border-blue-100 rounded-2xl relative">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI 3行要約</span>
            </div>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {summaryLines.map((line, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 外部投稿/記事へのリンクボタン */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
        <a
          href={news.url}
          target="_blank"
          rel="noreferrer"
          className="group/btn inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
        >
          <span>公式ページを見る</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </a>
      </div>
    </article>
  );
}
