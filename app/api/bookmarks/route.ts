import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: ログイン中のユーザーのブックマーク一覧を取得
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ bookmarks: bookmarks || [] });
  } catch (error: any) {
    console.error('GET /api/bookmarks Error:', error);
    return NextResponse.json({ error: error.message || 'ブックマークの取得に失敗しました' }, { status: 500 });
  }
}

// POST: ニュース記事をブックマーク保存
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { news_id, title, url, source, summary, published_at } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'タイトルおよびURLは必須です' }, { status: 400 });
    }

    const { data: inserted, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        news_id: news_id || null,
        title,
        url,
        source: source || null,
        summary: summary || '',
        published_at: published_at || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ bookmark: inserted });
  } catch (error: any) {
    console.error('POST /api/bookmarks Error:', error);
    return NextResponse.json({ error: error.message || 'ブックマークの保存に失敗しました' }, { status: 500 });
  }
}

// DELETE: 指定した URL または ID のブックマークを解除
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const id = searchParams.get('id');

    if (!url && !id) {
      return NextResponse.json({ error: '削除対象の URL または ID が指定されていません' }, { status: 400 });
    }

    let query = supabase.from('bookmarks').delete().eq('user_id', user.id);
    if (id) {
      query = query.eq('id', id);
    } else if (url) {
      query = query.eq('url', url);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/bookmarks Error:', error);
    return NextResponse.json({ error: error.message || 'ブックマークの削除に失敗しました' }, { status: 500 });
  }
}
