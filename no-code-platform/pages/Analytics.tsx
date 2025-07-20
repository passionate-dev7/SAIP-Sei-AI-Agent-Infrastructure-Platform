import React from 'react';
import { BarChart3 } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div className="p-6">
      <div className="text-center py-20">
        <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Analytics</h2>
        <p className="text-muted-foreground">
          Detailed performance analytics and insights coming soon!
        </p>
      </div>
    </div>
  );
};

export default Analytics;