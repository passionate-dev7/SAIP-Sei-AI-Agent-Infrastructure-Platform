import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';

interface DecisionNodeData {
  label: string;
  condition: string;
  onUpdate: (updates: any) => void;
}

interface DecisionNodeProps {
  id: string;
  data: DecisionNodeData;
  selected?: boolean;
}

const DecisionNode: React.FC<DecisionNodeProps> = ({ id, data, selected }) => {
  const { label, condition } = data;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`
        relative bg-yellow-50 border-2 rounded-lg shadow-sm min-w-[150px]
        ${selected ? 'border-yellow-500 shadow-lg' : 'border-yellow-200 hover:border-yellow-300'}
        transition-all duration-200
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="w-3 h-3 !bg-yellow-500 !border-2 !border-white"
      />

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="w-4 h-4 text-yellow-600" />
          <span className="font-medium text-sm text-yellow-800">{label}</span>
        </div>
        
        <div className="text-xs text-yellow-700 bg-yellow-100 rounded p-2">
          {condition || 'if (condition)'}
        </div>
      </div>

      {/* True/False outputs */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '25%' }}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '75%' }}
        className="w-3 h-3 !bg-red-500 !border-2 !border-white"
      />

      {/* Labels for outputs */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
        <span style={{ marginLeft: '20%' }}>True</span>
        <span style={{ marginRight: '20%' }}>False</span>
      </div>
    </motion.div>
  );
};

export default memo(DecisionNode);