"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  parseISO,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Plus, Wallet, FileDown } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { SpendingDonutChart } from "@/components/dashboard/SpendingDonutChart";
import { CategoryList } from "@/components/dashboard/CategoryList";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { AddExpenseModal } from "@/components/dashboard/AddExpenseModal";
import { AddTransferModal } from "@/components/dashboard/AddTransferModal";
import { EditExpenseModal } from "@/components/dashboard/EditExpenseModal";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { QuickAddSheet } from "@/components/dashboard/QuickAddSheet";
import { CategoryExpensesModal } from "@/components/dashboard/CategoryExpensesModal";

import {
  getCategories,
  getTransfers,
  getExpensesByDateRange,
  calculateCategorySummaries,
  addExpense,
  addTransfer,
  deleteExpense,
  updateExpense,
  generateInsights,
  getBudgetStatuses,
} from "@/lib/queries";
import { generateExpenseReport } from "@/lib/pdf";
import { createClient } from "@/lib/supabase/client";

import type {
  Category,
  Transfer,
  ExpenseWithCategory,
  CategorySummary,
  PeriodType,
  SpendingInsight,
  BudgetStatus,
} from "@/lib/types";

export function DashboardContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [summaries, setSummaries] = useState<CategorySummary[]>([]);
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);
  const [userName, setUserName] = useState("");

  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [customStart, setCustomStart] = useState(() =>
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [customEnd, setCustomEnd] = useState(() =>
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddTransfer, setShowAddTransfer] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [categoryDetailSummary, setCategoryDetailSummary] =
    useState<CategorySummary | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.full_name ?? user.email ?? "");
      }
    });
  }, []);

  useEffect(() => {
    const onOpenExpense = () => setShowAddExpense(true);
    const onOpenTransfer = () => setShowAddTransfer(true);
    const onOpenQuickAdd = () => setShowQuickAdd(true);
    window.addEventListener("moneylog:open-expense", onOpenExpense);
    window.addEventListener("moneylog:open-transfer", onOpenTransfer);
    window.addEventListener("moneylog:open-quick-add", onOpenQuickAdd);
    return () => {
      window.removeEventListener("moneylog:open-expense", onOpenExpense);
      window.removeEventListener("moneylog:open-transfer", onOpenTransfer);
      window.removeEventListener("moneylog:open-quick-add", onOpenQuickAdd);
    };
  }, []);

  const computeDateRange = useCallback(() => {
    if (periodType === "custom") {
      return { start: customStart, end: customEnd };
    }
    let start: Date;
    let end: Date;
    if (periodType === "month") {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
    } else {
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
    }
    return {
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    };
  }, [periodType, currentDate, customStart, customEnd]);

  const insightReferenceDate = useMemo(
    () => (periodType === "custom" ? parseISO(customEnd) : currentDate),
    [periodType, customEnd, currentDate]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const range = computeDateRange();
      setDateRange(range);
      const [cats, trans, exps] = await Promise.all([
        getCategories(),
        getTransfers(),
        getExpensesByDateRange(range.start, range.end),
      ]);
      setCategories(cats);
      setTransfers(trans);
      setExpenses(exps);
      const sums = calculateCategorySummaries(exps, cats);
      setSummaries(sums);

      setInsightsLoading(true);
      Promise.all([
        generateInsights(insightReferenceDate, exps, cats),
        getBudgetStatuses(insightReferenceDate),
      ])
        .then(([ins, budgets]) => {
          setInsights(ins);
          setBudgetStatuses(budgets);
        })
        .catch(() => {})
        .finally(() => setInsightsLoading(false));
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [computeDateRange, insightReferenceDate]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleAddExpense = async (data: {
    description: string;
    amount: number;
    expense_date: string;
    category_id: string;
    transfer_id: string | null;
  }) => {
    await addExpense(data);
    await fetchData();
  };

  const handleAddTransfer = async (data: {
    amount: number;
    transfer_date: string;
    notes?: string;
  }) => {
    await addTransfer(data);
    await fetchData();
  };

  const handleUpdateExpense = async (
    id: string,
    data: {
      description?: string;
      amount?: number;
      expense_date?: string;
      category_id?: string;
      transfer_id?: string | null;
    }
  ) => {
    await updateExpense(id, data);
    await fetchData();
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
    await fetchData();
  };

  const handleExportPDF = () => {
    let periodLabel: string;
    if (periodType === "month") {
      periodLabel = format(currentDate, "MMMM yyyy", { locale: localeId });
    } else if (periodType === "week") {
      periodLabel = `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM", { locale: localeId })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM yyyy", { locale: localeId })}`;
    } else {
      periodLabel = `${format(parseISO(customStart), "d MMM yyyy", { locale: localeId })} – ${format(parseISO(customEnd), "d MMM yyyy", { locale: localeId })}`;
    }

    generateExpenseReport({
      expenses,
      summaries,
      totalSpending,
      periodLabel,
      userName: userName || "Pengguna",
    });
  };

  const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
  const maxCategoryTotal =
    summaries.length > 0 ? Math.max(...summaries.map((s) => s.total)) : 0;

  const categoryDetailExpenses = useMemo(() => {
    if (!categoryDetailSummary) return [];
    return expenses.filter(
      (e) => e.category_id === categoryDetailSummary.category.id
    );
  }, [expenses, categoryDetailSummary]);

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-brand-mint/60 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#136f2b] rounded-xl flex items-center justify-center shadow-sm shadow-[#136f2b]/25">
              <Wallet size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                MoneyLog
              </h1>
              {userName && (
                <p className="text-[11px] text-gray-400 leading-tight">
                  Halo, {userName.split(" ")[0]}!
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportPDF}
              disabled={expenses.length === 0}
              title="Export PDF"
            >
              <FileDown size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block bg-white border-b border-brand-mint/60 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Beranda</h1>
            {userName && (
              <p className="text-sm text-gray-400">
                Selamat datang, {userName}!
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportPDF}
              disabled={expenses.length === 0}
            >
              <FileDown size={16} />
              Export PDF
            </Button>
            <Button size="sm" onClick={() => setShowQuickAdd(true)}>
              <Plus size={14} />
              Tambah
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 space-y-4">
        {/* Period Selector */}
        <Card>
          <PeriodSelector
            periodType={periodType}
            onPeriodTypeChange={setPeriodType}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            customStart={customStart}
            customEnd={customEnd}
            onCustomRangeChange={(start, end) => {
              setCustomStart(start);
              setCustomEnd(end);
            }}
          />
        </Card>

        {/* Summary Cards */}
        <SummaryCards
          transfers={transfers}
          expenses={expenses}
          dateRange={dateRange}
        />

        {/* Desktop: two-column layout — visualisasi utama */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {/* Donut Chart + Categories */}
          <div className="space-y-4 md:space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Pengeluaran</CardTitle>
              </CardHeader>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-emerald-200 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <SpendingDonutChart
                    summaries={summaries}
                    totalSpending={totalSpending}
                  />
                  <p className="text-[11px] text-gray-400 mt-4 mb-2 px-0.5">
                    Ketuk salah satu kategori untuk melihat riwayat transaksi di periode ini.
                  </p>
                  <div className="mt-1">
                    <CategoryList
                      summaries={summaries}
                      maxTotal={maxCategoryTotal}
                      onCategoryClick={setCategoryDetailSummary}
                    />
                  </div>
                </>
              )}
            </Card>

            {/* Budget Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Anggaran</CardTitle>
              </CardHeader>
              <BudgetProgress statuses={budgetStatuses} />
            </Card>

            <InsightsPanel insights={insights} loading={insightsLoading} />
          </div>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transaksi</CardTitle>
              <span className="text-xs text-gray-400 tabular-nums">
                {expenses.length} transaksi
              </span>
            </CardHeader>
            <div className="max-h-[600px] overflow-y-auto -mx-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-emerald-200 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <TransactionList
                  expenses={expenses}
                  onDelete={handleDeleteExpense}
                  onEdit={setEditingExpense}
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      <QuickAddSheet
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onPickExpense={() => setShowAddExpense(true)}
        onPickTransfer={() => setShowAddTransfer(true)}
      />

      <CategoryExpensesModal
        isOpen={!!categoryDetailSummary}
        onClose={() => setCategoryDetailSummary(null)}
        categoryName={categoryDetailSummary?.category.name ?? ""}
        categoryIcon={categoryDetailSummary?.category.icon ?? "📦"}
        total={categoryDetailSummary?.total ?? 0}
        count={categoryDetailSummary?.count ?? 0}
        expenses={categoryDetailExpenses}
        onDelete={handleDeleteExpense}
        onEdit={(expense) => {
          setEditingExpense(expense);
        }}
      />

      {/* Modals */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        categories={categories}
        transfers={transfers}
        onSubmit={handleAddExpense}
      />
      <AddTransferModal
        isOpen={showAddTransfer}
        onClose={() => setShowAddTransfer(false)}
        onSubmit={handleAddTransfer}
      />
      <EditExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        categories={categories}
        transfers={transfers}
        onSubmit={handleUpdateExpense}
      />
    </>
  );
}
