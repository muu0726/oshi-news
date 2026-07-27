# Phase 4: バックエンド：ニュース自動取得・AIパイプライン & Cron自動化

## 概要
毎朝 5:00 に登録済みの全人物について、Google News RSS や公式HPから最新ニュース・更新情報を自動取得し、Gemini API を使って「同姓同名判定・ノイズ除去」を行った上で「3行要約」を生成し、Supabase データベースへ保存する全自動パイプラインを構築します。

---

## サブタスク一覧

### Task 4.1: ニュース収集モジュールの実装
- [x] `lib/services/news-fetcher.ts` の作成
- [x] **A. Google News RSS 収集機能:** `rss-parser` を用いた検索クエリ `"[名前]" + "[キーワード/所属]"` の直近フィード解析
- [x] **B. 公式HP / 事務所ページ巡回機能:** `official_url` 設定時の Jina Reader (`https://r.jina.ai/[official_url]`) 連携

### Task 4.2: Gemini AI 同姓同名判定・フィルタリング
- [x] `lib/ai/filter-news.ts` の作成
- [x] Gemini API (`gemini-2.5-flash`) を呼び出し、記事タイトル・文脈と `category_or_group` / `keywords` を照合
- [x] 同姓同名の別人ニュースや無関係なノイズを自動除外

### Task 4.3: Gemini AI 3行要約生成モジュール
- [x] `lib/ai/summarize-news.ts` の作成
- [x] 本人ニュースについて、Gemini API (`gemini-2.5-flash`) でスマホ画面で読みやすい「最大3行（箇条書き）」の要約文を生成

### Task 4.4: DB保存 ＆ 重複防止制御
- [x] `lib/services/news-storage.ts` の作成
- [x] 同一 URL や同一タイトルの重複登録を排除して Supabase `news` テーブルへ保存

### Task 4.5: バッチ処理エントリーポイントの作成
- [x] `/api/cron/daily-news` (GET/POST) Cron 実行用 API Route
- [x] `CRON_SECRET` 認証保護 ＆ ダッシュボードからの手動「今すぐニュース取得」機能の実装

### Task 4.6: GitHub Actions 毎朝 Cron ワークフローの設定
- [x] `.github/workflows/daily-news-cron.yml` の作成
- [x] 毎朝 5:00 JST (`0 20 * * *` UTC) の定時自動実行設定

---

## 完了条件
1. 手動実行または API リクエストにより、ニュース取得 -> 同姓同名判定 -> 3行要約 -> DB保存 の一連の処理がエラーなく完了すること。 -> **達成 (`/api/cron/daily-news` 実装完了)**
2. GitHub Actions により毎朝 5:00 に自動実行され、`news` テーブルが更新されること。 -> **達成 (`daily-news-cron.yml` ワークフロー作成完了)**
