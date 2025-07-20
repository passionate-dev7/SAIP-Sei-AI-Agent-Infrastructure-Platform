import React, { useCallback, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, Brain, MessageSquare, Database, Globe } from 'lucide-react';
import { Agent, Capability, Trigger, Action } from '../../types';
import { useAgentStore } from '../../store';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import DraggableComponent from './DraggableComponent';
import DropZone from './DropZone';
import AgentPropertyPanel from './AgentPropertyPanel';
import AIAssistant from './AIAssistant';

interface AgentCanvasProps {
  agent?: Agent | null;
  agents?: Agent[];
  selectedAgent?: Agent | null;
  onAgentChange?: (agent: Agent) => void;
  onAgentSelect?: (agent: Agent | null) => void;
  onAgentUpdate?: (agent: Agent) => void;
  onAgentDelete?: (agentId: string) => void;
  onAgentCreate?: (agent: Agent) => void;
}

const componentTypes = [
  {
    type: 'trigger',
    icon: Zap,
    title: 'Triggers',
    description: 'Start your agent with events',
    items: [
      { id: 'webhook', name: 'Webhook', description: 'HTTP endpoint trigger' },
      { id: 'schedule', name: 'Schedule', description: 'Time-based trigger' },
      { id: 'event', name: 'Event', description: 'System event trigger' },
      { id: 'manual', name: 'Manual', description: 'Manual execution' },
    ]
  },
  {
    type: 'action',
    icon: MessageSquare,
    title: 'Actions',
    description: 'What your agent can do',
    items: [
      { id: 'api_call', name: 'API Call', description: 'Make HTTP requests' },
      { id: 'email', name: 'Send Email', description: 'Email notifications' },
      { id: 'webhook', name: 'Webhook', description: 'Send webhook data' },
      { id: 'ai_prompt', name: 'AI Prompt', description: 'AI processing' },
    ]
  },
  {
    type: 'capability',
    icon: Brain,
    title: 'Capabilities',
    description: 'Advanced agent abilities',
    items: [
      { id: 'data_processing', name: 'Data Processing', description: 'Transform and analyze data' },
      { id: 'communication', name: 'Communication', description: 'Multi-channel messaging' },
      { id: 'ai_ml', name: 'AI/ML', description: 'Machine learning features' },
      { id: 'automation', name: 'Automation', description: 'Workflow automation' },
    ]
  },
  {
    type: 'integration',
    icon: Globe,
    title: 'Integrations',
    description: 'Connect external services',
    items: [
      { id: 'database', name: 'Database', description: 'Database connections' },
      { id: 'cloud', name: 'Cloud Storage', description: 'File storage' },
      { id: 'api', name: 'REST API', description: 'API integrations' },
      { id: 'ai_service', name: 'AI Service', description: 'AI model APIs' },
    ]
  },
];

const AgentCanvas: React.FC<AgentCanvasProps> = ({ 
  agent, 
  agents, 
  selectedAgent,
  onAgentChange, 
  onAgentSelect,
  onAgentUpdate, 
  onAgentDelete, 
  onAgentCreate 
}) => {
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { updateAgent } = useAgentStore();

  const handleDrop = useCallback((item: any, position: { x: number; y: number }) => {
    if (!agent) return;

    const newComponent = {
      id: crypto.randomUUID(),
      type: item.type,
      name: item.name,
      description: item.description,
      configuration: {},
      position,
      enabled: true,
    };

    let updatedAgent: Agent;

    switch (item.type) {
      case 'trigger':
        updatedAgent = {
          ...agent,
          configuration: {
            ...agent.configuration,
            triggers: [...agent.configuration.triggers, newComponent as Trigger]
          }
        };
        break;
      case 'action':
        updatedAgent = {
          ...agent,
          configuration: {
            ...agent.configuration,
            actions: [...agent.configuration.actions, newComponent as Action]
          }
        };
        break;
      default:
        updatedAgent = {
          ...agent,
          capabilities: [...agent.capabilities, newComponent as Capability]
        };
    }

    onAgentChange(updatedAgent);
    updateAgent(agent.id, updatedAgent);
  }, [agent, onAgentChange, updateAgent]);

  const handleComponentSelect = useCallback((component: any) => {
    setSelectedComponent(component);
  }, []);

  const handleComponentUpdate = useCallback((componentId: string, updates: any) => {
    if (!agent) return;

    // Update the component in the agent configuration
    const updatedAgent = { ...agent };
    
    // Find and update the component
    const updateComponentInArray = (array: any[]) => {
      return array.map(item => 
        item.id === componentId ? { ...item, ...updates } : item
      );
    };

    updatedAgent.configuration.triggers = updateComponentInArray(updatedAgent.configuration.triggers);
    updatedAgent.configuration.actions = updateComponentInArray(updatedAgent.configuration.actions);
    updatedAgent.capabilities = updateComponentInArray(updatedAgent.capabilities);

    onAgentChange(updatedAgent);
    updateAgent(agent.id, updatedAgent);
  }, [agent, onAgentChange, updateAgent]);

  const handleComponentDelete = useCallback((componentId: string) => {
    if (!agent) return;

    const updatedAgent = { ...agent };
    
    // Remove the component from all arrays
    updatedAgent.configuration.triggers = updatedAgent.configuration.triggers.filter(item => item.id !== componentId);
    updatedAgent.configuration.actions = updatedAgent.configuration.actions.filter(item => item.id !== componentId);
    updatedAgent.capabilities = updatedAgent.capabilities.filter(item => item.id !== componentId);

    onAgentChange(updatedAgent);
    updateAgent(agent.id, updatedAgent);
    
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }
  }, [agent, onAgentChange, updateAgent, selectedComponent]);

  const getAllComponents = () => {
    if (!agent) return [];
    
    return [
      ...agent.configuration.triggers.map(t => ({ ...t, componentType: 'trigger' })),
      ...agent.configuration.actions.map(a => ({ ...a, componentType: 'action' })),
      ...agent.capabilities.map(c => ({ ...c, componentType: 'capability' })),
    ];
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full">
        {/* Component Palette */}
        <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Components</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className="text-primary"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Help
              </Button>
            </div>

            {componentTypes.map((category) => (
              <Card key={category.type}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <category.icon className="w-4 h-4" />
                    {category.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {category.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {category.items.map((item) => (
                    <DraggableComponent
                      key={item.id}
                      item={{
                        ...item,
                        type: category.type,
                        category: category.type
                      }}
                    />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <div
            ref={canvasRef}
            className="h-full w-full bg-background grid-pattern relative overflow-auto"
          >
            <DropZone onDrop={handleDrop} className="h-full w-full">
              {agent && (
                <div className="absolute inset-0 p-8">
                  {/* Agent Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">{agent.name}</h2>
                            <p className="text-muted-foreground">{agent.description}</p>
                          </div>
                          <div className="ml-auto flex gap-2">
                            <Badge variant={agent.status === 'active' ? 'success' : 'secondary'}>
                              {agent.status}
                            </Badge>
                            <Badge variant="outline">{agent.type}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Agent Components */}
                  <AnimatePresence>
                    {getAllComponents().map((component, index) => (
                      <motion.div
                        key={component.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.1 }}
                        className="absolute"
                        style={{
                          left: component.position?.x || 100 + (index * 200),
                          top: component.position?.y || 150 + Math.floor(index / 3) * 150,
                        }}
                      >
                        <Card
                          className={`w-48 cursor-pointer transition-all hover:shadow-lg ${
                            selectedComponent?.id === component.id
                              ? 'ring-2 ring-primary shadow-lg'
                              : ''
                          }`}
                          onClick={() => handleComponentSelect(component)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              {component.componentType === 'trigger' && (
                                <Zap className="w-5 h-5 text-yellow-500" />
                              )}
                              {component.componentType === 'action' && (
                                <MessageSquare className="w-5 h-5 text-blue-500" />
                              )}
                              {component.componentType === 'capability' && (
                                <Brain className="w-5 h-5 text-purple-500" />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {component.name}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate">
                                  {component.description}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <Badge
                                variant={component.enabled ? 'success' : 'secondary'}
                                className="text-xs"
                              >
                                {component.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleComponentDelete(component.id);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty State */}
                  {getAllComponents().length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-64 text-center"
                    >
                      <Plus className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground">
                        Start Building Your Agent
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Drag and drop components from the left panel to start building your agent.
                        Add triggers to define when your agent should run, and actions to define what it should do.
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </DropZone>
          </div>
        </div>

        {/* Property Panel */}
        {selectedComponent && (
          <div className="w-80 border-l bg-muted/30">
            <AgentPropertyPanel
              component={selectedComponent}
              onUpdate={(updates) => handleComponentUpdate(selectedComponent.id, updates)}
              onClose={() => setSelectedComponent(null)}
            />
          </div>
        )}

        {/* AI Assistant */}
        <AnimatePresence>
          {showAIAssistant && (
            <AIAssistant
              agent={agent}
              onSuggestion={(suggestion) => {
                // Handle AI suggestions
                console.log('AI Suggestion:', suggestion);
              }}
              onClose={() => setShowAIAssistant(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
};

export default AgentCanvas;