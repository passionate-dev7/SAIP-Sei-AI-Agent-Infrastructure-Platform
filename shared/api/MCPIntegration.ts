// MCP Server Integration for orchestrating components

import axios from 'axios';
import WebSocket from 'ws';
import { INTEGRATION_CONFIG } from '../config/integration';
import { MCPRequest, MCPResponse, ComponentType, ApiResponse } from '../types/integration';
import { EventPublisher } from '../events/EventBus';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  mimeType: string;
  description: string;
}

export class MCPIntegration {
  private mcpUrl: string;
  private wsConnection: WebSocket | null = null;
  private eventPublisher: EventPublisher;
  private requestId = 0;
  private pendingRequests = new Map<string, { resolve: Function; reject: Function }>();

  constructor() {
    this.mcpUrl = INTEGRATION_CONFIG.components['mcp-server'].url;
    this.eventPublisher = new EventPublisher();
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      const wsUrl = this.mcpUrl.replace('http', 'ws') + '/ws';
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.on('open', () => {
        console.log('[MCP Integration] WebSocket connected');
        this.sendInitializeRequest();
      });

      this.wsConnection.on('message', (data: WebSocket.Data) => {
        try {
          const response: MCPResponse = JSON.parse(data.toString());
          this.handleResponse(response);
        } catch (error) {
          console.error('[MCP Integration] Error parsing message:', error);
        }
      });

      this.wsConnection.on('close', () => {
        console.log('[MCP Integration] WebSocket disconnected');
        // Reconnect after delay
        setTimeout(() => this.connect(), 5000);
      });

      this.wsConnection.on('error', (error) => {
        console.error('[MCP Integration] WebSocket error:', error);
      });

    } catch (error) {
      console.error('[MCP Integration] Connection failed:', error);
      // Retry connection
      setTimeout(() => this.connect(), 5000);
    }
  }

  private sendInitializeRequest(): void {
    const request: MCPRequest = {
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {},
        },
        clientInfo: {
          name: 'SEI Integration Layer',
          version: '1.0.0',
        },
      },
      id: this.generateRequestId(),
    };

    this.sendRequest(request);
  }

  private sendRequest(request: MCPRequest): Promise<MCPResponse> {
    return new Promise((resolve, reject) => {
      if (!this.wsConnection || this.wsConnection.readyState !== WebSocket.OPEN) {
        reject(new Error('MCP WebSocket not connected'));
        return;
      }

      this.pendingRequests.set(request.id, { resolve, reject });
      
      try {
        this.wsConnection.send(JSON.stringify(request));
      } catch (error) {
        this.pendingRequests.delete(request.id);
        reject(error);
      }

      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(request.id)) {
          this.pendingRequests.delete(request.id);
          reject(new Error('MCP request timeout'));
        }
      }, 30000);
    });
  }

  private handleResponse(response: MCPResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (pending) {
      this.pendingRequests.delete(response.id);
      
      if (response.error) {
        pending.reject(new Error(response.error.message));
      } else {
        pending.resolve(response);
      }
    }
  }

  private generateRequestId(): string {
    return `req_${++this.requestId}`;
  }

  // Tool execution methods
  async listTools(): Promise<ApiResponse<MCPTool[]>> {
    try {
      const request: MCPRequest = {
        method: 'tools/list',
        params: {},
        id: this.generateRequestId(),
      };

      const response = await this.sendRequest(request);
      
      return {
        success: true,
        data: response.result?.tools || [],
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MCP_TOOLS_LIST_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  async callTool(toolName: string, parameters: any): Promise<ApiResponse<any>> {
    try {
      const request: MCPRequest = {
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: parameters,
        },
        id: this.generateRequestId(),
      };

      const response = await this.sendRequest(request);

      // Publish tool execution event
      this.eventPublisher.publishRealtimeUpdate('mcp-server', {
        action: 'tool_executed',
        tool: toolName,
        parameters,
        result: response.result,
      });
      
      return {
        success: true,
        data: response.result,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MCP_TOOL_CALL_FAILED',
          message: error.message,
          details: { toolName, parameters },
        },
        timestamp: new Date(),
      };
    }
  }

  // Resource methods
  async listResources(): Promise<ApiResponse<MCPResource[]>> {
    try {
      const request: MCPRequest = {
        method: 'resources/list',
        params: {},
        id: this.generateRequestId(),
      };

      const response = await this.sendRequest(request);
      
      return {
        success: true,
        data: response.result?.resources || [],
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MCP_RESOURCES_LIST_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  async readResource(uri: string): Promise<ApiResponse<any>> {
    try {
      const request: MCPRequest = {
        method: 'resources/read',
        params: {
          uri,
        },
        id: this.generateRequestId(),
      };

      const response = await this.sendRequest(request);
      
      return {
        success: true,
        data: response.result,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MCP_RESOURCE_READ_FAILED',
          message: error.message,
          details: { uri },
        },
        timestamp: new Date(),
      };
    }
  }

  // Agent orchestration methods
  async orchestrateAgentDeployment(agentConfig: any): Promise<ApiResponse<any>> {
    try {
      const result = await this.callTool('agent_deploy', {
        config: agentConfig,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AGENT_ORCHESTRATION_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  async orchestrateContractDeployment(contractConfig: any): Promise<ApiResponse<any>> {
    try {
      const result = await this.callTool('contract_deploy', {
        config: contractConfig,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONTRACT_ORCHESTRATION_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  async orchestrateWalletConnection(walletConfig: any): Promise<ApiResponse<any>> {
    try {
      const result = await this.callTool('wallet_connect', {
        config: walletConfig,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WALLET_ORCHESTRATION_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // System monitoring methods
  async getSystemHealth(): Promise<ApiResponse<any>> {
    try {
      const result = await this.callTool('system_health', {});
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SYSTEM_HEALTH_CHECK_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  async getComponentMetrics(componentType: ComponentType): Promise<ApiResponse<any>> {
    try {
      const result = await this.callTool('component_metrics', {
        component: componentType,
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'COMPONENT_METRICS_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // AI-powered assistance methods
  async getAgentRecommendations(requirements: any): Promise<ApiResponse<any>> {
    try {
      const result = await this.callTool('agent_recommendations', {
        requirements,
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AGENT_RECOMMENDATIONS_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  async optimizeAgentConfiguration(agentId: string, metrics: any): Promise<ApiResponse<any>> {
    try {
      const result = await this.callTool('optimize_agent', {
        agentId,
        metrics,
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AGENT_OPTIMIZATION_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // Close connection
  close(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}

export default MCPIntegration;