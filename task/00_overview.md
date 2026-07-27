# Webアプリケーション「推しニュース」開発ロードマップ・全体概要

## 1. プロジェクト概要
登録した人物（アイドル・インフルエンサー・芸能人等）ごとに動的なタブが生成され、毎朝その人物に関する最新ニュースおよび公式更新情報を自動集約・AI要約して閲覧できるWebアプリケーション「推しニュース」のプロトタイプ構築プロジェクトです。

将来的には **Expo (React Native) を用いたスマホアプリ (iOS / Android) への移植** および Supabase バックエンドの共有を前提とした拡張性の高いアーキテクチャで設計します。

---

## 2. システム構成・技術スタック

- **Front-end:** Next.js (App Router, TypeScript, Tailwind CSS)
- **UI Component / Icons:** Lucide Icons (モバイルUI/スワイプ操作対応)
- **Back-end / DB:** Supabase (Auth, PostgreSQL, Row Level Security)
- **AI Engine:** Gemini API (`gemini-2.5-flash`, `@google/genai` SDK)
- **Automation / Cron:** GitHub Actions (毎朝 5:00 JST 自動バッチ)
- **Data Source:** Google News RSS + 公式HP/所属事務所ページ巡回スクレイピング/検索API

---

## 3. データベース設計概要

```
[ users ] (Supabase Auth)
   │ 1
   │ N
[ favorites ] (推し人物マスター)
   │ ── id (UUID, PK)
   │ ── user_id (UUID, FK -> users.id)
   │ ── name (Text) - 表示名
   │ ── category_or_group (Text) - 肩書・所属
   │ ── official_url (Text) - 公式HP/ブログ等 (任意)
   │ ── keywords (Text[]) - ノイズカット・表記揺れキーワード
   │ ── created_at (Timestamp)
   │ 1
   │ N
[ news ] (集約・要約済みニュース)
     ── id (UUID, PK)
     ── favorite_id (UUID, FK -> favorites.id)
     ── title (Text) - ニュース/記事タイトル
     ── url (Text) - 元記事URL
     ── source (Text) - 出典メディア名/公式名
     ── summary (Text) - AIによる3行要約
     ── published_at (Timestamp) - 発行/取得日時
     ── created_at (Timestamp)
```

---

## 4. フェーズ別開発ロードマップ

| Phase | フェーズ名 | 主要成果物・目的 | ステータス |
|---|---|---|---|
| **Phase 1** | **環境構築・DB設計・ユーザー認証** | Next.js環境構築、Supabase設定、SQL Migration、Auth認証画面 | **完了** |
| **Phase 2** | **推し登録機能 & Gemini AI同定** | Gemini API人物同定、候補選択モーダル、Favoritesテーブル保存 | **完了** |
| **Phase 3** | **メインダッシュボード & ニュースUI** | 動的タブ切替、ニュースカード表示（3行要約付き）、レスポンシブUI | **完了** |
| **Phase 4** | **自動取得・AIパイプライン & Cron** | RSS/公式巡回、Gemini同姓同名判定＋3行要約、GitHub Actions毎朝バッチ | **完了** |
| **Phase 5** | **Expo移植準備・テスト・最終検証** | 独立ロジックリファクタリング、テスト作成、セキュリティ/RLS確認 | **完了** |

---

## 5. タスク進捗チェックリスト

- [x] **Phase 1:** [01_phase1_environment_and_db.md](file:///c:/A_mainfile/SiteCode/%E6%8E%A8%E3%81%97%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B9/task/01_phase1_environment_and_db.md)
- [x] **Phase 2:** [02_phase2_fav_registration_ai.md](file:///c:/A_mainfile/SiteCode/%E6%8E%A8%E3%81%97%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B9/task/02_phase2_fav_registration_ai.md)
- [x] **Phase 3:** [03_phase3_dashboard_ui.md](file:///c:/A_mainfile/SiteCode/%E6%8E%A8%E3%81%97%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B9/task/03_phase3_dashboard_ui.md)
- [x] **Phase 4:** [04_phase4_news_pipeline_cron.md](file:///c:/A_mainfile/SiteCode/%E6%8E%A8%E3%81%97%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B9/task/04_phase4_news_pipeline_cron.md)
- [x] **Phase 5:** [05_phase5_expo_readiness_and_testing.md](file:///c:/A_mainfile/SiteCode/%E6%8E%A8%E3%81%97%E3%83%8B%E3%83%A5%E3%83%BC%E3%82%B9/task/05_phase5_expo_readiness_and_testing.md)
