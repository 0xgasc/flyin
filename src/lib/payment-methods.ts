// Payment method configuration for FlyInGuate
// Designed to support future stablecoin integration

export interface PaymentMethod {
  id: string
  name: string
  display_name: string
  icon: string
  description: string
  manual_approval: boolean
  auto_verification: boolean
  blockchain_enabled: boolean
  supported_currencies?: string[]
  processing_time: string
  fees?: {
    fixed?: number
    percentage?: number
  }
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'bank_transfer',
    name: 'bank_transfer',
    display_name: 'Bank Transfer',
    icon: '🏦',
    description: 'Traditional wire transfer or ACH payment',
    manual_approval: true,
    auto_verification: false,
    blockchain_enabled: false,
    processing_time: '1-3 business days',
    fees: {
      fixed: 0,
      percentage: 0
    }
  },
  {
    id: 'cryptocurrency',
    name: 'cryptocurrency',
    display_name: 'Cryptocurrency',
    icon: '🪙',
    description: 'Digital currency payments (stablecoin ready)',
    manual_approval: true, // Will be false when auto-verification is implemented
    auto_verification: false, // Future: true when blockchain integration is complete
    blockchain_enabled: true,
    supported_currencies: ['USDC', 'USDT', 'DAI'], // Future stablecoin support
    processing_time: 'Instant (pending integration)',
    fees: {
      percentage: 0.5 // Example: 0.5% processing fee
    }
  },
  {
    id: 'mobile_money',
    name: 'mobile_money',
    display_name: 'Mobile Money',
    icon: '📱',
    description: 'Local mobile payment solutions',
    manual_approval: true,
    auto_verification: false,
    blockchain_enabled: false,
    processing_time: 'Same day',
    fees: {
      percentage: 1.5
    }
  }
]

// Stablecoin architecture planning
export interface StablecoinConfig {
  enabled: boolean
  supported_networks: string[]
  supported_tokens: {
    symbol: string
    contract_address: string
    decimals: number
    network: string
  }[]
  webhook_url?: string
  auto_approval_threshold?: number
}

export const STABLECOIN_CONFIG: StablecoinConfig = {
  enabled: false, // Enable when ready for production
  supported_networks: ['ethereum', 'polygon', 'bsc'],
  supported_tokens: [
    {
      symbol: 'USDC',
      contract_address: '0xA0b86a33E6C6240d17E78CD98D3B6b4F8C8d9E9A', // Example
      decimals: 6,
      network: 'ethereum'
    },
    {
      symbol: 'USDT',
      contract_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Example
      decimals: 6,
      network: 'ethereum'
    },
    {
      symbol: 'DAI',
      contract_address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // Example
      decimals: 18,
      network: 'ethereum'
    }
  ],
  auto_approval_threshold: 1000 // Auto-approve transactions below $1000
}

export function getPaymentMethod(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find(method => method.id === id)
}

export function isStablecoinPayment(paymentMethod: string): boolean {
  const method = getPaymentMethod(paymentMethod)
  return method?.blockchain_enabled === true
}

export function shouldAutoApprove(amount: number, paymentMethod: string): boolean {
  if (!STABLECOIN_CONFIG.enabled) return false
  if (!isStablecoinPayment(paymentMethod)) return false
  
  return amount <= (STABLECOIN_CONFIG.auto_approval_threshold || 0)
}

// Future function for blockchain verification
export async function verifyStablecoinTransaction(
  txHash: string,
  expectedAmount: number,
  recipientAddress: string
): Promise<{
  verified: boolean
  amount: number
  token: string
  network: string
  error?: string
}> {
  // This will be implemented when stablecoin integration is ready
  // Will connect to blockchain APIs (Etherscan, etc.) to verify transactions
  return {
    verified: false,
    amount: 0,
    token: '',
    network: '',
    error: 'Stablecoin verification not yet implemented'
  }
}