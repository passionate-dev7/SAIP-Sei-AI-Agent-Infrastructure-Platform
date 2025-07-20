'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { 
  Play, 
  Save, 
  Settings, 
  Plus, 
  Loader2,
  AlertCircle,
  ChevronLeft
} from 'lucide-react'

interface N8nCanvasProps {
  workflowId?: string
  onSave?: (workflow: any) => void
  onExecute?: (workflow: any) => void
  onBack?: () => void
  templateData?: any
}

export function N8nCanvas({ 
  workflowId, 
  onSave, 
  onExecute, 
  onBack,
  templateData 
}: N8nCanvasProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [n8nUrl, setN8nUrl] = useState<string>('')

  useEffect(() => {
    // Check for n8n instance URL from environment or default to local
    const url = process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678'
    setN8nUrl(url)

    // Check if n8n is running
    checkN8nConnection(url)
  }, [])

  const checkN8nConnection = async (url: string) => {
    try {
      const response = await fetch(`${url}/healthz`, { 
        mode: 'no-cors',
        cache: 'no-cache' 
      })
      setIsLoading(false)
    } catch (error) {
      setError('Unable to connect to n8n instance. Please ensure n8n is running.')
      setIsLoading(false)
    }
  }

  const handleMessage = (event: MessageEvent) => {
    // Handle messages from n8n iframe
    if (event.origin !== n8nUrl) return

    const { type, data } = event.data
    switch (type) {
      case 'workflow-saved':
        onSave?.(data)
        break
      case 'workflow-executed':
        onExecute?.(data)
        break
      case 'ready':
        setIsLoading(false)
        // Load template if provided
        if (templateData) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'load-workflow',
            data: templateData
          }, n8nUrl)
        }
        break
    }
  }

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [n8nUrl, templateData])

  const handleSave = () => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'save-workflow'
    }, n8nUrl)
  }

  const handleExecute = () => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'execute-workflow'
    }, n8nUrl)
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <span className="font-medium">Workflow Editor</span>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md w-full">
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">n8n Connection Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              
              <div className="bg-muted/50 p-4 rounded-lg text-left mb-4">
                <h4 className="font-semibold mb-2">Quick Setup:</h4>
                <ol className="text-sm space-y-2 text-muted-foreground">
                  <li>1. Install Docker if not already installed</li>
                  <li>2. Run n8n locally:</li>
                </ol>
                <code className="block bg-black text-green-400 p-2 rounded mt-2 text-xs">
                  docker run -it --rm \<br />
                  --name n8n \<br />
                  -p 5678:5678 \<br />
                  -e N8N_SECURE_COOKIE=false \<br />
                  -v ~/.n8n:/home/node/.n8n \<br />
                  n8nio/n8n
                </code>
              </div>
              
              <Button onClick={() => checkN8nConnection(n8nUrl)} className="w-full">
                Retry Connection
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Editor Header */}
      <div className="border-b bg-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <span className="font-medium">
            {workflowId ? `Workflow: ${workflowId}` : 'New Workflow'}
          </span>
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

      {/* n8n iframe */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white z-10 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading n8n editor...</p>
            </div>
          </div>
        )}
        <div className="w-full h-full flex items-center justify-center bg-white">
          <div className="text-center max-w-2xl p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">n8n Workflow Editor</h2>
              <p className="text-gray-600 mb-6">
                n8n is running successfully! Due to security settings, it opens in a new window.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={() => window.open(n8nUrl, '_blank')}
                className="w-full max-w-sm"
                size="lg"
              >
                Open n8n Editor →
              </Button>
              
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <h3 className="font-semibold mb-2">Quick Start:</h3>
                <ol className="text-sm space-y-1 text-gray-600">
                  <li>1. Click "Open n8n Editor" above</li>
                  <li>2. Create your account if first time</li>
                  <li>3. Build your Sei workflow</li>
                  <li>4. Save and test your workflow</li>
                </ol>
              </div>
              
              <p className="text-xs text-gray-500">
                n8n is running at: <code className="bg-gray-100 px-2 py-1 rounded">{n8nUrl}</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}