import React from 'react';
import { Store } from 'lucide-react';

const Marketplace: React.FC = () => {
  return (
    <div className="p-6">
      <div className="text-center py-20">
        <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Marketplace</h2>
        <p className="text-muted-foreground">
          Agent marketplace coming soon! Buy, sell, and discover amazing agents built by the community.
        </p>
      </div>
    </div>
  );
};

export default Marketplace;