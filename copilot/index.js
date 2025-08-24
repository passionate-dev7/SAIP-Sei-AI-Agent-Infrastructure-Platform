#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { CopilotCore } from './core/copilot-core.js';
import { SyntaxHighlighter } from './syntax/syntax-highlighter.js';
import { TemplateGenerator } from './templates/template-generator.js';
import { SecurityAnalyzer } from './security/security-analyzer.js';
import { GasOptimizer } from './optimization/gas-optimizer.js';
import { TestGenerator } from './testing/test-generator.js';
import { DeploymentManager } from './deployment/deployment-manager.js';
import { ContractVerifier } from './verification/contract-verifier.js';
import { InteractiveDebugger } from './debug/interactive-debugger.js';

console.log(
  chalk.cyan(
    figlet.textSync('Sui Move Copilot', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    })
  )
);

console.log(chalk.yellow('🤖 AI-Powered Smart Contract Development Assistant\n'));

const copilot = new CopilotCore();

program
  .name('sui-copilot')
  .description('AI-powered copilot for Sui Move smart contract development')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new Move project with AI assistance')
  .option('-n, --name <name>', 'project name')
  .option('-t, --template <template>', 'contract template')
  .action(async (options) => {
    await copilot.initProject(options);
  });

program
  .command('analyze')
  .description('Analyze Move contract for security vulnerabilities and optimizations')
  .argument('<file>', 'Move contract file')
  .option('-s, --security', 'run security analysis')
  .option('-g, --gas', 'run gas optimization analysis')
  .option('-a, --all', 'run all analyses')
  .action(async (file, options) => {
    await copilot.analyzeContract(file, options);
  });

program
  .command('generate')
  .description('Generate code with AI assistance')
  .option('-t, --test', 'generate tests')
  .option('-c, --contract', 'generate contract')
  .option('-d, --docs', 'generate documentation')
  .argument('<input>', 'input specification')
  .action(async (input, options) => {
    await copilot.generateCode(input, options);
  });

program
  .command('debug')
  .description('Start interactive debugging session')
  .argument('<contract>', 'contract file to debug')
  .action(async (contract) => {
    await copilot.startDebugSession(contract);
  });

program
  .command('deploy')
  .description('Deploy contract with automated pipeline')
  .argument '<contract>', 'contract file to deploy'
  .option('-n, --network <network>', 'network to deploy to', 'devnet')
  .option('-g, --gas-budget <budget>', 'gas budget for deployment')
  .action(async (contract, options) => {
    await copilot.deployContract(contract, options);
  });

program
  .command('verify')
  .description('Verify contract on blockchain')
  .argument '<address>', 'contract address'
  .action(async (address) => {
    await copilot.verifyContract(address);
  });

program
  .command('serve')
  .description('Start copilot server for IDE integration')
  .option('-p, --port <port>', 'server port', '3000')
  .action(async (options) => {
    await copilot.startServer(options);
  });

program.parse();