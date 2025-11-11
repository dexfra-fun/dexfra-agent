/**
 * Get Balance Action
 * Action metadata for AI frameworks to get token balances
 */

import { z } from "zod";
import type { Action } from "../types/plugin";

/**
 * Get Balance Action
 * Enables AI agents to check SOL or SPL token balances for the connected wallet
 */
export const getBalanceAction: Action = {
  name: "get_balance",

  description: `Get the balance of SOL or any SPL token for the connected wallet. 
If no token mint is provided, returns the SOL balance. 
For SPL tokens, provide the token mint address to get the token balance.`,

  similes: [
    "check balance",
    "get balance",
    "how much sol do i have",
    "show balance",
    "what is my balance",
    "check my tokens",
    "how many tokens",
    "wallet balance",
    "token balance",
    "sol balance",
    "usdc balance",
    "my balance",
  ],

  schema: z.object({
    tokenMint: z
      .string()
      .optional()
      .describe(
        "Token mint address (PublicKey) for SPL tokens. Leave empty for SOL balance. Example: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v for USDC"
      ),
  }),

  examples: [
    {
      input: {},
      output: {
        success: true,
        balance: 10.523456789,
        token: "SOL",
        formatted: "10.523456789 SOL",
      },
      explanation:
        "Get SOL balance for the connected wallet (no token mint specified)",
    },
    {
      input: {
        tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      },
      output: {
        success: true,
        balance: 1000.5,
        token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        formatted: "1000.5 USDC",
      },
      explanation:
        "Get USDC balance (SPL token) by providing the USDC mint address",
    },
    {
      input: {
        tokenMint: "So11111111111111111111111111111111111111112",
      },
      output: {
        success: true,
        balance: 10.523456789,
        token: "So11111111111111111111111111111111111111112",
        formatted: "10.523456789 wSOL",
      },
      explanation:
        "Get wrapped SOL (wSOL) balance by providing the wSOL mint address",
    },
    {
      input: {
        tokenMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      },
      output: {
        success: true,
        balance: 0,
        token: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        formatted: "0 BONK",
      },
      explanation:
        "Get BONK token balance (returns 0 if the wallet does not hold any)",
    },
  ],

  handler: async (agent, params) => {
    const result = await agent.getBalance(params.tokenMint);

    return {
      success: true,
      ...result,
    };
  },
};
