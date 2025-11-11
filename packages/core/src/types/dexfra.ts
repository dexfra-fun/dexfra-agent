/**
 * Dexfra-specific type definitions
 */

import type { Connection } from "@solana/web3.js";
import type { DexfraWallet } from "../wallet";

/**
 * Dexfra API metadata from marketplace
 */
export interface DexfraAPI {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: string;
  category: string;
  categoryId: string;
  tags: string[];
  price: number; // Price in USDC
  priceFormatted: string; // Human-readable price
  inputSchema?: JSONSchema;
  outputSchema?: JSONSchema;
  exampleRequest?: Record<string, unknown>;
  exampleResponse?: Record<string, unknown>;
  rateLimit?: {
    requests: number;
    window: string; // e.g., "1m", "1h", "1d"
  };
  authentication?: {
    required: boolean;
    type?: "x402" | "api-key";
  };
}

/**
 * JSON Schema definition
 */
export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  enum?: unknown[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
  items?: JSONSchemaProperty;
}

/**
 * API discovery filters
 */
export interface APIDiscoveryFilters {
  category?: string;
  categoryId?: string;
  search?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

/**
 * API discovery response
 */
export interface APIDiscoveryResponse {
  apis: DexfraAPI[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Payment requirement from x402 response
 */
export interface X402PaymentRequirement {
  scheme: "exact" | "upto";
  network: string;
  recipient: string;
  maxAmountRequired: string;
  token?: string;
  extra?: Record<string, unknown>;
}

/**
 * x402 Payment Required response body
 */
export interface X402PaymentRequiredResponse {
  x402Version: number;
  accepts: X402PaymentRequirement[];
  message?: string;
}

/**
 * Settlement response from x-payment-response header
 */
export interface X402SettlementResponse {
  transactionId: string;
  network: string;
  amount: string;
  timestamp: number;
}

/**
 * Configuration for dexfraFetch
 */
export interface DexfraFetchConfig {
  wallet: DexfraWallet;
  connection: Connection;
  network: string;
  facilitatorUrl: string;
  maxAmount?: number;
  onPaymentRequired?: (amount: string) => void;
  onPaymentSuccess?: (txId: string) => void;
  onPaymentError?: (error: Error) => void;
}

/**
 * Error types
 */
export class DexfraError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "DexfraError";
  }
}

export class PaymentRequiredError extends DexfraError {
  constructor(
    message: string,
    public amount: string,
    public requirements: X402PaymentRequirement[]
  ) {
    super(message, "PAYMENT_REQUIRED", { amount, requirements });
    this.name = "PaymentRequiredError";
  }
}

export class MaxAmountExceededError extends DexfraError {
  constructor(
    message: string,
    public required: string,
    public max: string
  ) {
    super(message, "MAX_AMOUNT_EXCEEDED", { required, max });
    this.name = "MaxAmountExceededError";
  }
}

export class APINotFoundError extends DexfraError {
  constructor(
    message: string,
    public apiId: string
  ) {
    super(message, "API_NOT_FOUND", { apiId });
    this.name = "APINotFoundError";
  }
}

export class NetworkNotSupportedError extends DexfraError {
  constructor(
    message: string,
    public network: string
  ) {
    super(message, "NETWORK_NOT_SUPPORTED", { network });
    this.name = "NetworkNotSupportedError";
  }
}
