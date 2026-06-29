// Shared economy domain contracts

export type TransactionStatus = "pending" | "completed" | "cancelled" | "failed";

export interface Offering {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  ownerId: string;
  locationId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  offeringId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface MembershipPlan {
  id: "L1" | "L2" | "L3";
  name: string;
  priceMxn: number;
  benefits: string[];
}
