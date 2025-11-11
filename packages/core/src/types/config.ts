/**
 * Configuration types for Dexfra Agent Kit
 */

/**
 * Dexfra Agent Kit configuration
 */
export interface DexfraConfig {
  /** Solana RPC URL */
  rpcUrl?: string;
  
  /** Network: devnet or mainnet-beta */
  network?: "devnet" | "mainnet-beta";
  
  /** x402 facilitator URL */
  facilitatorUrl?: string;
  
  /** Max USDC amount per payment (prevents overspending) */
  maxAmount?: number;
  
  /** Dexfra API key for discovery service */
  dexfraApiKey?: string;
  
  /** Marketplace URL for API discovery */
  marketplaceUrl?: string;
  
  /** Priority level for transactions */
  priorityLevel?: "low" | "medium" | "high";
  
  /** Request timeout in milliseconds */
  timeout?: number;
  
  /** Callback when payment is required */
  onPaymentRequired?: (amount: string) => void;
  
  /** Callback when payment succeeds */
  onPaymentSuccess?: (txId: string) => void;
  
  /** Callback when payment fails */
  onPaymentError?: (error: Error) => void;
}