// Integration client for no-code platform to connect with integration layer

import axios, { AxiosInstance } from 'axios';
import { 
  AgentConfig, 
  AgentDeploymentRequest, 
  ContractGenerationRequest,
  WalletConnectionRequest,
  ApiResponse,
  WebSocketMessage
} from '../../shared/types/integration';

export interface IntegrationClientConfig {
  apiUrl: string;
  wsUrl: string;
  timeout?: number;
  retries?: number;
}

export class IntegrationClient {
  private api: AxiosInstance;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private wsReconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(config: IntegrationClientConfig) {
    this.wsUrl = config.wsUrl;
    
    this.api = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'no-code-platform',
      },
    });

    this.setupInterceptors();
    this.connectWebSocket();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use((config) => {
      console.log(`[Integration Client] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[Integration Client] API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  private connectWebSocket(): void {
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('[Integration Client] WebSocket connected');
        this.wsReconnectAttempts = 0;
        
        // Authenticate with server
        this.sendWebSocketMessage({
          type: 'request',
          id: this.generateId(),
          payload: {
            action: 'authenticate',
            componentType: 'no-code-platform',
          },
          timestamp: new Date(),
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('[Integration Client] Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('[Integration Client] WebSocket disconnected');
        this.ws = null;
        this.attemptReconnection();
      };

      this.ws.onerror = (error) => {
        console.error('[Integration Client] WebSocket error:', error);
      };

    } catch (error) {
      console.error('[Integration Client] WebSocket connection failed:', error);
      this.attemptReconnection();
    }
  }

  private attemptReconnection(): void {
    if (this.wsReconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[Integration Client] Max reconnection attempts reached');
      return;
    }

    this.wsReconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.wsReconnectAttempts - 1), 30000);

    console.log(`[Integration Client] Reconnecting in ${delay}ms (attempt ${this.wsReconnectAttempts})`);
    
    setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  }

  private handleWebSocketMessage(message: WebSocketMessage): void {
    // Emit to listeners
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('[Integration Client] Error in message listener:', error);
        }
      });
    }

    // Handle specific message types
    if (message.type === 'event' && message.payload) {
      const eventListeners = this.listeners.get('event:' + message.payload.type);
      if (eventListeners) {
        eventListeners.forEach(callback => {
          try {
            callback(message.payload);
          } catch (error) {
            console.error('[Integration Client] Error in event listener:', error);
          }
        });
      }
    }
  }

  private sendWebSocketMessage(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[Integration Client] WebSocket not connected, message not sent');
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Agent deployment methods
  async deployAgent(request: AgentDeploymentRequest): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/api/integration/deploy-agent', request);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AGENT_DEPLOYMENT_FAILED',
          message: error.response?.data?.message || error.message,
          details: error.response?.data,
        },
        timestamp: new Date(),
      };
    }
  }

  async getDeploymentStatus(pipelineId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/api/integration/deployment/${pipelineId}/status`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DEPLOYMENT_STATUS_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // Contract generation methods
  async generateContract(request: ContractGenerationRequest): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/api/integration/generate-contract', request);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONTRACT_GENERATION_FAILED',
          message: error.response?.data?.message || error.message,
          details: error.response?.data,
        },
        timestamp: new Date(),
      };
    }
  }

  async deployContract(contractId: string, network: string, params: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post(`/api/copilot/deploy`, {
        contractId,
        network,
        deploymentParams: params,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CONTRACT_DEPLOYMENT_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // Wallet connection methods
  async connectWallet(request: WalletConnectionRequest): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/api/integration/connect-wallet', request);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WALLET_CONNECTION_FAILED',
          message: error.response?.data?.message || error.message,
          details: error.response?.data,
        },
        timestamp: new Date(),
      };
    }
  }

  async getWalletBalance(address: string, chainId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get(`/api/sdk/wallet/${address}/balance`, {
        params: { chainId },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WALLET_BALANCE_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // System monitoring methods
  async getSystemStatus(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/api/integration/status');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SYSTEM_STATUS_FAILED',
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }

  // WebSocket subscription methods
  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);

    // Send subscription request to server
    this.sendWebSocketMessage({
      type: 'request',
      id: this.generateId(),
      payload: {
        action: 'subscribe',
        eventTypes: [eventType],
      },
      timestamp: new Date(),
    });

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
          
          // Send unsubscription request
          this.sendWebSocketMessage({
            type: 'request',
            id: this.generateId(),
            payload: {
              action: 'unsubscribe',
              eventTypes: [eventType],
            },
            timestamp: new Date(),
          });
        }
      }
    };
  }

  // Convenience subscription methods
  onAgentDeployed(callback: (data: any) => void): () => void {
    return this.subscribe('event:agent_deployed', callback);
  }

  onContractGenerated(callback: (data: any) => void): () => void {
    return this.subscribe('event:contract_ready_for_deployment', callback);
  }

  onWalletConnected(callback: (data: any) => void): () => void {
    return this.subscribe('event:wallet_connected', callback);
  }

  onSystemHealthUpdate(callback: (data: any) => void): () => void {
    return this.subscribe('event:system_health_update', callback);
  }

  onPipelineUpdate(callback: (data: any) => void): () => void {
    return this.subscribe('event:pipeline_update', callback);
  }

  // Cleanup
  disconnect(): void {
    this.listeners.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Factory function for creating integration client
export function createIntegrationClient(config?: Partial<IntegrationClientConfig>): IntegrationClient {
  const defaultConfig: IntegrationClientConfig = {
    apiUrl: 'http://localhost:3001',
    wsUrl: 'ws://localhost:3002/ws',
    timeout: 30000,
    retries: 3,
  };

  return new IntegrationClient({ ...defaultConfig, ...config });
}

export default IntegrationClient;