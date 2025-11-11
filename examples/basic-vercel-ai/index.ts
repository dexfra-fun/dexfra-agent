/**
 * Basic Vercel AI SDK Example with Dexfra Agent Kit
 *
 * This example demonstrates how to use the Dexfra Agent Kit with the Vercel AI SDK
 * to create an AI agent that can call Dexfra APIs with automatic x402 payment.
 */

import { DexfraAgentKit, KeypairWallet } from "@dexfra/agent-kit";
import { createVercelAITools } from "@dexfra/adapter-vercel";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";

async function main() {
  // 1. Setup wallet
  // In production, load from environment variable or secure storage
  const secretKey = process.env.SOLANA_PRIVATE_KEY;
  if (!secretKey) {
    throw new Error("SOLANA_PRIVATE_KEY environment variable is required");
  }

  const keypair = Keypair.fromSecretKey(bs58.decode(secretKey));
  const wallet = new KeypairWallet(keypair);

  console.log("Wallet address:", wallet.publicKey.toBase58());

  // 2. Create Dexfra Agent Kit
  const agent = new DexfraAgentKit(wallet, {
    network: "devnet",
    rpcUrl: process.env.RPC_URL || "https://api.devnet.solana.com",
    facilitatorUrl:
      process.env.FACILITATOR_URL || "https://facilitator.payai.network",
    maxAmount: 1.0, // Max 1 USDC per payment
  });

  console.log("Agent initialized with", agent.actions.length, "actions");

  // 3. Convert actions to Vercel AI tools
  const tools = createVercelAITools(agent);
  console.log("Created", Object.keys(tools).length, "tools for Vercel AI SDK");

  // 4. Use with Vercel AI SDK
  console.log("\n--- Example 1: Get Balance ---");
  const balanceResult = await generateText({
    model: openai("gpt-4"),
    prompt: "What is my SOL balance?",
    tools,
  });

  console.log("AI Response:", balanceResult.text);
  console.log("\nTool Calls:");
  for (const step of balanceResult.steps) {
    if (step.toolCalls && step.toolCalls.length > 0) {
      for (const toolCall of step.toolCalls) {
        console.log(
          `- ${toolCall.toolName}:`,
          JSON.stringify(toolCall.args, null, 2)
        );
      }
    }
  }

  // 5. Discover APIs
  console.log("\n--- Example 2: Discover APIs ---");
  const discoveryResult = await generateText({
    model: openai("gpt-4"),
    prompt: "What APIs are available for token data?",
    tools,
  });

  console.log("AI Response:", discoveryResult.text);

  // 6. Call a specific API
  console.log("\n--- Example 3: Call Dexfra API ---");
  const apiCallResult = await generateText({
    model: openai("gpt-4"),
    prompt: "Get the price of SOL token using Dexfra API",
    tools,
  });

  console.log("AI Response:", apiCallResult.text);
  console.log("\nTool Calls:");
  for (const step of apiCallResult.steps) {
    if (step.toolCalls && step.toolCalls.length > 0) {
      for (const toolCall of step.toolCalls) {
        console.log(
          `- ${toolCall.toolName}:`,
          JSON.stringify(toolCall.args, null, 2)
        );
        if (toolCall.result) {
          console.log("  Result:", JSON.stringify(toolCall.result, null, 2));
        }
      }
    }
  }

  console.log("\n✅ Examples completed successfully!");
}

// Run the example
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
