import React from 'react';
import { FlaskConical } from 'lucide-react';

const ABTesting: React.FC = () => {
  return (
    <div className="p-6">
      <div className="text-center py-20">
        <FlaskConical className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">A/B Testing</h2>
        <p className="text-muted-foreground">
          Advanced A/B testing framework coming soon! Optimize your agent strategies with data-driven insights.
        </p>
      </div>
    </div>
  );
};

export default ABTesting;