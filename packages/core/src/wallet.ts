/**
 * Solana-only wallet implementation
 * Simplified from multi-chain approach based on Solana Agent Kit pattern
 */

import { Keypair, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

/**
 * Base wallet interface for Dexfra Agent Kit
 * Compatible with Solana wallet adapters (Phantom, Privy, etc.)
 */
export interface DexfraWallet {
  /** Wallet's public key */
  publicKey: PublicKey;
  
  /** Sign a transaction */
  signTransaction(
    tx: Transaction | VersionedTransaction
  ): Promise<Transaction | VersionedTransaction>;
  
  /** Sign multiple transactions */
  signAllTransactions(
    txs: (Transaction | VersionedTransaction)[]
  ): Promise<(Transaction | VersionedTransaction)[]>;
  
  /** Optional: Send transaction directly */
  sendTransaction?(
    tx: Transaction | VersionedTransaction
  ): Promise<string>;
}

/**
 * Keypair wallet implementation
 * Use this for agent automation with a keypair
 */
export class KeypairWallet implements DexfraWallet {
  private keypair: Keypair;
  
  constructor(keypair: Keypair) {
    this.keypair = keypair;
  }
  
  get publicKey(): PublicKey {
    return this.keypair.publicKey;
  }
  
  async signTransaction(
    tx: Transaction | VersionedTransaction
  ): Promise<Transaction | VersionedTransaction> {
    if (tx instanceof Transaction) {
      tx.partialSign(this.keypair);
    } else {
      tx.sign([this.keypair]);
    }
    return tx;
  }
  
  async signAllTransactions(
    txs: (Transaction | VersionedTransaction)[]
  ): Promise<(Transaction | VersionedTransaction)[]> {
    return Promise.all(txs.map(tx => this.signTransaction(tx)));
  }
  
  /**
   * Create KeypairWallet from secret key
   */
  static fromSecretKey(secretKey: Uint8Array): KeypairWallet {
    const keypair = Keypair.fromSecretKey(secretKey);
    return new KeypairWallet(keypair);
  }
  
  /**
   * Create KeypairWallet from base58 secret key
   */
  static fromBase58(secretKey: string): KeypairWallet {
    const decoded = bs58.decode(secretKey);
    return KeypairWallet.fromSecretKey(decoded);
  }
  
  /**
   * Generate a new random wallet
   */
  static generate(): KeypairWallet {
    const keypair = Keypair.generate();
    return new KeypairWallet(keypair);
  }
}

/**
 * Adapter wallet for browser wallets (Phantom, Solflare, etc.)
 * Wraps any wallet adapter that follows the Solana wallet standard
 */
export class AdapterWallet implements DexfraWallet {
  constructor(private adapter: any) {
    if (!adapter?.publicKey) {
      throw new Error("Invalid wallet adapter: must have publicKey property");
    }
  }
  
  get publicKey(): PublicKey {
    return this.adapter.publicKey;
  }
  
  async signTransaction(
    tx: Transaction | VersionedTransaction
  ): Promise<Transaction | VersionedTransaction> {
    if (!this.adapter.signTransaction) {
      throw new Error("Wallet adapter does not support signTransaction");
    }
    return await this.adapter.signTransaction(tx);
  }
  
  async signAllTransactions(
    txs: (Transaction | VersionedTransaction)[]
  ): Promise<(Transaction | VersionedTransaction)[]> {
    if (!this.adapter.signAllTransactions) {
      throw new Error("Wallet adapter does not support signAllTransactions");
    }
    return await this.adapter.signAllTransactions(txs);
  }
  
  async sendTransaction(
    tx: Transaction | VersionedTransaction
  ): Promise<string> {
    if (!this.adapter.sendTransaction) {
      throw new Error("Wallet adapter does not support sendTransaction");
    }
    return await this.adapter.sendTransaction(tx);
  }
}

/**
 * Validate if an object is a valid Dexfra wallet
 */
export function isValidWallet(wallet: any): wallet is DexfraWallet {
  return (
    wallet &&
    wallet.publicKey instanceof PublicKey &&
    typeof wallet.signTransaction === "function" &&
    typeof wallet.signAllTransactions === "function"
  );
}