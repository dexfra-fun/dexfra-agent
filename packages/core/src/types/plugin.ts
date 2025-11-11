/**
 * Plugin architecture types
 * Inspired by Solana Agent Kit's plugin pattern
 */

import type { z } from "zod";
import type { DexfraAgentKit } from "../client";

/**
 * Action definition for AI frameworks
 * Includes metadata to help AI understand and use the action
 */
export interface Action {
  /** Unique name for the action */
  name: string;
  
  /** Description of what the action does */
  description: string;
  
  /** Alternative names/phrases that could trigger this action */
  similes: string[];
  
  /** Zod schema for input validation */
  schema: z.ZodObject<any>;
  
  /** Example usage with explanations */
  examples: Array<{
    input: Record<string, any>;
    output: Record<string, any>;
    explanation: string;
  }>;
  
  /** Handler function that executes the action */
  handler: (agent: DexfraAgentKit, params: any) => Promise<any>;
}

/**
 * Plugin definition
 */
export interface Plugin {
  /** Plugin name */
  name: string;
  
  /** Methods provided by the plugin */
  methods: Record<string, (...args: any[]) => any>;
  
  /** Actions for AI frameworks */
  actions: Action[];
  
  /** Initialize function called when plugin is added */
  initialize: (agent: DexfraAgentKit) => void;
}

/**
 * Extract plugin methods type
 */
export type PluginMethods<T> = T extends Plugin ? T["methods"] : Record<string, never>;