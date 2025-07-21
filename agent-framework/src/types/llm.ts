// LLM Provider Types and Interfaces

export interface LLMProvider {
  readonly name: string;
  readonly version: string;
  
  // Core Methods
  generateText(prompt: string, options?: GenerationOptions): Promise<LLMResponse>;
  generateChat(messages: ChatMessage[], options?: GenerationOptions): Promise<LLMResponse>;
  generateStream(prompt: string, options?: GenerationOptions): AsyncIterable<LLMStreamResponse>;
  
  // Embeddings
  generateEmbeddings(texts: string[]): Promise<number[][]>;
  
  // Utility Methods
  countTokens(text: string): Promise<number>;
  validateConfig(config: LLMConfig): Promise<boolean>;
  getModels(): Promise<string[]>;
  
  // Lifecycle
  initialize(config: LLMConfig): Promise<void>;
  shutdown(): Promise<void>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
  seed?: number;
  tools?: Tool[];
  toolChoice?: 'none' | 'auto' | 'required' | { type: 'function'; function: { name: string } };
  responseFormat?: { type: 'text' | 'json_object' };
  metadata?: Record<string, any>;
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface LLMResponse {
  id: string;
  content: string;
  role: 'assistant';
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call';
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  toolCalls?: ToolCall[];
  metadata?: Record<string, any>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost?: number;
  };
  timing?: {
    queueTime: number;
    processingTime: number;
    totalTime: number;
  };
}

export interface LLMStreamResponse {
  id: string;
  delta: {
    content?: string;
    role?: 'assistant';
    toolCalls?: Partial<ToolCall>[];
  };
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  index: number;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'llama' | 'custom';
  model: string;
  apiKey?: string;
  baseURL?: string;
  organizationId?: string;
  projectId?: string;
  
  // Generation defaults
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  
  // Client configuration
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  maxRetryDelay?: number;
  
  // Features
  streamingEnabled?: boolean;
  toolsEnabled?: boolean;
  visionEnabled?: boolean;
  
  // Rate limiting
  requestsPerMinute?: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
  
  // Cost management
  maxCostPerRequest?: number;
  maxCostPerHour?: number;
  maxCostPerDay?: number;
  
  // Custom configuration
  customHeaders?: Record<string, string>;
  customParams?: Record<string, any>;
  
  // Monitoring
  enableLogging?: boolean;
  enableMetrics?: boolean;
}

// Provider-specific configurations
export interface OpenAIConfig extends LLMConfig {
  provider: 'openai';
  assistantId?: string;
  threadId?: string;
  logitBias?: Record<string, number>;
  user?: string;
}

export interface AnthropicConfig extends LLMConfig {
  provider: 'anthropic';
  anthropicVersion?: string;
  beta?: string[];
}

export interface LlamaConfig extends LLMConfig {
  provider: 'llama';
  contextLength?: number;
  numGpu?: number;
  numThread?: number;
  batchSize?: number;
  repeatPenalty?: number;
  repeatLastN?: number;
  tfsZ?: number;
  typicalP?: number;
  mirostat?: number;
  mirostatEta?: number;
  mirostatTau?: number;
}

// Provider Factory
export interface LLMProviderFactory {
  createProvider(config: LLMConfig): Promise<LLMProvider>;
  getSupportedProviders(): string[];
  getDefaultConfig(provider: string): LLMConfig;
  validateConfig(config: LLMConfig): Promise<ValidationResult>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Embeddings
export interface EmbeddingProvider {
  generateEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResponse>;
  getDimensions(): number;
  getMaxInputLength(): number;
}

export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
  encodingFormat?: 'float' | 'base64';
  user?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

// Fine-tuning
export interface FineTuningJob {
  id: string;
  model: string;
  status: 'validating_files' | 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  trainingFile: string;
  validationFile?: string;
  fineTunedModel?: string;
  hyperparameters: {
    nEpochs: number;
    batchSize?: number;
    learningRateMultiplier?: number;
  };
  resultFiles?: string[];
  createdAt: Date;
  updatedAt: Date;
  error?: {
    message: string;
    code: string;
    param?: string;
  };
}

// LLM Metrics and Monitoring
export interface LLMMetrics {
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageLatency: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCost: number;
  requestsPerMinute: number;
  tokensPerSecond: number;
  errorRate: number;
  
  // Model-specific metrics
  modelUsage: Record<string, number>;
  featureUsage: {
    streaming: number;
    tools: number;
    vision: number;
  };
  
  // Time-based metrics
  hourlyStats: TimeBasedMetrics[];
  dailyStats: TimeBasedMetrics[];
}

export interface TimeBasedMetrics {
  timestamp: Date;
  requests: number;
  tokens: number;
  cost: number;
  errors: number;
  averageLatency: number;
}

// LLM Cache
export interface LLMCache {
  get(key: string): Promise<LLMResponse | null>;
  set(key: string, response: LLMResponse, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  generateKey(prompt: string, options: GenerationOptions): string;
}

// Context Management
export interface ContextManager {
  addContext(context: string, weight?: number): void;
  removeContext(context: string): void;
  getContext(): string;
  clearContext(): void;
  getTokenCount(): Promise<number>;
  optimizeContext(maxTokens: number): Promise<string>;
}

// Prompt Management
export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  description?: string;
  category?: string;
  tags?: string[];
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptManager {
  saveTemplate(template: PromptTemplate): Promise<void>;
  getTemplate(id: string): Promise<PromptTemplate | null>;
  listTemplates(category?: string): Promise<PromptTemplate[]>;
  renderTemplate(templateId: string, variables: Record<string, any>): Promise<string>;
  deleteTemplate(id: string): Promise<void>;
  validateTemplate(template: string, variables: Record<string, any>): Promise<ValidationResult>;
}