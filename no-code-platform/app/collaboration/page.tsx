'use client'

import { Header } from '../../components/layout/Header'
import { Sidebar } from '../../components/layout/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/Badge'
import { Users, UserPlus, MessageSquare, Video } from 'lucide-react'

export default function CollaborationPage() {
  const teamMembers = [
    { id: 1, name: 'John Doe', role: 'Admin', status: 'online', avatar: 'JD' },
    { id: 2, name: 'Jane Smith', role: 'Developer', status: 'online', avatar: 'JS' },
    { id: 3, name: 'Bob Johnson', role: 'Viewer', status: 'offline', avatar: 'BJ' },
  ]
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="Collaboration" />
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Team Collaboration</h1>
            <p className="text-muted-foreground">Work together on agents and workflows</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Members
                  </span>
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </CardTitle>
                <CardDescription>Manage your team and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">{member.avatar}</span>
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.status === 'online' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  Start Video Call
                </Button>
                <Button className="w-full" variant="outline">
                  Share Screen
                </Button>
                <Button className="w-full" variant="outline">
                  Create Shared Workspace
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}