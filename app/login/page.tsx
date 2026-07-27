'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Mail, Lock, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setSuccessMsg('アカウントを登録しました！ダッシュボードへ移動します。');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1000);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || '認証処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-[32px] p-8 sm:p-10 shadow-xl shadow-slate-200/60 relative overflow-hidden animate-fadeIn">
        
        {/* ヘッダーブランド */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-3 shadow-md shadow-blue-500/20">
            <Sparkles className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            推しニュース
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            推しの最新情報を毎朝AIが自動集約 ＆ 3行要約
          </p>
        </div>

        {/* タブ切替 (ログイン / 新規登録) */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl mb-6 font-bold text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2.5 rounded-xl transition-all duration-200 ${
              !isSignUp
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2.5 rounded-xl transition-all duration-200 ${
              isSignUp
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            新規登録
          </button>
        </div>

        {/* アラート表示 */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-600 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-700 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{successMsg}</span>
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 pl-1">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 pl-1">
              パスワード
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                無料でアカウント作成
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                ログイン
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400 mt-6">
          登録することで、プライバシーポリシーと利用規約に同意したことになります。
        </p>
      </div>
    </div>
  );
}
