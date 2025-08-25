import { AgentId } from './index';

// Memory System Types
export interface MemorySystem {
  // Core operations
  store(entry: MemoryEntry): Promise<string>;
  retrieve(id: string): Promise<MemoryEntry | null>;
  update(id: string, entry: Partial<MemoryEntry>): Promise<void>;
  delete(id: string): Promise<void>;
  
  // Query operations
  search(query: MemoryQuery): Promise<MemoryEntry[]>;
  findSimilar(entry: MemoryEntry, limit?: number): Promise<MemoryEntry[]>;
  getByTag(tag: string): Promise<MemoryEntry[]>;
  getByAgent(agentId: AgentId): Promise<MemoryEntry[]>;
  getByType(type: MemoryType): Promise<MemoryEntry[]>;
  
  // Maintenance operations
  cleanup(): Promise<void>;
  compress(): Promise<void>;
  backup(): Promise<string>;
  restore(backupData: string): Promise<void>;
  
  // Lifecycle
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

export interface MemoryEntry {
  id: string;
  agentId: AgentId;
  type: MemoryType;
  content: any;
  embedding?: number[];
  importance: number; // 0-1
  confidence: number; // 0-1
  accessibility: MemoryAccessibility;
  tags: string[];
  metadata: MemoryMetadata;
  timestamp: Date;
  expiresAt?: Date;
  lastAccessed?: Date;
  accessCount: number;
  version: number;
}

export enum MemoryType {
  EXPERIENCE = 'experience',
  KNOWLEDGE = 'knowledge',
  CONTEXT = 'context',
  RESULT = 'result',
  SKILL = 'skill',
  GOAL = 'goal',
  PLAN = 'plan',
  OBSERVATION = 'observation',
  HYPOTHESIS = 'hypothesis',
  CONCLUSION = 'conclusion'
}

export enum MemoryAccessibility {
  PRIVATE = 'private',
  SHARED = 'shared',
  PUBLIC = 'public',
  RESTRICTED = 'restricted'
}

export interface MemoryMetadata {
  source: string;
  category?: string;
  keywords?: string[];
  related?: string[];
  context?: any;
  validation?: {
    verified: boolean;
    confidence: number;
    source: string;
  };
  usage?: {
    count: number;
    lastUsed: Date;
    successRate: number;
  };
  [key: string]: any;
}

export interface MemoryQuery {
  text?: string;
  embedding?: number[];
  tags?: string[];
  agentId?: AgentId;
  type?: MemoryType;
  accessibility?: MemoryAccessibility;
  minImportance?: number;
  maxImportance?: number;
  minConfidence?: number;
  maxConfidence?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'importance' | 'confidence' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  includeExpired?: boolean;
}

// Specific Memory Types
export interface ExperienceMemory extends MemoryEntry {
  type: MemoryType.EXPERIENCE;
  content: {
    situation: string;
    action: string;
    result: string;
    outcome: 'success' | 'failure' | 'partial';
    learningPoints: string[];
  };
}

export interface KnowledgeMemory extends MemoryEntry {
  type: MemoryType.KNOWLEDGE;
  content: {
    fact: string;
    domain: string;
    references?: string[];
    proof?: string;
  };
}

export interface ContextMemory extends MemoryEntry {
  type: MemoryType.CONTEXT;
  content: {
    situation: string;
    variables: Record<string, any>;
    constraints: string[];
    goals: string[];
  };
}

export interface SkillMemory extends MemoryEntry {
  type: MemoryType.SKILL;
  content: {
    name: string;
    description: string;
    proficiency: number; // 0-1
    prerequisites: string[];
    applications: string[];
    examples: string[];
  };
}

// Memory Storage Backends
export interface MemoryStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  keys(pattern?: string): Promise<string[]>;
  clear(): Promise<void>;
  size(): Promise<number>;
}

export interface VectorMemoryStorage extends MemoryStorage {
  addVector(id: string, vector: number[], metadata?: any): Promise<void>;
  searchSimilar(vector: number[], k: number, filter?: any): Promise<VectorSearchResult[]>;
  updateVector(id: string, vector: number[], metadata?: any): Promise<void>;
  deleteVector(id: string): Promise<void>;
  getDimension(): number;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: any;
}

// Memory Strategies
export interface MemoryStrategy {
  shouldStore(entry: MemoryEntry): boolean;
  shouldRetain(entry: MemoryEntry): boolean;
  calculateImportance(entry: MemoryEntry): number;
  updateImportance(entry: MemoryEntry): number;
  selectForEviction(entries: MemoryEntry[], count: number): MemoryEntry[];
}

export interface ConsolidationStrategy {
  consolidate(entries: MemoryEntry[]): MemoryEntry[];
  merge(entry1: MemoryEntry, entry2: MemoryEntry): MemoryEntry;
  abstract(entries: MemoryEntry[]): MemoryEntry;
  generalize(entries: MemoryEntry[]): MemoryEntry;
}

// Working Memory
export interface WorkingMemory {
  capacity: number;
  current: MemoryEntry[];
  
  add(entry: MemoryEntry): boolean;
  remove(id: string): boolean;
  clear(): void;
  isFull(): boolean;
  getAvailableSpace(): number;
  prioritize(): void;
  refresh(id: string): boolean;
}

// Long-term Memory
export interface LongTermMemory {
  store(entry: MemoryEntry): Promise<void>;
  consolidate(): Promise<void>;
  archive(age: number): Promise<void>;
  recall(cue: any): Promise<MemoryEntry[]>;
  forget(criteria: any): Promise<void>;
}

// Episodic Memory
export interface EpisodicMemory {
  recordEpisode(episode: Episode): Promise<void>;
  getEpisode(id: string): Promise<Episode | null>;
  getEpisodesByTime(start: Date, end: Date): Promise<Episode[]>;
  getEpisodesByAgent(agentId: AgentId): Promise<Episode[]>;
  getEpisodesByContext(context: any): Promise<Episode[]>;
}

export interface Episode {
  id: string;
  agentId: AgentId;
  timestamp: Date;
  context: any;
  events: EpisodeEvent[];
  outcome: any;
  duration: number;
  importance: number;
}

export interface EpisodeEvent {
  timestamp: Date;
  type: string;
  description: string;
  data: any;
}

// Semantic Memory
export interface SemanticMemory {
  addConcept(concept: Concept): Promise<void>;
  getConcept(name: string): Promise<Concept | null>;
  getRelatedConcepts(name: string, depth?: number): Promise<Concept[]>;
  addRelation(from: string, to: string, type: string, strength?: number): Promise<void>;
  getRelations(concept: string): Promise<Relation[]>;
  inferRelations(): Promise<void>;
}

export interface Concept {
  name: string;
  description: string;
  category: string;
  attributes: Record<string, any>;
  examples: string[];
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Relation {
  from: string;
  to: string;
  type: string;
  strength: number;
  bidirectional: boolean;
  metadata?: any;
}

// Memory Analytics
export interface MemoryAnalytics {
  getTotalEntries(): Promise<number>;
  getEntriesByType(): Promise<Record<MemoryType, number>>;
  getEntriesByAgent(): Promise<Record<AgentId, number>>;
  getMemoryUsage(): Promise<MemoryUsageStats>;
  getAccessPatterns(): Promise<AccessPattern[]>;
  getRetentionStats(): Promise<RetentionStats>;
}

export interface MemoryUsageStats {
  totalSize: number;
  avgEntrySize: number;
  maxEntrySize: number;
  minEntrySize: number;
  typeDistribution: Record<MemoryType, number>;
  accessibilityDistribution: Record<MemoryAccessibility, number>;
  importanceDistribution: {
    low: number; // 0-0.33
    medium: number; // 0.33-0.66
    high: number; // 0.66-1
  };
}

export interface AccessPattern {
  agentId: AgentId;
  type: MemoryType;
  frequency: number;
  avgImportance: number;
  timePattern: Record<string, number>; // hour -> count
  queryPatterns: string[];
}

export interface RetentionStats {
  avgRetentionTime: number;
  retentionByType: Record<MemoryType, number>;
  retentionByImportance: Record<string, number>;
  evictionReasons: Record<string, number>;
  consolidationRate: number;
}

// Memory Configuration
export interface MemoryConfig {
  type: 'in-memory' | 'persistent' | 'hybrid' | 'distributed';
  maxSize?: number;
  maxEntries?: number;
  retentionPolicy?: 'fifo' | 'lru' | 'importance' | 'custom';
  consolidationEnabled?: boolean;
  consolidationInterval?: number;
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
  vectorSearchEnabled?: boolean;
  embeddingModel?: string;
  embeddingDimension?: number;
  
  // Storage backend configuration
  storage?: {
    redis?: RedisConfig;
    mongodb?: MongoConfig;
    sqlite?: SqliteConfig;
    memory?: InMemoryConfig;
  };
  
  // Strategy configuration
  strategies?: {
    memory?: string;
    consolidation?: string;
    eviction?: string;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  keyPrefix?: string;
}

export interface MongoConfig {
  uri: string;
  database: string;
  collection: string;
}

export interface SqliteConfig {
  filename: string;
  inMemory?: boolean;
}

export interface InMemoryConfig {
  maxSize: number;
  gcInterval?: number;
}