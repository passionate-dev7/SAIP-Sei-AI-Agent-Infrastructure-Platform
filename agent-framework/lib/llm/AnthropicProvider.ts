import Anthropic from '@anthropic-ai/sdk';
import { 
  LLMConfig, 
  LLMResponse, 
  ChatMessage, 
  GenerationOptions,
  LLMStreamResponse,
  AnthropicConfig
} from '../../types/llm';
import { LLMProvider } from './LLMProvider';

/**
 * Anthropic LLM Provider implementation
 */
export class AnthropicProvider extends LLMProvider {
  readonly name = 'anthropic';
  readonly version = '1.0.0';
  
  private client: Anthropic | null = null;
  
  protected async onInitialize(config: LLMConfig): Promise<void> {
    const anthropicConfig = config as AnthropicConfig;
    
    this.client = new Anthropic({
      apiKey: anthropicConfig.apiKey,
      baseURL: anthropicConfig.baseURL,
      timeout: anthropicConfig.timeout || 60000,
      maxRetries: anthropicConfig.retries || 3
    });
  }
  
  protected async onShutdown(): Promise<void> {
    this.client = null;
  }
  
  async generateText(prompt: string, options?: GenerationOptions): Promise<LLMResponse> {
    this.ensureInitialized();
    
    const config = this.getConfig();
    
    try {
      const response = await this.client!.messages.create({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens || config.maxTokens || 4096,
        temperature: options?.temperature ?? config.temperature ?? 0.7,
        top_p: options?.topP ?? config.topP,
        stop_sequences: typeof options?.stop === 'string' ? [options.stop] : options?.stop
      });
      
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic');
      }
      
      return {
        id: response.id,
        content: content.text,
        role: 'assistant',
        finishReason: response.stop_reason as any,
        tokens: {
          prompt: response.usage.input_tokens,
          completion: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens
        },
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        }
      };
      
    } catch (error) {
      throw new Error(`Anthropic API error: ${error}`);
    }
  }
  
  async generateChat(messages: ChatMessage[], options?: GenerationOptions): Promise<LLMResponse> {
    // Convert messages to Anthropic format
    const anthropicMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: msg.content
    }));
    
    const config = this.getConfig();
    
    try {
      const response = await this.client!.messages.create({
        model: config.model,
        messages: anthropicMessages,
        max_tokens: options?.maxTokens || config.maxTokens || 4096,
        temperature: options?.temperature ?? config.temperature ?? 0.7,
        top_p: options?.topP ?? config.topP,
        stop_sequences: typeof options?.stop === 'string' ? [options.stop] : options?.stop
      });
      
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic');
      }
      
      return {
        id: response.id,
        content: content.text,
        role: 'assistant',
        finishReason: response.stop_reason as any,
        tokens: {
          prompt: response.usage.input_tokens,
          completion: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens
        },
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        }
      };
      
    } catch (error) {
      throw new Error(`Anthropic API error: ${error}`);
    }
  }
  
  async* generateStream(prompt: string, options?: GenerationOptions): AsyncIterable<LLMStreamResponse> {
    this.ensureInitialized();
    
    const config = this.getConfig();
    
    try {
      const stream = await this.client!.messages.create({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options?.maxTokens || config.maxTokens || 4096,
        temperature: options?.temperature ?? config.temperature ?? 0.7,
        stream: true
      });
      
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield {
            id: 'anthropic-stream',
            delta: {
              content: chunk.delta.text
            },
            index: 0
          };
        }
      }
      
    } catch (error) {
      throw new Error(`Anthropic streaming error: ${error}`);
    }
  }
  
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Anthropic doesn't provide embeddings directly
    // This would need to use a different service
    throw new Error('Embeddings not supported by Anthropic provider');
  }
  
  async countTokens(text: string): Promise<number> {
    // Simple approximation - Anthropic uses similar tokenization to GPT
    return Math.ceil(text.length / 4);
  }
  
  async getModels(): Promise<string[]> {
    // Return known Anthropic models
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-3-5-sonnet-20241022'
    ];
  }
}