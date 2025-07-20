import React from 'react';
import { useDrag } from 'react-dnd';
import { motion } from 'framer-motion';
import { GripVertical, Zap, MessageSquare, Brain, Globe } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface DraggableComponentProps {
  item: {
    id: string;
    name: string;
    description: string;
    type: string;
    category: string;
  };
}

const iconMap = {
  trigger: Zap,
  action: MessageSquare,
  capability: Brain,
  integration: Globe,
};

const colorMap = {
  trigger: 'text-yellow-500 bg-yellow-500/10',
  action: 'text-blue-500 bg-blue-500/10',
  capability: 'text-purple-500 bg-purple-500/10',
  integration: 'text-green-500 bg-green-500/10',
};

const DraggableComponent: React.FC<DraggableComponentProps> = ({ item }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const Icon = iconMap[item.category as keyof typeof iconMap] || Brain;
  const colorClass = colorMap[item.category as keyof typeof colorMap] || 'text-gray-500 bg-gray-500/10';

  return (
    <motion.div
      ref={drag}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-move ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <Card className="hover:shadow-md transition-shadow border-dashed hover:border-solid">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            </div>
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DraggableComponent;