/**
 * Vercel AI SDK Adapter
 * Converts Dexfra Agent Kit actions to Vercel AI SDK tools
 */

import { tool } from "ai";
import type { DexfraAgentKit } from "@dexfra/agent-kit";
import type { Action } from "@dexfra/agent-kit";

/**
 * Format action description with similes and examples for better AI understanding
 */
function formatDescription(action: Action): string {
  let desc = action.description + "\n\n";

  // Add similes (alternative phrases)
  if (action.similes && action.similes.length > 0) {
    desc += `Also known as: ${action.similes.join(", ")}\n\n`;
  }

  // Add examples with input/output/explanation
  if (action.examples && action.examples.length > 0) {
    desc += "Examples:\n";
    for (const example of action.examples) {
      desc += `- Input: ${JSON.stringify(example.input)}\n`;
      desc += `  Output: ${JSON.stringify(example.output)}\n`;
      desc += `  Explanation: ${example.explanation}\n\n`;
    }
  }

  // Vercel AI SDK max description is 1024 chars
  return desc.slice(0, 1023);
}

/**
 * Execute an action with error handling
 */
async function executeAction(
  action: Action,
  agent: DexfraAgentKit,
  params: Record<string, unknown>
): Promise<any> {
  try {
    return await action.handler(agent, params);
  } catch (error) {
    // Return error in a structured format that AI can understand
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      action: action.name,
    };
  }
}

/**
 * Create Vercel AI SDK tools from Dexfra Agent Kit actions
 *
 * This function converts all actions from the agent into Vercel AI SDK tools
 * with rich descriptions including similes and examples to help the AI understand
 * how to use each tool effectively.
 *
 * @param agent - The DexfraAgentKit instance
 * @param actions - Array of actions to convert (defaults to agent.actions)
 * @returns Record of Vercel AI SDK CoreTools indexed by action name
 *
 * @example
 * ```typescript
 * import { DexfraAgentKit, KeypairWallet } from "@dexfra/agent-kit";
 * import { createVercelAITools } from "@dexfra/adapter-vercel";
 * import { generateText } from "ai";
 * import { openai } from "@ai-sdk/openai";
 *
 * const wallet = new KeypairWallet(keypair);
 * const agent = new DexfraAgentKit(wallet, config);
 *
 * const tools = createVercelAITools(agent);
 *
 * const result = await generateText({
 *   model: openai("gpt-4"),
 *   prompt: "Get SOL balance for my wallet",
 *   tools
 * });
 * ```
 */
export function createVercelAITools(
  agent: DexfraAgentKit,
  actions?: Action[]
): Record<string, any> {
  const tools: Record<string, any> = {};
  const actionsToConvert = actions || agent.actions;

  // Limit to 128 tools for optimal performance
  // Vercel AI SDK performs better with fewer tools
  if (actionsToConvert.length > 128) {
    console.warn(
      `[Dexfra Adapter] Too many actions (${actionsToConvert.length}). ` +
        `Only the first 128 will be converted to tools for optimal performance.`
    );
  }

  const limitedActions = actionsToConvert.slice(0, 128);

  for (const action of limitedActions) {
    try {
      // Use action name as tool key
      // The tool function from Vercel AI SDK requires id, description and parameters
      // Vercel AI SDK tool() has complex overload types, using type assertion
      tools[action.name] = tool({
        id: `dexfra.${action.name}` as `${string}.${string}`,
        description: formatDescription(action),
        parameters: action.schema,
        execute: async (params: Record<string, unknown>) =>
          await executeAction(action, agent, params),
      } as any);
    } catch (error) {
      console.error(
        `[Dexfra Adapter] Failed to create tool for action "${action.name}":`,
        error
      );
      // Continue with other actions instead of failing completely
    }
  }

  return tools;
}

/**
 * Create a single Vercel AI SDK tool from a specific action
 *
 * @param agent - The DexfraAgentKit instance
 * @param actionName - Name of the action to convert
 * @returns A single CoreTool or undefined if action not found
 *
 * @example
 * ```typescript
 * const callAPITool = createVercelAITool(agent, "call_dexfra_api");
 * ```
 */
export function createVercelAITool(
  agent: DexfraAgentKit,
  actionName: string
): any {
  const action = agent.actions.find((a) => a.name === actionName);

  if (!action) {
    console.warn(
      `[Dexfra Adapter] Action "${actionName}" not found in agent.actions`
    );
    return undefined;
  }

  try {
    // Vercel AI SDK tool() has complex overload types, using type assertion
    return tool({
      id: `dexfra.${action.name}` as `${string}.${string}`,
      description: formatDescription(action),
      parameters: action.schema,
      execute: async (params: Record<string, unknown>) =>
        await executeAction(action, agent, params),
    } as any);
  } catch (error) {
    console.error(
      `[Dexfra Adapter] Failed to create tool for action "${actionName}":`,
      error
    );
    return undefined;
  }
}

/**
 * Get tool statistics
 *
 * @param agent - The DexfraAgentKit instance
 * @returns Statistics about available tools
 */
export function getToolStats(agent: DexfraAgentKit): {
  totalActions: number;
  availableTools: number;
  truncated: boolean;
} {
  const totalActions = agent.actions.length;
  const availableTools = Math.min(totalActions, 128);

  return {
    totalActions,
    availableTools,
    truncated: totalActions > 128,
  };
}

// Re-export the tool function for convenience
export { tool } from "ai";
