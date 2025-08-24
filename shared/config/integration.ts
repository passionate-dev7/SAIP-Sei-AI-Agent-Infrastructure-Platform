// Configuration for component integration

export const INTEGRATION_CONFIG = {
  // API Gateway Configuration
  api: {
    host: process.env.API_HOST || 'localhost',
    port: process.env.API_PORT || 3001,
    basePath: '/api/v1',
    timeout: 30000,
    retries: 3,
  },

  // WebSocket Configuration
  websocket: {
    host: process.env.WS_HOST || 'localhost',
    port: process.env.WS_PORT || 3002,
    path: '/ws',
    heartbeatInterval: 30000,
    reconnectDelay: 5000,
    maxReconnectAttempts: 5,
  },

  // Component Endpoints
  components: {
    'no-code-platform': {
      url: process.env.NO_CODE_PLATFORM_URL || 'http://localhost:3000',
      healthCheck: '/health',
    },
    'agent-framework': {
      url: process.env.AGENT_FRAMEWORK_URL || 'http://localhost:3003',
      healthCheck: '/health',
    },
    'smart-contract-copilot': {
      url: process.env.COPILOT_URL || 'http://localhost:3004',
      healthCheck: '/health',
    },
    'mcp-server': {
      url: process.env.MCP_SERVER_URL || 'http://localhost:3005',
      healthCheck: '/health',
    },
    'sdk': {
      url: process.env.SDK_URL || 'http://localhost:3006',
      healthCheck: '/health',
    },
  },

  // Database Configuration (if needed for state persistence)
  database: {
    type: 'memory', // or 'redis', 'mongodb', etc.
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      db: 0,
    },
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },

  // Blockchain Configuration
  blockchain: {
    sei: {
      mainnet: {
        rpcUrl: 'https://rpc.sei-mainnet.com',
        chainId: 'sei-mainnet',
      },
      testnet: {
        rpcUrl: 'https://rpc.testnet.sei-mainnet.com',
        chainId: 'sei-testnet',
      },
    },
    ethereum: {
      mainnet: {
        rpcUrl: process.env.ETH_RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/your-api-key',
        chainId: 1,
      },
      sepolia: {
        rpcUrl: process.env.ETH_SEPOLIA_RPC_URL || 'https://eth-sepolia.alchemyapi.io/v2/your-api-key',
        chainId: 11155111,
      },
    },
  },

  // GOAT SDK Configuration
  goat: {
    defaultChain: 'sei-mainnet',
    supportedChains: ['sei-mainnet', 'sei-testnet', 'ethereum', 'polygon'],
    walletProviders: ['metamask', 'keplr', 'sei-wallet'],
  },

  // Agent Framework Configuration
  agents: {
    maxConcurrentAgents: 10,
    defaultResources: {
      cpu: 1,
      memory: 512,
      storage: 1024,
    },
    monitoring: {
      enabled: true,
      interval: 5000,
      metrics: ['cpu', 'memory', 'network', 'errors'],
    },
  },

  // Smart Contract Copilot Configuration
  copilot: {
    aiProvider: 'anthropic', // or 'openai'
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7,
    maxTokens: 4000,
    codeGeneration: {
      languages: ['rust', 'move', 'solidity'],
      frameworks: ['cosmwasm', 'sui-move', 'hardhat'],
    },
  },

  // System Limits
  limits: {
    maxAgentsPerUser: 50,
    maxContractsPerAgent: 10,
    maxTransactionsPerMinute: 100,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
} as const;

// Environment validation
export function validateEnvironment(): void {
  const requiredEnvVars = [
    'JWT_SECRET',
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
  }
}

export default INTEGRATION_CONFIG;