'use client'

import { useRouter } from 'next/navigation'
import { Header } from '../../components/layout/Header'
import { Sidebar } from '../../components/layout/Sidebar'

export default function WorkflowsPage() {
  const router = useRouter()
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="Workflows" />
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex justify-center items-center h-full">
            <button
              onClick={() => router.push('/workflow/select')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Workflow Designer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}