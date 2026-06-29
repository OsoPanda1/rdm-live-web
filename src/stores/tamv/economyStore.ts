// ============================================================================
// TAMV — Economy Store: TC, MSR, TAMV balances + 20/30/50 Phoenix rule
// ============================================================================
import { create } from "zustand";

export type TxType = "credit" | "debit" | "stake" | "reward" | "donation";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  description: string;
  timestamp: Date;
  msrHash?: string;
}

export interface EconomyState {
  tcBalance: number;
  msrBalance: number;
  tamvBalance: number;
  stakedAmount: number;
  recentTransactions: Transaction[];
  phoenixFund: number;
  infraFund: number;
  reserveFund: number;

  addTransaction: (tx: Omit<Transaction, "id" | "timestamp">) => void;
  updateBalances: (tc: number, msr: number, tamv: number) => void;
  setStakedAmount: (amount: number) => void;
  distributeFunds: (profit: number) => void;
}

export const useEconomyStore = create<EconomyState>((set) => ({
  tcBalance: 100,
  msrBalance: 0,
  tamvBalance: 0,
  stakedAmount: 0,
  recentTransactions: [],
  phoenixFund: 0,
  infraFund: 0,
  reserveFund: 0,

  addTransaction: (tx) =>
    set((s) => ({
      recentTransactions: [
        { ...tx, id: crypto.randomUUID(), timestamp: new Date() },
        ...s.recentTransactions.slice(0, 49),
      ],
    })),

  updateBalances: (tcBalance, msrBalance, tamvBalance) =>
    set({ tcBalance, msrBalance, tamvBalance }),

  setStakedAmount: (stakedAmount) => set({ stakedAmount }),

  // 20% Phoenix (resiliencia) / 30% Infra / 50% Reserva
  distributeFunds: (profit) =>
    set((s) => ({
      phoenixFund: s.phoenixFund + profit * 0.2,
      infraFund: s.infraFund + profit * 0.3,
      reserveFund: s.reserveFund + profit * 0.5,
    })),
}));
