-- ========================================================
-- 推しニュース Webアプリケーション: Supabase マイグレーション
-- 005_fix_master_favorites_rls.sql
-- master_favorites テーブルの RLS 権限修正
-- 匿名ユーザーによる直接改ざんを防止し、認証済みユーザーのみ登録・更新可能にする
-- ========================================================

-- 既存の誰でも書き込み可能なポリシーを削除
DROP POLICY IF EXISTS "全ユーザーがマスター推し情報を登録・更新可能" ON public.master_favorites;
DROP POLICY IF EXISTS "全ユーザーがマスター推し情報を更新可能" ON public.master_favorites;

-- 新しい制限付きポリシーの作成
-- 1. 参照ポリシー (全ユーザーが参照可能)
-- "全ユーザーがマスター推し情報を参照可能" ポリシーはそのまま維持

-- 2. 登録ポリシー (認証済みユーザーのみ可能)
CREATE POLICY "認証済みユーザーのみマスター推し情報を登録可能"
  ON public.master_favorites FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. 更新ポリシー (認証済みユーザーのみ可能)
CREATE POLICY "認証済みユーザーのみマスター推し情報を更新可能"
  ON public.master_favorites FOR UPDATE
  TO authenticated
  USING (true);
