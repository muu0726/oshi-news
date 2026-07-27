import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: ログイン中のユーザーの推しリストを取得
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

    return NextResponse.json({ favorites: favorites || [] });
  } catch (error: any) {
    console.error('GET /api/favorites Error:', error);
    return NextResponse.json({ error: error.message || '推しリストの取得に失敗しました' }, { status: 500 });
  }
}

// POST: 推し人物を新規登録
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { name, category_or_group, official_url, keywords } = body;

    if (!name) {
      return NextResponse.json({ error: '名前は必須項目です' }, { status: 400 });
    }

    const { data: inserted, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        name,
        category_or_group: category_or_group || '',
        official_url: official_url || null,
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
