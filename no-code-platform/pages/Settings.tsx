import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="p-6">
      <div className="text-center py-20">
        <SettingsIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Platform settings and configuration options coming soon!
        </p>
      </div>
    </div>
  );
};

export default Settings;