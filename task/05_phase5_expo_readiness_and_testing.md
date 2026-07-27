# Phase 5: Expo移植準備・リファクタリング・最終検証

## 概要
将来的な Expo (React Native) による iOS / Android スマートフォンアプリ移植を見据え、ロジック層を Next.js から独立・抽出します。また、セキュリティ（RLS）検証、ドキュメントの最終更新を行いました。

---

## サブタスク一覧

### Task 5.1: アーキテクチャ分離・リファクタリング
- [x] API呼び出し・データクエリ・AIロジックを Next.js から独立した共通サービスモジュール (`services/apiClient.ts`) に再構成
- [x] Expo (React Native) アプリ側でそのまま再利用できるカスタムフック (`hooks/useFavorites.ts`, `hooks/useNews.ts`) への整理

### Task 5.2: 構造化機能検証 ＆ ビルドチェック
- [x] `npm run build` による TypeScript 型チェック ＆ 全ページプリレンダリング通過

### Task 5.3: セキュリティ ＆ RLS ポリシーの最終検証
- [x] Supabase RLS (Row Level Security) の検証: 認証ユーザーのみが自身のデータにアクセスできる設定の確認
- [x] `.env.local` 秘密情報保護の確認 (`.gitignore` の追加 ＆ クラウド環境変数の保護方針記述)

### Task 5.4: ドキュメントの最終更新
- [x] `README.md` の作成 (セットアップ手順, 環境変数, GitHub Actions 設定)
- [x] `document/EXPO_MIGRATION_GUIDE.md` (将来の Expo 移植手順・バックエンド共有方法のドキュメント) の作成

### Task 5.5: 全体動作検証
- [x] 新規ユーザー登録 -> 人物検索・同定 -> ニュース自動取得・3行要約 -> ニュースカード表示の一連フローの検証完了

---

## 完了条件
1. データ取得・AI処理ロジックが Next.js に過度に依存せず、Expo (React Native) に移植容易な構造になっていること。 -> **達成 (`services/apiClient.ts` 実装完了)**
2. `npm run build` によるビルドがエラーゼロで完了すること。 -> **達成 (静的プリレンダリング通過)**
3. `README.md` および Expo 移植ガイドが整備され、プロジェクトが完結すること。 -> **達成 (`README.md`, `EXPO_MIGRATION_GUIDE.md` 作成完了)**
