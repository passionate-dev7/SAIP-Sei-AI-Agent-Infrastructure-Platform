'use client'

import { Header } from '../../components/layout/Header'
import { Sidebar } from '../../components/layout/Sidebar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/Badge'
import { Store, Star, Download, TrendingUp } from 'lucide-react'

export default function MarketplacePage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="Marketplace" />
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="text-center py-12">
            <Store className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">Agent Marketplace</h1>
            <p className="text-muted-foreground mb-6">Buy and sell AI agents</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
                  <CardTitle>Top Sellers</CardTitle>
                  <CardDescription>Most popular agents this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Star className="w-8 h-8 text-yellow-500 mb-2" />
                  <CardTitle>Featured</CardTitle>
                  <CardDescription>Hand-picked quality agents</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Download className="w-8 h-8 text-blue-500 mb-2" />
                  <CardTitle>New Arrivals</CardTitle>
                  <CardDescription>Latest agents added</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}