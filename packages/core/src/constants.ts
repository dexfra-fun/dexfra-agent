/**
 * Dexfra API Configuration and Constants
 */

/**
 * Default Dexfra API endpoints
 */
export const DEXFRA_DEFAULTS = {
  MARKETPLACE_URL: 'https://dexfra.fun',
  API_BASE_URL: 'https://api.dexfra.fun',
  FACILITATOR_URL: 'https://facilitator.payai.network',
  DEFAULT_NETWORK: 'solana-devnet',
} as const;

/**
 * Dexfra API Categories
 * These categories group related APIs in the Dexfra marketplace
 */
export const DEXFRA_CATEGORIES = {
  TOKEN_DATA: {
    id: '6911956bea5afb9fc66607e4',
    name: 'Token Data',
    url: 'https://dexfra.fun/categories/6911956bea5afb9fc66607e4',
    description: 'APIs for token price, metadata, and market data',
  },
  WALLET_DATA: {
    id: '6910ceb89931921d7a492a44',
    name: 'Wallet Data',
    url: 'https://dexfra.fun/categories/6910ceb89931921d7a492a44',
    description: 'APIs for wallet analysis, portfolio tracking, and transaction history',
  },
  MEME_FACTORY: {
    id: '6910cec39931921d7a492a46',
    name: 'Meme Factory',
    url: 'https://dexfra.fun/categories/6910cec39931921d7a492a46',
    description: 'APIs for meme coin creation, discovery, and analytics',
  },
  SMART_MONEY: {
    id: '691345b3bb6dc6ef219142d0',
    name: 'Smart Money',
    url: 'https://dexfra.fun/categories/691345b3bb6dc6ef219142d0',
    description: 'APIs for smart money tracking, whale movements, and trading signals',
  },
} as const;

/**
 * Category IDs for easy reference
 */
export const CATEGORY_IDS = {
  TOKEN_DATA: DEXFRA_CATEGORIES.TOKEN_DATA.id,
  WALLET_DATA: DEXFRA_CATEGORIES.WALLET_DATA.id,
  MEME_FACTORY: DEXFRA_CATEGORIES.MEME_FACTORY.id,
  SMART_MONEY: DEXFRA_CATEGORIES.SMART_MONEY.id,
} as const;

/**
 * Supported blockchain networks
 */
export const SUPPORTED_NETWORKS = {
  SOLANA_DEVNET: 'solana-devnet',
  SOLANA_MAINNET: 'solana-mainnet',
  BASE_MAINNET: 'base-mainnet',
  BASE_SEPOLIA: 'base-sepolia',
  ETHEREUM_MAINNET: 'ethereum-mainnet',
  ETHEREUM_SEPOLIA: 'ethereum-sepolia',
} as const;

/**
 * x402 Protocol Version
 */
export const X402_VERSION = 1 as const;

/**
 * Default max amount in USDC for API calls
 * This can be overridden in DexfraClient config
 */
export const DEFAULT_MAX_AMOUNT_USDC = 1.0;

/**
 * USDC token decimals
 */
export const USDC_DECIMALS = 6;