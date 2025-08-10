const map = new Map();

export function acquire(key, ttlMs = 30 * 60 * 1000) {
  const now = Date.now();
  const exp = map.get(key);
  if (exp && exp > now) return false;
  map.set(key, now + ttlMs);
  return true;
}

export function clear() {
  map.clear();
}
