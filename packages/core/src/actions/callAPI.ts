/**
 * Call Dexfra API Action
 * Action metadata for AI frameworks to call Dexfra APIs with x402 payment
 */

import { z } from "zod";
import type { Action } from "../types/plugin";

/**
 * Call Dexfra API Action
 * Enables AI agents to call any Dexfra API with automatic x402 payment
 */
export const callAPIAction: Action = {
  name: "call_dexfra_api",

  description: `Call a Dexfra API endpoint with automatic x402 payment handling. 
This action allows you to access any API from the Dexfra marketplace by providing either the API ID or full URL. 
The payment will be handled automatically using the wallet's USDC balance.`,

  similes: [
    "call api",
    "fetch data",
    "get data from api",
    "query dexfra",
    "access dexfra api",
    "use dexfra service",
    "request api data",
    "retrieve from api",
    "fetch from dexfra",
    "call dexfra endpoint",
  ],

  schema: z.object({
    apiId: z
      .string()
      .describe(
        'Dexfra API ID (e.g., "6911956bea5afb9fc66607e4") or full URL (e.g., "https://api.dexfra.fun/v1/token/price")'
      ),
    params: z
      .record(z.any())
      .optional()
      .describe("Query parameters to pass to the API as key-value pairs"),
    method: z
      .enum(["GET", "POST"])
      .default("GET")
      .describe("HTTP method to use for the request"),
  }),

  examples: [
    {
      input: {
        apiId: "6911956bea5afb9fc66607e4",
        params: { address: "So11111111111111111111111111111111111111112" },
        method: "GET",
      },
      output: {
        success: true,
        data: {
          address: "So11111111111111111111111111111111111111112",
          symbol: "SOL",
          name: "Wrapped SOL",
          balance: 100.5,
          price: 150.25,
          value: 15100.125,
        },
      },
      explanation:
        "Get token balance and price data for SOL from Dexfra Token Data API",
    },
    {
      input: {
        apiId: "https://api.dexfra.fun/v1/wallet/portfolio",
        params: { wallet: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK" },
        method: "GET",
      },
      output: {
        success: true,
        data: {
          wallet: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
          totalValue: 50000,
          tokens: [
            { symbol: "SOL", balance: 100, value: 15000 },
            { symbol: "USDC", balance: 35000, value: 35000 },
          ],
        },
      },
      explanation:
        "Get complete portfolio data for a Solana wallet including all token holdings",
    },
    {
      input: {
        apiId: "https://api.dexfra.fun/v1/meme/trending",
        params: { timeframe: "24h", limit: "10" },
        method: "GET",
      },
      output: {
        success: true,
        data: {
          trending: [
            {
              name: "BONK",
              symbol: "BONK",
              price: 0.0000123,
              change24h: 45.2,
              volume24h: 1500000,
            },
          ],
        },
      },
      explanation: "Get trending meme coins from the Dexfra Meme Factory API",
    },
  ],

  handler: async (agent, params) => {
    const url = params.apiId.startsWith("http")
      ? params.apiId
      : `https://api.dexfra.fun/api/${params.apiId}`;

    const response = await agent.callAPI(url, {
      method: params.method,
      params: params.params,
    });

    return await response.json();
  },
};
