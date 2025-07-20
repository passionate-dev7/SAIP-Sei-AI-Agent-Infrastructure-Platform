'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { 
  Play, 
  Save, 
  Plus, 
  Trash2,
  Settings,
  Link,
  ChevronRight,
  Code,
  Database,
  Webhook,
  Bot,
  Globe,
  Shield,
  Coins,
  Image
} from 'lucide-react'

// Node types for Sei blockchain
const nodeTypes = [
  { id: 'trigger-webhook', name: 'Webhook Trigger', icon: Webhook, category: 'Trigger', color: 'bg-purple-500' },
  { id: 'trigger-schedule', name: 'Schedule', icon: Globe, category: 'Trigger', color: 'bg-purple-500' },
  { id: 'sei-query', name: 'Query Sei', icon: Database, category: 'Blockchain', color: 'bg-blue-500' },
  { id: 'sei-execute', name: 'Execute Transaction', icon: Coins, category: 'Blockchain', color: 'bg-blue-500' },
  { id: 'sei-contract', name: 'Smart Contract', icon: Code, category: 'Blockchain', color: 'bg-blue-500' },
  { id: 'sei-nft', name: 'NFT Operations', icon: Image, category: 'NFT', color: 'bg-green-500' },
  { id: 'ai-decision', name: 'AI Decision', icon: Bot, category: 'AI', color: 'bg-yellow-500' },
  { id: 'condition', name: 'If/Else', icon: Shield, category: 'Logic', color: 'bg-gray-500' },
]

interface Node {
  id: string
  type: string
  name: string
  position: { x: number; y: number }
  data: any
  connections: string[]
}

interface WorkflowBuilderProps {
  initialWorkflow?: any
  onSave?: (workflow: any) => void
  onExecute?: (workflow: any) => void
}

export function WorkflowBuilder({ initialWorkflow, onSave, onExecute }: WorkflowBuilderProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Add a new node to the canvas
  const addNode = (nodeType: typeof nodeTypes[0]) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: nodeType.id,
      name: nodeType.name,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {},
      connections: []
    }
    setNodes([...nodes, newNode])
  }

  // Delete a node
  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId))
    // Remove connections to this node
    setNodes(prev => prev.map(n => ({
      ...n,
      connections: n.connections.filter(c => c !== nodeId)
    })))
  }

  // Connect two nodes
  const connectNodes = (fromId: string, toId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === fromId) {
        return { ...n, connections: [...n.connections, toId] }
      }
      return n
    }))
  }

  // Handle node click for connections
  const handleNodeClick = (node: Node) => {
    if (isConnecting && connectingFrom) {
      if (connectingFrom !== node.id) {
        connectNodes(connectingFrom, node.id)
      }
      setIsConnecting(false)
      setConnectingFrom(null)
    } else {
      setSelectedNode(node)
    }
  }

  // Start connection mode
  const startConnection = (nodeId: string) => {
    setIsConnecting(true)
    setConnectingFrom(nodeId)
  }

  // Save workflow
  const handleSave = () => {
    const workflow = {
      nodes,
      connections: nodes.reduce((acc, node) => {
        node.connections.forEach(conn => {
          acc.push({ from: node.id, to: conn })
        })
        return acc
      }, [] as any[]),
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0'
      }
    }
    onSave?.(workflow)
    console.log('Workflow saved:', workflow)
  }

  // Execute workflow
  const handleExecute = () => {
    const workflow = { nodes }
    onExecute?.(workflow)
    console.log('Executing workflow:', workflow)
  }

  return (
    <div className="flex h-full">
      {/* Sidebar with node types */}
      <div className="w-64 border-r bg-gray-50 p-4">
        <h3 className="font-semibold mb-4">Add Nodes</h3>
        <div className="space-y-2">
          {Object.entries(
            nodeTypes.reduce((acc, node) => {
              if (!acc[node.category]) acc[node.category] = []
              acc[node.category].push(node)
              return acc
            }, {} as Record<string, typeof nodeTypes>)
          ).map(([category, categoryNodes]) => (
            <div key={category}>
              <p className="text-xs font-medium text-gray-500 mb-1">{category}</p>
              {categoryNodes.map(nodeType => (
                <button
                  key={nodeType.id}
                  onClick={() => addNode(nodeType)}
                  className="w-full text-left p-2 rounded hover:bg-gray-100 flex items-center gap-2 transition-colors"
                >
                  <div className={`w-8 h-8 rounded ${nodeType.color} flex items-center justify-center`}>
                    <nodeType.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">{nodeType.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Connection Mode */}
        {isConnecting && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-600">
              Click on a node to connect from {connectingFrom}
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 w-full"
              onClick={() => {
                setIsConnecting(false)
                setConnectingFrom(null)
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b bg-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{nodes.length} nodes</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleExecute}>
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
          </div>
        </div>

        {/* Workflow Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 relative bg-gray-50 overflow-auto"
          style={{
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Add nodes from the sidebar to start building</p>
              </div>
            </div>
          ) : (
            <>
              {/* Render connections */}
              <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                {nodes.map(node => 
                  node.connections.map(targetId => {
                    const targetNode = nodes.find(n => n.id === targetId)
                    if (!targetNode) return null
                    return (
                      <line
                        key={`${node.id}-${targetId}`}
                        x1={node.position.x + 100}
                        y1={node.position.y + 40}
                        x2={targetNode.position.x}
                        y2={targetNode.position.y + 40}
                        stroke="#9ca3af"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    )
                  })
                )}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="10"
                    refY="5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 5, 0 10" fill="#9ca3af" />
                  </marker>
                </defs>
              </svg>

              {/* Render nodes */}
              {nodes.map(node => {
                const nodeType = nodeTypes.find(n => n.id === node.type)
                if (!nodeType) return null
                const Icon = nodeType.icon

                return (
                  <div
                    key={node.id}
                    className={`absolute bg-white rounded-lg shadow-lg p-3 cursor-move hover:shadow-xl transition-shadow ${
                      selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      zIndex: 1,
                      minWidth: '200px'
                    }}
                    onClick={() => handleNodeClick(node)}
                    onMouseDown={(e) => {
                      const startX = e.clientX - node.position.x
                      const startY = e.clientY - node.position.y

                      const handleMouseMove = (e: MouseEvent) => {
                        setNodes(prev => prev.map(n => 
                          n.id === node.id 
                            ? { ...n, position: { x: e.clientX - startX, y: e.clientY - startY } }
                            : n
                        ))
                      }

                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove)
                        document.removeEventListener('mouseup', handleMouseUp)
                      }

                      document.addEventListener('mousemove', handleMouseMove)
                      document.addEventListener('mouseup', handleMouseUp)
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded ${nodeType.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-sm">{node.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startConnection(node.id)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Link className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNode(node.id)
                          }}
                          className="p-1 hover:bg-red-100 rounded text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {nodeType.category}
                    </Badge>
                    {node.connections.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        → {node.connections.length} connection(s)
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Node Properties Panel */}
        {selectedNode && (
          <div className="w-80 border-l bg-white p-4">
            <h3 className="font-semibold mb-4">Node Properties</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) => {
                    setNodes(prev => prev.map(n => 
                      n.id === selectedNode.id 
                        ? { ...n, name: e.target.value }
                        : n
                    ))
                    setSelectedNode({ ...selectedNode, name: e.target.value })
                  }}
                  className="w-full mt-1 px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <p className="mt-1 text-sm text-gray-600">{selectedNode.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Node ID</label>
                <p className="mt-1 text-xs text-gray-500 font-mono">{selectedNode.id}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setSelectedNode(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}