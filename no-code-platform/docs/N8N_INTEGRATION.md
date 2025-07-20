# n8n Integration Guide for Sei No-Code Platform

## Why n8n Instead of Custom Workflow Builder?

After analyzing the requirements and seeing successful implementations like Seiling BuildBox, we recommend using **n8n** as the workflow engine instead of building a custom solution. Here's why:

### ✅ Advantages of n8n:

1. **Production-Ready**: Battle-tested with thousands of users
2. **400+ Integrations**: Pre-built nodes for most services
3. **Visual Editor**: Professional drag-and-drop interface
4. **Self-Hosted**: Full control over your data
5. **Extensible**: Easy to create custom nodes for Sei
6. **Active Development**: Regular updates and bug fixes
7. **Cost-Effective**: Open-source with optional cloud version

## 🚀 Integration Options

### Option 1: Embed n8n (Recommended)
```bash
# Run n8n with Docker
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Access at http://localhost:5678
```

### Option 2: iframe Integration
```tsx
// Embed n8n editor in your app
<iframe 
  src="http://localhost:5678/workflow/new" 
  className="w-full h-full"
  title="n8n Workflow Editor"
/>
```

### Option 3: n8n Cloud API
```typescript
// Use n8n Cloud API
import { N8nClient } from '@n8n/client-sdk'

const client = new N8nClient({
  apiKey: process.env.N8N_API_KEY,
  baseUrl: 'https://your-instance.n8n.cloud'
})

// Create workflow
const workflow = await client.workflows.create({
  name: 'Sei Trading Bot',
  nodes: [...],
  connections: {...}
})
```

## 🔧 Custom Sei Nodes for n8n

Create custom nodes for Sei blockchain operations:

### 1. Sei Query Node
```javascript
// nodes/SeiQuery/SeiQuery.node.ts
import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class SeiQuery implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sei Query',
    name: 'seiQuery',
    group: ['transform'],
    version: 1,
    description: 'Query Sei blockchain state',
    defaults: {
      name: 'Sei Query',
      color: '#FF6B6B',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Query Type',
        name: 'queryType',
        type: 'options',
        options: [
          { name: 'Account Balance', value: 'balance' },
          { name: 'Contract State', value: 'contract' },
          { name: 'Transaction', value: 'tx' },
        ],
        default: 'balance',
      },
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        required: true,
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const queryType = this.getNodeParameter('queryType', 0) as string;
    const address = this.getNodeParameter('address', 0) as string;
    
    // Query Sei blockchain
    const result = await querySeiBlockchain(queryType, address);
    
    return [this.helpers.returnJsonArray(result)];
  }
}
```

### 2. Sei Execute Node
```javascript
// nodes/SeiExecute/SeiExecute.node.ts
export class SeiExecute implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sei Execute',
    name: 'seiExecute',
    group: ['action'],
    version: 1,
    description: 'Execute transactions on Sei',
    defaults: {
      name: 'Sei Execute',
      color: '#4ECDC4',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'seiWallet',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Action',
        name: 'action',
        type: 'options',
        options: [
          { name: 'Send Tokens', value: 'send' },
          { name: 'Execute Contract', value: 'execute' },
          { name: 'Swap', value: 'swap' },
        ],
        default: 'send',
      },
    ],
  };
}
```

## 📋 Workflow Templates for Sei

### DeFi Trading Bot Template
```json
{
  "name": "DeFi Trading Bot",
  "nodes": [
    {
      "id": "1",
      "type": "n8n-nodes-base.webhook",
      "name": "Price Alert",
      "position": [250, 300]
    },
    {
      "id": "2", 
      "type": "sei-nodes.seiQuery",
      "name": "Check Liquidity",
      "position": [450, 300]
    },
    {
      "id": "3",
      "type": "n8n-nodes-base.if",
      "name": "Trading Decision",
      "position": [650, 300]
    },
    {
      "id": "4",
      "type": "sei-nodes.seiExecute", 
      "name": "Execute Trade",
      "position": [850, 300]
    }
  ],
  "connections": {
    "1": { "main": [[{ "node": "2" }]] },
    "2": { "main": [[{ "node": "3" }]] },
    "3": { "main": [[{ "node": "4" }], []] }
  }
}
```

## 🔌 API Integration

### Connect n8n to Your Platform
```typescript
// services/n8n-service.ts
export class N8nService {
  private apiUrl = process.env.N8N_API_URL || 'http://localhost:5678/api/v1'
  
  async createWorkflow(workflow: WorkflowConfig) {
    const response = await fetch(`${this.apiUrl}/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': process.env.N8N_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflow)
    })
    return response.json()
  }
  
  async executeWorkflow(id: string, data?: any) {
    const response = await fetch(`${this.apiUrl}/workflows/${id}/execute`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': process.env.N8N_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    })
    return response.json()
  }
}
```

## 🎨 UI Integration

### Seamless UI Experience
```tsx
// components/WorkflowEditor.tsx
export function WorkflowEditor() {
  const [workflow, setWorkflow] = useState(null)
  
  return (
    <div className="h-full flex flex-col">
      {/* Your custom header */}
      <div className="border-b p-4">
        <Button onClick={saveWorkflow}>Save</Button>
        <Button onClick={executeWorkflow}>Run</Button>
      </div>
      
      {/* n8n editor iframe */}
      <iframe 
        src={`${N8N_URL}/workflow/${workflowId}`}
        className="flex-1"
        onMessage={handleN8nMessage}
      />
    </div>
  )
}
```

## 📦 Package.json Dependencies

```json
{
  "dependencies": {
    "n8n": "^1.19.0",
    "n8n-core": "^1.19.0",
    "n8n-workflow": "^1.19.0",
    "@n8n/client": "^0.1.0"
  }
}
```

## 🚀 Deployment

### Docker Compose Setup
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
      - N8N_HOST=n8n.your-domain.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://n8n.your-domain.com/
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
      - ./custom-nodes:/home/node/.n8n/custom
    networks:
      - sei-network

volumes:
  n8n_data:

networks:
  sei-network:
    external: true
```

## 🎯 Benefits Over Custom Solution

| Feature | Custom Build | n8n |
|---------|-------------|-----|
| Development Time | 3-6 months | 1-2 weeks |
| Maintenance | High | Low |
| Bug Fixes | Your responsibility | Community/n8n team |
| Integrations | Build from scratch | 400+ ready |
| Documentation | Write yourself | Extensive docs |
| Community | None | Large & active |
| Cost | High dev cost | Free (self-hosted) |

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io)
- [n8n GitHub](https://github.com/n8n-io/n8n)
- [Custom Nodes Guide](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n Community](https://community.n8n.io)

## Next Steps

1. **Install n8n locally** for development
2. **Create custom Sei nodes** for blockchain operations
3. **Design workflow templates** for common use cases
4. **Integrate n8n API** with your platform
5. **Deploy n8n** alongside your application

This approach gives you a production-ready workflow engine while focusing your development efforts on Sei-specific features and integrations.