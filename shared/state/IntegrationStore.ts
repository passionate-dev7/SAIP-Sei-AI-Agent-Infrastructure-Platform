// Shared state management using Zustand for component integration

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  AgentConfig, 
  SmartContractReference, 
  WalletConfig, 
  SystemState, 
  ComponentStatus, 
  ComponentType,
  AgentDeploymentRequest,
  IntegrationEvent
} from '../types/integration';

export interface IntegrationState extends SystemState {
  // Actions for agents
  addAgent: (agent: AgentConfig) => void;
  updateAgent: (id: string, updates: Partial<AgentConfig>) => void;
  removeAgent: (id: string) => void;
  getAgent: (id: string) => AgentConfig | undefined;
  
  // Actions for deployments
  addDeployment: (deployment: AgentDeploymentRequest & { id: string }) => void;
  updateDeployment: (id: string, updates: Partial<AgentDeploymentRequest>) => void;
  removeDeployment: (id: string) => void;
  getDeployment: (id: string) => AgentDeploymentRequest | undefined;
  
  // Actions for contracts
  addContract: (contract: SmartContractReference) => void;
  updateContract: (id: string, updates: Partial<SmartContractReference>) => void;
  removeContract: (id: string) => void;
  getContract: (id: string) => SmartContractReference | undefined;
  
  // Actions for wallets
  addWallet: (wallet: WalletConfig & { id: string }) => void;
  updateWallet: (id: string, updates: Partial<WalletConfig>) => void;
  removeWallet: (id: string) => void;
  getWallet: (id: string) => WalletConfig | undefined;
  
  // Actions for events
  addEvent: (event: IntegrationEvent) => void;
  markEventHandled: (eventId: string) => void;
  clearEvents: () => void;
  getUnhandledEvents: () => IntegrationEvent[];
  
  // Actions for system status
  updateComponentStatus: (component: ComponentType, status: ComponentStatus) => void;
  updateSystemHealth: (healthy: boolean) => void;
  
  // Utility actions
  reset: () => void;
  getStats: () => {
    totalAgents: number;
    activeDeployments: number;
    deployedContracts: number;
    connectedWallets: number;
    unhandledEvents: number;
  };
}

const initialState: SystemState = {
  agents: {},
  deployments: {},
  contracts: {},
  wallets: {},
  events: [],
  status: {
    healthy: true,
    components: {
      'no-code-platform': {
        online: false,
        version: '1.0.0',
        lastHeartbeat: new Date(),
        errors: [],
        metrics: {},
      },
      'agent-framework': {
        online: false,
        version: '1.0.0',
        lastHeartbeat: new Date(),
        errors: [],
        metrics: {},
      },
      'smart-contract-copilot': {
        online: false,
        version: '1.0.0',
        lastHeartbeat: new Date(),
        errors: [],
        metrics: {},
      },
      'mcp-server': {
        online: false,
        version: '1.0.0',
        lastHeartbeat: new Date(),
        errors: [],
        metrics: {},
      },
      'sdk': {
        online: false,
        version: '1.0.0',
        lastHeartbeat: new Date(),
        errors: [],
        metrics: {},
      },
    },
    lastCheck: new Date(),
  },
};

export const useIntegrationStore = create<IntegrationState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        // Agent actions
        addAgent: (agent: AgentConfig) => {
          set((state) => ({
            agents: {
              ...state.agents,
              [agent.id]: agent,
            },
          }));
        },

        updateAgent: (id: string, updates: Partial<AgentConfig>) => {
          set((state) => ({
            agents: {
              ...state.agents,
              [id]: state.agents[id] ? { ...state.agents[id], ...updates, lastModified: new Date() } : state.agents[id],
            },
          }));
        },

        removeAgent: (id: string) => {
          set((state) => {
            const { [id]: removed, ...rest } = state.agents;
            return { agents: rest };
          });
        },

        getAgent: (id: string) => {
          return get().agents[id];
        },

        // Deployment actions
        addDeployment: (deployment: AgentDeploymentRequest & { id: string }) => {
          set((state) => ({
            deployments: {
              ...state.deployments,
              [deployment.id]: deployment,
            },
          }));
        },

        updateDeployment: (id: string, updates: Partial<AgentDeploymentRequest>) => {
          set((state) => ({
            deployments: {
              ...state.deployments,
              [id]: state.deployments[id] ? { ...state.deployments[id], ...updates } : state.deployments[id],
            },
          }));
        },

        removeDeployment: (id: string) => {
          set((state) => {
            const { [id]: removed, ...rest } = state.deployments;
            return { deployments: rest };
          });
        },

        getDeployment: (id: string) => {
          return get().deployments[id];
        },

        // Contract actions
        addContract: (contract: SmartContractReference) => {
          set((state) => ({
            contracts: {
              ...state.contracts,
              [contract.id]: contract,
            },
          }));
        },

        updateContract: (id: string, updates: Partial<SmartContractReference>) => {
          set((state) => ({
            contracts: {
              ...state.contracts,
              [id]: state.contracts[id] ? { ...state.contracts[id], ...updates } : state.contracts[id],
            },
          }));
        },

        removeContract: (id: string) => {
          set((state) => {
            const { [id]: removed, ...rest } = state.contracts;
            return { contracts: rest };
          });
        },

        getContract: (id: string) => {
          return get().contracts[id];
        },

        // Wallet actions
        addWallet: (wallet: WalletConfig & { id: string }) => {
          set((state) => ({
            wallets: {
              ...state.wallets,
              [wallet.id]: wallet,
            },
          }));
        },

        updateWallet: (id: string, updates: Partial<WalletConfig>) => {
          set((state) => ({
            wallets: {
              ...state.wallets,
              [id]: state.wallets[id] ? { ...state.wallets[id], ...updates } : state.wallets[id],
            },
          }));
        },

        removeWallet: (id: string) => {
          set((state) => {
            const { [id]: removed, ...rest } = state.wallets;
            return { wallets: rest };
          });
        },

        getWallet: (id: string) => {
          return get().wallets[id];
        },

        // Event actions
        addEvent: (event: IntegrationEvent) => {
          set((state) => ({
            events: [...state.events, event].slice(-1000), // Keep last 1000 events
          }));
        },

        markEventHandled: (eventId: string) => {
          set((state) => ({
            events: state.events.map((event) =>
              event.id === eventId ? { ...event, handled: true } : event
            ),
          }));
        },

        clearEvents: () => {
          set({ events: [] });
        },

        getUnhandledEvents: () => {
          return get().events.filter((event) => !event.handled);
        },

        // System status actions
        updateComponentStatus: (component: ComponentType, status: ComponentStatus) => {
          set((state) => ({
            status: {
              ...state.status,
              components: {
                ...state.status.components,
                [component]: status,
              },
              lastCheck: new Date(),
            },
          }));
        },

        updateSystemHealth: (healthy: boolean) => {
          set((state) => ({
            status: {
              ...state.status,
              healthy,
              lastCheck: new Date(),
            },
          }));
        },

        // Utility actions
        reset: () => {
          set(initialState);
        },

        getStats: () => {
          const state = get();
          return {
            totalAgents: Object.keys(state.agents).length,
            activeDeployments: Object.keys(state.deployments).length,
            deployedContracts: Object.values(state.contracts).filter((c) => c.deployed).length,
            connectedWallets: Object.keys(state.wallets).length,
            unhandledEvents: state.events.filter((e) => !e.handled).length,
          };
        },
      }),
      {
        name: 'sei-integration-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist essential data, not ephemeral state
          agents: state.agents,
          contracts: state.contracts,
          wallets: state.wallets,
        }),
      }
    )
  )
);

// Selector hooks for specific data
export const useAgents = () => useIntegrationStore((state) => state.agents);
export const useContracts = () => useIntegrationStore((state) => state.contracts);
export const useWallets = () => useIntegrationStore((state) => state.wallets);
export const useDeployments = () => useIntegrationStore((state) => state.deployments);
export const useSystemStatus = () => useIntegrationStore((state) => state.status);
export const useSystemHealth = () => useIntegrationStore((state) => state.status.healthy);
export const useUnhandledEvents = () => useIntegrationStore((state) => state.getUnhandledEvents());
export const useStats = () => useIntegrationStore((state) => state.getStats());

// Action hooks
export const useAgentActions = () => useIntegrationStore((state) => ({
  addAgent: state.addAgent,
  updateAgent: state.updateAgent,
  removeAgent: state.removeAgent,
  getAgent: state.getAgent,
}));

export const useContractActions = () => useIntegrationStore((state) => ({
  addContract: state.addContract,
  updateContract: state.updateContract,
  removeContract: state.removeContract,
  getContract: state.getContract,
}));

export const useWalletActions = () => useIntegrationStore((state) => ({
  addWallet: state.addWallet,
  updateWallet: state.updateWallet,
  removeWallet: state.removeWallet,
  getWallet: state.getWallet,
}));

export const useSystemActions = () => useIntegrationStore((state) => ({
  updateComponentStatus: state.updateComponentStatus,
  updateSystemHealth: state.updateSystemHealth,
  addEvent: state.addEvent,
  markEventHandled: state.markEventHandled,
  clearEvents: state.clearEvents,
  reset: state.reset,
}));

// Subscribe to changes
export const subscribeToAgents = (callback: (agents: Record<string, AgentConfig>) => void) => {
  return useIntegrationStore.subscribe(
    (state) => state.agents,
    callback
  );
};

export const subscribeToSystemHealth = (callback: (healthy: boolean) => void) => {
  return useIntegrationStore.subscribe(
    (state) => state.status.healthy,
    callback
  );
};

export default useIntegrationStore;