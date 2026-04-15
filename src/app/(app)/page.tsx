"use client";

import { useEffect, useState, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Plus,
  ArrowDownToLine,
  Wallet,
  FileDown,
} from "lucide-react";

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

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
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

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddTransfer, setShowAddTransfer] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.full_name ?? user.email ?? "");
      }
    });
  }, []);

  const computeDateRange = useCallback(() => {
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
  }, [periodType, currentDate]);

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

      // Load insights & budgets in background (non-blocking)
      setInsightsLoading(true);
      Promise.all([
        generateInsights(currentDate, exps, cats),
        getBudgetStatuses(currentDate),
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
  }, [computeDateRange, currentDate]);

  useEffect(() => {
    if (mounted) fetchData();
  }, [fetchData, mounted]);

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
    const periodLabel =
      periodType === "month"
        ? format(currentDate, "MMMM yyyy", { locale: localeId })
        : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM", { locale: localeId })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM yyyy", { locale: localeId })}`;

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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
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
          <div className="flex items-center gap-2">
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
      <header className="hidden md:block bg-white border-b border-gray-100 sticky top-0 z-40">
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddTransfer(true)}
            >
              <ArrowDownToLine size={14} />
              Transfer
            </Button>
            <Button size="sm" onClick={() => setShowAddExpense(true)}>
              <Plus size={14} />
              Catat
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-5 space-y-5">
        {/* Mobile action bar */}
        <div className="flex gap-2 md:hidden">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => setShowAddTransfer(true)}
          >
            <ArrowDownToLine size={14} />
            Transfer
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => setShowAddExpense(true)}
          >
            <Plus size={14} />
            Catat Pengeluaran
          </Button>
        </div>

        {/* Period Selector */}
        <Card>
          <PeriodSelector
            periodType={periodType}
            onPeriodTypeChange={setPeriodType}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        </Card>

        {/* Summary Cards */}
        <SummaryCards
          transfers={transfers}
          expenses={expenses}
          dateRange={dateRange}
        />

        {/* Insights */}
        <InsightsPanel insights={insights} loading={insightsLoading} />

        {/* Desktop: two-column layout */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Donut Chart + Categories */}
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Pengeluaran</CardTitle>
              </CardHeader>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <SpendingDonutChart
                    summaries={summaries}
                    totalSpending={totalSpending}
                  />
                  <div className="mt-6">
                    <CategoryList
                      summaries={summaries}
                      maxTotal={maxCategoryTotal}
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
          </div>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transaksi</CardTitle>
              <span className="text-xs text-gray-400 tabular-nums">
                {expenses.length} transaksi
              </span>
            </CardHeader>
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
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
