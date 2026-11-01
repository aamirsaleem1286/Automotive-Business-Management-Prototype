type Entry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Entry>();

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 15 * 60 * 1000
) {
  const now = Date.now();

  if (buckets.size > 5_000) {
    for (const [bucketKey, entry] of buckets) {
      if (entry.resetAt < now) buckets.delete(bucketKey);
    }
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  return {
    ok: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfter: 0,
  };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
