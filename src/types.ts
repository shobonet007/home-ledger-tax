export type TransactionType = "inflow" | "outflow";

export type PaymentMethod =
  | "cash"
  | "mobile_money"
  | "bank"
  | "other";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // ISO date string
  note: string;
  paymentMethod: PaymentMethod;
  createdAt: string; // ISO timestamp
}

export interface CategoryMeta {
  id: string;
  label: string;
  icon: string;
  type: TransactionType;
  color: string;
}

export interface TaxPeriod {
  label: string;
  months: number;
  value: "monthly" | "quarterly" | "annual";
}

export interface ReminderConfig {
  enabled: boolean;
  time: string; // "HH:mm"
  frequency: "daily" | "weekdays" | "weekly";
  lastNudge: string | null;
  streak: number;
}

export interface HouseholdProfile {
  name: string;
  currency: string;
  currencySymbol: string;
  taxYearStart: string; // "YYYY-MM-DD"
  taxBracket: number; // percentage e.g. 10
  deductibleThreshold: number;
}

export interface TaxSummary {
  period: TaxPeriod;
  grossIncome: number;
  totalExpenses: number;
  netIncome: number;
  estimatedTax: number;
  deductibleExpenses: number;
  netAfterTax: number;
  transactionCount: number;
}

export interface LedgerFilters {
  search: string;
  type: TransactionType | "all";
  category: string;
  dateFrom: string;
  dateTo: string;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}