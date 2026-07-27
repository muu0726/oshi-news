-- ========================================================
-- 推しニュース Webアプリケーション: Supabase マイグレーション
-- 004_create_master_favorites_table.sql
-- API消費量削減用マスターDBキャッシュテーブルの作成
-- ========================================================

CREATE TABLE IF NOT EXISTS public.master_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'person', -- 'person' (個人) または 'group' (グループ)
  category_or_group TEXT,
  official_url TEXT,
  image_url TEXT, -- 顔写真・グループアイコンの画像URL
  social_accounts JSONB DEFAULT '{}'::jsonb,
  keywords TEXT[] DEFAULT '{}'::TEXT[],
  description TEXT,
  search_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_master_favorites_name ON public.master_favorites (name);
CREATE INDEX IF NOT EXISTS idx_master_favorites_type ON public.master_favorites (type);
CREATE INDEX IF NOT EXISTS idx_master_favorites_keywords ON public.master_favorites USING GIN (keywords);

-- RLS (Row Level Security) の有効化
ALTER TABLE public.master_favorites ENABLE ROW LEVEL SECURITY;

-- 参照・書き込みポリシー (全ユーザーが参照・キャッシュ登録可能)
CREATE POLICY "全ユーザーがマスター推し情報を参照可能"
  ON public.master_favorites FOR SELECT
  USING (true);

CREATE POLICY "全ユーザーがマスター推し情報を登録・更新可能"
  ON public.master_favorites FOR INSERT
  WITH CHECK (true);

CREATE POLICY "全ユーザーがマスター推し情報を更新可能"
  ON public.master_favorites FOR UPDATE
  USING (true);
