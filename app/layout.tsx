import type { Metadata } from 'next';
import { Outfit, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '推しニュース | 最新の推し情報を毎朝AIが自動集約 ＆ 3行要約',
  description: '登録したアイドル・インフルエンサー・俳優などの最新ニュースを自動収集し、Gemini AIによる3行要約で一括閲覧できるWebアプリケーション',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${outfit.variable} ${notoSansJP.variable}`}>
      <body className="antialiased font-sans text-slate-800 bg-slate-50 selection:bg-blue-500 selection:text-white relative min-h-screen">
        {children}
      </body>
    </html>
  );
}
