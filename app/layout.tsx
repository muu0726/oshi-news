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
      <body className="antialiased font-sans text-slate-100 bg-[#090d16] selection:bg-blue-500 selection:text-white relative min-h-screen overflow-x-hidden">
        {/* 背景のダイナミック・アンビエントオーラ光彩 */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[180px] pointer-events-none -z-10" />

        {children}
      </body>
    </html>
  );
}
