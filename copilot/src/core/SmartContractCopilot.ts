import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { 
  ContractRequest,
  ContractResponse,
  SecurityIssue,
  OptimizationSuggestion,
  ContractLanguage,
  CopilotConfig
} from '../types';
import { ContractTemplateGenerator } from '../templates/ContractTemplates';
import { SecurityAnalyzer } from '../analyzers/SecurityAnalyzer';
import { GasOptimizer } from '../optimizers/GasOptimizer';
import { TestGenerator } from '../generators/TestGenerator';
import { NaturalLanguageParser } from '../parsers/NaturalLanguageParser';

/**
 * Main Smart Contract Copilot class that orchestrates all AI-powered features
 */
export class SmartContractCopilot {
  private anthropic?: Anthropic;
  private openai?: OpenAI;
  private templateGenerator: ContractTemplateGenerator;
  private securityAnalyzer: SecurityAnalyzer;
  private gasOptimizer: GasOptimizer;
  private testGenerator: TestGenerator;
  private nlParser: NaturalLanguageParser;

  constructor(private config: CopilotConfig) {
    // Initialize AI providers
    if (config.anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: config.anthropicKey });
    }
    if (config.openaiKey) {
      this.openai = new OpenAI({ apiKey: config.openaiKey });
    }

    // Initialize components
    this.templateGenerator = new ContractTemplateGenerator(config);
    this.securityAnalyzer = new SecurityAnalyzer(config);
    this.gasOptimizer = new GasOptimizer(config);
    this.testGenerator = new TestGenerator(config);
    this.nlParser = new NaturalLanguageParser(config);
  }

  /**
   * Generate a smart contract from natural language description
   */
  async generateContract(request: ContractRequest): Promise<ContractResponse> {
    try {
      // Parse natural language into structured requirements
      const requirements = await this.nlParser.parse(request.description);
      
      // Generate base contract from template
      let contract = await this.templateGenerator.generate({
        language: request.language || ContractLanguage.CosmWasm,
        type: requirements.contractType,
        features: requirements.features,
        customLogic: requirements.customLogic
      });

      // Analyze for security issues
      const securityIssues = await this.securityAnalyzer.analyze(contract);
      
      // Apply security fixes if auto-fix is enabled
      if (request.autoFix && securityIssues.length > 0) {
        contract = await this.applySecurity8Fixes(contract, securityIssues);
      }

      // Optimize for gas
      const optimizations = await this.gasOptimizer.optimize(contract, request.language);
      if (request.autoOptimize) {
        contract = await this.applyOptimizations(contract, optimizations);
      }

      // Generate tests
      const tests = request.generateTests 
        ? await this.testGenerator.generate(contract, request.language)
        : undefined;

      // Generate documentation
      const documentation = request.generateDocs
        ? await this.generateDocumentation(contract)
        : undefined;

      return {
        success: true,
        contract,
        tests,
        documentation,
        securityIssues: request.autoFix ? [] : securityIssues,
        optimizations: request.autoOptimize ? [] : optimizations,
        metadata: {
          language: request.language || ContractLanguage.CosmWasm,
          estimatedGas: await this.estimateGas(contract),
          complexity: this.calculateComplexity(contract),
          linesOfCode: contract.split('\n').length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        contract: ''
      };
    }
  }

  /**
   * Explain an existing smart contract in natural language
   */
  async explainContract(contract: string, language: ContractLanguage): Promise<string> {
    const prompt = `Explain this ${language} smart contract in simple terms:
    
${contract}

Provide:
1. Purpose and main functionality
2. Key functions and what they do
3. Security considerations
4. Potential use cases`;

    if (this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });
      return response.content[0].type === 'text' ? response.content[0].text : '';
    } else if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      });
      return response.choices[0].message.content || '';
    }
    
    throw new Error('No AI provider configured');
  }

  /**
   * Suggest improvements for an existing contract
   */
  async suggestImprovements(contract: string, language: ContractLanguage): Promise<{
    security: SecurityIssue[];
    optimizations: OptimizationSuggestion[];
    bestPractices: string[];
  }> {
    const [security, optimizations] = await Promise.all([
      this.securityAnalyzer.analyze(contract),
      this.gasOptimizer.optimize(contract, language)
    ]);

    const bestPractices = await this.analyzeBestPractices(contract, language);

    return {
      security,
      optimizations,
      bestPractices
    };
  }

  /**
   * Debug a smart contract error
   */
  async debugError(contract: string, error: string, language: ContractLanguage): Promise<{
    diagnosis: string;
    suggestedFix: string;
    explanation: string;
  }> {
    const prompt = `Debug this ${language} smart contract error:

Contract:
${contract}

Error:
${error}

Provide:
1. Root cause diagnosis
2. Suggested fix (code)
3. Explanation of why this error occurred`;

    if (this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });
      
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      return this.parseDebugResponse(text);
    } else if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      });
      
      const text = response.choices[0].message.content || '';
      return this.parseDebugResponse(text);
    }
    
    throw new Error('No AI provider configured');
  }

  /**
   * Convert contract between different languages (e.g., Solidity to CosmWasm)
   */
  async convertContract(
    contract: string,
    fromLanguage: ContractLanguage,
    toLanguage: ContractLanguage
  ): Promise<string> {
    const prompt = `Convert this ${fromLanguage} smart contract to ${toLanguage}:

${contract}

Ensure:
1. Preserve all functionality
2. Follow ${toLanguage} best practices
3. Add appropriate comments
4. Maintain security properties`;

    if (this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      });
      return response.content[0].type === 'text' ? response.content[0].text : '';
    } else if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000
      });
      return response.choices[0].message.content || '';
    }
    
    throw new Error('No AI provider configured');
  }

  private async applySecurityFixes(contract: string, issues: SecurityIssue[]): Promise<string> {
    let fixedContract = contract;
    for (const issue of issues) {
      if (issue.fix) {
        fixedContract = fixedContract.replace(issue.location, issue.fix);
      }
    }
    return fixedContract;
  }

  private async applyOptimizations(contract: string, optimizations: OptimizationSuggestion[]): Promise<string> {
    let optimizedContract = contract;
    for (const opt of optimizations) {
      if (opt.implementation) {
        optimizedContract = optimizedContract.replace(opt.location, opt.implementation);
      }
    }
    return optimizedContract;
  }

  private async generateDocumentation(contract: string): Promise<string> {
    const prompt = `Generate comprehensive documentation for this smart contract:

${contract}

Include:
1. Overview
2. Function descriptions
3. Events and their meanings
4. Usage examples
5. Security considerations`;

    if (this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      });
      return response.content[0].type === 'text' ? response.content[0].text : '';
    } else if (this.openai) {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000
      });
      return response.choices[0].message.content || '';
    }
    
    return 'Documentation generation requires AI provider';
  }

  private async estimateGas(contract: string): Promise<number> {
    // Simplified gas estimation based on contract complexity
    const lines = contract.split('\n').length;
    const functions = (contract.match(/function|pub fn|def/g) || []).length;
    const loops = (contract.match(/for|while|loop/g) || []).length;
    const storage = (contract.match(/storage|state|mapping/g) || []).length;
    
    return Math.floor(21000 + (lines * 10) + (functions * 5000) + (loops * 10000) + (storage * 20000));
  }

  private calculateComplexity(contract: string): 'low' | 'medium' | 'high' {
    const lines = contract.split('\n').length;
    const functions = (contract.match(/function|pub fn|def/g) || []).length;
    
    if (lines < 100 && functions < 5) return 'low';
    if (lines < 500 && functions < 20) return 'medium';
    return 'high';
  }

  private async analyzeBestPractices(contract: string, language: ContractLanguage): Promise<string[]> {
    const practices: string[] = [];
    
    // Check for common best practices
    if (!contract.includes('require') && !contract.includes('assert')) {
      practices.push('Add input validation using require/assert statements');
    }
    
    if (!contract.includes('event') && !contract.includes('emit')) {
      practices.push('Add events for important state changes');
    }
    
    if (!contract.includes('modifier') && language === ContractLanguage.Solidity) {
      practices.push('Consider using modifiers for access control');
    }
    
    if (!contract.includes('test') && !contract.includes('Test')) {
      practices.push('Add comprehensive test coverage');
    }
    
    return practices;
  }

  private parseDebugResponse(text: string): {
    diagnosis: string;
    suggestedFix: string;
    explanation: string;
  } {
    // Simple parsing - in production would use more sophisticated parsing
    const sections = text.split(/\d\.\s+/);
    return {
      diagnosis: sections[1] || 'Unable to diagnose',
      suggestedFix: sections[2] || 'No fix available',
      explanation: sections[3] || 'No explanation available'
    };
  }
}