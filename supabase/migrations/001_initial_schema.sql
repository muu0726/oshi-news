-- ========================================================
-- 推しニュース Webアプリケーション: Supabase 初期スキーマ定義
-- 001_initial_schema.sql
-- ========================================================

-- 1. favorites (登録された推し人物) テーブルの作成
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_or_group TEXT,
  official_url TEXT,
  keywords TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. news (収集・要約済みニュース) テーブルの作成
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  favorite_id UUID NOT NULL REFERENCES public.favorites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source TEXT,
  summary TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. パフォーマンス向上のためのインデックス定義
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_news_favorite_id ON public.news(favorite_id);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at DESC);

-- 4. RLS (Row Level Security) の有効化
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- 5. RLS ポリシーの定義

-- favorites テーブルの RLS ポリシー
CREATE POLICY "ユーザーは自分の推し人物のみ参照可能"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の推し人物を登録可能"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の推し人物のみ更新可能"
  ON public.favorites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の推し人物のみ削除可能"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- news テーブルの RLS ポリシー
CREATE POLICY "ユーザーは自分が登録した推しのニュースのみ参照可能"
  ON public.news FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.favorites
      WHERE favorites.id = news.favorite_id
      AND favorites.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分が登録した推しのニュースを登録可能"
  ON public.news FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.favorites
      WHERE favorites.id = news.favorite_id
      AND favorites.user_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分が登録した推しのニュースを削除可能"
  ON public.news FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.favorites
      WHERE favorites.id = news.favorite_id
      AND favorites.user_id = auth.uid()
    )
  );
