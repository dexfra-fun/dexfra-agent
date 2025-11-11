# Basic Vercel AI Example

This example demonstrates how to use the Dexfra Agent Kit with the Vercel AI SDK to create an AI agent that can call Dexfra APIs with automatic x402 payment.

## Features

- 🤖 AI-powered API interaction using GPT-4
- 💰 Automatic x402 payment handling
- 🔧 Multiple action examples (balance check, API discovery, API calls)
- 📊 Tool call tracking and result logging

## Setup

1. Install dependencies:

```bash
cd examples/basic-vercel-ai
pnpm install
```

2. Create `.env` file with your credentials:

```bash
cp .env.example .env
```

3. Edit `.env` and add your credentials:

```env
# Solana wallet private key (base58 encoded)
SOLANA_PRIVATE_KEY=your_private_key_here

# OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Custom RPC URL (defaults to devnet)
RPC_URL=https://api.devnet.solana.com

# Optional: Custom facilitator URL
FACILITATOR_URL=https://facilitator.payai.network
```

## Run

```bash
pnpm start
```

## What It Does

The example demonstrates three main scenarios:

### 1. Get Balance
Asks the AI to check the wallet's SOL balance using the built-in `get_balance` action.

```typescript
const result = await generateText({
  model: openai("gpt-4"),
  prompt: "What is my SOL balance?",
  tools,
});
```

### 2. Discover APIs
Uses the `discover_dexfra_apis` action to find available APIs in the Dexfra marketplace.

```typescript
const result = await generateText({
  model: openai("gpt-4"),
  prompt: "What APIs are available for token data?",
  tools,
});
```

### 3. Call Dexfra API
Demonstrates calling a Dexfra API endpoint with automatic x402 payment using the `call_dexfra_api` action.

```typescript
const result = await generateText({
  model: openai("gpt-4"),
  prompt: "Get the price of SOL token using Dexfra API",
  tools,
});
```

## Understanding the Output

The example logs:
- Wallet address being used
- Number of actions/tools available
- AI responses for each scenario
- Tool calls made (action name and parameters)
- Results returned from each tool

## Next Steps

- Modify the prompts to try different queries
- Add more complex multi-step workflows
- Integrate with your own application
- Try different AI models (GPT-3.5, Claude, etc.)

## Troubleshooting

### "Insufficient balance" error
Make sure your wallet has enough USDC for API payments on the network you're using (devnet or mainnet).

### OpenAI API errors
Verify your `OPENAI_API_KEY` is valid and has sufficient credits.

### Connection errors
Check your `RPC_URL` and `FACILITATOR_URL` are accessible.

## Learn More

- [Dexfra Agent Kit Documentation](../../packages/core/README.md)
- [Vercel AI SDK Adapter Documentation](../../packages/adapter-vercel/README.md)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/)