import { NextRequest, NextResponse } from 'next/server';
import { AgentFramework } from '../../../agents/AgentFramework';
import { TaskPriority } from '../../../types';

// This would be shared instance in production
const framework = new AgentFramework();
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await framework.initialize();
    await framework.start();
    initialized = true;
  }
}

export async function GET() {
  try {
    await ensureInitialized();
    
    const tasks = framework.getTasks();
    
    return NextResponse.json({
      success: true,
      data: tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        progress: task.progress,
        assignedTo: task.assignedTo,
        createdAt: task.createdAt,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
        estimatedDuration: task.estimatedDuration,
        actualDuration: task.actualDuration
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();
    
    const body = await request.json();
    const { 
      title, 
      description, 
      priority = 'medium', 
      requiredCapabilities = [],
      input,
      estimatedDuration,
      agentId 
    } = body;
    
    const task = await framework.createTask({
      title,
      description,
      priority: priority as TaskPriority,
      requiredCapabilities,
      input,
      estimatedDuration,
      metadata: {
        type: body.type || 'general',
        source: 'api'
      }
    });
    
    // Assign to specific agent or let framework choose
    await framework.assignTask(task.id, agentId);
    
    return NextResponse.json({
      success: true,
      data: {
        id: task.id,
        title: task.title,
        status: task.status,
        assignedTo: task.assignedTo,
        createdAt: task.createdAt
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}