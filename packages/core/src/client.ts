/**
 * DexfraAgentKit - Main client with plugin architecture
 * Core Dexfra functionality is built-in, plugins are for optional extensions
 */

import { Connection, PublicKey } from "@solana/web3.js";
import type { DexfraWallet } from "./wallet";
import type { DexfraConfig } from "./types/config";
import type { Plugin, Action, PluginMethods } from "./types/plugin";
import type { DexfraFetchConfig, APIDiscoveryFilters } from "./types/dexfra";
import { DEXFRA_DEFAULTS } from "./constants";
import { dexfraGet, dexfraPost } from "./tools/fetch";
import {
  discoverAPIs as discoverAPIsTools,
  getAPIDetails as getAPIDetailsTool,
} from "./tools/discovery";
import { getBalance as getBalanceTool } from "./tools/balance";
import { callAPIAction } from "./actions/callAPI";
import { discoverAPIsAction } from "./actions/discoverAPIs";
import { getBalanceAction } from "./actions/getBalance";

/**
 * Main Dexfra Agent Kit client
 *
 * @example
 * ```typescript
 * import { DexfraAgentKit, KeypairWallet } from "@dexfra/agent-kit";
 *
 * const wallet = KeypairWallet.fromBase58(process.env.PRIVATE_KEY);
 * const agent = new DexfraAgentKit(wallet, {
 *   network: "devnet",
 *   rpcUrl: "https://api.devnet.solana.com",
 * });
 *
 * // Built-in methods (no plugins needed)
 * const response = await agent.callAPI("https://api.dexfra.fun/...");
 * const apis = await agent.discoverAPIs({ category: "Token Data" });
 * const balance = await agent.getBalance();
 *
 * // Built-in actions for AI frameworks
 * console.log(agent.actions); // [callAPIAction, discoverAPIsAction, getBalanceAction]
 * ```
 */
export class DexfraAgentKit<TPlugins = Record<string, never>> {
  /** Solana connection */
  public connection: Connection;

  /** Wallet instance */
  public wallet: DexfraWallet;

  /** Configuration */
  public config: DexfraConfig;

  /** Registered plugins */
  private plugins: Map<string, Plugin> = new Map();

  /** Plugin methods (typed based on registered plugins) */
  public methods: TPlugins = {} as TPlugins;

  /** All registered actions (for AI frameworks) */
  public actions: Action[] = [];

  constructor(wallet: DexfraWallet, config: DexfraConfig = {}) {
    this.wallet = wallet;
    this.config = config;

    // Initialize Solana connection
    this.connection = new Connection(
      config.rpcUrl || "https://api.devnet.solana.com",
      {
        commitment: "confirmed",
      }
    );

    // Register built-in actions
    this.actions = [callAPIAction, discoverAPIsAction, getBalanceAction];
  }

  /**
   * Call a Dexfra API with automatic x402 payment
   * Built-in core method
   */
  async callAPI(
    url: string,
    options?: {
      method?: "GET" | "POST";
      params?: Record<string, string>;
      body?: unknown;
    }
  ): Promise<Response> {
    const config: DexfraFetchConfig = {
      wallet: this.wallet,
      connection: this.connection,
      network: this.config.network || DEXFRA_DEFAULTS.DEFAULT_NETWORK,
      facilitatorUrl:
        this.config.facilitatorUrl || DEXFRA_DEFAULTS.FACILITATOR_URL,
      maxAmount: this.config.maxAmount,
      onPaymentRequired: this.config.onPaymentRequired,
      onPaymentSuccess: this.config.onPaymentSuccess,
      onPaymentError: this.config.onPaymentError,
    };

    if (options?.method === "POST") {
      return dexfraPost(url, config, options.body);
    }

    return dexfraGet(url, config, options?.params);
  }

  /**
   * Discover APIs from Dexfra marketplace
   * Built-in core method
   */
  async discoverAPIs(filters?: APIDiscoveryFilters) {
    const marketplaceUrl =
      this.config.marketplaceUrl || DEXFRA_DEFAULTS.MARKETPLACE_URL;
    return discoverAPIsTools(filters, marketplaceUrl);
  }

  /**
   * Get API details by ID
   * Built-in core method
   */
  async getAPIDetails(apiId: string) {
    const marketplaceUrl =
      this.config.marketplaceUrl || DEXFRA_DEFAULTS.MARKETPLACE_URL;
    return getAPIDetailsTool(apiId, marketplaceUrl);
  }

  /**
   * Get balance for SOL or SPL token
   * Built-in core method
   */
  async getBalance(tokenMint?: string) {
    const mint = tokenMint ? new PublicKey(tokenMint) : undefined;
    return getBalanceTool(this.wallet, this.connection, mint);
  }

  /**
   * Add a plugin and register its methods
   *
   * @example
   * ```typescript
   * import DexfraPlugin from "@dexfra/plugin-dexfra";
   * import X402Plugin from "@dexfra/plugin-x402";
   *
   * const agent = new DexfraAgentKit(wallet, config)
   *   .use(DexfraPlugin)
   *   .use(X402Plugin);
   * ```
   */
  use<P extends Plugin>(
    plugin: P
  ): DexfraAgentKit<TPlugins & PluginMethods<P>> {
    // Check if plugin already registered
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered`);
      return this as DexfraAgentKit<TPlugins & PluginMethods<P>>;
    }

    // Initialize plugin
    plugin.initialize(this as DexfraAgentKit);

    // Register methods
    for (const [methodName, method] of Object.entries(plugin.methods)) {
      if ((this.methods as Record<string, unknown>)[methodName]) {
        throw new Error(
          `Method ${methodName} already exists. Plugin ${plugin.name} conflicts with existing method.`
        );
      }
      (this.methods as Record<string, unknown>)[methodName] =
        method.bind(plugin);
    }

    // Register actions
    for (const action of plugin.actions) {
      // Check for duplicate action names
      if (this.actions.some((a) => a.name === action.name)) {
        throw new Error(
          `Action ${action.name} already exists. Plugin ${plugin.name} conflicts with existing action.`
        );
      }
      this.actions.push(action);
    }

    // Store plugin
    this.plugins.set(plugin.name, plugin);

    return this as DexfraAgentKit<TPlugins & PluginMethods<P>>;
  }

  /**
   * Get registered plugin by name
   */
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Check if plugin is registered
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Get all registered plugin names
   */
  getPluginNames(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Get wallet address
   */
  getAddress(): string {
    return this.wallet.publicKey.toBase58();
  }

  /**
   * Get network
   */
  getNetwork(): string {
    return this.config.network || "devnet";
  }
}
