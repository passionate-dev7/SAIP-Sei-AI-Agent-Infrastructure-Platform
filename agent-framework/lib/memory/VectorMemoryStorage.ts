import { 
  VectorMemoryStorage as IVectorMemoryStorage,
  VectorSearchResult,
  MemoryStorage 
} from '../../types/memory';

/**
 * Simple vector memory storage implementation
 * In production, you'd want to use a proper vector database like Pinecone, Weaviate, etc.
 */
export class VectorMemoryStorage implements IVectorMemoryStorage {
  private vectors: Map<string, { vector: number[]; metadata?: any }> = new Map();
  private storage: Map<string, any> = new Map();
  
  constructor(private dimension: number = 384) {}
  
  // Standard storage methods
  async get(key: string): Promise<any> {
    return this.storage.get(key) || null;
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.storage.set(key, value);
    
    if (ttl && ttl > 0) {
      setTimeout(() => {
        this.storage.delete(key);
        this.vectors.delete(key);
      }, ttl * 1000);
    }
  }
  
  async delete(key: string): Promise<void> {
    this.storage.delete(key);
    this.vectors.delete(key);
  }
  
  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }
  
  async keys(pattern?: string): Promise<string[]> {
    const allKeys = Array.from(this.storage.keys());
    
    if (!pattern) {
      return allKeys;
    }
    
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return allKeys.filter(key => regex.test(key));
  }
  
  async clear(): Promise<void> {
    this.storage.clear();
    this.vectors.clear();
  }
  
  async size(): Promise<number> {
    return this.storage.size;
  }
  
  // Vector-specific methods
  async addVector(id: string, vector: number[], metadata?: any): Promise<void> {
    if (vector.length !== this.dimension) {
      throw new Error(`Vector dimension mismatch. Expected ${this.dimension}, got ${vector.length}`);
    }
    
    this.vectors.set(id, { vector, metadata });
  }
  
  async searchSimilar(vector: number[], k: number, filter?: any): Promise<VectorSearchResult[]> {
    if (vector.length !== this.dimension) {
      throw new Error(`Vector dimension mismatch. Expected ${this.dimension}, got ${vector.length}`);
    }
    
    const similarities: Array<{ id: string; score: number; metadata?: any }> = [];
    
    for (const [id, data] of this.vectors.entries()) {
      // Apply filter if provided
      if (filter && !this.matchesFilter(data.metadata, filter)) {
        continue;
      }
      
      const similarity = this.cosineSimilarity(vector, data.vector);
      similarities.push({
        id,
        score: similarity,
        metadata: data.metadata
      });
    }
    
    // Sort by similarity score (descending)
    similarities.sort((a, b) => b.score - a.score);
    
    return similarities.slice(0, k);
  }
  
  async updateVector(id: string, vector: number[], metadata?: any): Promise<void> {
    if (!this.vectors.has(id)) {
      throw new Error(`Vector with id ${id} not found`);
    }
    
    if (vector.length !== this.dimension) {
      throw new Error(`Vector dimension mismatch. Expected ${this.dimension}, got ${vector.length}`);
    }
    
    this.vectors.set(id, { vector, metadata });
  }
  
  async deleteVector(id: string): Promise<void> {
    this.vectors.delete(id);
  }
  
  getDimension(): number {
    return this.dimension;
  }
  
  // Private helper methods
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  private matchesFilter(metadata: any, filter: any): boolean {
    if (!metadata || !filter) {
      return true;
    }
    
    for (const [key, value] of Object.entries(filter)) {
      if (metadata[key] !== value) {
        return false;
      }
    }
    
    return true;
  }
}