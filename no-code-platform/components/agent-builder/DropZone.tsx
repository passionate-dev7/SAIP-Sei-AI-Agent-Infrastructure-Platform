import React from 'react';
import { useDrop } from 'react-dnd';
import { clsx } from 'clsx';

interface DropZoneProps {
  onDrop: (item: any, position: { x: number; y: number }) => void;
  children: React.ReactNode;
  className?: string;
}

const DropZone: React.FC<DropZoneProps> = ({ onDrop, children, className }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const dropElement = drop.current;
      
      if (offset && dropElement) {
        const rect = dropElement.getBoundingClientRect();
        const position = {
          x: offset.x - rect.left,
          y: offset.y - rect.top,
        };
        onDrop(item, position);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={clsx(
        className,
        'relative',
        {
          'bg-primary/5 border-2 border-primary/30 border-dashed': isOver && canDrop,
          'bg-muted/20': !isOver && canDrop,
        }
      )}
    >
      {children}
      {isOver && canDrop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
            Drop component here
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;