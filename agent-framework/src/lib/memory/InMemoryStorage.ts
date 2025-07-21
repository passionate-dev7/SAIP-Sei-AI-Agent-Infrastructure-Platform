import { MemoryStorage, MemoryEntry } from '../../types/memory';

/**
 * Simple in-memory storage implementation for memory entries
 */
export class InMemoryStorage implements MemoryStorage {
  private store: Map<string, any> = new Map();
  
  async get(key: string): Promise<any> {
    return this.store.get(key) || null;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.store.set(key, value);
    
    // Handle TTL if provided
    if (ttl && ttl > 0) {
      setTimeout(() => {
        this.store.delete(key);
      }, ttl * 1000);
    }
  }
  
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
  
  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }
  
  async keys(pattern?: string): Promise<string[]> {
    const allKeys = Array.from(this.store.keys());
    
    if (!pattern) {
      return allKeys;
    }
    
    // Simple pattern matching with wildcards
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return allKeys.filter(key => regex.test(key));
  }
  
  async clear(): Promise<void> {
    this.store.clear();
  }
  
  async size(): Promise<number> {
    return this.store.size;
  }
}