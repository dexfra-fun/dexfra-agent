/**
 * dexfraFetch - Fetch wrapper with automatic x402 payment handling
 */

import { Connection } from "@solana/web3.js";
import type { DexfraWallet } from "../wallet";
import type {
  DexfraFetchConfig,
  X402PaymentRequiredResponse,
  X402PaymentRequirement,
  X402SettlementResponse,
} from "../types/dexfra";
import {
  PaymentRequiredError,
  MaxAmountExceededError,
  DexfraError,
} from "../types/dexfra";
import { USDC_DECIMALS } from "../constants";

/**
 * Parse USDC amount to wei (with 6 decimals)
 */
function parseUSDCAmount(amount: number): bigint {
  return BigInt(Math.floor(amount * Math.pow(10, USDC_DECIMALS)));
}

/**
 * Create payment header from 402 response
 * This will use the x402 client library when available
 */
async function createPaymentHeader(
  _wallet: DexfraWallet,
  _connection: Connection,
  x402Version: number,
  requirement: X402PaymentRequirement
): Promise<string> {
  try {
    // For now, create a basic payment structure
    // In production, this would use the full x402 payment creation flow
    const paymentData = {
      version: x402Version,
      network: requirement.network,
      recipient: requirement.recipient,
      amount: requirement.maxAmountRequired,
      token: requirement.token,
      scheme: requirement.scheme,
      timestamp: Date.now(),
    };

    // Sign the payment data
    // Note: In production, this would use proper x402 signing
    // const message = JSON.stringify(paymentData);
    // const encodedMessage = new TextEncoder().encode(message);

    // This is a simplified version - in production, use proper x402 signing
    const paymentHeader = Buffer.from(JSON.stringify(paymentData)).toString(
      "base64"
    );

    return paymentHeader;
  } catch (error) {
    throw new DexfraError(
      `Failed to create payment header: ${error instanceof Error ? error.message : "Unknown error"}`,
      "PAYMENT_CREATION_FAILED",
      error
    );
  }
}

/**
 * Select best payment requirement from available options
 */
function selectPaymentRequirement(
  requirements: X402PaymentRequirement[],
  preferredNetwork: string
): X402PaymentRequirement {
  // Try to find a requirement matching the preferred network
  const networkMatch = requirements.find(
    (req) => req.network.toLowerCase() === preferredNetwork.toLowerCase()
  );

  if (networkMatch) {
    return networkMatch;
  }

  // Fallback to first requirement
  return requirements[0];
}

/**
 * Parse settlement response from x-payment-response header
 */
function parseSettlementResponse(
  header: string | null
): X402SettlementResponse | null {
  if (!header) return null;

  try {
    const decoded = atob(header);
    return JSON.parse(decoded) as X402SettlementResponse;
  } catch (error) {
    console.warn("Failed to parse settlement response:", error);
    return null;
  }
}

/**
 * Fetch with automatic x402 payment handling
 */
export async function dexfraFetch(
  url: string,
  config: DexfraFetchConfig,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);

  // Initial request
  let response = await fetch(url, {
    ...init,
    headers,
  });

  // Handle 402 Payment Required
  if (response.status === 402) {
    try {
      // Parse 402 response
      const paymentRequiredData =
        (await response.json()) as X402PaymentRequiredResponse;

      // Validate response structure
      if (
        !paymentRequiredData.x402Version ||
        !Array.isArray(paymentRequiredData.accepts) ||
        paymentRequiredData.accepts.length === 0
      ) {
        throw new DexfraError(
          "Invalid 402 Payment Required response",
          "INVALID_402_RESPONSE",
          paymentRequiredData
        );
      }

      // Parse payment requirements
      const { x402Version, accepts } = paymentRequiredData;
      const requirements: X402PaymentRequirement[] = accepts;

      // Select best payment requirement
      const selectedRequirement = selectPaymentRequirement(
        requirements,
        config.network
      );

      // Check max amount if configured
      if (config.maxAmount !== undefined) {
        const maxAmountWei = parseUSDCAmount(config.maxAmount);
        const requiredAmount = BigInt(selectedRequirement.maxAmountRequired);

        if (requiredAmount > maxAmountWei) {
          const error = new MaxAmountExceededError(
            `Payment amount ${selectedRequirement.maxAmountRequired} exceeds max amount ${maxAmountWei}`,
            selectedRequirement.maxAmountRequired,
            maxAmountWei.toString()
          );

          config.onPaymentError?.(error);
          throw error;
        }
      }

      // Notify payment required
      config.onPaymentRequired?.(selectedRequirement.maxAmountRequired);

      // Create payment header
      const paymentHeader = await createPaymentHeader(
        config.wallet,
        config.connection,
        x402Version,
        selectedRequirement
      );

      // Retry with payment
      headers.set("x-payment", paymentHeader);
      const paidResponse = await fetch(url, {
        ...init,
        headers,
      });

      // Check if payment was successful
      if (!paidResponse.ok && paidResponse.status === 402) {
        throw new PaymentRequiredError(
          "Payment was not accepted",
          selectedRequirement.maxAmountRequired,
          requirements
        );
      }

      // Extract and parse settlement response
      const settlementHeader = paidResponse.headers.get("x-payment-response");
      const settlement = parseSettlementResponse(settlementHeader);

      if (settlement) {
        config.onPaymentSuccess?.(settlement.transactionId);
      }

      return paidResponse;
    } catch (error) {
      // If it's already a Dexfra error, rethrow it
      if (error instanceof DexfraError) {
        throw error;
      }

      // Wrap other errors
      const wrappedError = new DexfraError(
        `Payment processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "PAYMENT_PROCESSING_FAILED",
        error
      );

      config.onPaymentError?.(wrappedError);
      throw wrappedError;
    }
  }

  // Return successful response
  return response;
}

/**
 * Simple GET request with x402 payment
 */
export async function dexfraGet(
  url: string,
  config: DexfraFetchConfig,
  params?: Record<string, string>
): Promise<Response> {
  const searchParams = new URLSearchParams(params);
  const fullUrl = params ? `${url}?${searchParams.toString()}` : url;

  return dexfraFetch(fullUrl, config, {
    method: "GET",
  });
}

/**
 * Simple POST request with x402 payment
 */
export async function dexfraPost(
  url: string,
  config: DexfraFetchConfig,
  body?: unknown
): Promise<Response> {
  return dexfraFetch(url, config, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
