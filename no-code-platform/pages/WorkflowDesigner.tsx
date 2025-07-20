import React from 'react';
import { useWorkflowStore } from '../store';
import WorkflowCanvas from '../components/workflow-designer/WorkflowCanvas';

const WorkflowDesigner: React.FC = () => {
  const { selectedWorkflow, updateWorkflow } = useWorkflowStore();

  const handleWorkflowChange = (workflow: any) => {
    if (workflow) {
      updateWorkflow(workflow.id, workflow);
    }
  };

  return (
    <div className="h-full">
      <WorkflowCanvas
        workflow={selectedWorkflow}
        onWorkflowChange={handleWorkflowChange}
      />
    </div>
  );
};

export default WorkflowDesigner;