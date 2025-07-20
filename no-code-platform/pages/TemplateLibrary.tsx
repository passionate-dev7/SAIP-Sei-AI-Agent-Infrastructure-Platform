import React from 'react';
import { useAgentStore } from '../store';
import TemplateLibrary from '../components/templates/TemplateLibrary';

const TemplateLibraryPage: React.FC = () => {
  const { addAgent } = useAgentStore();

  const handleSelectTemplate = (template: any) => {
    // Create a new agent from template
    const newAgent = {
      ...template.agent,
      id: crypto.randomUUID(),
      name: `${template.agent.name} (Copy)`,
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    addAgent(newAgent);
  };

  return (
    <div className="p-6">
      <TemplateLibrary onSelectTemplate={handleSelectTemplate} />
    </div>
  );
};

export default TemplateLibraryPage;