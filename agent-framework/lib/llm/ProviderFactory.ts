import { 
  LLMConfig, 
  LLMProviderFactory as ILLMProviderFactory, 
  ValidationResult 
} from '../../types/llm';
import { LLMProvider } from './LLMProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { LlamaProvider } from './LlamaProvider';

/**
 * Factory for creating LLM providers
 */
export class LLMProviderFactory implements ILLMProviderFactory {
  private static instance: LLMProviderFactory;
  
  private providers: Map<string, typeof LLMProvider> = new Map();
  
  private constructor() {
    this.registerProvider('openai', OpenAIProvider);
    this.registerProvider('anthropic', AnthropicProvider);
    this.registerProvider('llama', LlamaProvider);
  }
  
  static getInstance(): LLMProviderFactory {
    if (!LLMProviderFactory.instance) {
      LLMProviderFactory.instance = new LLMProviderFactory();
    }
    return LLMProviderFactory.instance;
  }
  
  registerProvider(name: string, providerClass: typeof LLMProvider): void {
    this.providers.set(name, providerClass);
  }
  
  async createProvider(config: LLMConfig): Promise<LLMProvider> {
    const ProviderClass = this.providers.get(config.provider);
    if (!ProviderClass) {
      throw new Error(`Unknown LLM provider: ${config.provider}`);
    }
    
    const provider = new ProviderClass();
    await provider.initialize(config);
    
    return provider;
  }
  
  getSupportedProviders(): string[] {
    return Array.from(this.providers.keys());
  }
  
  getDefaultConfig(provider: string): LLMConfig {
    switch (provider) {
      case 'openai':
        return {
          provider: 'openai',
          model: 'gpt-4',
          maxTokens: 4096,
          temperature: 0.7,
          timeout: 60000,
          retries: 3
        };
      
      case 'anthropic':
        return {
          provider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          maxTokens: 4096,
          temperature: 0.7,
          timeout: 60000,
          retries: 3
        };
      
      case 'llama':
        return {
          provider: 'llama',
          model: 'llama-2-7b-chat',
          maxTokens: 2048,
          temperature: 0.7,
          timeout: 120000,
          retries: 2
        };
      
      default:
        throw new Error(`No default config for provider: ${provider}`);
    }
  }
  
  async validateConfig(config: LLMConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation
    if (!config.provider) {
      errors.push('Provider is required');
    } else if (!this.providers.has(config.provider)) {
      errors.push(`Unsupported provider: ${config.provider}`);
    }
    
    if (!config.model) {
      errors.push('Model is required');
    }
    
    // Provider-specific validation
    switch (config.provider) {
      case 'openai':
        if (!config.apiKey) {
          errors.push('API key is required for OpenAI provider');
        }
        break;
      
      case 'anthropic':
        if (!config.apiKey) {
          errors.push('API key is required for Anthropic provider');
        }
        break;
      
      case 'llama':
        // Local model - no API key required
        if (config.maxTokens && config.maxTokens > 4096) {
          warnings.push('Large max_tokens may cause performance issues with Llama');
        }
        break;
    }
    
    // General validation
    if (config.temperature !== undefined) {
      if (config.temperature < 0 || config.temperature > 2) {
        warnings.push('Temperature should be between 0 and 2');
      }
    }
    
    if (config.maxTokens && config.maxTokens < 1) {
      errors.push('max_tokens must be greater than 0');
    }
    
    if (config.topP !== undefined && (config.topP < 0 || config.topP > 1)) {
      warnings.push('top_p should be between 0 and 1');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}