# @dexfra/adapter-vercel

Vercel AI SDK adapter for Dexfra Agent Kit. Converts Dexfra Agent Kit actions into Vercel AI SDK tools with rich descriptions, similes, and examples for better AI understanding.

## Installation

```bash
npm install @dexfra/adapter-vercel @dexfra/agent-kit ai
# or
pnpm add @dexfra/adapter-vercel @dexfra/agent-kit ai
# or
yarn add @dexfra/adapter-vercel @dexfra/agent-kit ai
```

## Features

- 🎯 **Action-to-Tool Conversion**: Automatically converts all Dexfra actions to Vercel AI SDK tools
- 📝 **Rich Descriptions**: Includes similes and examples to help AI understand tool usage
- ⚡ **Performance Optimized**: Limits to 128 tools for optimal performance
- 🔧 **Type-Safe**: Full TypeScript support with type inference
- 🎨 **Flexible**: Create all tools or specific tools as needed

## Usage

### Basic Usage

```typescript
import { DexfraAgentKit, KeypairWallet } from "@dexfra/agent-kit";
import { createVercelAITools } from "@dexfra/adapter-vercel";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Keypair } from "@solana/web3.js";

// Create wallet and agent
const keypair = Keypair.fromSecretKey(/* your secret key */);
const wallet = new KeypairWallet(keypair);

const agent = new DexfraAgentKit(wallet, {
  network: "devnet",
  rpcUrl: "https://api.devnet.solana.com",
  facilitatorUrl: "https://facilitator.payai.network",
});

// Convert all actions to Vercel AI tools
const tools = createVercelAITools(agent);

// Use with Vercel AI SDK
const result = await generateText({
  model: openai("gpt-4"),
  prompt: "Get SOL balance for my wallet",
  tools,
});

console.log(result.text);
```

### Create Single Tool

```typescript
import { createVercelAITool } from "@dexfra/adapter-vercel";

// Create a specific tool
const callAPITool = createVercelAITool(agent, "call_dexfra_api");

if (callAPITool) {
  const tools = {
    call_dexfra_api: callAPITool,
  };

  // Use the specific tool
  const result = await generateText({
    model: openai("gpt-4"),
    prompt: "Call the token price API",
    tools,
  });
}
```

### Get Tool Statistics

```typescript
import { getToolStats } from "@dexfra/adapter-vercel";

const stats = getToolStats(agent);
console.log(`Total actions: ${stats.totalActions}`);
console.log(`Available tools: ${stats.availableTools}`);
console.log(`Truncated: ${stats.truncated}`);
```

### With Streaming

```typescript
import { streamText } from "ai";

const result = streamText({
  model: openai("gpt-4"),
  prompt: "Get my SOL balance and explain it",
  tools: createVercelAITools(agent),
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

### Advanced: Custom Action Filtering

```typescript
// Only convert specific actions
const specificActions = agent.actions.filter((action) =>
  ["call_dexfra_api", "get_balance"].includes(action.name)
);

const tools = createVercelAITools(agent, specificActions);
```

## API Reference

### `createVercelAITools(agent, actions?)`

Converts Dexfra Agent Kit actions to Vercel AI SDK tools.

**Parameters:**
- `agent: DexfraAgentKit` - The DexfraAgentKit instance
- `actions?: Action[]` - Optional array of actions to convert (defaults to `agent.actions`)

**Returns:** `Record<string, CoreTool>` - Object with action names as keys and CoreTools as values

**Notes:**
- Automatically limits to 128 tools for optimal performance
- Includes rich descriptions with similes and examples
- Handles errors gracefully and continues with remaining actions

### `createVercelAITool(agent, actionName)`

Creates a single Vercel AI SDK tool from a specific action.

**Parameters:**
- `agent: DexfraAgentKit` - The DexfraAgentKit instance
- `actionName: string` - Name of the action to convert

**Returns:** `CoreTool | undefined` - A single CoreTool or undefined if action not found

### `getToolStats(agent)`

Gets statistics about available tools.

**Parameters:**
- `agent: DexfraAgentKit` - The DexfraAgentKit instance

**Returns:**
```typescript
{
  totalActions: number;     // Total number of actions
  availableTools: number;   // Number of tools that will be created (max 128)
  truncated: boolean;       // Whether the tool list was truncated
}
```

## How It Works

### 1. Rich Descriptions

Each action is converted with enhanced descriptions:

```typescript
// Original action
{
  name: "call_dexfra_api",
  description: "Call a Dexfra API endpoint...",
  similes: ["call api", "fetch data", "query dexfra"],
  examples: [
    {
      input: { apiId: "..." },
      output: { data: "..." },
      explanation: "Get token balance..."
    }
  ]
}

// Becomes tool with formatted description:
// "Call a Dexfra API endpoint...
//  
//  Also known as: call api, fetch data, query dexfra
//  
//  Examples:
//  - Input: {...}
//    Output: {...}
//    Explanation: Get token balance..."
```

### 2. Performance Optimization

The adapter automatically limits to 128 tools to maintain optimal performance with the Vercel AI SDK, as recommended by their documentation.

### 3. Error Handling

All tool executions are wrapped with error handling that returns structured error responses AI can understand:

```typescript
{
  success: false,
  error: "Error message",
  action: "action_name"
}
```

## Examples

See the [examples directory](../../examples) for complete working examples:

- [Basic Usage](../../examples/basic-usage)
- [Vercel AI Chatbot](../../examples/vercel-ai-chatbot)
- [Streaming Responses](../../examples/streaming)

## License

Apache-2.0