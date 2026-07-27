# Phase 1: 環境構築・Supabase DB設計・ユーザー認証

## 概要
Next.js プロジェクトのセットアップ、Supabase データベーススキーマ（SQL Migration）の構築、および Supabase Auth によるユーザー登録・ログイン基盤を作成します。

---

## サブタスク一覧

### Task 1.1: Next.js プロジェクトのセットアップ
- [x] Next.js (App Router, TypeScript, Tailwind CSS) のプロジェクト環境構成
- [x] `.env.local.example` に Supabase URL および Anon Key 設定を追加

### Task 1.2: UIライブラリ / アイコンの導入
- [x] Lucide Icons (`lucide-react`) のインストール
- [x] Tailwind CSS v4 ＆ スタイル設定 (`app/globals.css`, `postcss.config.mjs`)

### Task 1.3: Supabase クライアントモジュールの作成
- [x] `@supabase/supabase-js` および `@supabase/ssr` のインストール
- [x] クライアント用 (`lib/supabase/client.ts`) および サーバー用 (`lib/supabase/server.ts`) モジュールの定義

### Task 1.4: データベース設計 ＆ SQL Migration の作成
- [x] `supabase/migrations/001_initial_schema.sql` の作成:
  - `favorites` (推し登録テーブル: `official_url` カラム含む)
  - `news` (要約ニューステーブル)
  - RLS (Row Level Security) ポリシーの記述（ユーザーごとの自分データの読み書き制御）

### Task 1.5: ユーザー認証 (Auth) UI と処理の実装
- [x] ログイン / ユーザー登録画面 (`app/login/page.tsx`) の作成
- [x] Auth 認証コンテキスト / フック (`hooks/useAuth.ts`) の作成
- [x] ログインガード (保護ルートリダイレクト: `app/page.tsx`, `app/dashboard/page.tsx`) の設定

---

## 完了条件
1. Supabase テーブル (`favorites`, `news`) が SQL Migration で正しく構築されること。 -> **達成 (`001_initial_schema.sql` 作成完了)**
2. ユーザーがログイン・新規登録し、認証セッションが保持されること。 -> **達成 (`/login` 画面 ＆ `useAuth` 実装完了)**
