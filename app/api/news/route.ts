import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: 指定した favorite_id に紐づくニュース一覧を取得
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get('favorite_id');

    if (!favoriteId) {
      return NextResponse.json({ error: 'favorite_id が指定されていません' }, { status: 400 });
    }

    // RLS ポリシーにより自分の推しのニュースのみ取得可能
    const { data: newsList, error } = await supabase
      .from('news')
      .select('*')
      .eq('favorite_id', favoriteId)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ news: newsList || [] });
  } catch (error: any) {
    console.error('GET /api/news Error:', error);
    return NextResponse.json({ error: error.message || 'ニュースの取得に失敗しました' }, { status: 500 });
  }
}
