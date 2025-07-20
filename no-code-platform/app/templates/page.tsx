'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../components/layout/Header'
import { Sidebar } from '../../components/layout/Sidebar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import {
  Search,
  Filter,
  Bot,
  LineChart,
  ShoppingCart,
  Users,
  Shield,
  Zap,
  Star,
  Download,
  Eye,
  Copy,
  Heart,
} from 'lucide-react'

const templates = [
  {
    id: 1,
    name: 'DeFi Trading Bot',
    category: 'DeFi',
    description: 'Automated trading bot for DEX arbitrage and liquidity provision',
    author: 'SeiLabs',
    downloads: 1234,
    rating: 4.8,
    tags: ['Trading', 'Arbitrage', 'DeFi'],
    icon: LineChart,
    color: 'from-blue-500 to-purple-500',
    featured: true,
  },
  {
    id: 2,
    name: 'NFT Marketplace Agent',
    category: 'NFT',
    description: 'Complete NFT marketplace with minting, trading, and analytics',
    author: 'CryptoDevs',
    downloads: 892,
    rating: 4.6,
    tags: ['NFT', 'Marketplace', 'Trading'],
    icon: ShoppingCart,
    color: 'from-purple-500 to-pink-500',
    featured: true,
  },
  {
    id: 3,
    name: 'DAO Governance Bot',
    category: 'DAO',
    description: 'Automated governance participation and proposal management',
    author: 'DAOBuilder',
    downloads: 567,
    rating: 4.7,
    tags: ['DAO', 'Governance', 'Voting'],
    icon: Users,
    color: 'from-green-500 to-teal-500',
  },
  {
    id: 4,
    name: 'Security Monitor',
    category: 'Security',
    description: 'Real-time smart contract security monitoring and alerts',
    author: 'SecureChain',
    downloads: 2341,
    rating: 4.9,
    tags: ['Security', 'Monitoring', 'Alerts'],
    icon: Shield,
    color: 'from-red-500 to-orange-500',
    featured: true,
  },
  {
    id: 5,
    name: 'Flash Loan Bot',
    category: 'DeFi',
    description: 'Execute flash loan strategies across multiple protocols',
    author: 'FlashDev',
    downloads: 423,
    rating: 4.5,
    tags: ['Flash Loans', 'DeFi', 'Arbitrage'],
    icon: Zap,
    color: 'from-yellow-500 to-amber-500',
  },
  {
    id: 6,
    name: 'Data Aggregator',
    category: 'Analytics',
    description: 'Collect and analyze blockchain data in real-time',
    author: 'DataPro',
    downloads: 789,
    rating: 4.4,
    tags: ['Analytics', 'Data', 'Monitoring'],
    icon: Bot,
    color: 'from-indigo-500 to-blue-500',
  },
]

const categories = ['All', 'DeFi', 'NFT', 'DAO', 'Security', 'Analytics']

export default function TemplatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [likedTemplates, setLikedTemplates] = useState<number[]>([])

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleUseTemplate = (templateId: number) => {
    // Navigate to builder with template
    router.push(`/builder?template=${templateId}`)
  }

  const toggleLike = (templateId: number) => {
    setLikedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header title="Templates" />
        
        <div className="flex-1 p-6 overflow-auto">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Templates */}
          {selectedCategory === 'All' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Featured Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.filter(t => t.featured).map(template => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                          <template.icon className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      </div>
                      <CardTitle className="mt-4">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {template.downloads}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {template.rating}
                          </span>
                        </div>
                        <span>by {template.author}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleUseTemplate(template.id)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(template.id)
                        }}
                      >
                        <Heart 
                          className={`w-4 h-4 ${likedTemplates.includes(template.id) ? 'fill-red-500 text-red-500' : ''}`} 
                        />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Templates */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {selectedCategory === 'All' ? 'All Templates' : `${selectedCategory} Templates`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.filter(t => selectedCategory !== 'All' || !t.featured).map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-3`}>
                      <template.icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {template.downloads}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {template.rating}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleUseTemplate(template.id)}
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}