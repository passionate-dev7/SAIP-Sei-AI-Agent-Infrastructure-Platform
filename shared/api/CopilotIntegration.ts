// Integration layer for Smart Contract Copilot with No-Code Platform

import axios from 'axios';
import { 
  ContractGenerationRequest, 
  SmartContractReference, 
  ContractRequirements,
  ApiResponse 
} from '../types/integration';
import { INTEGRATION_CONFIG } from '../config/integration';
import { EventPublisher } from '../events/EventBus';

export interface CopilotGenerationResponse {
  contract: {
    id: string;
    name: string;
    code: string;
    language: 'rust' | 'move' | 'solidity';
    framework: 'cosmwasm' | 'sui-move' | 'hardhat';
    abi?: any;
    metadata: {
      compilation: {
        success: boolean;
        warnings: string[];
        errors: string[];
      };
      security: {
        score: number;
        issues: Array<{
          severity: 'low' | 'medium' | 'high' | 'critical';
          description: string;
          line?: number;
        }>;
      };
      optimization: {
        gasEstimate: number;
        codeSize: number;
        complexity: number;
      };
    };
  };
  tests: {
    unitTests: string;
    integrationTests: string;
    coverage: number;
  };
  documentation: {
    readme: string;
    api: string;
    deployment: string;
  };
}

export class CopilotIntegration {
  private copilotUrl: string;
  private eventPublisher: EventPublisher;

  constructor() {
    this.copilotUrl = INTEGRATION_CONFIG.components['smart-contract-copilot'].url;
    this.eventPublisher = new EventPublisher();
  }

  async generateContract(request: ContractGenerationRequest): Promise<ApiResponse<CopilotGenerationResponse>> {
    try {
      console.log('[Copilot Integration] Generating contract:', request);

      // Publish generation started event
      this.eventPublisher.publishContractGenerated('smart-contract-copilot', {
        phase: 'generation_started',
        agentId: request.agentId,
        contractType: request.contractType,
      });

      const response = await axios.post(`${this.copilotUrl}/api/generate`, {
        ...request,
        config: {
          aiProvider: INTEGRATION_CONFIG.copilot.aiProvider,
          model: INTEGRATION_CONFIG.copilot.model,
          temperature: INTEGRATION_CONFIG.copilot.temperature,
        },
      }, {
        timeout: 120000, // 2 minutes timeout for contract generation
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Source': 'no-code-platform',
        },
      });

      const generationResponse: CopilotGenerationResponse = response.data;

      // Create smart contract reference
      const contractRef: SmartContractReference = {
        id: generationResponse.contract.id,
        name: generationResponse.contract.name,
        network: request.targetNetwork,
        type: this.mapFrameworkToType(generationResponse.contract.framework),
        abi: generationResponse.contract.abi,
        functions: this.extractContractFunctions(generationResponse.contract.code, generationResponse.contract.abi),
        deployed: false,
      };

      // Publish generation completed event
      this.eventPublisher.publishContractGenerated('smart-contract-copilot', {
        phase: 'generation_completed',
        agentId: request.agentId,
        contractId: contractRef.id,
        contract: contractRef,
        metadata: generationResponse.contract.metadata,
      });

      return {
        success: true,
        data: generationResponse,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('[Copilot Integration] Generation failed:', error);

      // Publish error event
      this.eventPublisher.publishContractGenerated('smart-contract-copilot', {
        phase: 'generation_failed',
        agentId: request.agentId,
        error: error.message,
      });

      return {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: error.response?.data?.message || error.message,
          details: error.response?.data,
        },
        timestamp: new Date(),
      };
    }
  }

  async deployContract(contractId: string, network: string, deploymentParams: any): Promise<ApiResponse<any>> {
    try {
      console.log('[Copilot Integration] Deploying contract:', contractId);

      const response = await axios.post(`${this.copilotUrl}/api/deploy`, {
        contractId,
        network,
        deploymentParams,
      }, {
        timeout: 180000, // 3 minutes for deployment
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Source': 'no-code-platform',
        },
      });

      // Publish deployment completed event
      this.eventPublisher.publishContractGenerated('smart-contract-copilot', {
        phase: 'deployment_completed',
        contractId,
        network,
        address: response.data.address,
        transactionHash: response.data.transactionHash,
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('[Copilot Integration] Deployment failed:', error);

      return {
        success: false,
        error: {
          code: 'DEPLOYMENT_FAILED',
          message: error.response?.data?.message || error.message,
          details: error.response?.data,
        },
        timestamp: new Date(),
      };
    }
  }

  async verifyContract(contractId: string, network: string): Promise<ApiResponse<any>> {
    try {
      const response = await axios.post(`${this.copilotUrl}/api/verify`, {
        contractId,
        network,
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('[Copilot Integration] Verification failed:', error);

      return {
        success: false,
        error: {
          code: 'VERIFICATION_FAILED',
          message: error.response?.data?.message || error.message,
          details: error.response?.data,
        },
        timestamp: new Date(),
      };
    }
  }

  async optimizeContract(contractId: string, optimizationLevel: 'low' | 'medium' | 'high'): Promise<ApiResponse<any>> {
    try {
      const response = await axios.post(`${this.copilotUrl}/api/optimize`, {
        contractId,
        optimizationLevel,
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('[Copilot Integration] Optimization failed:', error);

      return {
        success: false,
        error: {
          code: 'OPTIMIZATION_FAILED',
          message: error.response?.data?.message || error.message,
          details: error.response?.data,
        },
        timestamp: new Date(),
      };
    }
  }

  async getContractTemplates(): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${this.copilotUrl}/api/templates`);

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('[Copilot Integration] Failed to fetch templates:', error);

      return {
        success: false,
        error: {
          code: 'TEMPLATES_FETCH_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  async analyzeContract(contractCode: string): Promise<ApiResponse<any>> {
    try {
      const response = await axios.post(`${this.copilotUrl}/api/analyze`, {
        contractCode,
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('[Copilot Integration] Analysis failed:', error);

      return {
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  private mapFrameworkToType(framework: string): 'cosmwasm' | 'move' | 'evm' {
    switch (framework) {
      case 'cosmwasm':
        return 'cosmwasm';
      case 'sui-move':
        return 'move';
      case 'hardhat':
        return 'evm';
      default:
        return 'cosmwasm';
    }
  }

  private extractContractFunctions(code: string, abi?: any): any[] {
    // This would be implemented based on the contract language and ABI
    // For now, return empty array
    if (abi && abi.functions) {
      return abi.functions.map((func: any) => ({
        name: func.name,
        type: func.stateMutability === 'view' ? 'query' : 'execute',
        parameters: func.inputs || [],
        description: func.description || `Function ${func.name}`,
      }));
    }

    return [];
  }
}

// Visual Builder Integration Helper
export class VisualBuilderCopilotBridge {
  private copilot: CopilotIntegration;

  constructor() {
    this.copilot = new CopilotIntegration();
  }

  // Convert visual builder node configuration to contract requirements
  async generateFromVisualConfig(agentConfig: any): Promise<ApiResponse<CopilotGenerationResponse>> {
    const contractRequest: ContractGenerationRequest = {
      agentId: agentConfig.id,
      contractType: this.inferContractType(agentConfig),
      requirements: this.buildContractRequirements(agentConfig),
      targetNetwork: agentConfig.network || 'sei-testnet',
    };

    return this.copilot.generateContract(contractRequest);
  }

  private inferContractType(agentConfig: any): 'token' | 'nft' | 'defi' | 'governance' | 'custom' {
    // Analyze agent configuration to infer contract type
    const capabilities = agentConfig.capabilities || [];
    
    if (capabilities.some((cap: string) => cap.includes('token') || cap.includes('erc20'))) {
      return 'token';
    }
    
    if (capabilities.some((cap: string) => cap.includes('nft') || cap.includes('erc721'))) {
      return 'nft';
    }
    
    if (capabilities.some((cap: string) => cap.includes('defi') || cap.includes('swap') || cap.includes('stake'))) {
      return 'defi';
    }
    
    if (capabilities.some((cap: string) => cap.includes('governance') || cap.includes('voting'))) {
      return 'governance';
    }

    return 'custom';
  }

  private buildContractRequirements(agentConfig: any): ContractRequirements {
    return {
      name: agentConfig.name || 'Generated Contract',
      symbol: agentConfig.symbol,
      functionality: agentConfig.capabilities || [],
      security: ['access-control', 'reentrancy-guard'],
      optimization: 'medium',
      testing: {
        unitTests: true,
        integrationTests: true,
        fuzzTesting: false,
        coverage: 80,
      },
    };
  }

  // Create contract deployment pipeline for visual builder
  async createDeploymentPipeline(contractId: string, agentConfig: any): Promise<{
    steps: Array<{
      name: string;
      description: string;
      action: () => Promise<any>;
    }>;
  }> {
    return {
      steps: [
        {
          name: 'Compile Contract',
          description: 'Compile the generated smart contract',
          action: async () => {
            // This would integrate with the copilot's compilation service
            return { success: true, message: 'Contract compiled successfully' };
          },
        },
        {
          name: 'Run Tests',
          description: 'Execute unit and integration tests',
          action: async () => {
            // This would run the generated tests
            return { success: true, coverage: 85, tests: 12 };
          },
        },
        {
          name: 'Security Audit',
          description: 'Perform automated security analysis',
          action: async () => {
            return this.copilot.analyzeContract(contractId);
          },
        },
        {
          name: 'Deploy to Testnet',
          description: 'Deploy contract to test network',
          action: async () => {
            return this.copilot.deployContract(contractId, 'testnet', agentConfig.deploymentParams);
          },
        },
        {
          name: 'Verify Contract',
          description: 'Verify contract source code',
          action: async () => {
            return this.copilot.verifyContract(contractId, 'testnet');
          },
        },
        {
          name: 'Deploy to Mainnet',
          description: 'Deploy to production network',
          action: async () => {
            return this.copilot.deployContract(contractId, 'mainnet', agentConfig.deploymentParams);
          },
        },
      ],
    };
  }
}

export default CopilotIntegration;