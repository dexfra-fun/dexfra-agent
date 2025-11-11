# @dexfra/agent-kit

Core SDK for building AI agents on Dexfra with built-in x402 micropayment support.

## Features

- 🤖 **Built-in Dexfra API Access**: Call any Dexfra API with automatic x402 payments
- 💰 **Automatic Payments**: Transparent x402 micropayment handling
- 🔍 **API Discovery**: Search and discover APIs from Dexfra marketplace
- 💼 **Balance Management**: Check SOL and SPL token balances
- 🎯 **AI-Optimized Actions**: Rich metadata with similes and examples for better AI understanding
- 🔧 **Solana-Only**: Simplified focus on Solana blockchain
- 📦 **No Plugins Required**: All core functionality built-in

## Installation

```bash
pnpm add @dexfra/agent-kit
```

## Quick Start

```typescript
import { DexfraAgentKit, KeypairWallet } from "@dexfra/agent-kit";
import { Keypair } from "@solana/web3.js";

// Create wallet
const keypair = Keypair.generate();
const wallet = new KeypairWallet(keypair);

// Initialize agent
const agent = new DexfraAgentKit(wallet, {
  network: "devnet",
  rpcUrl: "https://api.devnet.solana.com",
  facilitatorUrl: "https://facilitator.payai.network",
  maxAmount: 1.0, // Max 1 USDC per payment
});

// Call Dexfra API with automatic payment
const response = await agent.callAPI(
  "https://api.dexfra.fun/v1/token/price",
  {
    params: { address: "So11111111111111111111111111111111111111112" }
  }
);
const data = await response.json();
console.log("Token price:", data);

// Discover available APIs
const apis = await agent.discoverAPIs({
  category: "Token Data",
  maxPrice: 0.01
});
console.log("Available APIs:", apis);

// Check wallet balance
const balance = await agent.getBalance();
console.log("SOL Balance:", balance.formatted);
```

## Built-in Methods

### `callAPI(url, options?)`

Call any Dexfra API endpoint with automatic x402 payment.

```typescript
// GET request
const response = await agent.callAPI(
  "https://api.dexfra.fun/v1/token/balance",
  {
    method: "GET",
    params: { address: "So11..." }
  }
);

// POST request
const response = await agent.callAPI(
  "https://api.dexfra.fun/v1/swap",
  {
    method: "POST",
    body: { from: "SOL", to: "USDC", amount: 1.0 }
  }
);
```

### `discoverAPIs(filters?)`

Search and discover APIs from the Dexfra marketplace.

```typescript
const apis = await agent.discoverAPIs({
  category: "Token Data",
  tags: ["price", "real-time"],
  maxPrice: 0.01,
  limit: 20
});
```

### `getAPIDetails(apiId)`

Get detailed information about a specific API.

```typescript
const api = await agent.getAPIDetails("6911956bea5afb9fc66607e4");
console.log(api.name, api.price, api.description);
```

### `getBalance(tokenMint?)`

Get SOL or SPL token balance for the wallet.

```typescript
// Get SOL balance
const solBalance = await agent.getBalance();
console.log(solBalance.formatted); // "10.5 SOL"

// Get USDC balance
const usdcBalance = await agent.getBalance(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
console.log(usdcBalance.formatted); // "100.5 USDC"
```

## Built-in Actions for AI Frameworks

The agent exposes actions that can be used with AI frameworks like Vercel AI SDK:

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createVercelAITools } from "@dexfra/adapter-vercel";

// Actions are automatically populated
console.log(agent.actions);
// [callAPIAction, discoverAPIsAction, getBalanceAction]

// Use with Vercel AI SDK
const tools = createVercelAITools(agent);
const result = await generateText({
  model: openai("gpt-4"),
  prompt: "Get SOL token balance and current price",
  tools,
});
```

Each action includes:
- **Rich descriptions**: Help AI understand when to use the action
- **Similes**: Alternative phrases that trigger the action
- **Examples**: Input/output pairs with explanations

## Configuration

```typescript
interface DexfraConfig {
  // Network configuration
  rpcUrl?: string;                    // Solana RPC URL
  network?: "devnet" | "mainnet-beta"; // Network to use
  
  // x402 Payment settings
  facilitatorUrl?: string;            // x402 facilitator URL
  maxAmount?: number;                 // Max USDC per payment
  
  // API Discovery
  marketplaceUrl?: string;            // Dexfra marketplace URL
  
  // Payment callbacks
  onPaymentRequired?: (amount: string) => void;
  onPaymentSuccess?: (txId: string) => void;
  onPaymentError?: (error: Error) => void;
  
  // Performance
  priorityLevel?: "low" | "medium" | "high";
  timeout?: number;
}
```

## Plugin Architecture (Planned)

Plugin support is planned for future releases to extend functionality:

```typescript
// Future API (not yet implemented)
import SomePlugin from "@dexfra/plugin-example";

const agent = new DexfraAgentKit(wallet, config)
  .use(SomePlugin);

// Access plugin methods
await agent.methods.somePluginMethod();
```

## Constants

```typescript
import {
  DEXFRA_DEFAULTS,
  DEXFRA_CATEGORIES,
  CATEGORY_IDS,
  SUPPORTED_NETWORKS
} from "@dexfra/agent-kit";

// Default endpoints
console.log(DEXFRA_DEFAULTS.MARKETPLACE_URL); // 'https://dexfra.fun'
console.log(DEXFRA_DEFAULTS.API_BASE_URL); // 'https://api.dexfra.fun'

// Category IDs for discovery
console.log(CATEGORY_IDS.TOKEN_DATA); // '6911956bea5afb9fc66607e4'
console.log(CATEGORY_IDS.WALLET_DATA); // '6910ceb89931921d7a492a44'
```

## Error Handling

```typescript
import {
  DexfraError,
  PaymentRequiredError,
  MaxAmountExceededError,
  APINotFoundError
} from "@dexfra/agent-kit";

try {
  await agent.callAPI(url);
} catch (error) {
  if (error instanceof PaymentRequiredError) {
    console.error("Payment required:", error.amount);
  } else if (error instanceof MaxAmountExceededError) {
    console.error("Payment exceeds max:", error.required, "vs", error.max);
  } else if (error instanceof APINotFoundError) {
    console.error("API not found:", error.apiId);
  }
}
```

## Advanced Usage

### Direct Tool Usage

For advanced use cases, you can use the underlying tools directly:

```typescript
import { 
  dexfraFetch, 
  discoverAPIs, 
  getBalance 
} from "@dexfra/agent-kit";

// Manual fetch with x402 payment
const response = await dexfraFetch(url, {
  wallet,
  connection,
  network: "devnet",
  facilitatorUrl: "https://facilitator.payai.network"
});

// Direct API discovery
const apis = await discoverAPIs(
  { category: "Token Data" },
  "https://dexfra.fun"
);
```

### Custom Wallet Implementation

```typescript
import type { DexfraWallet } from "@dexfra/agent-kit";
import { PublicKey, Transaction } from "@solana/web3.js";

class MyCustomWallet implements DexfraWallet {
  publicKey: PublicKey;
  
  async signTransaction(tx: Transaction) {
    // Your signing logic
    return tx;
  }
  
  async signAllTransactions(txs: Transaction[]) {
    return Promise.all(txs.map(tx => this.signTransaction(tx)));
  }
}
```

## TypeScript Support

Full TypeScript support with type inference:

```typescript
const agent = new DexfraAgentKit(wallet, config);

// Built-in methods are fully typed
agent.callAPI // ✅ (url: string, options?: {...}) => Promise<Response>
agent.discoverAPIs // ✅ (filters?: APIDiscoveryFilters) => Promise<DexfraAPI[]>
agent.getBalance // ✅ (tokenMint?: string) => Promise<{...}>
agent.getAPIDetails // ✅ (apiId: string) => Promise<DexfraAPI>

// Actions array is typed
agent.actions // ✅ Action[]
```

## Examples

See the [examples directory](../../examples/) for complete examples:
- [Basic Vercel AI](../../examples/basic-vercel-ai/) - Getting started with Vercel AI SDK

## License

Apache-2.0