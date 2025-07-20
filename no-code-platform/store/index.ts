import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Agent, Workflow, Template, ABTest, Collaboration } from '../types';

// Main application store
interface AppState {
  // UI State
  sidebarOpen: boolean;
  currentView: 'dashboard' | 'builder' | 'workflows' | 'templates' | 'marketplace' | 'analytics';
  theme: 'light' | 'dark' | 'system';
  
  // User State
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  setTheme: (theme: AppState['theme']) => void;
  setUser: (user: User | null) => void;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        sidebarOpen: true,
        currentView: 'dashboard',
        theme: 'system',
        user: null,
        isAuthenticated: false,
        
        // Actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setCurrentView: (view) => set({ currentView: view }),
        setTheme: (theme) => set({ theme }),
        setUser: (user) => set({ user, isAuthenticated: !!user }),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// Agent store
interface AgentState {
  agents: Agent[];
  selectedAgent: Agent | null;
  agentTemplates: Template[];
  
  // Actions
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  setAgentTemplates: (templates: Template[]) => void;
  duplicateAgent: (id: string) => void;
}

export const useAgentStore = create<AgentState>()(
  devtools((set, get) => ({
    agents: [],
    selectedAgent: null,
    agentTemplates: [],
    
    addAgent: (agent) => 
      set((state) => ({ 
        agents: [...state.agents, agent],
        selectedAgent: agent
      })),
      
    updateAgent: (id, updates) =>
      set((state) => ({
        agents: state.agents.map(agent =>
          agent.id === id ? { ...agent, ...updates, updatedAt: new Date() } : agent
        ),
        selectedAgent: state.selectedAgent?.id === id 
          ? { ...state.selectedAgent, ...updates, updatedAt: new Date() }
          : state.selectedAgent
      })),
      
    deleteAgent: (id) =>
      set((state) => ({
        agents: state.agents.filter(agent => agent.id !== id),
        selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent
      })),
      
    setSelectedAgent: (agent) => set({ selectedAgent: agent }),
    
    setAgentTemplates: (templates) => set({ agentTemplates: templates }),
    
    duplicateAgent: (id) => {
      const { agents, addAgent } = get();
      const agent = agents.find(a => a.id === id);
      if (agent) {
        const duplicatedAgent: Agent = {
          ...agent,
          id: crypto.randomUUID(),
          name: `${agent.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addAgent(duplicatedAgent);
      }
    },
  }))
);

// Workflow store
interface WorkflowState {
  workflows: Workflow[];
  selectedWorkflow: Workflow | null;
  workflowTemplates: Template[];
  
  // Actions
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setSelectedWorkflow: (workflow: Workflow | null) => void;
  setWorkflowTemplates: (templates: Template[]) => void;
  deployWorkflow: (id: string) => void;
  pauseWorkflow: (id: string) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  devtools((set, get) => ({
    workflows: [],
    selectedWorkflow: null,
    workflowTemplates: [],
    
    addWorkflow: (workflow) =>
      set((state) => ({
        workflows: [...state.workflows, workflow],
        selectedWorkflow: workflow
      })),
      
    updateWorkflow: (id, updates) =>
      set((state) => ({
        workflows: state.workflows.map(workflow =>
          workflow.id === id ? { ...workflow, ...updates, updatedAt: new Date() } : workflow
        ),
        selectedWorkflow: state.selectedWorkflow?.id === id
          ? { ...state.selectedWorkflow, ...updates, updatedAt: new Date() }
          : state.selectedWorkflow
      })),
      
    deleteWorkflow: (id) =>
      set((state) => ({
        workflows: state.workflows.filter(workflow => workflow.id !== id),
        selectedWorkflow: state.selectedWorkflow?.id === id ? null : state.selectedWorkflow
      })),
      
    setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),
    
    setWorkflowTemplates: (templates) => set({ workflowTemplates: templates }),
    
    deployWorkflow: (id) => {
      const { updateWorkflow } = get();
      updateWorkflow(id, { status: 'deployed' });
    },
    
    pauseWorkflow: (id) => {
      const { updateWorkflow } = get();
      updateWorkflow(id, { status: 'paused' });
    },
  }))
);

// A/B Testing store
interface ABTestState {
  tests: ABTest[];
  selectedTest: ABTest | null;
  
  // Actions
  addTest: (test: ABTest) => void;
  updateTest: (id: string, updates: Partial<ABTest>) => void;
  deleteTest: (id: string) => void;
  setSelectedTest: (test: ABTest | null) => void;
  startTest: (id: string) => void;
  stopTest: (id: string) => void;
}

export const useABTestStore = create<ABTestState>()(
  devtools((set, get) => ({
    tests: [],
    selectedTest: null,
    
    addTest: (test) =>
      set((state) => ({
        tests: [...state.tests, test],
        selectedTest: test
      })),
      
    updateTest: (id, updates) =>
      set((state) => ({
        tests: state.tests.map(test =>
          test.id === id ? { ...test, ...updates } : test
        ),
        selectedTest: state.selectedTest?.id === id
          ? { ...state.selectedTest, ...updates }
          : state.selectedTest
      })),
      
    deleteTest: (id) =>
      set((state) => ({
        tests: state.tests.filter(test => test.id !== id),
        selectedTest: state.selectedTest?.id === id ? null : state.selectedTest
      })),
      
    setSelectedTest: (test) => set({ selectedTest: test }),
    
    startTest: (id) => {
      const { updateTest } = get();
      updateTest(id, { 
        status: 'running',
        startDate: new Date()
      });
    },
    
    stopTest: (id) => {
      const { updateTest } = get();
      updateTest(id, { 
        status: 'completed',
        endDate: new Date()
      });
    },
  }))
);

// Collaboration store
interface CollaborationState {
  collaborations: Record<string, Collaboration>;
  activeUsers: Record<string, string[]>; // workflowId -> userIds
  comments: Record<string, Comment[]>; // workflowId -> comments
  
  // Actions
  setCollaboration: (workflowId: string, collaboration: Collaboration) => void;
  updateActiveUsers: (workflowId: string, userIds: string[]) => void;
  addComment: (workflowId: string, comment: Comment) => void;
  updateComment: (workflowId: string, commentId: string, updates: Partial<Comment>) => void;
  deleteComment: (workflowId: string, commentId: string) => void;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  position?: { x: number; y: number; agentId?: string };
  createdAt: Date;
  replies: Comment[];
}

export const useCollaborationStore = create<CollaborationState>()(
  devtools((set) => ({
    collaborations: {},
    activeUsers: {},
    comments: {},
    
    setCollaboration: (workflowId, collaboration) =>
      set((state) => ({
        collaborations: {
          ...state.collaborations,
          [workflowId]: collaboration
        }
      })),
      
    updateActiveUsers: (workflowId, userIds) =>
      set((state) => ({
        activeUsers: {
          ...state.activeUsers,
          [workflowId]: userIds
        }
      })),
      
    addComment: (workflowId, comment) =>
      set((state) => ({
        comments: {
          ...state.comments,
          [workflowId]: [...(state.comments[workflowId] || []), comment]
        }
      })),
      
    updateComment: (workflowId, commentId, updates) =>
      set((state) => ({
        comments: {
          ...state.comments,
          [workflowId]: (state.comments[workflowId] || []).map(comment =>
            comment.id === commentId ? { ...comment, ...updates } : comment
          )
        }
      })),
      
    deleteComment: (workflowId, commentId) =>
      set((state) => ({
        comments: {
          ...state.comments,
          [workflowId]: (state.comments[workflowId] || []).filter(
            comment => comment.id !== commentId
          )
        }
      })),
  }))
);

// Analytics store
interface AnalyticsState {
  dashboardData: DashboardData | null;
  workflowAnalytics: Record<string, WorkflowAnalytics>;
  agentMetrics: Record<string, AgentMetrics>;
  
  // Actions
  setDashboardData: (data: DashboardData) => void;
  setWorkflowAnalytics: (workflowId: string, analytics: WorkflowAnalytics) => void;
  setAgentMetrics: (agentId: string, metrics: AgentMetrics) => void;
}

interface DashboardData {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  monthlyUsage: Array<{ month: string; executions: number; costs: number }>;
  topPerforming: Array<{ id: string; name: string; successRate: number }>;
}

interface WorkflowAnalytics {
  executions: number;
  successRate: number;
  averageExecutionTime: number;
  errorRate: number;
  performance: PerformanceMetrics;
  costs: CostMetrics;
}

interface AgentMetrics {
  totalExecutions: number;
  successRate: number;
  averageResponseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  errorCount: number;
}

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  throughput: number;
  latency: number;
}

interface CostMetrics {
  totalCost: number;
  costPerExecution: number;
  breakdown: {
    compute: number;
    storage: number;
    network: number;
    thirdParty: number;
  };
}

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools((set) => ({
    dashboardData: null,
    workflowAnalytics: {},
    agentMetrics: {},
    
    setDashboardData: (data) => set({ dashboardData: data }),
    
    setWorkflowAnalytics: (workflowId, analytics) =>
      set((state) => ({
        workflowAnalytics: {
          ...state.workflowAnalytics,
          [workflowId]: analytics
        }
      })),
      
    setAgentMetrics: (agentId, metrics) =>
      set((state) => ({
        agentMetrics: {
          ...state.agentMetrics,
          [agentId]: metrics
        }
      })),
  }))
);