import type { CategoryMeta, TaxPeriod, Transaction, HouseholdProfile, ReminderConfig } from "./types";

export const BRAND_NAME = "Kasita";
export const BRAND_TAGLINE = "Family Income & Tax Tracker";

export const APP_VERSION = "v1.0.0";

export const INFLOW_CATEGORIES: CategoryMeta[] = [
  { id: "sales", label: "Sales", icon: "ShoppingBag", type: "inflow", color: "#10B981" },
  { id: "wages", label: "Wages", icon: "Briefcase", type: "inflow", color: "#3B82F6" },
  { id: "gifts", label: "Gifts", icon: "Gift", type: "inflow", color: "#F59E0B" },
  { id: "remittances", label: "Remittances", icon: "PaperPlane", type: "inflow", color: "#8B5CF6" },
  { id: "other_income", label: "Other", icon: "CurrencyCircleDollar", type: "inflow", color: "#06B6D4" },
];

export const OUTFLOW_CATEGORIES: CategoryMeta[] = [
  { id: "food", label: "Food", icon: "ForkKnife", type: "outflow", color: "#EF4444" },
  { id: "rent", label: "Rent", icon: "House", type: "outflow", color: "#F97316" },
  { id: "school", label: "School Fees", icon: "GraduationCap", type: "outflow", color: "#EAB308" },
  { id: "transport", label: "Transport", icon: "Bus", type: "outflow", color: "#14B8A6" },
  { id: "health", label: "Health", icon: "Heartbeat", type: "outflow", color: "#EC4899" },
  { id: "utilities", label: "Utilities", icon: "Drop", type: "outflow", color: "#6366F1" },
  { id: "clothing", label: "Clothing", icon: "TShirt", type: "outflow", color: "#A855F7" },
  { id: "business", label: "Business Exp.", icon: "Wrench", type: "outflow", color: "#78716C" },
  { id: "other_expense", label: "Other", icon: "Receipt", type: "outflow", color: "#6B7280" },
];

export const ALL_CATEGORIES = [...INFLOW_CATEGORIES, ...OUTFLOW_CATEGORIES];

export const TAX_PERIODS: TaxPeriod[] = [
  { label: "Monthly", months: 1, value: "monthly" },
  { label: "Quarterly", months: 3, value: "quarterly" },
  { label: "Annual", months: 12, value: "annual" },
];

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "FCFA", symbol: "FCFA", label: "CFA Franc" },
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "KES", symbol: "KSh", label: "Kenyan Shilling" },
  { code: "NGN", symbol: "₦", label: "Nigerian Naira" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "EUR", symbol: "€", label: "Euro" },
];

export const DEFAULT_PROFILE: HouseholdProfile = {
  name: "My Family",
  currency: "USD",
  currencySymbol: "$",
  taxYearStart: "2025-01-01",
  taxBracket: 10,
  deductibleThreshold: 500,
};

export const DEFAULT_REMINDER: ReminderConfig = {
  enabled: false,
  time: "19:00",
  frequency: "daily",
  lastNudge: null,
  streak: 0,
};

export function getCategoryMeta(id: string): CategoryMeta | undefined {
  return ALL_CATEGORIES.find((c) => c.id === id);
}

export function formatCurrency(amount: number, symbol: string = "$"): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getMonthRange(date: Date, months: number): { start: Date; end: Date } {
  const end = new Date(date);
  const start = new Date(date);
  start.setMonth(start.getMonth() - months);
  start.setDate(1);
  return { start, end };
}

// ---------- Seed Data ----------

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const SEED_TRANSACTIONS: Transaction[] = [
  // Last 30 days of realistic family transactions
  { id: "s1", type: "inflow", category: "wages", amount: 850, date: daysAgo(28), note: "Weekly wages - construction", paymentMethod: "cash", createdAt: daysAgo(28) },
  { id: "s2", type: "inflow", category: "sales", amount: 120, date: daysAgo(26), note: "Vegetable sales at market", paymentMethod: "cash", createdAt: daysAgo(26) },
  { id: "s3", type: "outflow", category: "food", amount: 45, date: daysAgo(26), note: "Weekly groceries", paymentMethod: "cash", createdAt: daysAgo(26) },
  { id: "s4", type: "outflow", category: "transport", amount: 15, date: daysAgo(25), note: "Bus fare - city trip", paymentMethod: "cash", createdAt: daysAgo(25) },
  { id: "s5", type: "outflow", category: "school", amount: 200, date: daysAgo(24), note: "School fees - term 2", paymentMethod: "mobile_money", createdAt: daysAgo(24) },
  { id: "s6", type: "inflow", category: "remittances", amount: 300, date: daysAgo(22), note: "Family support from abroad", paymentMethod: "mobile_money", createdAt: daysAgo(22) },
  { id: "s7", type: "outflow", category: "rent", amount: 350, date: daysAgo(21), note: "Monthly rent payment", paymentMethod: "cash", createdAt: daysAgo(21) },
  { id: "s8", type: "outflow", category: "utilities", amount: 40, date: daysAgo(20), note: "Electricity bill", paymentMethod: "cash", createdAt: daysAgo(20) },
  { id: "s9", type: "inflow", category: "sales", amount: 85, date: daysAgo(19), note: "Handicraft sales", paymentMethod: "cash", createdAt: daysAgo(19) },
  { id: "s10", type: "outflow", category: "health", amount: 60, date: daysAgo(18), note: "Clinic visit - child checkup", paymentMethod: "cash", createdAt: daysAgo(18) },
  { id: "s11", type: "outflow", category: "food", amount: 55, date: daysAgo(17), note: "Market shopping", paymentMethod: "cash", createdAt: daysAgo(17) },
  { id: "s12", type: "inflow", category: "wages", amount: 850, date: daysAgo(14), note: "Weekly wages - construction", paymentMethod: "cash", createdAt: daysAgo(14) },
  { id: "s13", type: "outflow", category: "transport", amount: 20, date: daysAgo(13), note: "Taxi to market", paymentMethod: "cash", createdAt: daysAgo(13) },
  { id: "s14", type: "outflow", category: "clothing", amount: 75, date: daysAgo(12), note: "Kids school uniforms", paymentMethod: "cash", createdAt: daysAgo(12) },
  { id: "s15", type: "inflow", category: "gifts", amount: 50, date: daysAgo(11), note: "Birthday gift from aunt", paymentMethod: "cash", createdAt: daysAgo(11) },
  { id: "s16", type: "outflow", category: "food", amount: 60, date: daysAgo(10), note: "Weekly groceries", paymentMethod: "cash", createdAt: daysAgo(10) },
  { id: "s17", type: "outflow", category: "business", amount: 100, date: daysAgo(9), note: "Restock materials", paymentMethod: "cash", createdAt: daysAgo(9) },
  { id: "s18", type: "inflow", category: "sales", amount: 150, date: daysAgo(8), note: "Catering order payment", paymentMethod: "mobile_money", createdAt: daysAgo(8) },
  { id: "s19", type: "outflow", category: "utilities", amount: 25, date: daysAgo(7), note: "Water bill", paymentMethod: "cash", createdAt: daysAgo(7) },
  { id: "s20", type: "outflow", category: "health", amount: 35, date: daysAgo(6), note: "Pharmacy - medicine", paymentMethod: "cash", createdAt: daysAgo(6) },
  { id: "s21", type: "inflow", category: "wages", amount: 850, date: daysAgo(5), note: "Weekly wages - construction", paymentMethod: "cash", createdAt: daysAgo(5) },
  { id: "s22", type: "outflow", category: "food", amount: 70, date: daysAgo(4), note: "Weekend groceries + meat", paymentMethod: "cash", createdAt: daysAgo(4) },
  { id: "s23", type: "outflow", category: "school", amount: 50, date: daysAgo(3), note: "School supplies", paymentMethod: "cash", createdAt: daysAgo(3) },
  { id: "s24", type: "outflow", category: "transport", amount: 10, date: daysAgo(2), note: "Local transport", paymentMethod: "cash", createdAt: daysAgo(2) },
  { id: "s25", type: "inflow", category: "other_income", amount: 200, date: daysAgo(1), note: "Freelance graphic design", paymentMethod: "mobile_money", createdAt: daysAgo(1) },
];

export function computeTaxSummary(
  transactions: Transaction[],
  periods: number,
  bracket: number,
  deductibleThreshold: number
) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - periods);

  const filtered = transactions.filter((t) => new Date(t.date) >= cutoff);
  const inflows = filtered.filter((t) => t.type === "inflow");
  const outflows = filtered.filter((t) => t.type === "outflow");

  const grossIncome = inflows.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = outflows.reduce((sum, t) => sum + t.amount, 0);
  const netIncome = grossIncome - totalExpenses;

  // Deductible expenses are those over threshold (e.g., school fees, health, rent)
  const deductibleExpenses = outflows
    .filter((t) => ["school", "health", "rent", "business", "utilities"].includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const taxableIncome = Math.max(0, netIncome);
  const estimatedTax = Math.round(taxableIncome * (bracket / 100));
  const netAfterTax = taxableIncome - estimatedTax;

  return {
    grossIncome,
    totalExpenses,
    netIncome,
    estimatedTax,
    deductibleExpenses,
    netAfterTax,
    transactionCount: filtered.length,
  };
}