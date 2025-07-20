import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

interface ConditionNodeData {
  label: string;
  expression: string;
  onUpdate: (updates: any) => void;
}

interface ConditionNodeProps {
  id: string;
  data: ConditionNodeData;
  selected?: boolean;
}

const ConditionNode: React.FC<ConditionNodeProps> = ({ id, data, selected }) => {
  const { label, expression } = data;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`
        relative bg-purple-50 border-2 rounded-lg shadow-sm min-w-[140px]
        ${selected ? 'border-purple-500 shadow-lg' : 'border-purple-200 hover:border-purple-300'}
        transition-all duration-200
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
      />

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-sm text-purple-800">{label}</span>
        </div>
        
        <div className="text-xs text-purple-700 bg-purple-100 rounded p-2 font-mono">
          {expression || 'filter condition'}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
      />
    </motion.div>
  );
};

export default memo(ConditionNode);