import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { processNewsPipelineForFavorite } from '@/lib/services/news-storage';
import { Favorite } from '@/types/database';

export async function GET(request: Request) {
  return handleCronJob(request);
}

export async function POST(request: Request) {
  return handleCronJob(request);
}

async function handleCronJob(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    // 本番環境で CRON_SECRET が未設定の場合、安全のため即座に拒否
    if (process.env.NODE_ENV === 'production' && !secret) {
      console.error('CRON_SECRET is not configured in production environment.');
      return NextResponse.json({ error: 'サーバー設定エラー: CRON_SECRET が未設定です' }, { status: 500 });
    }

    const expectedSecret = secret || 'dev-secret';

    // 認証チェック (Cron シークレットヘッダーまたはパラメータ)
    const isAuthorized =
      authHeader === `Bearer ${expectedSecret}` ||
      searchParams.get('secret') === expectedSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: '認証エラー: 無効な Cron シークレットです' }, { status: 401 });
    }

    // Supabase クライアントの準備
    let supabase;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';

    if (serviceRoleKey) {
      // Admin (Service Role) クライアントで全ユーザーの favorites を一括取得
      supabase = createAdminClient(supabaseUrl, serviceRoleKey);
    } else {
      // 通常の Server クライアント
      supabase = await createServerClient();
    }

    // 登録されている推し人物一覧を取得
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('*');

    if (favError) throw favError;

    if (!favorites || favorites.length === 0) {
      return NextResponse.json({
        success: true,
        message: '登録されている推し人物が存在しませんでした',
        totalFavorites: 0,
        totalAdded: 0,
      });
    }

    let totalAdded = 0;
    const details = [];

    // 各推し人物ごとにニュース取得・AI判定・保存を実施
    for (const favorite of favorites as Favorite[]) {
      const result = await processNewsPipelineForFavorite(supabase, favorite);
      totalAdded += result.added;
      details.push({
        name: favorite.name,
        processed: result.processed,
        added: result.added,
      });
    }

    return NextResponse.json({
      success: true,
      message: '毎朝のニュース自動取得・AIパイプラインが正常に完了しました',
      totalFavorites: favorites.length,
      totalAdded,
      details,
    });
  } catch (error: any) {
    console.error('Cron job execution error:', error);
    return NextResponse.json(
      { error: error.message || 'ニュースパイプラインの実行中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
