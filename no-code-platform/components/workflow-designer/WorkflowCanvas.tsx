import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Plus, Play, Pause, Save, Share2, GitBranch, Eye } from 'lucide-react';
import { Workflow, Agent } from '../../types';
import { useWorkflowStore, useAgentStore } from '../../store';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import AgentNode from './nodes/AgentNode';
import DecisionNode from './nodes/DecisionNode';
import ConditionNode from './nodes/ConditionNode';
import WorkflowSidebar from './WorkflowSidebar';
import CollaborationOverlay from '../collaboration/CollaborationOverlay';

interface WorkflowCanvasProps {
  workflow: Workflow | null;
  onWorkflowChange: (workflow: Workflow) => void;
}

const nodeTypes: NodeTypes = {
  agent: AgentNode,
  decision: DecisionNode,
  condition: ConditionNode,
};

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ workflow, onWorkflowChange }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);

  const { agents } = useAgentStore();
  const { updateWorkflow } = useWorkflowStore();

  // Initialize nodes and edges from workflow
  React.useEffect(() => {
    if (workflow) {
      const workflowNodes: Node[] = workflow.agents.map((agent, index) => ({
        id: agent.id,
        type: 'agent',
        position: { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 200 },
        data: {
          agent,
          onUpdate: (updates: Partial<Agent>) => handleAgentUpdate(agent.id, updates),
          onDelete: () => handleAgentDelete(agent.id),
        },
      }));

      const workflowEdges: Edge[] = workflow.connections.map(connection => ({
        id: `${connection.source.agentId}-${connection.target.agentId}`,
        source: connection.source.agentId,
        target: connection.target.agentId,
        sourceHandle: connection.source.outputKey,
        targetHandle: connection.target.inputKey,
        type: connection.condition ? 'conditional' : 'default',
        data: {
          condition: connection.condition,
          transform: connection.transform,
        },
      }));

      setNodes(workflowNodes);
      setEdges(workflowEdges);
    }
  }, [workflow]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        type: 'default',
      };
      setEdges((eds) => addEdge(newEdge, eds));
      
      if (workflow) {
        const connection = {
          id: newEdge.id,
          source: {
            agentId: params.source!,
            outputKey: params.sourceHandle || 'output',
          },
          target: {
            agentId: params.target!,
            inputKey: params.targetHandle || 'input',
          },
        };
        
        const updatedWorkflow = {
          ...workflow,
          connections: [...workflow.connections, connection],
        };
        
        onWorkflowChange(updatedWorkflow);
        updateWorkflow(workflow.id, updatedWorkflow);
      }
    },
    [workflow, onWorkflowChange, updateWorkflow]
  );

  const handleAgentUpdate = (agentId: string, updates: Partial<Agent>) => {
    if (workflow) {
      const updatedAgents = workflow.agents.map(agent =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      );
      
      const updatedWorkflow = {
        ...workflow,
        agents: updatedAgents,
      };
      
      onWorkflowChange(updatedWorkflow);
      updateWorkflow(workflow.id, updatedWorkflow);
    }
  };

  const handleAgentDelete = (agentId: string) => {
    if (workflow) {
      const updatedAgents = workflow.agents.filter(agent => agent.id !== agentId);
      const updatedConnections = workflow.connections.filter(
        connection => 
          connection.source.agentId !== agentId && 
          connection.target.agentId !== agentId
      );
      
      const updatedWorkflow = {
        ...workflow,
        agents: updatedAgents,
        connections: updatedConnections,
      };
      
      onWorkflowChange(updatedWorkflow);
      updateWorkflow(workflow.id, updatedWorkflow);
      
      setNodes(nodes => nodes.filter(node => node.id !== agentId));
      setEdges(edges => edges.filter(edge => 
        edge.source !== agentId && edge.target !== agentId
      ));
    }
  };

  const addAgentToWorkflow = (agent: Agent) => {
    if (!workflow) return;

    const newNode: Node = {
      id: agent.id,
      type: 'agent',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        agent,
        onUpdate: (updates: Partial<Agent>) => handleAgentUpdate(agent.id, updates),
        onDelete: () => handleAgentDelete(agent.id),
      },
    };

    setNodes(nodes => [...nodes, newNode]);

    const updatedWorkflow = {
      ...workflow,
      agents: [...workflow.agents, agent],
    };

    onWorkflowChange(updatedWorkflow);
    updateWorkflow(workflow.id, updatedWorkflow);
  };

  const handleRunWorkflow = async () => {
    if (!workflow) return;
    
    setIsRunning(true);
    
    try {
      // Simulate workflow execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedWorkflow = {
        ...workflow,
        status: 'active' as const,
        analytics: {
          ...workflow.analytics,
          executions: workflow.analytics.executions + 1,
        },
      };
      
      onWorkflowChange(updatedWorkflow);
      updateWorkflow(workflow.id, updatedWorkflow);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handlePauseWorkflow = () => {
    if (!workflow) return;
    
    const updatedWorkflow = {
      ...workflow,
      status: 'paused' as const,
    };
    
    onWorkflowChange(updatedWorkflow);
    updateWorkflow(workflow.id, updatedWorkflow);
  };

  const handleSaveWorkflow = () => {
    if (workflow) {
      updateWorkflow(workflow.id, workflow);
    }
  };

  const onNodeSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    setSelectedNodes(selectedNodes);
  }, []);

  return (
    <ReactFlowProvider>
      <div className="flex h-full">
        {/* Sidebar */}
        {sidebarOpen && (
          <WorkflowSidebar
            agents={agents}
            onAddAgent={addAgentToWorkflow}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <div ref={reactFlowWrapper} className="h-full w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onNodeSelectionChange}
              nodeTypes={nodeTypes}
              onInit={(instance) => {
                reactFlowInstance.current = instance;
              }}
              fitView
              attributionPosition="bottom-left"
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
              <Controls />
              <MiniMap 
                nodeColor="rgb(59 130 246)"
                maskColor="rgb(255 255 255 / 0.1)"
                position="bottom-right"
                className="bg-background border border-border rounded-lg"
              />
              
              {/* Top Panel */}
              <Panel position="top-left">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Workflow Info */}
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold">{workflow?.name || 'Untitled Workflow'}</h2>
                        <Badge variant={workflow?.status === 'active' ? 'success' : 'secondary'}>
                          {workflow?.status || 'draft'}
                        </Badge>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {!sidebarOpen && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSidebarOpen(true)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant={isRunning ? "secondary" : "default"}
                          size="sm"
                          onClick={isRunning ? handlePauseWorkflow : handleRunWorkflow}
                          loading={isRunning}
                        >
                          {isRunning ? (
                            <Pause className="w-4 h-4 mr-2" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          {isRunning ? 'Pause' : 'Run'}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveWorkflow}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCollaboration(!showCollaboration)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <GitBranch className="w-4 h-4 mr-2" />
                          Version
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Panel>

              {/* Status Panel */}
              <Panel position="bottom-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 bg-background/80 backdrop-blur-sm border rounded-lg px-4 py-2"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Nodes: {nodes.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Connections: {edges.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Selected: {selectedNodes.length}</span>
                  </div>
                  {workflow && (
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="w-3 h-3" />
                      <span>Executions: {workflow.analytics.executions}</span>
                    </div>
                  )}
                </motion.div>
              </Panel>
            </ReactFlow>
          </div>

          {/* Collaboration Overlay */}
          {showCollaboration && workflow && (
            <CollaborationOverlay
              workflowId={workflow.id}
              onClose={() => setShowCollaboration(false)}
            />
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default WorkflowCanvas;