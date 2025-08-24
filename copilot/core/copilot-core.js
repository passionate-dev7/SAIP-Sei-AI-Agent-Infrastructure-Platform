import express from 'express';
import { WebSocketServer } from 'ws';
import chalk from 'chalk';
import ora from 'ora';
import { SyntaxHighlighter } from '../syntax/syntax-highlighter.js';
import { TemplateGenerator } from '../templates/template-generator.js';
import { SecurityAnalyzer } from '../security/security-analyzer.js';
import { GasOptimizer } from '../optimization/gas-optimizer.js';
import { TestGenerator } from '../testing/test-generator.js';
import { DeploymentManager } from '../deployment/deployment-manager.js';
import { ContractVerifier } from '../verification/contract-verifier.js';
import { InteractiveDebugger } from '../debug/interactive-debugger.js';
import { AIAssistant } from '../ai/ai-assistant.js';

export class CopilotCore {
  constructor() {
    this.syntaxHighlighter = new SyntaxHighlighter();
    this.templateGenerator = new TemplateGenerator();
    this.securityAnalyzer = new SecurityAnalyzer();
    this.gasOptimizer = new GasOptimizer();
    this.testGenerator = new TestGenerator();
    this.deploymentManager = new DeploymentManager();
    this.contractVerifier = new ContractVerifier();
    this.debugger = new InteractiveDebugger();
    this.aiAssistant = new AIAssistant();
  }

  async initProject(options) {
    const spinner = ora('Initializing Sui Move project with AI assistance...').start();
    
    try {
      // Generate project structure with AI recommendations
      const projectStructure = await this.aiAssistant.generateProjectStructure(options);
      const template = await this.templateGenerator.generateProject(options.name, options.template);
      
      spinner.succeed(chalk.green('✅ Project initialized successfully!'));
      
      console.log(chalk.cyan('📁 Generated project structure:'));
      console.log(template.structure);
      
      if (projectStructure.recommendations) {
        console.log(chalk.yellow('🤖 AI Recommendations:'));
        projectStructure.recommendations.forEach(rec => {
          console.log(chalk.gray(`  • ${rec}`));
        });
      }
    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to initialize project'));
      console.error(error.message);
    }
  }

  async analyzeContract(file, options) {
    const spinner = ora('Analyzing Move contract...').start();
    
    try {
      const results = {
        security: null,
        gas: null,
        aiInsights: null
      };

      if (options.security || options.all) {
        spinner.text = 'Running security analysis...';
        results.security = await this.securityAnalyzer.analyze(file);
      }

      if (options.gas || options.all) {
        spinner.text = 'Analyzing gas optimization opportunities...';
        results.gas = await this.gasOptimizer.analyze(file);
      }

      spinner.text = 'Generating AI insights...';
      results.aiInsights = await this.aiAssistant.analyzeContract(file, results);

      spinner.succeed(chalk.green('✅ Analysis complete!'));
      
      this.displayAnalysisResults(results);
    } catch (error) {
      spinner.fail(chalk.red('❌ Analysis failed'));
      console.error(error.message);
    }
  }

  async generateCode(input, options) {
    const spinner = ora('Generating code with AI assistance...').start();
    
    try {
      let result;

      if (options.test) {
        spinner.text = 'Generating comprehensive tests...';
        result = await this.testGenerator.generateTests(input);
      } else if (options.contract) {
        spinner.text = 'Generating Move contract...';
        result = await this.templateGenerator.generateContract(input);
      } else if (options.docs) {
        spinner.text = 'Generating documentation...';
        result = await this.aiAssistant.generateDocumentation(input);
      }

      spinner.succeed(chalk.green('✅ Code generated successfully!'));
      console.log(chalk.cyan('Generated code:'));
      console.log(result.code);
      
      if (result.suggestions) {
        console.log(chalk.yellow('🤖 AI Suggestions:'));
        result.suggestions.forEach(suggestion => {
          console.log(chalk.gray(`  • ${suggestion}`));
        });
      }
    } catch (error) {
      spinner.fail(chalk.red('❌ Code generation failed'));
      console.error(error.message);
    }
  }

  async startDebugSession(contract) {
    console.log(chalk.cyan('🔍 Starting interactive debugging session...'));
    await this.debugger.start(contract);
  }

  async deployContract(contract, options) {
    const spinner = ora('Deploying contract...').start();
    
    try {
      const deploymentResult = await this.deploymentManager.deploy(contract, options);
      
      spinner.succeed(chalk.green('✅ Contract deployed successfully!'));
      console.log(chalk.cyan('Deployment details:'));
      console.log(`  Address: ${deploymentResult.address}`);
      console.log(`  Transaction: ${deploymentResult.transaction}`);
      console.log(`  Gas used: ${deploymentResult.gasUsed}`);
    } catch (error) {
      spinner.fail(chalk.red('❌ Deployment failed'));
      console.error(error.message);
    }
  }

  async verifyContract(address) {
    const spinner = ora('Verifying contract...').start();
    
    try {
      const verificationResult = await this.contractVerifier.verify(address);
      
      spinner.succeed(chalk.green('✅ Contract verified successfully!'));
      console.log(chalk.cyan('Verification details:'));
      console.log(verificationResult);
    } catch (error) {
      spinner.fail(chalk.red('❌ Verification failed'));
      console.error(error.message);
    }
  }

  async startServer(options) {
    const app = express();
    const server = app.listen(options.port, () => {
      console.log(chalk.green(`🚀 Copilot server running on port ${options.port}`));
    });

    const wss = new WebSocketServer({ server });
    
    wss.on('connection', (ws) => {
      console.log(chalk.blue('📡 Client connected'));
      
      ws.on('message', async (message) => {
        try {
          const request = JSON.parse(message);
          const response = await this.handleWebSocketRequest(request);
          ws.send(JSON.stringify(response));
        } catch (error) {
          ws.send(JSON.stringify({ error: error.message }));
        }
      });

      ws.on('close', () => {
        console.log(chalk.gray('📡 Client disconnected'));
      });
    });

    // REST API endpoints
    app.use(express.json());
    
    app.post('/api/analyze', async (req, res) => {
      try {
        const { code, options } = req.body;
        const results = await this.analyzeContractCode(code, options);
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/complete', async (req, res) => {
      try {
        const { code, position } = req.body;
        const completions = await this.syntaxHighlighter.getCompletions(code, position);
        res.json(completions);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post('/api/generate', async (req, res) => {
      try {
        const { prompt, type } = req.body;
        const result = await this.aiAssistant.generateCode(prompt, type);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  async handleWebSocketRequest(request) {
    switch (request.type) {
      case 'highlight':
        return await this.syntaxHighlighter.highlight(request.code);
      case 'complete':
        return await this.syntaxHighlighter.getCompletions(request.code, request.position);
      case 'analyze':
        return await this.analyzeContractCode(request.code, request.options);
      case 'generate':
        return await this.aiAssistant.generateCode(request.prompt, request.type);
      default:
        throw new Error(`Unknown request type: ${request.type}`);
    }
  }

  async analyzeContractCode(code, options = {}) {
    const results = {};

    if (options.security !== false) {
      results.security = await this.securityAnalyzer.analyzeCode(code);
    }

    if (options.gas !== false) {
      results.gas = await this.gasOptimizer.analyzeCode(code);
    }

    if (options.ai !== false) {
      results.aiInsights = await this.aiAssistant.analyzeCode(code);
    }

    return results;
  }

  displayAnalysisResults(results) {
    if (results.security) {
      console.log(chalk.red('🔒 Security Analysis:'));
      results.security.vulnerabilities.forEach(vuln => {
        console.log(chalk.red(`  ⚠️  ${vuln.severity}: ${vuln.message}`));
        console.log(chalk.gray(`      Line ${vuln.line}: ${vuln.suggestion}`));
      });
    }

    if (results.gas) {
      console.log(chalk.yellow('⛽ Gas Optimization:'));
      results.gas.suggestions.forEach(suggestion => {
        console.log(chalk.yellow(`  💡 ${suggestion.message}`));
        console.log(chalk.gray(`      Potential savings: ${suggestion.savings}`));
      });
    }

    if (results.aiInsights) {
      console.log(chalk.cyan('🤖 AI Insights:'));
      results.aiInsights.suggestions.forEach(insight => {
        console.log(chalk.cyan(`  💭 ${insight}`));
      });
    }
  }
}