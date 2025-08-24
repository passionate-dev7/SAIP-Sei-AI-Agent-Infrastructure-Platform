# Agent Framework 🤖

Advanced TypeScript Agent Framework with Next.js, Swarm Coordination, and Blockchain Integration

## 🚀 Features

- **Autonomous AI Agents**: Self-directing agents with advanced reasoning capabilities
- **Multi-LLM Support**: OpenAI, Anthropic, Llama, and custom providers
- **Swarm Intelligence**: Coordinated multi-agent systems with various topologies
- **Blockchain Integration**: Native Sei Network support with GOAT SDK for DeFi
- **Real-time Processing**: High-performance task scheduling and execution
- **Enterprise Ready**: Production-grade security, monitoring, and scalability
- **TypeScript First**: Full type safety and excellent developer experience
- **Next.js 14**: Modern React framework with App Router

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Agent Layer   │    │Coordination Layer│   │ Blockchain Layer│
│                 │    │                 │    │                 │
│ • BaseAgent     │    │ • SwarmManager  │    │ • GOATWallet    │
│ • DecisionEngine│ ←→ │ • TaskScheduler │ ←→ │ • EVMProvider   │
│ • MemorySystem  │    │ • MessageRouter │    │ • SeiProvider   │
│ • LLMProvider   │    │ • Consensus     │    │ • DeFi Tools    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- TypeScript knowledge
- (Optional) Sei wallet for blockchain features

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd agent-framework

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Environment Variables

```env
# LLM Provider Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Blockchain Configuration
SEI_RPC_URL=https://evm-rpc.sei-apis.com
PRIVATE_KEY=your_private_key_for_testing

# Optional
NEXT_PUBLIC_APP_ENV=development
```

### Development

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Usage Examples

### Creating a Simple Agent

```typescript
import { BaseAgent } from './src/agents/BaseAgent';
import { LLMProviderFactory } from './src/lib/llm/ProviderFactory';

class MyAgent extends BaseAgent {
  protected async createLLMProvider() {
    const factory = LLMProviderFactory.getInstance();
    return await factory.createProvider(this.config.llmConfig);
  }
  
  protected async performTask(task: Task) {
    const response = await this.llmProvider.generateText(
      `Complete this task: ${task.description}`
    );
    return response.content;
  }
}

const agent = new MyAgent({
  id: 'my-agent-1',
  name: 'My First Agent',
  type: 'autonomous',
  llmConfig: {
    provider: 'openai',
    model: 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY
  },
  // ... other config
});

await agent.initialize();
```

### Blockchain-Enabled Agent

```typescript
import { BlockchainAgent } from './src/blockchain/agents/BlockchainAgent';

const blockchainAgent = new BlockchainAgent({
  id: 'defi-agent',
  name: 'DeFi Trading Agent',
  type: 'autonomous',
  llmConfig: {
    provider: 'openai',
    model: 'gpt-4'
  },
  blockchainConfig: {
    rpcUrl: 'https://evm-rpc.sei-apis.com',
    chainId: 1329,
    network: 'Sei Network',
    walletConfig: {
      privateKey: process.env.PRIVATE_KEY
    }
  }
});

// Perform DeFi operations
const swapResult = await blockchainAgent.performSwap({
  tokenIn: 'SEI',
  tokenOut: '0x...', // Token address
  amountIn: '1.0',
  slippage: 0.01
});
```

### Agent Framework Management

```typescript
import { AgentFramework } from './src/agents/AgentFramework';

const framework = new AgentFramework();
await framework.initialize();
await framework.start();

// Register agents
await framework.registerAgent(agent);

// Create and assign tasks
const task = await framework.createTask({
  title: 'Analyze Market Data',
  description: 'Analyze current DeFi market conditions',
  priority: 'high',
  requiredCapabilities: ['analysis', 'blockchain']
});

await framework.assignTask(task.id);
```

### Swarm Coordination

```typescript
// Create a swarm
const swarmId = await framework.createSwarm({
  id: 'trading-swarm',
  name: 'DeFi Trading Swarm',
  topology: 'hierarchical',
  coordinationStrategy: 'distributed',
  maxAgents: 10
});

// Add agents to swarm
await framework.addAgentToSwarm(swarmId, agent1.id);
await framework.addAgentToSwarm(swarmId, agent2.id);
```

## 🌐 API Endpoints

### Agents API

```http
# Get all agents
GET /api/agents

# Create new agent
POST /api/agents
Content-Type: application/json
{
  "type": "blockchain",
  "config": {
    "name": "My Agent",
    "privateKey": "0x...",
    "rpcUrl": "https://evm-rpc.sei-apis.com"
  }
}
```

### Tasks API

```http
# Get all tasks  
GET /api/tasks

# Create new task
POST /api/tasks
Content-Type: application/json
{
  "title": "Swap Tokens",
  "description": "Swap 1 SEI for USDC",
  "priority": "medium",
  "type": "defi_operation",
  "input": {
    "operation": "swap",
    "tokenIn": "SEI",
    "tokenOut": "USDC",
    "amountIn": "1.0"
  }
}
```

## 🧩 Core Components

### Agent Types

- **BaseAgent**: Abstract base class for all agents
- **BlockchainAgent**: Blockchain-enabled agent with DeFi capabilities
- **AnalystAgent**: Specialized for data analysis
- **CoordinatorAgent**: Manages other agents in swarms

### LLM Providers

- **OpenAIProvider**: GPT-3.5/GPT-4 integration
- **AnthropicProvider**: Claude integration  
- **LlamaProvider**: Local/self-hosted models
- **Custom providers**: Extend LLMProvider base class

### Memory Systems

- **InMemoryStorage**: Fast temporary storage
- **VectorMemoryStorage**: Semantic search capabilities
- **Persistent storage**: Redis, MongoDB, SQLite adapters

### Blockchain Features

- **EVMProvider**: Ethereum-compatible networks
- **GOATWallet**: DeFi operations and wallet management
- **Sei Integration**: Native Sei Network support
- **Smart Contracts**: Deploy and interact with contracts

## 📊 Monitoring & Metrics

The framework provides comprehensive monitoring:

- **Agent Performance**: Task completion rates, response times
- **Resource Usage**: CPU, memory, token consumption
- **Network Health**: Swarm coordination metrics
- **Blockchain Activity**: Transaction monitoring, gas optimization

## 🛡️ Security Considerations

- Never commit private keys to version control
- Use environment variables for sensitive data
- Enable rate limiting for API endpoints
- Implement proper access controls
- Monitor agent behavior for anomalies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- 📖 [Documentation](docs/)
- 💬 [Discord Community](https://discord.gg/agent-framework)
- 🐛 [Issue Tracker](https://github.com/agent-framework/issues)
- 📧 [Email Support](mailto:support@agent-framework.dev)

## 🗺️ Roadmap

- [ ] Multi-chain blockchain support (Ethereum, Solana)
- [ ] Advanced ML model fine-tuning
- [ ] GraphQL API
- [ ] Mobile SDKs
- [ ] Enterprise SSO integration
- [ ] Advanced visualization dashboard
- [ ] Plugin marketplace

---

Built with ❤️ using TypeScript, Next.js, and the power of AI agents.