import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  House,
  Wallet,
  Plus,
  Calculator,
  Gear,
  ArrowUp,
  ArrowDown,
  MagnifyingGlass,
  FadersHorizontal,
  CalendarBlank,
  Trash,
  Check,
  X,
  DownloadSimple,
  Bell,
  PiggyBank,
  Receipt,
  NotePencil,
  PaperPlane,
  Gift,
  ShoppingBag,
  Briefcase,
  CurrencyCircleDollar,
  ForkKnife,
  GraduationCap,
  Bus,
  Heartbeat,
  Drop,
  TShirt,
  Wrench,
  Sparkle,
  Clock,
  CaretLeft,
  CaretRight,
  DotsThree,
  SealCheck,
} from "@phosphor-icons/react";

import type { Transaction, LedgerFilters, TaxSummary } from "../types";
import { generateId } from "../types";
import {
  INFLOW_CATEGORIES,
  OUTFLOW_CATEGORIES,
  ALL_CATEGORIES,
  CURRENCIES,
  TAX_PERIODS,
  DEFAULT_PROFILE,
  DEFAULT_REMINDER,
  SEED_TRANSACTIONS,
  getCategoryMeta,
  formatCurrency,
  formatDate,
  computeTaxSummary,
  BRAND_NAME,
  BRAND_TAGLINE,
  APP_VERSION,
} from "../constants";
import { generateCSV, generateTaxReport, downloadFile } from "../utils/pdfGenerator";

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = "kasita_transactions";
const PROFILE_KEY = "kasita_profile";
const REMINDER_KEY = "kasita_reminder";

function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return SEED_TRANSACTIONS;
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_PROFILE;
}

function loadReminder() {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return DEFAULT_REMINDER;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatCard({ label, amount, symbol, trend, color }: {
  label: string; amount: number; symbol: string;
  trend?: "up" | "down"; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-1 rounded-2xl border bg-white/60 p-4 backdrop-blur-sm"
    >
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className={`text-xl font-bold tracking-tight ${color}`}>
        {formatCurrency(amount, symbol)}
      </span>
      {trend && (
        <span className="flex items-center gap-1 text-xs text-gray-400">
          {trend === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          Last 30 days
        </span>
      )}
    </motion.div>
  );
}

function CategoryPill({ id, amount, symbol }: { id: string; amount: number; symbol: string }) {
  const meta = getCategoryMeta(id);
  const Icon = meta ? getIconComponent(meta.icon) : Receipt;
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: meta?.color ?? "#6B7280" + "20" }}>
          <Icon size={14} className="text-white" weight="fill" />
        </span>
        <span className="font-medium text-gray-700">{meta?.label ?? id}</span>
      </div>
      <span className="font-semibold text-gray-900">{formatCurrency(amount, symbol)}</span>
    </div>
  );
}

function TransactionRow({ t, symbol, onDelete }: { t: Transaction; symbol: string; onDelete: (id: string) => void }) {
  const meta = getCategoryMeta(t.category);
  const Icon = meta ? getIconComponent(meta.icon) : Receipt;
  const isInflow = t.type === "inflow";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0, marginBottom: 0 }}
      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white/70 px-3 py-2.5 backdrop-blur-sm"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: meta?.color ?? "#6B7280" + "20" }}>
        <Icon size={16} className="text-white" weight="fill" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-gray-800">{t.note || meta?.label || t.category}</span>
          <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
            {meta?.label ?? t.category}
          </span>
        </div>
        <span className="text-xs text-gray-400">{formatDate(t.date)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${isInflow ? "text-emerald-600" : "text-red-500"}`}>
          {isInflow ? "+" : "-"}{formatCurrency(t.amount, symbol)}
        </span>
        <button onClick={() => onDelete(t.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400">
          <Trash size={14} />
        </button>
      </div>
    </motion.div>
  );
}

/* Helper to map string icon names to Phosphor components */
function getIconComponent(name: string) {
  const map: Record<string, React.ComponentType<any>> = {
    ShoppingBag, Briefcase, Gift, PaperPlane, CurrencyCircleDollar,
    ForkKnife, House, GraduationCap, Bus, Heartbeat, Drop, TShirt, Wrench, Receipt,
    PiggyBank, Wallet, NotePencil, Sparkle, Bell, Clock, CalendarBlank,
    Check, X, Plus, ArrowUp, ArrowDown, CaretLeft, CaretRight, DotsThree,
    SealCheck, MagnifyingGlass, FadersHorizontal, Trash, DownloadSimple,
  };
  return map[name] || Receipt;
}

/* ------------------------------------------------------------------ */
/*  Tab: Dashboard                                                     */
/* ------------------------------------------------------------------ */
function DashboardTab({ transactions, profile }: { transactions: Transaction[]; profile: typeof DEFAULT_PROFILE }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthTxs = transactions.filter((t) => new Date(t.date) >= monthStart);

  const income = monthTxs.filter((t) => t.type === "inflow").reduce((s, t) => s + t.amount, 0);
  const expenses = monthTxs.filter((t) => t.type === "outflow").reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;

  /* Top expense categories this month */
  const expenseByCat: Record<string, number> = {};
  monthTxs.filter((t) => t.type === "outflow").forEach((t) => {
    expenseByCat[t.category] = (expenseByCat[t.category] || 0) + t.amount;
  });
  const topExpenses = Object.entries(expenseByCat).sort((a, b) => b[1] - a[1]).slice(0, 5);

  /* Recent transactions */
  const recent = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{BRAND_NAME}</h1>
          <p className="text-xs text-gray-500">{BRAND_TAGLINE}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          <Sparkle size={14} weight="fill" />
          {profile.name}
        </span>
      </div>

      {/* Month summary */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white">
        <p className="text-sm font-medium text-emerald-200">Net Balance This Month</p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(net, profile.currencySymbol)}</p>
        <div className="mt-4 flex gap-4">
          <div className="flex-1">
            <p className="text-xs text-emerald-200">Income</p>
            <p className="text-lg font-bold">{formatCurrency(income, profile.currencySymbol)}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-emerald-200">Expenses</p>
            <p className="text-lg font-bold">{formatCurrency(expenses, profile.currencySymbol)}</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Income" amount={income} symbol={profile.currencySymbol} trend="up" color="text-emerald-600" />
        <StatCard label="Total Expenses" amount={expenses} symbol={profile.currencySymbol} trend="down" color="text-red-500" />
      </div>

      {/* Top expense categories */}
      {topExpenses.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-700">Top Expenses</h3>
          <div className="flex flex-col gap-1.5">
            {topExpenses.map(([catId, amt]) => (
              <CategoryPill key={catId} id={catId} amount={amt} symbol={profile.currencySymbol} />
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {recent.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-700">Recent</h3>
          <div className="flex flex-col gap-1.5">
            <AnimatePresence mode="popLayout">
              {recent.map((t) => (
                <TransactionRow key={t.id} t={t} symbol={profile.currencySymbol} onDelete={() => {}} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Ledger                                                        */
/* ------------------------------------------------------------------ */
function LedgerTab({ transactions, symbol, onDelete }: {
  transactions: Transaction[]; symbol: string; onDelete: (id: string) => void;
}) {
  const [filters, setFilters] = useState<LedgerFilters>({
    search: "", type: "all", category: "", dateFrom: "", dateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const filtered = transactions.filter((t) => {
    if (filters.type !== "all" && t.type !== filters.type) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.dateFrom && t.date < filters.dateFrom) return false;
    if (filters.dateTo && t.date > filters.dateTo) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const meta = getCategoryMeta(t.category);
      return t.note.toLowerCase().includes(q) || (meta?.label ?? "").toLowerCase().includes(q);
    }
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search transactions..."
            className="w-full rounded-xl border border-gray-200 bg-white/70 py-2.5 pl-9 pr-3 text-sm outline-none backdrop-blur-sm placeholder:text-gray-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
            showFilters ? "border-emerald-400 bg-emerald-50 text-emerald-600" : "border-gray-200 bg-white/70 text-gray-500"
          }`}
        >
          <FadersHorizontal size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-wrap gap-2 overflow-hidden rounded-xl border border-gray-200 bg-white/80 p-3 backdrop-blur-sm"
          >
            <select
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as any }))}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium outline-none"
            >
              <option value="all">All Types</option>
              <option value="inflow">Income</option>
              <option value="outflow">Expense</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium outline-none"
            >
              <option value="">All Categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none"
              placeholder="From"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs outline-none"
              placeholder="To"
            />
            <button
              onClick={() => setFilters({ search: "", type: "all", category: "", dateFrom: "", dateTo: "" })}
              className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-gray-400">
          <Receipt size={40} weight="light" />
          <p className="text-sm font-medium">No transactions found</p>
          <p className="text-xs">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <AnimatePresence mode="popLayout">
            {filtered.map((t) => (
              <TransactionRow key={t.id} t={t} symbol={symbol} onDelete={onDelete} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Add Transaction                                               */
/* ------------------------------------------------------------------ */
function AddTab({ onAdd, profile }: { onAdd: (t: Transaction) => void; profile: typeof DEFAULT_PROFILE }) {
  const [type, setType] = useState<"inflow" | "outflow">("outflow");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mobile_money" | "bank" | "other">("cash");

  const categories = type === "inflow" ? INFLOW_CATEGORIES : OUTFLOW_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Please enter a valid amount"); return; }
    if (!category) { toast.error("Please select a category"); return; }
    const tx: Transaction = {
      id: generateId(),
      type,
      category,
      amount: amt,
      date: new Date().toISOString().slice(0, 10),
      note,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };
    onAdd(tx);
    setAmount("");
    setNote("");
    setCategory("");
    toast.success("Transaction added!");
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      <h2 className="text-lg font-bold text-gray-900">Add Transaction</h2>

      {/* Type toggle */}
      <div className="flex rounded-xl border border-gray-200 bg-white/70 p-1 backdrop-blur-sm">
        <button
          onClick={() => { setType("inflow"); setCategory(""); }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            type === "inflow" ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500"
          }`}
        >
          <ArrowUp size={16} className="inline mr-1" /> Income
        </button>
        <button
          onClick={() => { setType("outflow"); setCategory(""); }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            type === "outflow" ? "bg-red-500 text-white shadow-sm" : "text-gray-500"
          }`}
        >
          <ArrowDown size={16} className="inline mr-1" /> Expense
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Category grid */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-600">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => {
              const Icon = getIconComponent(cat.icon);
              const selected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-all ${
                    selected
                      ? "border-emerald-400 bg-emerald-50 shadow-sm"
                      : "border-gray-200 bg-white/60 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: cat.color + "20" }}>
                    <Icon size={16} weight={selected ? "fill" : "regular"} style={{ color: cat.color }} />
                  </span>
                  <span className="text-[10px] font-medium leading-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Amount ({profile.currencySymbol})</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-lg font-bold outline-none backdrop-blur-sm placeholder:text-gray-300 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        {/* Note */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Note</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What was this for?"
            className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm outline-none backdrop-blur-sm placeholder:text-gray-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        {/* Payment method */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Payment Method</label>
          <div className="flex gap-2">
            {(["cash", "mobile_money", "bank", "other"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPaymentMethod(m)}
                className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${
                  paymentMethod === m
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white/60 text-gray-500"
                }`}
              >
                {m === "cash" ? "Cash" : m === "mobile_money" ? "Mobile" : m === "bank" ? "Bank" : "Other"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          <Plus size={18} weight="bold" />
          Add {type === "inflow" ? "Income" : "Expense"}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Tax Summary                                                   */
/* ------------------------------------------------------------------ */
function TaxTab({ transactions, profile }: { transactions: Transaction[]; profile: typeof DEFAULT_PROFILE }) {
  const [period, setPeriod] = useState(TAX_PERIODS[1]); // default quarterly
  const summary = computeTaxSummary(transactions, period.months, profile.taxBracket, profile.deductibleThreshold);

  const taxSummary: TaxSummary = { ...summary, period };

  const handleExport = () => {
    const csv = generateCSV(transactions, profile.currencySymbol);
    downloadFile(csv, `${BRAND_NAME}_export.csv`, "text/csv");
    toast.success("CSV exported!");
  };

  const handleTaxReport = () => {
    const report = generateTaxReport(taxSummary, profile.currencySymbol);
    downloadFile(report, `${BRAND_NAME}_tax_report.txt`, "text/plain");
    toast.success("Tax report exported!");
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Tax Summary</h2>
        <select
          value={period.value}
          onChange={(e) => setPeriod(TAX_PERIODS.find((p) => p.value === e.target.value) || TAX_PERIODS[1])}
          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium outline-none"
        >
          {TAX_PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 text-white">
        <p className="text-sm font-medium text-emerald-200">{period.label} Tax Summary</p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(summary.netAfterTax, profile.currencySymbol)}</p>
        <p className="text-xs text-emerald-300">Net after tax</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Gross Income" amount={summary.grossIncome} symbol={profile.currencySymbol} color="text-emerald-600" />
        <StatCard label="Expenses" amount={summary.totalExpenses} symbol={profile.currencySymbol} color="text-red-500" />
        <StatCard label="Deductible" amount={summary.deductibleExpenses} symbol={profile.currencySymbol} color="text-blue-500" />
        <StatCard label="Est. Tax" amount={summary.estimatedTax} symbol={profile.currencySymbol} color="text-orange-500" />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Transactions in period</span>
          <span className="text-lg font-bold text-gray-900">{summary.transactionCount}</span>
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/70 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100 active:scale-[0.98]"
        >
          <DownloadSimple size={18} />
          CSV
        </button>
        <button
          onClick={handleTaxReport}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          <Receipt size={18} />
          Tax Report
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Settings                                                      */
/* ------------------------------------------------------------------ */
function SettingsTab({ profile, reminder, onProfileChange, onReminderChange }: {
  profile: typeof DEFAULT_PROFILE;
  reminder: typeof DEFAULT_REMINDER;
  onProfileChange: (p: typeof DEFAULT_PROFILE) => void;
  onReminderChange: (r: typeof DEFAULT_REMINDER) => void;
}) {
  const [local, setLocal] = useState(profile);
  const [localRem, setLocalRem] = useState(reminder);

  const saveProfile = () => {
    onProfileChange(local);
    toast.success("Profile saved!");
  };

  const saveReminder = () => {
    onReminderChange(localRem);
    toast.success(localRem.enabled ? "Reminder enabled!" : "Reminder disabled");
  };

  const resetData = () => {
    if (confirm("This will delete all your data. Are you sure?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-24">
      <h2 className="text-lg font-bold text-gray-900">Settings</h2>

      {/* Profile */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/70 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-gray-700">Family Profile</h3>
        <div>
          <label className="mb-1 text-xs font-medium text-gray-500">Family Name</label>
          <input
            value={local.name}
            onChange={(e) => setLocal({ ...local, name: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
          />
        </div>
        <div>
          <label className="mb-1 text-xs font-medium text-gray-500">Currency</label>
          <select
            value={local.currency}
            onChange={(e) => {
              const c = CURRENCIES.find((c) => c.code === e.target.value) || CURRENCIES[0];
              setLocal({ ...local, currency: c.code, currencySymbol: c.symbol });
            }}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label} ({c.symbol})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 text-xs font-medium text-gray-500">Tax Bracket (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={local.taxBracket}
            onChange={(e) => setLocal({ ...local, taxBracket: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
          />
        </div>
        <button
          onClick={saveProfile}
          className="mt-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          <Check size={16} className="inline mr-1" /> Save Profile
        </button>
      </div>

      {/* Reminder */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white/70 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Daily Reminder</h3>
          <button
            onClick={() => setLocalRem({ ...localRem, enabled: !localRem.enabled })}
            className={`relative h-6 w-11 rounded-full transition-colors ${localRem.enabled ? "bg-emerald-500" : "bg-gray-300"}`}
          >
            <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${localRem.enabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
        {localRem.enabled && (
          <>
            <div>
              <label className="mb-1 text-xs font-medium text-gray-500">Reminder Time</label>
              <input
                type="time"
                value={localRem.time}
                onChange={(e) => setLocalRem({ ...localRem, time: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="mb-1 text-xs font-medium text-gray-500">Frequency</label>
              <select
                value={localRem.frequency}
                onChange={(e) => setLocalRem({ ...localRem, frequency: e.target.value as any })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </>
        )}
        <button
          onClick={saveReminder}
          className="mt-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98]"
        >
          <Bell size={16} className="inline mr-1" /> Save Reminder
        </button>
      </div>

      {/* Data */}
      <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50/50 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-red-700">Data</h3>
        <p className="text-xs text-red-500">All data is stored locally on this device.</p>
        <button
          onClick={resetData}
          className="rounded-xl border border-red-200 bg-white py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98]"
        >
          <Trash size={16} className="inline mr-1" /> Reset All Data
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">{BRAND_NAME} {APP_VERSION}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main App Shell                                                     */
/* ------------------------------------------------------------------ */
const TABS = [
  { key: "dashboard", label: "Home", Icon: House },
  { key: "ledger", label: "Ledger", Icon: Wallet },
  { key: "add", label: "Add", Icon: Plus },
  { key: "tax", label: "Tax", Icon: Calculator },
  { key: "settings", label: "Settings", Icon: Gear },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [profile, setProfile] = useState(loadProfile);
  const [reminder, setReminder] = useState(loadReminder);

  /* Persist */
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem(REMINDER_KEY, JSON.stringify(reminder)); }, [reminder]);

  const handleAdd = useCallback((t: Transaction) => {
    setTransactions((prev) => [t, ...prev]);
    setActiveTab("dashboard");
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast.success("Transaction deleted");
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab transactions={transactions} profile={profile} />;
      case "ledger": return <LedgerTab transactions={transactions} symbol={profile.currencySymbol} onDelete={handleDelete} />;
      case "add": return <AddTab onAdd={handleAdd} profile={profile} />;
      case "tax": return <TaxTab transactions={transactions} profile={profile} />;
      case "settings": return <SettingsTab profile={profile} reminder={reminder} onProfileChange={setProfile} onReminderChange={setReminder} />;
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-gradient-to-b from-emerald-50/80 via-white to-white">
      {/* Main content */}
      <div className="flex-1 px-4 pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.15 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md border-t border-gray-200/80 bg-white/90 px-2 pb-2 pt-1.5 backdrop-blur-xl">
        <div className="flex items-center justify-around">
          {TABS.map(({ key, label, Icon }) => {
            const isActive = activeTab === key;
            const isAdd = key === "add";
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all ${
                  isAdd ? "px-0" : ""
                }`}
              >
                {isAdd ? (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200 transition-all active:scale-90">
                    <Plus size={22} weight="bold" />
                  </span>
                ) : (
                  <>
                    <Icon
                      size={22}
                      weight={isActive ? "fill" : "regular"}
                      className={isActive ? "text-emerald-600" : "text-gray-400"}
                    />
                    <span className={`text-[10px] font-medium ${isActive ? "text-emerald-600" : "text-gray-400"}`}>
                      {label}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="activeTab"
                        className="absolute -top-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-emerald-500"
                      />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}