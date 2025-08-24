// Agent deployment pipeline from visual builder to framework

import { 
  AgentConfig, 
  AgentDeploymentRequest, 
  SmartContractReference,
  ApiResponse,
  ComponentType 
} from '../types/integration';
import { INTEGRATION_CONFIG } from '../config/integration';
import { EventPublisher } from '../events/EventBus';
import { CopilotIntegration, VisualBuilderCopilotBridge } from './CopilotIntegration';
import { MCPIntegration } from './MCPIntegration';
import { GoatSDKIntegration } from './GoatSDKIntegration';
import axios from 'axios';

export interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  error?: string;
  result?: any;
}

export interface DeploymentPipeline {
  id: string;
  agentId: string;
  status: 'created' | 'running' | 'completed' | 'failed';
  steps: DeploymentStep[];
  startTime: Date;
  endTime?: Date;
  deployedAgent?: any;
  contracts?: SmartContractReference[];
  wallets?: string[];
}

export class AgentDeploymentPipeline {
  private copilotBridge: VisualBuilderCopilotBridge;
  private mcpIntegration: MCPIntegration;
  private goatIntegration: GoatSDKIntegration;
  private eventPublisher: EventPublisher;
  private activePipelines: Map<string, DeploymentPipeline> = new Map();

  constructor() {
    this.copilotBridge = new VisualBuilderCopilotBridge();
    this.mcpIntegration = new MCPIntegration();
    this.goatIntegration = new GoatSDKIntegration();
    this.eventPublisher = new EventPublisher();
  }

  async deployAgent(request: AgentDeploymentRequest): Promise<ApiResponse<DeploymentPipeline>> {
    try {
      const pipelineId = this.generatePipelineId();
      
      // Create deployment pipeline
      const pipeline: DeploymentPipeline = {
        id: pipelineId,
        agentId: request.agentConfig.id,
        status: 'created',
        startTime: new Date(),
        steps: this.createDeploymentSteps(request),
        contracts: [],
        wallets: [],
      };

      this.activePipelines.set(pipelineId, pipeline);

      // Publish pipeline created event
      this.eventPublisher.publishAgentCreated('agent-framework', {
        pipelineId,
        agentId: request.agentConfig.id,
        steps: pipeline.steps.length,
      });

      // Start deployment process
      this.executePipeline(pipeline, request);

      return {
        success: true,
        data: pipeline,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('[Deployment Pipeline] Failed to start deployment:', error);

      return {
        success: false,
        error: {
          code: 'DEPLOYMENT_START_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  private createDeploymentSteps(request: AgentDeploymentRequest): DeploymentStep[] {
    const steps: DeploymentStep[] = [];

    // Step 1: Validate configuration
    steps.push({
      id: 'validate-config',
      name: 'Validate Configuration',
      description: 'Validate agent configuration and requirements',
      status: 'pending',
    });

    // Step 2: Generate smart contracts (if needed)
    if (request.agentConfig.smartContracts && request.agentConfig.smartContracts.length > 0) {
      steps.push({
        id: 'generate-contracts',
        name: 'Generate Smart Contracts',
        description: 'Generate smart contracts using AI copilot',
        status: 'pending',
      });
    }

    // Step 3: Set up wallet connections
    if (request.agentConfig.walletConfig) {
      steps.push({
        id: 'setup-wallet',
        name: 'Setup Wallet',
        description: 'Configure wallet connections and permissions',
        status: 'pending',
      });
    }

    // Step 4: Deploy contracts (if any)
    if (request.agentConfig.smartContracts && request.agentConfig.smartContracts.length > 0) {
      steps.push({
        id: 'deploy-contracts',
        name: 'Deploy Contracts',
        description: 'Deploy generated smart contracts to blockchain',
        status: 'pending',
      });
    }

    // Step 5: Configure agent runtime
    steps.push({
      id: 'configure-runtime',
      name: 'Configure Runtime',
      description: 'Set up agent runtime environment and dependencies',
      status: 'pending',
    });

    // Step 6: Deploy to framework
    steps.push({
      id: 'deploy-agent',
      name: 'Deploy Agent',
      description: 'Deploy agent to framework with all configurations',
      status: 'pending',
    });

    // Step 7: Start monitoring
    if (request.monitoring.enabled) {
      steps.push({
        id: 'start-monitoring',
        name: 'Start Monitoring',
        description: 'Initialize monitoring and health checks',
        status: 'pending',
      });
    }

    // Step 8: Run tests
    steps.push({
      id: 'run-tests',
      name: 'Run Tests',
      description: 'Execute deployment validation tests',
      status: 'pending',
    });

    return steps;
  }

  private async executePipeline(pipeline: DeploymentPipeline, request: AgentDeploymentRequest): Promise<void> {
    try {
      pipeline.status = 'running';
      this.updatePipeline(pipeline.id, pipeline);

      for (const step of pipeline.steps) {
        await this.executeStep(pipeline, step, request);
        
        if (step.status === 'failed') {
          pipeline.status = 'failed';
          break;
        }
      }

      if (pipeline.status === 'running') {
        pipeline.status = 'completed';
        pipeline.endTime = new Date();
      }

      this.updatePipeline(pipeline.id, pipeline);

      // Publish completion event
      this.eventPublisher.publishAgentDeployed('agent-framework', {
        pipelineId: pipeline.id,
        agentId: pipeline.agentId,
        status: pipeline.status,
        duration: pipeline.endTime ? 
          pipeline.endTime.getTime() - pipeline.startTime.getTime() : null,
      });

    } catch (error) {
      console.error('[Deployment Pipeline] Pipeline execution failed:', error);
      pipeline.status = 'failed';
      pipeline.endTime = new Date();
      this.updatePipeline(pipeline.id, pipeline);
    }
  }

  private async executeStep(
    pipeline: DeploymentPipeline, 
    step: DeploymentStep, 
    request: AgentDeploymentRequest
  ): Promise<void> {
    step.status = 'running';
    step.startTime = new Date();
    this.updatePipeline(pipeline.id, pipeline);

    try {
      switch (step.id) {
        case 'validate-config':
          await this.validateConfiguration(request);
          break;

        case 'generate-contracts':
          const contracts = await this.generateContracts(request);
          pipeline.contracts = contracts;
          step.result = { contractsGenerated: contracts.length };
          break;

        case 'setup-wallet':
          const wallets = await this.setupWallets(request);
          pipeline.wallets = wallets;
          step.result = { walletsConnected: wallets.length };
          break;

        case 'deploy-contracts':
          if (pipeline.contracts) {
            await this.deployContracts(pipeline.contracts, request);
            step.result = { contractsDeployed: pipeline.contracts.length };
          }
          break;

        case 'configure-runtime':
          await this.configureRuntime(request);
          break;

        case 'deploy-agent':
          const deployedAgent = await this.deployToFramework(request, pipeline);
          pipeline.deployedAgent = deployedAgent;
          step.result = deployedAgent;
          break;

        case 'start-monitoring':
          await this.startMonitoring(request, pipeline);
          break;

        case 'run-tests':
          const testResults = await this.runDeploymentTests(pipeline);
          step.result = testResults;
          break;

        default:
          throw new Error(`Unknown step: ${step.id}`);
      }

      step.status = 'completed';
      step.endTime = new Date();

    } catch (error) {
      console.error(`[Deployment Pipeline] Step ${step.id} failed:`, error);
      step.status = 'failed';
      step.endTime = new Date();
      step.error = error.message;
      throw error;
    }

    this.updatePipeline(pipeline.id, pipeline);
  }

  private async validateConfiguration(request: AgentDeploymentRequest): Promise<void> {
    // Validate agent configuration
    if (!request.agentConfig.id || !request.agentConfig.name) {
      throw new Error('Agent must have id and name');
    }

    if (!request.agentConfig.type) {
      throw new Error('Agent type is required');
    }

    // Validate resource requirements
    if (request.resourceRequirements.cpu < 0.1 || request.resourceRequirements.cpu > 8) {
      throw new Error('CPU requirements must be between 0.1 and 8 cores');
    }

    // Validate deployment target
    if (!['local', 'testnet', 'mainnet'].includes(request.deploymentTarget)) {
      throw new Error('Invalid deployment target');
    }

    console.log('[Deployment Pipeline] Configuration validated successfully');
  }

  private async generateContracts(request: AgentDeploymentRequest): Promise<SmartContractReference[]> {
    const contracts: SmartContractReference[] = [];

    if (request.agentConfig.smartContracts) {
      for (const contractRef of request.agentConfig.smartContracts) {
        if (!contractRef.deployed) {
          // Generate contract using copilot
          const generationResult = await this.copilotBridge.generateFromVisualConfig(request.agentConfig);
          
          if (generationResult.success && generationResult.data) {
            const generatedContract: SmartContractReference = {
              id: generationResult.data.contract.id,
              name: generationResult.data.contract.name,
              network: request.deploymentTarget === 'mainnet' ? 'sei-mainnet' : 'sei-testnet',
              type: 'cosmwasm',
              abi: generationResult.data.contract.abi,
              functions: [], // Will be extracted from ABI
              deployed: false,
            };

            contracts.push(generatedContract);
          }
        }
      }
    }

    return contracts;
  }

  private async setupWallets(request: AgentDeploymentRequest): Promise<string[]> {
    const wallets: string[] = [];

    if (request.agentConfig.walletConfig) {
      // Connect wallet using GOAT SDK
      const connectionResult = await this.goatIntegration.connectWallet({
        provider: request.agentConfig.walletConfig.walletProvider as any,
        chainId: request.agentConfig.walletConfig.chainId,
        network: request.agentConfig.walletConfig.network,
      });

      if (connectionResult.success && connectionResult.data) {
        wallets.push(connectionResult.data.address);
      }
    }

    return wallets;
  }

  private async deployContracts(contracts: SmartContractReference[], request: AgentDeploymentRequest): Promise<void> {
    // Deploy each contract
    for (const contract of contracts) {
      const deploymentResult = await this.copilotBridge.copilot.deployContract(
        contract.id,
        contract.network,
        {
          gasLimit: '2000000',
          gasPrice: 'auto',
        }
      );

      if (deploymentResult.success) {
        contract.deployed = true;
        contract.address = deploymentResult.data.address;
      } else {
        throw new Error(`Contract deployment failed: ${deploymentResult.error?.message}`);
      }
    }
  }

  private async configureRuntime(request: AgentDeploymentRequest): Promise<void> {
    // Configure agent runtime environment
    const runtimeConfig = {
      resources: request.resourceRequirements,
      environment: {
        NODE_ENV: request.deploymentTarget === 'mainnet' ? 'production' : 'development',
        NETWORK: request.deploymentTarget,
        AGENT_ID: request.agentConfig.id,
      },
      dependencies: request.agentConfig.capabilities,
    };

    // Use MCP to configure runtime
    await this.mcpIntegration.callTool('configure_runtime', runtimeConfig);
  }

  private async deployToFramework(request: AgentDeploymentRequest, pipeline: DeploymentPipeline): Promise<any> {
    // Deploy agent to framework
    const frameworkUrl = INTEGRATION_CONFIG.components['agent-framework'].url;
    
    const deploymentPayload = {
      config: request.agentConfig,
      contracts: pipeline.contracts,
      wallets: pipeline.wallets,
      runtime: {
        resources: request.resourceRequirements,
        monitoring: request.monitoring,
      },
    };

    const response = await axios.post(`${frameworkUrl}/api/agents/deploy`, deploymentPayload, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'X-Pipeline-Id': pipeline.id,
      },
    });

    return response.data;
  }

  private async startMonitoring(request: AgentDeploymentRequest, pipeline: DeploymentPipeline): Promise<void> {
    if (request.monitoring.enabled) {
      await this.mcpIntegration.callTool('start_monitoring', {
        agentId: request.agentConfig.id,
        pipelineId: pipeline.id,
        metrics: request.monitoring.metrics,
        thresholds: request.monitoring.alertThresholds,
      });
    }
  }

  private async runDeploymentTests(pipeline: DeploymentPipeline): Promise<any> {
    const testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: [],
    };

    // Test 1: Agent health check
    try {
      const healthCheck = await this.mcpIntegration.callTool('health_check', {
        agentId: pipeline.agentId,
      });
      
      testResults.total++;
      if (healthCheck.success) {
        testResults.passed++;
        testResults.details.push({ test: 'Health Check', status: 'passed' });
      } else {
        testResults.failed++;
        testResults.details.push({ test: 'Health Check', status: 'failed', error: healthCheck.error });
      }
    } catch (error) {
      testResults.total++;
      testResults.failed++;
      testResults.details.push({ test: 'Health Check', status: 'failed', error: error.message });
    }

    // Test 2: Contract interactions (if any)
    if (pipeline.contracts && pipeline.contracts.length > 0) {
      for (const contract of pipeline.contracts) {
        try {
          const contractTest = await this.testContractInteraction(contract);
          testResults.total++;
          if (contractTest.success) {
            testResults.passed++;
            testResults.details.push({ test: `Contract ${contract.name}`, status: 'passed' });
          } else {
            testResults.failed++;
            testResults.details.push({ test: `Contract ${contract.name}`, status: 'failed' });
          }
        } catch (error) {
          testResults.total++;
          testResults.failed++;
          testResults.details.push({ test: `Contract ${contract.name}`, status: 'failed', error: error.message });
        }
      }
    }

    return testResults;
  }

  private async testContractInteraction(contract: SmartContractReference): Promise<any> {
    // Basic contract interaction test
    if (contract.functions.length > 0) {
      const queryFunction = contract.functions.find(f => f.type === 'query');
      if (queryFunction && contract.address) {
        return await this.goatIntegration.queryContractMethod({
          contractAddress: contract.address,
          abi: contract.abi,
          methodName: queryFunction.name,
          parameters: [],
          chainId: contract.network,
        });
      }
    }
    
    return { success: true, message: 'No testable functions' };
  }

  // Public methods for pipeline management
  getPipeline(pipelineId: string): DeploymentPipeline | undefined {
    return this.activePipelines.get(pipelineId);
  }

  getAllPipelines(): DeploymentPipeline[] {
    return Array.from(this.activePipelines.values());
  }

  getPipelinesByAgent(agentId: string): DeploymentPipeline[] {
    return Array.from(this.activePipelines.values()).filter(
      pipeline => pipeline.agentId === agentId
    );
  }

  async cancelPipeline(pipelineId: string): Promise<boolean> {
    const pipeline = this.activePipelines.get(pipelineId);
    if (pipeline && pipeline.status === 'running') {
      pipeline.status = 'failed';
      pipeline.endTime = new Date();
      
      // Cancel any running steps
      for (const step of pipeline.steps) {
        if (step.status === 'running') {
          step.status = 'failed';
          step.error = 'Pipeline cancelled';
          step.endTime = new Date();
        }
      }

      this.updatePipeline(pipelineId, pipeline);
      return true;
    }
    return false;
  }

  private updatePipeline(pipelineId: string, pipeline: DeploymentPipeline): void {
    this.activePipelines.set(pipelineId, { ...pipeline });
    
    // Publish update event
    this.eventPublisher.publishRealtimeUpdate('agent-framework', {
      type: 'pipeline_update',
      pipelineId,
      status: pipeline.status,
      completedSteps: pipeline.steps.filter(s => s.status === 'completed').length,
      totalSteps: pipeline.steps.length,
    });
  }

  private generatePipelineId(): string {
    return `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default AgentDeploymentPipeline;