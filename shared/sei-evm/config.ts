/**
 * Sei EVM Configuration
 * Based on https://docs.sei.io/evm/
 */

export const SeiEVMConfig = {
  mainnet: {
    chainId: '0x531', // 1329 in hex
    chainName: 'Sei',
    rpcUrls: ['https://evm-rpc.sei-apis.com'],
    nativeCurrency: {
      name: 'SEI',
      symbol: 'SEI',
      decimals: 18,
    },
    blockExplorerUrls: ['https://seitrace.com'],
  },
  testnet: {
    chainId: '0x531', // 1329 in hex for atlantic-2
    chainName: 'Sei Atlantic-2',
    rpcUrls: ['https://evm-rpc-testnet.sei-apis.com'],
    nativeCurrency: {
      name: 'SEI',
      symbol: 'SEI',
      decimals: 18,
    },
    blockExplorerUrls: ['https://seitrace.com'],
  },
  devnet: {
    chainId: '0x331', // 713715 in hex
    chainName: 'Sei Devnet',
    rpcUrls: ['https://evm-rpc-arctic-1.sei-apis.com'],
    nativeCurrency: {
      name: 'SEI',
      symbol: 'SEI',
      decimals: 18,
    },
    blockExplorerUrls: ['https://seitrace.com'],
  }
}

export const POINTER_PRECOMPILE_ADDRESS = '0x0000000000000000000000000000000000001004'
export const WSEI_ADDRESS = '0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7'

// EVM JSON-RPC endpoints
export const EVM_RPC_ENDPOINTS = {
  mainnet: 'https://evm-rpc.sei-apis.com',
  testnet: 'https://evm-rpc-testnet.sei-apis.com',
  devnet: 'https://evm-rpc-arctic-1.sei-apis.com'
}

// WebSocket endpoints for real-time updates
export const EVM_WS_ENDPOINTS = {
  mainnet: 'wss://evm-ws.sei-apis.com',
  testnet: 'wss://evm-ws-testnet.sei-apis.com',
  devnet: 'wss://evm-ws-arctic-1.sei-apis.com'
}