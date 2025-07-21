import { 
  LLMProvider as ILLMProvider, 
  LLMConfig, 
  LLMResponse, 
  ChatMessage, 
  GenerationOptions,
  LLMStreamResponse
} from '../../types/llm';

/**
 * Abstract base class for LLM providers
 */
export abstract class LLMProvider implements ILLMProvider {
  abstract readonly name: string;
  abstract readonly version: string;
  
  protected config: LLMConfig | null = null;
  protected initialized = false;
  
  async initialize(config: LLMConfig): Promise<void> {
    await this.validateConfig(config);
    this.config = config;
    await this.onInitialize(config);
    this.initialized = true;
  }
  
  async shutdown(): Promise<void> {
    if (this.initialized) {
      await this.onShutdown();
      this.initialized = false;
    }
  }
  
  abstract generateText(prompt: string, options?: GenerationOptions): Promise<LLMResponse>;
  abstract generateChat(messages: ChatMessage[], options?: GenerationOptions): Promise<LLMResponse>;
  abstract generateStream(prompt: string, options?: GenerationOptions): AsyncIterable<LLMStreamResponse>;
  abstract generateEmbeddings(texts: string[]): Promise<number[][]>;
  abstract countTokens(text: string): Promise<number>;
  abstract getModels(): Promise<string[]>;
  
  async validateConfig(config: LLMConfig): Promise<boolean> {
    if (!config.provider) {
      throw new Error('Provider is required in LLM config');
    }
    if (!config.model) {
      throw new Error('Model is required in LLM config');
    }
    return true;
  }
  
  protected abstract onInitialize(config: LLMConfig): Promise<void>;
  protected abstract onShutdown(): Promise<void>;
  
  protected ensureInitialized(): void {
    if (!this.initialized || !this.config) {
      throw new Error('LLM Provider not initialized');
    }
  }
  
  protected getConfig(): LLMConfig {
    this.ensureInitialized();
    return this.config!;
  }
}