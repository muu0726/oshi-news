-- ========================================================
-- 推しニュース Webアプリケーション: Supabase マイグレーション
-- 003_create_bookmarks_table.sql
-- ブックマーク（後で見る）テーブルの作成
-- ========================================================

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  news_id UUID REFERENCES public.news(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source TEXT,
  summary TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_user_bookmark_url UNIQUE(user_id, url)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- RLS (Row Level Security) の有効化
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー
CREATE POLICY "ユーザーは自分のブックマークのみ参照可能"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のブックマークを追加可能"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のブックマークを削除可能"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);
