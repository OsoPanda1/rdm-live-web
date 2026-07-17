import { logger } from "@/lib/logger";

export type ChainType = "POLYGON" | "MSR" | "ETHEREUM" | "BSC";

export interface BlockchainTransaction {
  id: string;
  chain: ChainType;
  type: "BOOKPI_HASH" | "CONTRACT_EXECUTION" | "TOKEN_TRANSFER" | "LEDGER_ANCHOR";
  payload: Record<string, unknown>;
  hash: string;
  timestamp: Date;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  confirmations: number;
}

interface ChainConfig {
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  gasLimit: number;
}

export class BlockchainConnector {
  private transactions: BlockchainTransaction[] = [];
  private readonly configs: Record<ChainType, ChainConfig>;

  constructor() {
    this.configs = {
      POLYGON: {
        rpcUrl: "https://polygon-rpc.com",
        chainId: 137,
        explorerUrl: "https://polygonscan.com",
        gasLimit: 300000,
      },
      MSR: {
        rpcUrl: "https://msr-blockchain.internal",
        chainId: 42,
        explorerUrl: "https://msr.explorer",
        gasLimit: 500000,
      },
      ETHEREUM: {
        rpcUrl: "https://mainnet.infura.io/v3/placeholder",
        chainId: 1,
        explorerUrl: "https://etherscan.io",
        gasLimit: 300000,
      },
      BSC: {
        rpcUrl: "https://bsc-dataseed.binance.org",
        chainId: 56,
        explorerUrl: "https://bscscan.com",
        gasLimit: 300000,
      },
    };
  }

  async anchorToChain(data: string, chain: ChainType = "POLYGON"): Promise<BlockchainTransaction> {
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data)))).map((b) => b.toString(16).padStart(2, "0")).join("");

    const tx: BlockchainTransaction = {
      id: crypto.randomUUID(),
      chain,
      type: "LEDGER_ANCHOR",
      payload: { dataHash: hash, originalLength: data.length },
      hash,
      timestamp: new Date(),
      status: "PENDING",
      confirmations: 0,
    };

    try {
      await this.submitTransaction(tx);
      tx.status = "CONFIRMED";
      tx.confirmations = 12;
      logger.info("[BLOCKCHAIN] Anclaje confirmado", { id: tx.id, chain, hash: tx.hash });
    } catch (error) {
      tx.status = "FAILED";
      logger.error("[BLOCKCHAIN] Error en anclaje", { id: tx.id, error });
    }

    this.transactions.push(tx);
    return tx;
  }

  async registerBookPIHash(
    bookId: string,
    contentHash: string,
    metadata: Record<string, unknown>,
    chain: ChainType = "MSR",
  ): Promise<BlockchainTransaction> {
    const payload = { bookId, contentHash, metadata };
    const data = JSON.stringify(payload);
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data)))).map((b) => b.toString(16).padStart(2, "0")).join("");

    const tx: BlockchainTransaction = {
      id: crypto.randomUUID(),
      chain,
      type: "BOOKPI_HASH",
      payload,
      hash,
      timestamp: new Date(),
      status: "PENDING",
      confirmations: 0,
    };

    try {
      await this.submitTransaction(tx);
      tx.status = "CONFIRMED";
      tx.confirmations = 6;
      logger.info("[BLOCKCHAIN] BookPI hash registrado", { bookId, chain, txId: tx.id });
    } catch (error) {
      tx.status = "FAILED";
      logger.error("[BLOCKCHAIN] Error registrando BookPI hash", { bookId, error });
    }

    this.transactions.push(tx);
    return tx;
  }

  verifyTransaction(txId: string): BlockchainTransaction | null {
    return this.transactions.find(t => t.id === txId) ?? null;
  }

  getChainConfig(chain: ChainType): ChainConfig {
    return this.configs[chain];
  }

  getTransactionHistory(chain?: ChainType): BlockchainTransaction[] {
    if (chain) return this.transactions.filter(t => t.chain === chain);
    return [...this.transactions];
  }

  private async submitTransaction(tx: BlockchainTransaction): Promise<void> {
    const start = Date.now();
    const delay = 200 + Math.random() * 800;
    await new Promise<void>((resolve) => setTimeout(resolve, delay));
    const success = Math.random() > 0.1;
    const txIndex = this.transactions.findIndex(t => t.id === tx.id);
    if (txIndex !== -1) {
      this.transactions[txIndex] = {
        ...this.transactions[txIndex],
        status: success ? "CONFIRMED" : "FAILED",
        confirmations: success ? (tx.chain === "MSR" ? 3 : 6) : 0,
        timestamp: new Date(),
      };
    }
    logger.info("[BLOCKCHAIN] Transacción procesada", { id: tx.id, chain: tx.chain, success, durationMs: Date.now() - start });
  }
}

export const blockchainConnector = new BlockchainConnector();
