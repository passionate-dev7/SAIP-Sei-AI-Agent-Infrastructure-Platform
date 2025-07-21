import { NextRequest, NextResponse } from 'next/server';
import { AgentFramework } from '../../../agents/AgentFramework';
import { BlockchainAgent } from '../../../blockchain/agents/BlockchainAgent';

// Initialize framework (in production, this would be singleton)
const framework = new AgentFramework();
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await framework.initialize();
    await framework.start();
    initialized = true;
  }
}

export async function GET() {
  try {
    await ensureInitialized();
    
    const agents = framework.getAgents();
    const metrics = await framework.getFrameworkMetrics();
    
    return NextResponse.json({
      success: true,
      data: {
        agents: agents.map(agent => ({
          id: agent.id,
          name: agent.config.name,
          type: agent.config.type,
          status: agent.status,
          capabilities: agent.config.capabilities.map(cap => cap.name)
        })),
        metrics
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { type, config } = body;
    
    let agent;
    
    switch (type) {
      case 'blockchain':
        agent = new BlockchainAgent({
          id: config.id || `agent-${Date.now()}`,
          name: config.name || 'Blockchain Agent',
          description: config.description || 'Blockchain-enabled agent',
          type: 'autonomous',
          capabilities: [
            { name: 'blockchain', description: 'Blockchain operations', version: '1.0' },
            { name: 'defi', description: 'DeFi operations', version: '1.0' },
            { name: 'wallet', description: 'Wallet management', version: '1.0' }
          ],
          skills: {
            reasoning: 0.8,
            creativity: 0.6,
            analysis: 0.9,
            communication: 0.7,
            problemSolving: 0.8,
            domainExpertise: { blockchain: 0.9, defi: 0.8 }
          },
          llmConfig: {
            provider: 'openai',
            model: 'gpt-4',
            apiKey: process.env.OPENAI_API_KEY,
            maxTokens: 2000,
            temperature: 0.7
          },
          memoryConfig: {
            type: 'hybrid',
            maxSize: 1000
          },
          behaviorConfig: {
            autonomyLevel: 0.8,
            collaborationStyle: 'cooperative',
            communicationFrequency: 'medium',
            decisionMaking: 'balanced',
            learningRate: 0.1
          },
          blockchainConfig: {
            rpcUrl: config.rpcUrl || 'https://evm-rpc.sei-apis.com',
            chainId: config.chainId || 1329,
            network: 'Sei Network',
            walletConfig: {
              privateKey: config.privateKey
            },
            monitoringEnabled: true
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
        break;
      
      default:
        // Create basic agent
        const { BaseAgent } = await import('../../../agents/BaseAgent');
        const { LLMProviderFactory } = await import('../../../lib/llm/ProviderFactory');
        const { InMemoryStorage } = await import('../../../lib/memory/InMemoryStorage');
        const { MemorySystem } = await import('../../../lib/memory/MemorySystem');
        const { RuleBasedDecisionEngine } = await import('../../../lib/decision/RuleBasedDecisionEngine');
        
        class SimpleAgent extends BaseAgent {
          protected async createLLMProvider() {
            const factory = LLMProviderFactory.getInstance();
            return await factory.createProvider(this.config.llmConfig);
          }
          
          protected async createMemorySystem() {
            return new MemorySystem(this.config.memoryConfig, new InMemoryStorage());
          }
          
          protected async createDecisionEngine() {
            return new RuleBasedDecisionEngine();
          }
          
          protected async performTask(task: any) {
            return `Completed task: ${task.title}`;
          }
          
          protected async processMessage(message: any) {
            console.log(`Received message from ${message.from}: ${message.content}`);
          }
        }
        
        agent = new SimpleAgent({
          id: config.id || `agent-${Date.now()}`,
          name: config.name || 'Simple Agent',
          description: config.description || 'Basic agent',
          type: 'autonomous',
          capabilities: [
            { name: 'general', description: 'General purpose tasks', version: '1.0' }
          ],
          skills: {
            reasoning: 0.7,
            creativity: 0.6,
            analysis: 0.7,
            communication: 0.8,
            problemSolving: 0.7,
            domainExpertise: {}
          },
          llmConfig: {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            apiKey: process.env.OPENAI_API_KEY,
            maxTokens: 1000,
            temperature: 0.7
          },
          memoryConfig: {
            type: 'in-memory',
            maxSize: 500
          },
          behaviorConfig: {
            autonomyLevel: 0.6,
            collaborationStyle: 'cooperative',
            communicationFrequency: 'medium',
            decisionMaking: 'balanced',
            learningRate: 0.1
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    // Register agent with framework
    await framework.registerAgent(agent);
    
    return NextResponse.json({
      success: true,
      data: {
        id: agent.id,
        name: agent.config.name,
        type: agent.config.type,
        status: agent.status,
        capabilities: agent.config.capabilities.map(cap => cap.name)
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}