import { describe, it, expect, vi } from 'vitest';
import { identifyFavoriteCandidates } from '@/lib/ai/identify-favorite';

// Supabase クライアントのモック
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: () => ({
      select: () => ({
        or: () => ({
          limit: () => Promise.resolve({ data: [] }),
          eq: () => ({
            limit: () => Promise.resolve({ data: [] }),
          }),
        }),
      }),
      upsert: () => Promise.resolve({ error: null }),
    }),
  }),
}));

// Gemini クライアントのモック
vi.mock('@/lib/gemini', () => ({
  getGeminiClient: () => null,
}));

// SNS Resolver のモック
vi.mock('@/lib/services/sns-resolver', () => ({
  resolveOfficialSnsAccounts: vi.fn().mockResolvedValue({
    x_handle: null,
    instagram_handle: null,
    youtube_channel_id: null,
  }),
}));

describe('identifyFavoriteCandidates', () => {
  it('空またはスペースのみのクエリで空配列を返すこと', async () => {
    const result = await identifyFavoriteCandidates('   ');
    expect(result).toEqual([]);
  });

  it('Wikipedia フォールバックで候補が生成されること', async () => {
    const query = 'テスト有名人';
    const result = await identifyFavoriteCandidates(query);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBeDefined();
  });
});
