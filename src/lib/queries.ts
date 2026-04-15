import { supabase } from "./supabase";
import type {
  Category,
  Transfer,
  ExpenseWithCategory,
  CategorySummary,
  Budget,
  BudgetWithCategory,
  BudgetStatus,
  DailySpending,
  SpendingInsight,
} from "./types";
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

// ─── Auth helper ───────────────────────────────────────────────
async function requireUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

// ─── CATEGORIES ────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("is_default", { ascending: false })
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function addCategory(category: {
  name: string;
  icon?: string;
  color?: string;
}): Promise<Category> {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: category.name.trim(),
      icon: category.icon || "📦",
      color: category.color || "#136f2b",
      user_id: user.id,
      is_default: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  updates: { name?: string; icon?: string; color?: string }
): Promise<Category> {
  const clean: Record<string, string> = {};
  if (updates.name) clean.name = updates.name.trim();
  if (updates.icon) clean.icon = updates.icon;
  if (updates.color) clean.color = updates.color;

  const { data, error } = await supabase
    .from("categories")
    .update(clean)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ─── TRANSFERS (income) ────────────────────────────────────────
export async function getTransfers(): Promise<Transfer[]> {
  const { data, error } = await supabase
    .from("transfers")
    .select("*")
    .order("transfer_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getTransfersByDateRange(
  startDate: string,
  endDate: string
): Promise<Transfer[]> {
  const { data, error } = await supabase
    .from("transfers")
    .select("*")
    .gte("transfer_date", startDate)
    .lte("transfer_date", endDate)
    .order("transfer_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addTransfer(transfer: {
  amount: number;
  transfer_date: string;
  notes?: string;
}): Promise<Transfer> {
  if (transfer.amount <= 0) throw new Error("Amount must be positive");
  const user = await requireUser();
  const { data, error } = await supabase
    .from("transfers")
    .insert({ ...transfer, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTransfer(
  id: string,
  updates: { amount?: number; transfer_date?: string; notes?: string }
): Promise<Transfer> {
  if (updates.amount !== undefined && updates.amount <= 0)
    throw new Error("Amount must be positive");
  const { data, error } = await supabase
    .from("transfers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTransfer(id: string) {
  const { error } = await supabase.from("transfers").delete().eq("id", id);
  if (error) throw error;
}

// ─── EXPENSES ──────────────────────────────────────────────────
export async function getExpensesByDateRange(
  startDate: string,
  endDate: string
): Promise<ExpenseWithCategory[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*, categories(*)")
    .gte("expense_date", startDate)
    .lte("expense_date", endDate)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addExpense(expense: {
  description: string;
  amount: number;
  expense_date: string;
  category_id: string;
  transfer_id?: string | null;
}): Promise<ExpenseWithCategory> {
  if (expense.amount <= 0) throw new Error("Amount must be positive");
  if (!expense.description.trim()) throw new Error("Description is required");

  const user = await requireUser();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      ...expense,
      description: expense.description.trim(),
      user_id: user.id,
    })
    .select("*, categories(*)")
    .single();
  if (error) throw error;
  return data;
}

export async function updateExpense(
  id: string,
  updates: {
    description?: string;
    amount?: number;
    expense_date?: string;
    category_id?: string;
    transfer_id?: string | null;
  }
): Promise<ExpenseWithCategory> {
  if (updates.amount !== undefined && updates.amount <= 0)
    throw new Error("Amount must be positive");

  const clean = { ...updates };
  if (clean.description) clean.description = clean.description.trim();

  const { data, error } = await supabase
    .from("expenses")
    .update(clean)
    .eq("id", id)
    .select("*, categories(*)")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

// ─── BUDGETS ───────────────────────────────────────────────────
export async function getBudgets(month: string): Promise<BudgetWithCategory[]> {
  const { data, error } = await supabase
    .from("budgets")
    .select("*, categories(*)")
    .eq("month", month)
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function upsertBudget(budget: {
  category_id: string;
  amount: number;
  month: string;
}): Promise<Budget> {
  if (budget.amount <= 0) throw new Error("Budget amount must be positive");

  const user = await requireUser();
  const { data, error } = await supabase
    .from("budgets")
    .upsert(
      {
        user_id: user.id,
        category_id: budget.category_id,
        amount: budget.amount,
        month: budget.month,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,category_id,month" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBudget(id: string) {
  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) throw error;
}

export async function getBudgetStatuses(month: Date): Promise<BudgetStatus[]> {
  const monthStr = format(startOfMonth(month), "yyyy-MM-dd");
  const start = format(startOfMonth(month), "yyyy-MM-dd");
  const end = format(endOfMonth(month), "yyyy-MM-dd");

  const [budgets, expenses] = await Promise.all([
    getBudgets(monthStr),
    getExpensesByDateRange(start, end),
  ]);

  const spentByCategory = new Map<string, number>();
  for (const e of expenses) {
    if (e.category_id) {
      spentByCategory.set(
        e.category_id,
        (spentByCategory.get(e.category_id) ?? 0) + e.amount
      );
    }
  }

  return budgets.map((b) => {
    const spent = spentByCategory.get(b.category_id) ?? 0;
    const remaining = b.amount - spent;
    return {
      budget: b,
      spent,
      remaining,
      percentage: b.amount > 0 ? (spent / b.amount) * 100 : 0,
      isOver: spent > b.amount,
    };
  });
}

// ─── STATISTICS & INSIGHTS ─────────────────────────────────────
export function calculateCategorySummaries(
  expenses: ExpenseWithCategory[],
  categories: Category[]
): CategorySummary[] {
  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);
  const summaryMap = new Map<string, { total: number; count: number }>();

  for (const expense of expenses) {
    const catId = expense.category_id ?? "uncategorized";
    const existing = summaryMap.get(catId) ?? { total: 0, count: 0 };
    existing.total += expense.amount;
    existing.count += 1;
    summaryMap.set(catId, existing);
  }

  const summaries: CategorySummary[] = [];
  for (const category of categories) {
    const data = summaryMap.get(category.id);
    if (data) {
      summaries.push({
        category,
        total: data.total,
        count: data.count,
        percentage: totalAll > 0 ? (data.total / totalAll) * 100 : 0,
      });
    }
  }

  summaries.sort((a, b) => b.total - a.total);
  return summaries;
}

export function calculateDailySpending(
  expenses: ExpenseWithCategory[]
): DailySpending[] {
  const dailyMap = new Map<string, number>();
  for (const e of expenses) {
    dailyMap.set(e.expense_date, (dailyMap.get(e.expense_date) ?? 0) + e.amount);
  }
  return Array.from(dailyMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getMonthlyComparison(currentDate: Date) {
  const thisStart = format(startOfMonth(currentDate), "yyyy-MM-dd");
  const thisEnd = format(endOfMonth(currentDate), "yyyy-MM-dd");

  const prevMonth = subMonths(currentDate, 1);
  const prevStart = format(startOfMonth(prevMonth), "yyyy-MM-dd");
  const prevEnd = format(endOfMonth(prevMonth), "yyyy-MM-dd");

  const [thisExpenses, prevExpenses, thisTransfers, prevTransfers] =
    await Promise.all([
      getExpensesByDateRange(thisStart, thisEnd),
      getExpensesByDateRange(prevStart, prevEnd),
      getTransfersByDateRange(thisStart, thisEnd),
      getTransfersByDateRange(prevStart, prevEnd),
    ]);

  const thisTotal = thisExpenses.reduce((s, e) => s + e.amount, 0);
  const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);
  const thisIncome = thisTransfers.reduce((s, t) => s + t.amount, 0);
  const prevIncome = prevTransfers.reduce((s, t) => s + t.amount, 0);

  const changePercent =
    prevTotal > 0 ? ((thisTotal - prevTotal) / prevTotal) * 100 : 0;

  return {
    current: {
      month: format(currentDate, "MMMM yyyy", { locale: localeId }),
      expense: thisTotal,
      income: thisIncome,
      balance: thisIncome - thisTotal,
    },
    previous: {
      month: format(prevMonth, "MMMM yyyy", { locale: localeId }),
      expense: prevTotal,
      income: prevIncome,
      balance: prevIncome - prevTotal,
    },
    changePercent,
    isIncrease: thisTotal > prevTotal,
  };
}

export async function generateInsights(
  currentDate: Date,
  expenses: ExpenseWithCategory[],
  categories: Category[]
): Promise<SpendingInsight[]> {
  const insights: SpendingInsight[] = [];

  if (expenses.length === 0) return insights;

  const summaries = calculateCategorySummaries(expenses, categories);
  const totalSpending = expenses.reduce((s, e) => s + e.amount, 0);

  // 1) Highest spending category
  if (summaries.length > 0) {
    const top = summaries[0];
    insights.push({
      type: "highest_category",
      title: `${top.category.icon} ${top.category.name} Paling Banyak`,
      description: `Pengeluaran terbesar bulan ini di kategori ${top.category.name} sebesar ${formatRupiah(top.total)} (${top.percentage.toFixed(0)}%)`,
      severity: "info",
      value: top.total,
    });
  }

  // 2) Spending change vs last month
  try {
    const comparison = await getMonthlyComparison(currentDate);
    if (comparison.previous.expense > 0) {
      const pct = Math.abs(comparison.changePercent).toFixed(0);
      insights.push({
        type: "spending_change",
        title: comparison.isIncrease ? "📈 Pengeluaran Naik" : "📉 Pengeluaran Turun",
        description: comparison.isIncrease
          ? `Pengeluaran naik ${pct}% dibanding ${comparison.previous.month}`
          : `Pengeluaran turun ${pct}% dari ${comparison.previous.month}. Bagus!`,
        severity: comparison.isIncrease ? "warning" : "success",
        value: comparison.changePercent,
      });
    }
  } catch {
    // Skip if comparison fails
  }

  // 3) Budget warnings
  try {
    const budgetStatuses = await getBudgetStatuses(currentDate);
    const overBudgets = budgetStatuses.filter((b) => b.isOver);
    if (overBudgets.length > 0) {
      const names = overBudgets.map((b) => b.budget.categories.name).join(", ");
      insights.push({
        type: "budget_warning",
        title: "⚠️ Budget Terlewati",
        description: `Kamu sudah melebihi budget di: ${names}. Coba kurangi pengeluaran!`,
        severity: "danger",
      });
    }
    const nearBudgets = budgetStatuses.filter(
      (b) => !b.isOver && b.percentage >= 80
    );
    if (nearBudgets.length > 0) {
      const names = nearBudgets.map((b) => b.budget.categories.name).join(", ");
      insights.push({
        type: "budget_warning",
        title: "🔔 Hampir Mencapai Budget",
        description: `Budget ${names} sudah dipakai lebih dari 80%. Hati-hati!`,
        severity: "warning",
      });
    }
  } catch {
    // Skip if budget check fails
  }

  // 4) Daily average
  const start = startOfMonth(currentDate);
  const end = new Date() < endOfMonth(currentDate) ? new Date() : endOfMonth(currentDate);
  const dayCount = Math.max(differenceInDays(end, start), 1);
  const dailyAvg = totalSpending / dayCount;
  insights.push({
    type: "daily_average",
    title: "📊 Rata-rata Harian",
    description: `Rata-rata pengeluaranmu ${formatRupiah(dailyAvg)} per hari bulan ini`,
    severity: "info",
    value: dailyAvg,
  });

  return insights;
}

// ─── BALANCE ───────────────────────────────────────────────────
export async function getBalanceSummary(month: Date) {
  const start = format(startOfMonth(month), "yyyy-MM-dd");
  const end = format(endOfMonth(month), "yyyy-MM-dd");

  const [transfers, expenses] = await Promise.all([
    getTransfersByDateRange(start, end),
    getExpensesByDateRange(start, end),
  ]);

  const totalIncome = transfers.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
  };
}

// ─── FORMATTERS ────────────────────────────────────────────────
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount * 1000);
}

export function formatRupiahShort(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}jt`;
  }
  return `${amount}rb`;
}
