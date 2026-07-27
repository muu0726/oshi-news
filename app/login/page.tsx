'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Mail, Lock, LogIn, UserPlus, AlertCircle, CheckCircle2, Star } from 'lucide-react';

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

        setSuccessMsg('アカウントを登録しました！すぐにダッシュボードへ移動します。');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1200);
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      {/* メインカードコンテナ */}
      <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.6)] relative overflow-hidden animate-fadeIn">
        
        {/* 背景アクセントライト */}
        <div className="absolute -top-28 -left-28 w-56 h-56 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-56 h-56 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* ヘッダーブランド */}
        <div className="text-center mb-8 relative">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 animate-float">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <Star className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 fill-amber-300 animate-ping" style={{ animationDuration: '3s' }} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            推しニュース
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1.5">
            推しの最新情報を毎朝AIが自動集約 ＆ 3行要約
          </p>
        </div>

        {/* セグメントコントロール（ログイン / 新規登録） */}
        <div className="grid grid-cols-2 bg-slate-950/70 p-1.5 rounded-2xl mb-6 border border-white/5 relative">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
              !isSignUp
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
              isSignUp
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            新規アカウント作成
          </button>
        </div>

        {/* エラー / 成功アラート */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2.5 text-emerald-300 text-xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* 認証フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 pl-1">
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
                className="w-full bg-slate-950/70 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 pl-1">
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
                className="w-full bg-slate-950/70 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
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
                ログインして開始
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-500 mt-6">
          登録することで、プライバシーポリシーと利用規約に同意したことになります。
        </p>
      </div>
    </div>
  );
}
