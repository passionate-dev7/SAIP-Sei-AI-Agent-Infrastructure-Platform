import { INodeType, INodeTypeDescription, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow'

export class SeiNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sei Blockchain',
    name: 'sei',
    icon: 'file:sei.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Sei blockchain',
    defaults: {
      name: 'Sei',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'seiApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Account',
            value: 'account',
          },
          {
            name: 'Smart Contract',
            value: 'smartContract',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Token',
            value: 'token',
          },
          {
            name: 'NFT',
            value: 'nft',
          },
          {
            name: 'DeFi Pool',
            value: 'defiPool',
          },
        ],
        default: 'account',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['account'],
          },
        },
        options: [
          {
            name: 'Get Balance',
            value: 'getBalance',
            description: 'Get account balance',
          },
          {
            name: 'Get Transactions',
            value: 'getTransactions',
            description: 'Get account transactions',
          },
          {
            name: 'Get Delegations',
            value: 'getDelegations',
            description: 'Get staking delegations',
          },
        ],
        default: 'getBalance',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['smartContract'],
          },
        },
        options: [
          {
            name: 'Query',
            value: 'query',
            description: 'Query smart contract',
          },
          {
            name: 'Execute',
            value: 'execute',
            description: 'Execute smart contract',
          },
          {
            name: 'Deploy',
            value: 'deploy',
            description: 'Deploy smart contract',
          },
        ],
        default: 'query',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['transaction'],
          },
        },
        options: [
          {
            name: 'Send',
            value: 'send',
            description: 'Send transaction',
          },
          {
            name: 'Get Status',
            value: 'getStatus',
            description: 'Get transaction status',
          },
          {
            name: 'Simulate',
            value: 'simulate',
            description: 'Simulate transaction',
          },
        ],
        default: 'send',
      },
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['account'],
          },
        },
        default: '',
        placeholder: 'sei1...',
        description: 'Sei wallet address',
      },
      {
        displayName: 'Contract Address',
        name: 'contractAddress',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            resource: ['smartContract'],
          },
        },
        default: '',
        placeholder: 'sei1...',
        description: 'Smart contract address',
      },
      {
        displayName: 'Query Message',
        name: 'queryMessage',
        type: 'json',
        displayOptions: {
          show: {
            resource: ['smartContract'],
            operation: ['query'],
          },
        },
        default: '{}',
        description: 'Query message in JSON format',
      },
      {
        displayName: 'Execute Message',
        name: 'executeMessage',
        type: 'json',
        displayOptions: {
          show: {
            resource: ['smartContract'],
            operation: ['execute'],
          },
        },
        default: '{}',
        description: 'Execute message in JSON format',
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['transaction'],
            operation: ['send'],
          },
        },
        default: '',
        description: 'Amount to send',
      },
      {
        displayName: 'Recipient',
        name: 'recipient',
        type: 'string',
        displayOptions: {
          show: {
            resource: ['transaction'],
            operation: ['send'],
          },
        },
        default: '',
        placeholder: 'sei1...',
        description: 'Recipient address',
      },
    ],
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []
    const resource = this.getNodeParameter('resource', 0) as string
    const operation = this.getNodeParameter('operation', 0) as string

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: any

        if (resource === 'account') {
          const address = this.getNodeParameter('address', i) as string
          
          if (operation === 'getBalance') {
            // Implement balance query
            responseData = {
              address,
              balance: '1000000usei',
              denom: 'usei',
            }
          } else if (operation === 'getTransactions') {
            // Implement transaction query
            responseData = {
              address,
              transactions: [],
            }
          } else if (operation === 'getDelegations') {
            // Implement delegation query
            responseData = {
              address,
              delegations: [],
            }
          }
        } else if (resource === 'smartContract') {
          const contractAddress = this.getNodeParameter('contractAddress', i) as string
          
          if (operation === 'query') {
            const queryMessage = this.getNodeParameter('queryMessage', i) as string
            // Implement contract query
            responseData = {
              contractAddress,
              query: JSON.parse(queryMessage),
              result: {},
            }
          } else if (operation === 'execute') {
            const executeMessage = this.getNodeParameter('executeMessage', i) as string
            // Implement contract execution
            responseData = {
              contractAddress,
              execute: JSON.parse(executeMessage),
              txHash: 'mock_tx_hash',
            }
          }
        } else if (resource === 'transaction') {
          if (operation === 'send') {
            const amount = this.getNodeParameter('amount', i) as string
            const recipient = this.getNodeParameter('recipient', i) as string
            // Implement transaction sending
            responseData = {
              amount,
              recipient,
              txHash: 'mock_tx_hash',
              status: 'pending',
            }
          }
        }

        returnData.push({
          json: responseData,
          pairedItem: { item: i },
        })
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error.message },
            pairedItem: { item: i },
          })
          continue
        }
        throw error
      }
    }

    return [returnData]
  }
}