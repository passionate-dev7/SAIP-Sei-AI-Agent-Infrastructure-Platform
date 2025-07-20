'use client'

import { Header } from '../../components/layout/Header'
import { Sidebar } from '../../components/layout/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/button'
import { FlaskConical, Play, Pause, BarChart3 } from 'lucide-react'

export default function ABTestingPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="A/B Testing" />
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">A/B Testing</h1>
            <p className="text-muted-foreground">Optimize your agents with data-driven experiments</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" />
                  Active Experiments
                </CardTitle>
                <CardDescription>Currently running A/B tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Trading Bot Optimization</span>
                      <Button size="sm" variant="outline">
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Testing different trading strategies
                    </div>
                    <div className="mt-2 flex gap-4 text-xs">
                      <span>Variant A: 48%</span>
                      <span>Variant B: 52%</span>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Create New Experiment
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Results
                </CardTitle>
                <CardDescription>Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                Experiment results will appear here
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}