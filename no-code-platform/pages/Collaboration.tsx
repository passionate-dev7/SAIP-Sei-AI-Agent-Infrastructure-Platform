import React from 'react';
import { Users } from 'lucide-react';

const Collaboration: React.FC = () => {
  return (
    <div className="p-6">
      <div className="text-center py-20">
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Collaboration</h2>
        <p className="text-muted-foreground">
          Team collaboration features coming soon! Work together on agents and workflows.
        </p>
      </div>
    </div>
  );
};

export default Collaboration;