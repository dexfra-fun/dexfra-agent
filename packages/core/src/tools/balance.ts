/**
 * Balance tool - Get token balances
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import type { DexfraWallet } from "../wallet";

/**
 * Get SOL balance for a wallet
 */
export async function getSOLBalance(
  wallet: DexfraWallet,
  connection: Connection
): Promise<number> {
  try {
    const balance = await connection.getBalance(wallet.publicKey);
    // Convert lamports to SOL
    return balance / 1e9;
  } catch (error) {
    throw new Error(
      `Failed to get SOL balance: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get SPL token balance for a wallet
 */
export async function getTokenBalance(
  wallet: DexfraWallet,
  connection: Connection,
  tokenMint: PublicKey
): Promise<number> {
  try {
    // Get associated token address
    const tokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      wallet.publicKey
    );

    // Get account info
    const accountInfo = await getAccount(connection, tokenAccount);

    // Return balance (amount is in smallest units)
    return Number(accountInfo.amount);
  } catch (error) {
    // If account doesn't exist, balance is 0
    if (
      error instanceof Error &&
      error.message.includes("could not find account")
    ) {
      return 0;
    }
    throw new Error(
      `Failed to get token balance: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get balance for any token (SOL or SPL)
 */
export async function getBalance(
  wallet: DexfraWallet,
  connection: Connection,
  tokenMint?: string | PublicKey
): Promise<{
  balance: number;
  token: string;
  formatted: string;
}> {
  try {
    // If no token mint specified, get SOL balance
    if (!tokenMint) {
      const balance = await getSOLBalance(wallet, connection);
      return {
        balance,
        token: "SOL",
        formatted: `${balance.toFixed(9)} SOL`,
      };
    }

    // Get SPL token balance
    const mint =
      typeof tokenMint === "string" ? new PublicKey(tokenMint) : tokenMint;
    const balance = await getTokenBalance(wallet, connection, mint);

    return {
      balance,
      token: mint.toString(),
      formatted: `${balance} tokens`,
    };
  } catch (error) {
    throw new Error(
      `Failed to get balance: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
