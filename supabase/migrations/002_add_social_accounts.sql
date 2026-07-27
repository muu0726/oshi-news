-- ========================================================
-- 推しニュース Webアプリケーション: Supabase マイグレーション
-- 002_add_social_accounts.sql
-- favorites テーブルに social_accounts (JSONB) カラムを追加
-- ========================================================

ALTER TABLE public.favorites 
ADD COLUMN IF NOT EXISTS social_accounts JSONB DEFAULT '{
  "x_handle": null,
  "instagram_handle": null,
  "youtube_channel_id": null
}'::jsonb;
