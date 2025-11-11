/**
 * Dexfra Agent Kit - Core SDK
 * AI Agent SDK for Dexfra with built-in x402 payment support
 */

// Export main client
export { DexfraAgentKit } from "./client";

// Export wallet implementations
export { KeypairWallet, AdapterWallet } from "./wallet";
export type { DexfraWallet } from "./wallet";

// Export types
export type {
  DexfraConfig,
  Plugin,
  PluginMethods,
  Action,
  DexfraAPI,
  APIDiscoveryFilters,
  APIDiscoveryResponse,
  DexfraFetchConfig,
  X402PaymentRequirement,
  X402PaymentRequiredResponse,
  X402SettlementResponse,
  JSONSchema,
  JSONSchemaProperty,
} from "./types";

// Export errors
export {
  DexfraError,
  PaymentRequiredError,
  MaxAmountExceededError,
  APINotFoundError,
  NetworkNotSupportedError,
} from "./types/dexfra";

// Export constants
export {
  DEXFRA_DEFAULTS,
  DEXFRA_CATEGORIES,
  CATEGORY_IDS,
  SUPPORTED_NETWORKS,
  X402_VERSION,
  DEFAULT_MAX_AMOUNT_USDC,
  USDC_DECIMALS,
} from "./constants";

// Export built-in actions (for AI frameworks)
export { callAPIAction } from "./actions/callAPI";
export { discoverAPIsAction } from "./actions/discoverAPIs";
export { getBalanceAction } from "./actions/getBalance";

// Export tools (for advanced usage)
export { dexfraFetch, dexfraGet, dexfraPost } from "./tools/fetch";
export {
  discoverAPIs,
  getAPIDetails,
  getAPIsByCategory,
  getAPIsByTags,
  getMultipleAPIs,
  searchAPIsWithPagination,
} from "./tools/discovery";
export { getSOLBalance, getTokenBalance, getBalance } from "./tools/balance";
