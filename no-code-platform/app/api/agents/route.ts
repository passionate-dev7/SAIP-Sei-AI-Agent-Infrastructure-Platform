import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Agent validation schema
const AgentSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['trader', 'collector', 'analyzer', 'executor', 'monitor']),
  description: z.string(),
  capabilities: z.array(z.string()),
  configuration: z.object({
    triggers: z.array(z.any()),
    actions: z.array(z.any()),
    parameters: z.record(z.any()).optional(),
  }),
})

// Mock database
const agents = new Map()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    let agentList = Array.from(agents.values())
    
    if (status) {
      agentList = agentList.filter(agent => agent.status === status)
    }
    
    return NextResponse.json({
      success: true,
      data: agentList,
      total: agentList.length,
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch agents',
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
    const validatedData = AgentSchema.parse(body)
    
    // Create agent with generated ID
    const agent = {
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...validatedData,
      status: 'idle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        successRate: 0,
        totalExecutions: 0,
        avgExecutionTime: 0,
        lastExecution: null,
      },
    }
    
    // Store agent
    agents.set(agent.id, agent)
    
    return NextResponse.json({
      success: true,
      data: agent,
      message: 'Agent created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating agent:', error)
    
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
        error: 'Failed to create agent',
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
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      )
    }
    
    const agent = agents.get(id)
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Update agent
    const updatedAgent = {
      ...agent,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    agents.set(id, updatedAgent)
    
    return NextResponse.json({
      success: true,
      data: updatedAgent,
      message: 'Agent updated successfully',
    })
  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update agent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      )
    }
    
    if (!agents.has(id)) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    agents.delete(id)
    
    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete agent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}