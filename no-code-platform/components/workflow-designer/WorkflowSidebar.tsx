import React from 'react';
import { Bot, GitBranch, Shield, Zap } from 'lucide-react';

const nodeTypes = [
  { type: 'agent', label: 'Agent', icon: Bot, color: 'bg-blue-500' },
  { type: 'decision', label: 'Decision', icon: GitBranch, color: 'bg-green-500' },
  { type: 'condition', label: 'Condition', icon: Shield, color: 'bg-yellow-500' },
  { type: 'action', label: 'Action', icon: Zap, color: 'bg-purple-500' },
];

const WorkflowSidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('nodeType', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Components</h3>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-move hover:bg-gray-50 transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
          >
            <div className={`w-8 h-8 ${node.color} rounded flex items-center justify-center`}>
              <node.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-sm">{node.label}</div>
              <div className="text-xs text-gray-500">Drag to canvas</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Triggers</h3>
        <div className="space-y-2">
          <div
            className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm cursor-move"
            draggable
            onDragStart={(e) => onDragStart(e, 'trigger')}
          >
            ⚡ Webhook
          </div>
          <div
            className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm cursor-move"
            draggable
            onDragStart={(e) => onDragStart(e, 'schedule')}
          >
            ⚡ Schedule
          </div>
          <div
            className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm cursor-move"
            draggable
            onDragStart={(e) => onDragStart(e, 'event')}
          >
            ⚡ Event
          </div>
          <div
            className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm cursor-move"
            draggable
            onDragStart={(e) => onDragStart(e, 'manual')}
          >
            ⚡ Manual
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Actions</h3>
        <div className="space-y-2">
          <div
            className="p-2 bg-blue-50 border border-blue-200 rounded text-sm cursor-move"
            draggable
            onDragStart={(e) => onDragStart(e, 'api-call')}
          >
            ☐ API Call
          </div>
          <div
            className="p-2 bg-blue-50 border border-blue-200 rounded text-sm cursor-move"
            draggable
            onDragStart={(e) => onDragStart(e, 'email')}
          >
            ☐ Send Email
          </div>
          <div
            className="p-2 bg-blue-50 border border-blue-200 rounded text-sm cursor-move"
            draggable
            onDragStart={(e) => onDragStart(e, 'webhook-send')}
          >
            ☐ Webhook
          </div>
          <div
            className="p-2 bg-blue-50 border border-blue-200 rounded text-sm cursor-move"
            draggable
            onDragStart={(e) => onDragStart(e, 'ai-prompt')}
          >
            ☐ AI Prompt
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowSidebar;