# Dexfra Agent SDK - Monorepo

AI Agent SDK for Dexfra with Solana x402 payment protocol support.

## 🏗️ Monorepo Structure

This is a **Turbo + pnpm monorepo**.

```
dexfra-agent/
├── packages/
│   ├── core/                 # @dexfra/agent-kit (core package with built-in functionality)
│   └── adapter-vercel/       # @dexfra/adapter-vercel (Vercel AI SDK integration)
├── examples/                 # Example projects
│   └── basic-vercel-ai/      # Basic Vercel AI SDK example
└── docs/                     # Documentation (planned)
```

## 📦 Packages

### Core Package

**[@dexfra/agent-kit](./packages/core)** - Core SDK with built-in Dexfra functionality

- **Built-in Dexfra API calls** with automatic x402 payment
- **API discovery and search** from Dexfra marketplace
- **Balance management** for SOL and SPL tokens
- Simplified Solana-only wallet support
- Plugin system for extensibility (planned)
- Connection management
- Type-safe action registration

### Adapters

**[@dexfra/adapter-vercel](./packages/adapter-vercel)** - Vercel AI SDK integration

- Action-based tool creation
- Rich metadata for AI understanding
- Support for similes and examples
- Performance optimized (max 128 tools)

### Planned Packages

The following packages are planned for future releases:

- **@dexfra/plugin-x402** - Advanced x402 payment features
- **@dexfra/plugin-llm** - LLM payment via x402
- **@dexfra/adapter-langchain** - LangChain integration
- **@dexfra/adapter-mcp** - Model Context Protocol

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode
pnpm dev
```

### Usage

```typescript
import { DexfraAgentKit, KeypairWallet } from "@dexfra/agent-kit";

// Create wallet
const wallet = KeypairWallet.fromBase58(process.env.PRIVATE_KEY!);

// Initialize agent
const agent = new DexfraAgentKit(wallet, {
  network: "devnet",
  rpcUrl: "https://api.devnet.solana.com",
  facilitatorUrl: "https://facilitator.payai.network",
  maxAmount: 1.0, // Max 1 USDC per payment
});

// Call Dexfra API with automatic payment (built-in)
const response = await agent.callAPI(
  "https://api.dexfra.fun/v1/token/price",
  { params: { address: "So11111111111111111111111111111111111111112" } }
);
const data = await response.json();

// Discover APIs (built-in)
const apis = await agent.discoverAPIs({
  category: "Token Data"
});

// Get balance (built-in)
const balance = await agent.getBalance();
console.log(balance.formatted); // "10.5 SOL"
```

### With Vercel AI SDK

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createVercelAITools } from "@dexfra/adapter-vercel";

const tools = createVercelAITools(agent, agent.actions);

const result = await generateText({
  model: openai("gpt-4"),
  prompt: "Get SOL token balance for address So11111...",
  tools,
});
```

## 🔧 Development

### Commands

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:core
pnpm build:adapter-vercel

# Development mode (watch)
pnpm dev

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm lint:fix
pnpm format

# Type checking
pnpm typecheck

# Clean all builds
pnpm clean
```

### Publishing

```bash
# Create changeset
pnpm changeset

# Version packages
pnpm version-packages

# Publish to npm
pnpm publish-packages
```

## 📚 Key Features

### 1. Built-in Dexfra Functionality

All core Dexfra features are built-in, no plugins required:

- **API Calls**: Call any Dexfra API with automatic x402 payment
- **API Discovery**: Search and discover APIs from the marketplace
- **Balance Management**: Check SOL and SPL token balances
- **Type-safe**: Full TypeScript support with type inference

### 2. Action/Tool Architecture

- **Actions**: Rich metadata for AI frameworks (description, similes, examples)
- **Built-in Tools**: Pure functions that execute the logic
- **Better AI Understanding**: Similes and examples help AI agents use tools correctly

### 3. Solana-Only Focus

Simplified to Solana-only for better integration:

- **Cleaner API**: No chain detection needed
- **Native Types**: Native Solana web3.js types
- **Wallet Flexibility**: Supports keypair wallets and wallet adapters

### 4. Vercel AI Integration

Built-in support via [@dexfra/adapter-vercel](./packages/adapter-vercel):

- **Action-based tool creation**: Automatic conversion from actions
- **Rich descriptions**: Include similes and examples
- **Performance optimized**: Limit to 128 tools for optimal performance

## 📖 Documentation

- [Core Package README](./packages/core/README.md) - Complete API documentation
- [Vercel Adapter README](./packages/adapter-vercel/README.md) - Vercel AI SDK integration
- [Basic Example](./examples/basic-vercel-ai/README.md) - Getting started with Vercel AI SDK

## 🔗 Related Projects

- [x402 Protocol](https://github.com/coinbase/x402)
- [Vercel AI SDK](https://sdk.vercel.ai/)

## 📝 License

Apache-2.0

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

Built with ❤️ by the Dexfra Team