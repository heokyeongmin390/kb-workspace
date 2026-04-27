"use server";

import { Redis } from '@upstash/redis'
import { Memo } from '@/types'

const getRedisClient = () => {
  // @vercel/kv 기본 환경변수를 우선 확인
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }
  // Upstash Marketplace 연동 환경변수 확인
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv()
  }
  return null;
}

export async function fetchMemosFromServer(isKbMode: boolean): Promise<{memos: Memo[], configured: boolean}> {
  const redis = getRedisClient();
  if (!redis) return { memos: [], configured: false };
  
  const key = isKbMode ? 'all-memos-kb' : 'all-memos-normal';
  try {
    const memos = await redis.get<Memo[]>(key);
    return { memos: memos || [], configured: true };
  } catch (error) {
    console.error('Error fetching memos:', error);
    return { memos: [], configured: true };
  }
}

export async function saveMemosToServer(memos: Memo[], isKbMode: boolean): Promise<{success: boolean, configured: boolean}> {
  const redis = getRedisClient();
  if (!redis) return { success: false, configured: false };

  const key = isKbMode ? 'all-memos-kb' : 'all-memos-normal';
  try {
    await redis.set(key, memos);
    return { success: true, configured: true };
  } catch (error) {
    console.error('Error saving memos:', error);
    return { success: false, configured: true };
  }
}
