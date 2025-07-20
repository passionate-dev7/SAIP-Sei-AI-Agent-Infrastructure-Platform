import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { Bot, Settings, Play, Pause, AlertCircle } from 'lucide-react';
import { Agent } from '../../../types';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

interface AgentNodeData {
  agent: Agent;
  onUpdate: (updates: Partial<Agent>) => void;
  onDelete: () => void;
}

interface AgentNodeProps {
  id: string;
  data: AgentNodeData;
  selected?: boolean;
  dragging?: boolean;
}

const AgentNode: React.FC<AgentNodeProps> = ({ id, data, selected, dragging }) => {
  const { agent, onUpdate, onDelete } = data;

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'paused':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'deployed':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getTypeIcon = (type: Agent['type']) => {
    return Bot; // Could expand with different icons for different types
  };

  const TypeIcon = getTypeIcon(agent.type);

  const handleToggleStatus = () => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    onUpdate({ status: newStatus });
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative bg-white rounded-lg border-2 shadow-sm min-w-[200px] max-w-[250px]
        ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
        ${dragging ? 'shadow-xl' : ''}
        transition-all duration-200
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />

      {/* Header */}
      <div className={`p-3 rounded-t-lg ${getStatusColor(agent.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon className="w-4 h-4" />
            <span className="font-medium text-sm truncate">{agent.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {agent.status === 'error' && (
              <AlertCircle className="w-3 h-3 text-red-600" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleStatus}
              className="w-6 h-6 p-0 hover:bg-white/20"
            >
              {agent.status === 'active' ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {agent.description}
        </p>

        {/* Type and Capabilities */}
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className="text-xs">
            {agent.type}
          </Badge>
          {agent.capabilities.slice(0, 2).map((capability) => (
            <Badge key={capability.id} variant="secondary" className="text-xs">
              {capability.name}
            </Badge>
          ))}
          {agent.capabilities.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{agent.capabilities.length - 2}
            </Badge>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div>
            <span className="font-medium">Triggers:</span> {agent.configuration.triggers.length}
          </div>
          <div>
            <span className="font-medium">Actions:</span> {agent.configuration.actions.length}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* Handle settings click */}}
            className="p-1"
          >
            <Settings className="w-3 h-3" />
          </Button>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              agent.status === 'active' ? 'bg-green-400' :
              agent.status === 'error' ? 'bg-red-400' :
              agent.status === 'paused' ? 'bg-yellow-400' :
              'bg-gray-400'
            }`} />
            <span className="text-xs capitalize">{agent.status}</span>
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 !bg-green-500 !border-2 !border-white"
      />

      {/* Connection Points for different outputs */}
      <Handle
        type="source"
        position={Position.Right}
        id="success"
        style={{ top: '30%' }}
        className="w-2 h-2 !bg-green-400 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="error"
        style={{ top: '70%' }}
        className="w-2 h-2 !bg-red-400 !border-white"
      />

      {/* Version indicator */}
      {agent.version && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          v{agent.version}
        </div>
      )}

      {/* Collaboration indicator */}
      {agent.collaborators.length > 0 && (
        <div className="absolute -top-2 -left-2 bg-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {agent.collaborators.length}
        </div>
      )}
    </motion.div>
  );
};

export default memo(AgentNode);