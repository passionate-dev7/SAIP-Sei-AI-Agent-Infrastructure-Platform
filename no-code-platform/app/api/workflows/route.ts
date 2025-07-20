import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Workflow validation schema
const WorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  nodes: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    data: z.any(),
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional(),
    targetHandle: z.string().optional(),
  })),
})

// Mock database
const workflows = new Map()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    
    let workflowList = Array.from(workflows.values())
    
    if (userId) {
      workflowList = workflowList.filter(workflow => workflow.userId === userId)
    }
    
    return NextResponse.json({
      success: true,
      data: workflowList,
      total: workflowList.length,
    })
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch workflows',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = WorkflowSchema.parse(body)
    
    // Create workflow with generated ID
    const workflow = {
      id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...validatedData,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executions: 0,
      lastExecuted: null,
    }
    
    // Store workflow
    workflows.set(workflow.id, workflow)
    
    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'Workflow created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating workflow:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      )
    }
    
    const workflow = workflows.get(id)
    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      )
    }
    
    // Update workflow
    const updatedWorkflow = {
      ...workflow,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    workflows.set(id, updatedWorkflow)
    
    return NextResponse.json({
      success: true,
      data: updatedWorkflow,
      message: 'Workflow updated successfully',
    })
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Execute workflow endpoint
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action } = body
    
    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID and action are required' },
        { status: 400 }
      )
    }
    
    const workflow = workflows.get(id)
    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      )
    }
    
    if (action === 'execute') {
      // Simulate workflow execution
      const executionId = `exec-${Date.now()}`
      
      // Update workflow execution stats
      workflow.executions += 1
      workflow.lastExecuted = new Date().toISOString()
      workflow.status = 'running'
      workflows.set(id, workflow)
      
      // Simulate async execution
      setTimeout(() => {
        workflow.status = 'completed'
        workflows.set(id, workflow)
      }, 3000)
      
      return NextResponse.json({
        success: true,
        data: {
          executionId,
          status: 'started',
          workflow: workflow,
        },
        message: 'Workflow execution started',
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error executing workflow:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}