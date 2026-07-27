import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '推しニュース | 最新の推し情報を毎朝AIが自動集約',
  description: '登録したアイドル・インフルエンサーなどの最新ニュースを自動収集し、AIによる3行要約で一括閲覧できるWebアプリケーション',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
