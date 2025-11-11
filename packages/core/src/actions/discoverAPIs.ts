/**
 * Discover APIs Action
 * Action metadata for AI frameworks to discover available APIs in Dexfra marketplace
 */

import { z } from "zod";
import type { Action } from "../types/plugin";

/**
 * Discover Dexfra APIs Action
 * Enables AI agents to search and discover available APIs in the Dexfra marketplace
 */
export const discoverAPIsAction: Action = {
  name: "discover_dexfra_apis",

  description: `Search and discover available APIs in the Dexfra marketplace. 
You can filter by category, search by keywords, filter by tags, or set price limits. 
This helps you find the right API for your needs before calling it.`,

  similes: [
    "find api",
    "search api",
    "list apis",
    "what apis are available",
    "discover services",
    "search for api",
    "find available apis",
    "lookup api",
    "browse apis",
    "what can I access",
    "show me apis",
    "api marketplace",
  ],

  schema: z.object({
    category: z
      .string()
      .optional()
      .describe(
        'Filter by category name (e.g., "Token Data", "Wallet Data", "Meme Factory", "Smart Money")'
      ),
    categoryId: z
      .string()
      .optional()
      .describe("Filter by category ID for more precise filtering"),
    search: z
      .string()
      .optional()
      .describe("Search term to find APIs by name or description"),
    tags: z
      .array(z.string())
      .optional()
      .describe('Filter by tags (e.g., ["price", "solana", "real-time"])'),
    minPrice: z
      .number()
      .optional()
      .describe("Minimum price in USDC (inclusive)"),
    maxPrice: z
      .number()
      .optional()
      .describe("Maximum price in USDC (inclusive)"),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of results to return (default: 20)"),
  }),

  examples: [
    {
      input: {
        category: "Token Data",
      },
      output: {
        success: true,
        apis: [
          {
            id: "6911956bea5afb9fc66607e4",
            name: "Token Balance & Price API",
            description:
              "Get real-time token balances and prices for any Solana token",
            price: 0.001,
            priceFormatted: "$0.001 per call",
            category: "Token Data",
            tags: ["token", "balance", "price", "solana"],
          },
          {
            id: "691195abcd123456789012ef",
            name: "Token Metadata API",
            description:
              "Fetch comprehensive token metadata including supply and holders",
            price: 0.002,
            priceFormatted: "$0.002 per call",
            category: "Token Data",
            tags: ["token", "metadata", "solana"],
          },
        ],
        total: 15,
      },
      explanation:
        "Find all APIs in the Token Data category to work with token information",
    },
    {
      input: {
        search: "whale tracking",
        tags: ["smart-money", "solana"],
      },
      output: {
        success: true,
        apis: [
          {
            id: "691345b3bb6dc6ef219142d0",
            name: "Smart Money Tracker API",
            description:
              "Track whale movements and smart money flows on Solana",
            price: 0.005,
            priceFormatted: "$0.005 per call",
            category: "Smart Money",
            tags: ["smart-money", "whale", "tracking", "solana"],
          },
        ],
        total: 3,
      },
      explanation:
        "Search for APIs related to whale tracking using both search terms and tags",
    },
    {
      input: {
        maxPrice: 0.01,
        limit: 5,
      },
      output: {
        success: true,
        apis: [
          {
            id: "6911956bea5afb9fc66607e4",
            name: "Token Balance & Price API",
            price: 0.001,
            category: "Token Data",
          },
          {
            id: "6910ceb89931921d7a492a44",
            name: "Wallet Portfolio API",
            price: 0.003,
            category: "Wallet Data",
          },
        ],
        total: 45,
      },
      explanation:
        "Find affordable APIs under $0.01 per call, showing only 5 results",
    },
    {
      input: {
        category: "Meme Factory",
        search: "trending",
      },
      output: {
        success: true,
        apis: [
          {
            id: "6910cec39931921d7a492a46",
            name: "Trending Meme Coins API",
            description:
              "Get real-time trending meme coins with volume and sentiment data",
            price: 0.002,
            category: "Meme Factory",
            tags: ["meme", "trending", "sentiment"],
          },
        ],
        total: 5,
      },
      explanation: "Find trending meme coin APIs in the Meme Factory category",
    },
  ],

  handler: async (agent, params) => {
    const apis = await agent.discoverAPIs({
      category: params.category,
      categoryId: params.categoryId,
      search: params.search,
      tags: params.tags,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      limit: params.limit,
    });

    return {
      success: true,
      apis,
      total: apis.length,
    };
  },
};
