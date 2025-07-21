import { v4 as uuidv4 } from 'uuid';
import { 
  MemorySystem as IMemorySystem,
  MemoryEntry, 
  MemoryQuery, 
  MemoryStorage,
  MemoryConfig,
  MemoryType,
  AgentId
} from '../../types/memory';

/**
 * Default Memory System implementation
 */
export class MemorySystem implements IMemorySystem {
  private storage: MemoryStorage;
  private initialized = false;
  
  constructor(
    private config: MemoryConfig,
    storage?: MemoryStorage
  ) {
    // Use provided storage or create default in-memory storage
    this.storage = storage || new Map() as any;
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    // Initialize storage if it has an initialize method
    if (typeof (this.storage as any).initialize === 'function') {
      await (this.storage as any).initialize();
    }
    
    this.initialized = true;
  }
  
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    
    // Cleanup if storage has a shutdown method
    if (typeof (this.storage as any).shutdown === 'function') {
      await (this.storage as any).shutdown();
    }
    
    this.initialized = false;
  }
  
  async store(entry: MemoryEntry): Promise<string> {
    this.ensureInitialized();
    
    // Generate ID if not provided
    if (!entry.id) {
      entry.id = uuidv4();
    }
    
    // Set default values
    entry.timestamp = entry.timestamp || new Date();
    entry.accessCount = entry.accessCount || 0;
    entry.version = entry.version || 1;
    
    await this.storage.set(entry.id, entry);
    
    // Check if we need to evict old entries
    await this.performEvictionIfNeeded();
    
    return entry.id;
  }
  
  async retrieve(id: string): Promise<MemoryEntry | null> {
    this.ensureInitialized();
    
    const entry = await this.storage.get(id);
    if (!entry) {
      return null;
    }
    
    // Update access information
    entry.accessCount++;
    entry.lastAccessed = new Date();
    await this.storage.set(id, entry);
    
    return entry;
  }
  
  async update(id: string, updates: Partial<MemoryEntry>): Promise<void> {
    this.ensureInitialized();
    
    const existing = await this.storage.get(id);
    if (!existing) {
      throw new Error(`Memory entry with id ${id} not found`);
    }
    
    const updated = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      timestamp: new Date()
    };
    
    await this.storage.set(id, updated);
  }
  
  async delete(id: string): Promise<void> {
    this.ensureInitialized();
    
    await this.storage.delete(id);
  }
  
  async search(query: MemoryQuery): Promise<MemoryEntry[]> {
    this.ensureInitialized();
    
    const allKeys = await this.storage.keys();
    const results: MemoryEntry[] = [];
    
    for (const key of allKeys) {
      const entry = await this.storage.get(key);
      if (!entry) continue;
      
      if (this.matchesQuery(entry, query)) {
        results.push(entry);
      }
    }
    
    // Sort results
    this.sortResults(results, query);
    
    // Apply pagination
    const start = query.offset || 0;
    const end = query.limit ? start + query.limit : results.length;
    
    return results.slice(start, end);
  }
  
  async findSimilar(entry: MemoryEntry, limit = 10): Promise<MemoryEntry[]> {
    this.ensureInitialized();
    
    // Simple similarity based on tags and type
    const results: Array<{ entry: MemoryEntry; score: number }> = [];
    
    const allKeys = await this.storage.keys();
    for (const key of allKeys) {
      const candidate = await this.storage.get(key);
      if (!candidate || candidate.id === entry.id) continue;
      
      const score = this.calculateSimilarity(entry, candidate);
      if (score > 0) {
        results.push({ entry: candidate, score });
      }
    }
    
    // Sort by similarity score
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, limit).map(r => r.entry);
  }
  
  async getByTag(tag: string): Promise<MemoryEntry[]> {
    return this.search({ tags: [tag] });
  }
  
  async getByAgent(agentId: AgentId): Promise<MemoryEntry[]> {
    return this.search({ agentId });
  }
  
  async getByType(type: MemoryType): Promise<MemoryEntry[]> {
    return this.search({ type });
  }
  
  async cleanup(): Promise<void> {
    this.ensureInitialized();
    
    const allKeys = await this.storage.keys();
    const now = new Date();
    
    for (const key of allKeys) {
      const entry = await this.storage.get(key);
      if (!entry) continue;
      
      // Remove expired entries
      if (entry.expiresAt && entry.expiresAt < now) {
        await this.storage.delete(key);
      }
    }
  }
  
  async compress(): Promise<void> {
    this.ensureInitialized();
    
    // Implementation would compress memory entries
    // For now, just perform cleanup
    await this.cleanup();
  }
  
  async backup(): Promise<string> {
    this.ensureInitialized();
    
    const allKeys = await this.storage.keys();
    const entries: MemoryEntry[] = [];
    
    for (const key of allKeys) {
      const entry = await this.storage.get(key);
      if (entry) {
        entries.push(entry);
      }
    }
    
    return JSON.stringify({
      version: '1.0',
      timestamp: new Date().toISOString(),
      entries
    });
  }
  
  async restore(backupData: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      const backup = JSON.parse(backupData);
      
      if (!backup.entries || !Array.isArray(backup.entries)) {
        throw new Error('Invalid backup format');
      }
      
      // Clear existing data
      await this.storage.clear();
      
      // Restore entries
      for (const entry of backup.entries) {
        await this.storage.set(entry.id, entry);
      }
      
    } catch (error) {
      throw new Error(`Failed to restore backup: ${error}`);
    }
  }
  
  // Private methods
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('MemorySystem not initialized');
    }
  }
  
  private matchesQuery(entry: MemoryEntry, query: MemoryQuery): boolean {
    // Text search
    if (query.text) {
      const searchText = query.text.toLowerCase();
      const content = JSON.stringify(entry.content).toLowerCase();
      if (!content.includes(searchText)) {
        return false;
      }
    }
    
    // Tag search
    if (query.tags && query.tags.length > 0) {
      const hasAnyTag = query.tags.some(tag => 
        entry.tags.includes(tag)
      );
      if (!hasAnyTag) {
        return false;
      }
    }
    
    // Agent filter
    if (query.agentId && entry.agentId !== query.agentId) {
      return false;
    }
    
    // Type filter
    if (query.type && entry.type !== query.type) {
      return false;
    }
    
    // Accessibility filter
    if (query.accessibility && entry.accessibility !== query.accessibility) {
      return false;
    }
    
    // Importance range
    if (query.minImportance !== undefined && entry.importance < query.minImportance) {
      return false;
    }
    if (query.maxImportance !== undefined && entry.importance > query.maxImportance) {
      return false;
    }
    
    // Date range
    if (query.dateRange) {
      if (entry.timestamp < query.dateRange.start || entry.timestamp > query.dateRange.end) {
        return false;
      }
    }
    
    // Expired entries
    if (!query.includeExpired && entry.expiresAt && entry.expiresAt < new Date()) {
      return false;
    }
    
    return true;
  }
  
  private sortResults(results: MemoryEntry[], query: MemoryQuery): void {
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';
    
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'importance':
          comparison = a.importance - b.importance;
          break;
        case 'confidence':
          comparison = (a as any).confidence - (b as any).confidence;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }
  
  private calculateSimilarity(entry1: MemoryEntry, entry2: MemoryEntry): number {
    let score = 0;
    
    // Type similarity
    if (entry1.type === entry2.type) {
      score += 0.3;
    }
    
    // Tag similarity
    const commonTags = entry1.tags.filter(tag => entry2.tags.includes(tag));
    score += (commonTags.length / Math.max(entry1.tags.length, entry2.tags.length)) * 0.4;
    
    // Agent similarity
    if (entry1.agentId === entry2.agentId) {
      score += 0.2;
    }
    
    // Accessibility similarity
    if (entry1.accessibility === entry2.accessibility) {
      score += 0.1;
    }
    
    return score;
  }
  
  private async performEvictionIfNeeded(): Promise<void> {
    if (!this.config.maxEntries) {
      return;
    }
    
    const currentSize = (await this.storage.keys()).length;
    if (currentSize <= this.config.maxEntries) {
      return;
    }
    
    // Simple eviction: remove oldest entries first
    const allKeys = await this.storage.keys();
    const entries: Array<{ key: string; entry: MemoryEntry }> = [];
    
    for (const key of allKeys) {
      const entry = await this.storage.get(key);
      if (entry) {
        entries.push({ key, entry });
      }
    }
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a.entry.timestamp.getTime() - b.entry.timestamp.getTime());
    
    // Remove excess entries
    const toRemove = currentSize - this.config.maxEntries;
    for (let i = 0; i < toRemove; i++) {
      await this.storage.delete(entries[i].key);
    }
  }
}