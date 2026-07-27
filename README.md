# 推しニュース (Oshi News) 🌟

登録した人物（アイドル・インフルエンサー・俳優・VTuber等）ごとにタブが自動生成され、毎朝その人物に関する最新ニュースおよび公式更新情報を自動集約・AI要約して閲覧できる Web アプリケーションです。

将来的な **Expo (React Native) によるスマートフォンアプリ (iOS / Android) への移植** および Supabase バックエンドの共有を前提とした拡張性の高い設計になっています。

---

## 🚀 技術スタック

- **フロントエンド:** Next.js (App Router, TypeScript, Tailwind CSS v4)
- **UI / アイコン:** Lucide Icons (レスポンシブ ＆ スワイプ操作対応)
- **バックエンド / DB:** Supabase (Auth, PostgreSQL, Row Level Security)
- **AI エンジン:** Gemini API (`gemini-2.5-flash`, 公式 `@google/genai` SDK)
- **自動化 / Cron:** GitHub Actions (毎朝 5:00 JST 定時バッチ)
- **データソース:** Google News RSS ＋ 公式HP巡回 (Jina Reader 連携)

---

## 📁 ディレクトリ構造

```
推しニュース/
├── app/
│   ├── api/
│   │   ├── favorites/                 # 推し人物 CRUD ＆ Gemini 候補同定 API
│   │   ├── news/                      # ニュース取得 API
│   │   └── cron/daily-news/           # 毎朝ニュース自動取得バッチ API
│   ├── dashboard/                     # メインダッシュボード画面
│   └── login/                         # ログイン / 新規登録画面 (Supabase Auth)
├── components/
│   ├── AddFavoriteModal.tsx           # 推し追加モーダル (Gemini同定カード表示)
│   ├── FavoriteTabs.tsx               # 動的推しタブバー (スワイプ対応)
│   ├── NewsCard.tsx                   # 3行要約付きニュースカード UI
│   └── EmptyNewsState.tsx             # 未登録・更新待ち案内 UI
├── hooks/
│   ├── useAuth.ts                     # Supabase 認証セッション管理
│   ├── useFavorites.ts                # 推し一覧管理
│   └── useNews.ts                     # ニュース一覧管理
├── lib/
│   ├── ai/                            # Gemini API パイプライン (同定・判定・3行要約)
│   ├── services/                      # RSS取得・スクレイピング・DB保存サービス
│   └── supabase/                      # Supabase Client (Browser/Server)
├── services/
│   └── apiClient.ts                   # Expo(React Native)移植対応共通APIクライアント
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # DBテーブル ＆ RLS ポリシー作成 SQL
├── task/                              # フェーズ別タスク仕様書 (Phase 1〜5)
├── document/
│   ├── 初期プロンプト.md
│   └── EXPO_MIGRATION_GUIDE.md        # Expo (React Native) 移植ガイド
└── .github/
    └── workflows/
        └── daily-news-cron.yml        # 毎朝 5:00 Cron 自動実行ワークフロー
```

---

## 🛠️ ローカル開発環境のセットアップ

### 1. リポジトリのクローンと依存関係のインストール

```bash
git clone <repository-url>
cd 推しニュース
npm install
```

### 2. 環境変数 (.env.local) の設定

プロジェクト直下に `.env.local` を作成し、必要なキーを設定します（[.env.local.example](file:///c:/A_mainfile/SiteCode/%E6%8E%A8%E3%81%97%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B9/.env.local.example) 参照）：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
GEMINI_API_KEY=AIzaSy...
CRON_SECRET=your_custom_cron_secret
```

### 3. Supabase データベースのセットアップ

1. [Supabase Dashboard](https://supabase.com/dashboard) でプロジェクトを作成。
2. 「SQL Editor」を開き、[001_initial_schema.sql](file:///c:/A_mainfile/SiteCode/%E6%8E%A8%E3%81%97%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B9/supabase/migrations/001_initial_schema.sql) の内容を実行。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

---

## ⏰ 毎朝 5:00 の自動バッチ (Cron) 設定

GitHub Actions により、毎朝 5:00（JST）に自動実行されます：

1. GitHub リポジトリの **Settings > Secrets and variables > Actions** を開きます。
2. 以下の Secrets を追加します：
   - `APP_URL`: デプロイ先アプリの URL（例: `https://your-app.vercel.app`）
   - `CRON_SECRET`: `.env.local` で設定したシークレット文字列

---

## 📱 スマホアプリ (Expo) への移植

詳細な移植設計手順および Supabase バックエンドの共有方法については、[EXPO_MIGRATION_GUIDE.md](file:///c:/A_mainfile/SiteCode/%E6%8E%A8%E3%81%97%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B9/document/EXPO_MIGRATION_GUIDE.md) をご参照ください。
