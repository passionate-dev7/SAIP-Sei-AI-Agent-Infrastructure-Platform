import OpenAI from 'openai/index.mjs';
import { 
  LLMConfig, 
  LLMResponse, 
  ChatMessage, 
  GenerationOptions,
  LLMStreamResponse,
  OpenAIConfig
} from '../../types/llm';
import { LLMProvider } from './LLMProvider';

/**
 * OpenAI LLM Provider implementation
 */
export class OpenAIProvider extends LLMProvider {
  readonly name = 'openai';
  readonly version = '1.0.0';
  
  private client: OpenAI | null = null;
  
  protected async onInitialize(config: LLMConfig): Promise<void> {
    const openaiConfig = config as OpenAIConfig;
    
    this.client = new OpenAI({
      apiKey: openaiConfig.apiKey,
      baseURL: openaiConfig.baseURL,
      organization: openaiConfig.organizationId,
      project: openaiConfig.projectId,
      timeout: openaiConfig.timeout || 60000,
      maxRetries: openaiConfig.retries || 3
    });
  }
  
  protected async onShutdown(): Promise<void> {
    this.client = null;
  }
  
  async generateText(prompt: string, options?: GenerationOptions): Promise<LLMResponse> {
    this.ensureInitialized();
    
    const messages: ChatMessage[] = [
      { role: 'user', content: prompt }
    ];
    
    return this.generateChat(messages, options);
  }
  
  async generateChat(messages: ChatMessage[], options?: GenerationOptions): Promise<LLMResponse> {
    this.ensureInitialized();
    
    const config = this.getConfig();
    
    try {
      const response = await this.client!.chat.completions.create({
        model: config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          name: msg.name,
          tool_call_id: msg.toolCallId,
          tool_calls: msg.toolCalls?.map(tc => ({
            id: tc.id,
            type: tc.type,
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments
            }
          }))
        })),
        max_tokens: options?.maxTokens || config.maxTokens,
        temperature: options?.temperature ?? config.temperature ?? 0.7,
        top_p: options?.topP ?? config.topP,
        frequency_penalty: options?.frequencyPenalty ?? config.frequencyPenalty,
        presence_penalty: options?.presencePenalty ?? config.presencePenalty,
        stop: options?.stop,
        seed: options?.seed,
        tools: options?.tools?.map(tool => ({
          type: tool.type,
          function: {
            name: tool.function.name,
            description: tool.function.description,
            parameters: tool.function.parameters
          }
        })),
        tool_choice: options?.toolChoice,
        response_format: options?.responseFormat
      });
      
      const choice = response.choices[0];
      if (!choice) {
        throw new Error('No response choice returned from OpenAI');
      }
      
      return {
        id: response.id,
        content: choice.message.content || '',
        role: 'assistant',
        finishReason: choice.finish_reason as any,
        tokens: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        },
        model: response.model,
        toolCalls: choice.message.tool_calls?.map(tc => ({
          id: tc.id,
          type: tc.type,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments
          }
        })),
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      };
      
    } catch (error) {
      throw new Error(`OpenAI API error: ${error}`);
    }
  }
  
  async* generateStream(prompt: string, options?: GenerationOptions): AsyncIterable<LLMStreamResponse> {
    this.ensureInitialized();
    
    const messages: ChatMessage[] = [
      { role: 'user', content: prompt }
    ];
    
    const config = this.getConfig();
    
    try {
      const stream = await this.client!.chat.completions.create({
        model: config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: options?.maxTokens || config.maxTokens,
        temperature: options?.temperature ?? config.temperature ?? 0.7,
        stream: true
      });
      
      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (choice) {
          yield {
            id: chunk.id,
            delta: {
              content: choice.delta.content || undefined,
              role: choice.delta.role as 'assistant' | undefined
            },
            finishReason: choice.finish_reason as any,
            index: choice.index
          };
        }
      }
      
    } catch (error) {
      throw new Error(`OpenAI streaming error: ${error}`);
    }
  }
  
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts
      });
      
      return response.data.map(item => item.embedding);
      
    } catch (error) {
      throw new Error(`OpenAI embeddings error: ${error}`);
    }
  }
  
  async countTokens(text: string): Promise<number> {
    // Simple approximation - 1 token ≈ 4 characters for English text
    // For production, you'd want to use tiktoken or similar
    return Math.ceil(text.length / 4);
  }
  
  async getModels(): Promise<string[]> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.models.list();
      return response.data
        .filter(model => model.id.includes('gpt') || model.id.includes('text'))
        .map(model => model.id)
        .sort();
      
    } catch (error) {
      throw new Error(`Failed to fetch OpenAI models: ${error}`);
    }
  }
}