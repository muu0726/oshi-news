import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveOfficialSnsAccounts } from '@/lib/services/sns-resolver';

// GET: ログイン中のユーザーの推しリストを取得 (未補完のSNSアカウントがあれば自動補完)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (favorites && favorites.length > 0) {
      // SNS 情報が空の登録済み推しがあれば自動補完
      const enrichedFavorites = await Promise.all(
        favorites.map(async (fav) => {
          let sns = fav.social_accounts || {};
          if (!sns.x_handle && !sns.instagram_handle && !sns.youtube_channel_id) {
            sns = await resolveOfficialSnsAccounts(fav.name);
            if (sns.x_handle || sns.instagram_handle || sns.youtube_channel_id) {
              await supabase
                .from('favorites')
                .update({ social_accounts: sns })
                .eq('id', fav.id);
            }
          }
          return {
            ...fav,
            social_accounts: sns,
          };
        })
      );
      return NextResponse.json({ favorites: enrichedFavorites });
    }

    return NextResponse.json({ favorites: [] });
  } catch (error: any) {
    console.error('GET /api/favorites Error:', error);
    return NextResponse.json({ error: error.message || '推しリストの取得に失敗しました' }, { status: 500 });
  }
}

// POST: 推し人物を新規登録 (SNSアカウントの自動解決統合)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, category_or_group, official_url, image_url, social_accounts, keywords } = body;

    if (!name) {
      return NextResponse.json({ error: '名前は必須項目です' }, { status: 400 });
    }

    let finalSocial = social_accounts || {};
    if (!finalSocial.x_handle && !finalSocial.instagram_handle && !finalSocial.youtube_channel_id) {
      finalSocial = await resolveOfficialSnsAccounts(name);
    }

    const { data: inserted, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        name,
        type: type || 'person',
        category_or_group: category_or_group || '',
        official_url: official_url || null,
        image_url: image_url || null,
        social_accounts: finalSocial,
        keywords: Array.isArray(keywords) ? keywords : [name],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ favorite: inserted });
  } catch (error: any) {
    console.error('POST /api/favorites Error:', error);
    return NextResponse.json({ error: error.message || '推しの登録に失敗しました' }, { status: 500 });
  }
}

// DELETE: 指定した推し人物を削除
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '削除対象のIDが指定されていません' }, { status: 400 });
    }

    // 1. 関連する集約ニュースを削除
    await supabase
      .from('news')
      .delete()
      .eq('favorite_id', id);

    // 2. 推し人物を削除
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/favorites Error:', error);
    return NextResponse.json({ error: error.message || '推しの削除に失敗しました' }, { status: 500 });
  }
}
