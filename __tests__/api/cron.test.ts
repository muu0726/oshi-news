import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/cron/daily-news/route';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
    }),
  }),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
    }),
  }),
}));

describe('/api/cron/daily-news API', () => {
  it('認証なしのリクエストに対し 401 を返すこと', async () => {
    const req = new Request('http://localhost:3000/api/cron/daily-news');
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('認証エラー');
  });

  it('正しい Bearer トークン指定で正常レスポンスを返すこと', async () => {
    const originalSecret = process.env.CRON_SECRET;
    process.env.CRON_SECRET = 'test-secret';

    const req = new Request('http://localhost:3000/api/cron/daily-news', {
      headers: {
        authorization: 'Bearer test-secret',
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    process.env.CRON_SECRET = originalSecret;
  });
});
