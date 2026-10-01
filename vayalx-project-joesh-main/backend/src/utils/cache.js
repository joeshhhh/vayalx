/**
 * VAYALX - In-memory Cache Service
 */
class Cache {
  constructor(maxItems = 1000) {
    this.cache = new Map();
    this.maxItems = maxItems;
  }

  set(key, value, ttlMs) {
    if (this.cache.size >= this.maxItems) {
      // Basic cleanup: remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt, createdAt: Date.now() });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = new Cache();
