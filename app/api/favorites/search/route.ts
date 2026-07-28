import { NextResponse } from 'next/server';
import { identifyFavoriteCandidates } from '@/lib/ai/identify-favorite';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const query = body.query || '';
    const type = body.type || 'all'; // 'all' | 'person' | 'group'

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: '検索キーワードが指定されていません' }, { status: 400 });
    }

    const candidates = await identifyFavoriteCandidates(query, type);
    return NextResponse.json({ candidates });
  } catch (error: any) {
    console.error('API Error in /api/favorites/search:', error);
    return NextResponse.json({ error: '候補の検索中にエラーが発生しました' }, { status: 500 });
  }
}
