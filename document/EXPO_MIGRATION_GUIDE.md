# Expo (React Native) スマホアプリへの移植ガイドライン

本ドキュメントは、「推しニュース」Web版の Supabase バックエンドおよび AI ロジックを活用し、将来的に **Expo (React Native)** を用いた iOS / Android アプリを構築・移植するためのアーキテクチャガイドラインです。

---

## 1. 全体アーキテクチャとバックエンド共有方針

Web版（Next.js）とスマートフォンアプリ版（Expo）は、同一の **Supabase プロジェクト** および **Gemini API パイプライン** を共有します。

```
                    ┌─────────────────────────┐
                    │ Supabase (Postgres/Auth)│
                    └────────────▲────────────┘
                                 │ (共通DB / RLS)
            ┌────────────────────┴────────────────────┐
            │                                         │
┌──────────────────────┐                  ┌──────────────────────┐
│  Next.js (Web版)     │                  │ Expo (React Native)  │
│  - App Router        │                  │ - iOS / Android      │
│  - Tailwind CSS      │                  │ - React Native Paper │
└──────────────────────┘                  └──────────────────────┘
```

---

## 2. Supabase Client の Expo への組み込み手順

### (1) パッケージのインストール (Expo 側)
```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

### (2) Supabase クライアント初期化 (`lib/supabase.ts` for Expo)
```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 3. Web版コンポーネントと Expo コンポーネントのマッピング

Web版のロジック層（`services/apiClient.ts`, `hooks/useFavorites.ts`, `hooks/useNews.ts`）はそのまま React Native でも再利用可能です。UIコンポーネントのみ React Native 標準コンポーネントにマッピングします。

| Web (Next.js / React) | Expo (React Native) 対応コンポーネント |
|---|---|
| `<FavoriteTabs />` | `ScrollView (horizontal)` または `react-native-tab-view` |
| `<NewsCard />` | `<Card />` (React Native Paper) ＋ `<Text />` |
| `<AddFavoriteModal />` | `<Modal />` または `react-native-modal` |
| 外部記事リンク | `expo-web-browser` (`WebBrowser.openBrowserAsync(url)`) |
| プッシュ通知 | `expo-notifications` (毎朝 5:00 の更新通知用) |

---

## 4. Expo 移植時の推奨ステップ

1. **ステップ 1:** `npx create-expo-app --template typescript` でプロジェクト作成。
2. **ステップ 2:** 本リポジトリの `types/database.ts` および `services/apiClient.ts` をコピー。
3. **ステップ 3:** `expo-web-browser` を用いて、ニュースカードからの In-App Browser 閲覧を実装。
4. **ステップ 4:** `expo-notifications` を設定し、Supabase Edge Functions / GitHub Actions から毎朝の Push 通知を端末へ配信。
