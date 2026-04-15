"use client";

import { useEffect, useState, useCallback } from "react";
import { format, startOfMonth, addMonths, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Target,
} from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRupiah, getCategories, getBudgetStatuses, upsertBudget, deleteBudget } from "@/lib/queries";
import type { Category, BudgetStatus } from "@/lib/types";

export default function AnggaranPage() {
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [categories, setCategories] = useState<Category[]>([]);
  const [statuses, setStatuses] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Form states
  const [selectedCat, setSelectedCat] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, bStatuses] = await Promise.all([
        getCategories(),
        getBudgetStatuses(currentMonth),
      ]);
      setCategories(cats);
      setStatuses(bStatuses);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    if (mounted) fetchData();
  }, [fetchData, mounted]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat || !budgetAmount) return;
    setSaving(true);
    try {
      await upsertBudget({
        category_id: selectedCat,
        amount: Number(budgetAmount),
        month: format(currentMonth, "yyyy-MM-dd"),
      });
      setSelectedCat("");
      setBudgetAmount("");
      setShowAdd(false);
      await fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteBudget(id);
    await fetchData();
  };

  const budgetedCatIds = new Set(statuses.map((s) => s.budget.category_id));
  const availableCategories = categories.filter((c) => !budgetedCatIds.has(c.id));

  const totalBudget = statuses.reduce((s, b) => s + b.budget.amount, 0);
  const totalSpent = statuses.reduce((s, b) => s + b.spent, 0);
  const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Anggaran</h1>
            <p className="text-xs md:text-sm text-gray-400">Atur budget per kategori</p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAdd(true)}
            disabled={availableCategories.length === 0}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Tambah</span>
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-5 space-y-5">
        {/* Month selector */}
        <Card>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
            <span className="text-sm font-semibold text-gray-800 capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: localeId })}
            </span>
            <button
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>
        </Card>

        {/* Overall summary */}
        {statuses.length > 0 && (
          <Card>
            <div className="text-center space-y-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Anggaran</p>
              <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalBudget)}</p>
              <div className="flex items-center justify-center gap-6 text-xs">
                <span className="text-gray-500">
                  Terpakai: <strong className="text-gray-800">{formatRupiah(totalSpent)}</strong>
                </span>
                <span className="text-gray-500">
                  Sisa: <strong className={totalBudget - totalSpent >= 0 ? "text-emerald-600" : "text-red-600"}>{formatRupiah(totalBudget - totalSpent)}</strong>
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${overallPct > 100 ? "bg-red-500" : overallPct >= 80 ? "bg-amber-500" : "bg-indigo-500"}`}
                  style={{ width: `${Math.min(overallPct, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400">{overallPct.toFixed(0)}% terpakai</p>
            </div>
          </Card>
        )}

        {/* Budget items */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : statuses.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Target size={40} />}
              title="Belum ada anggaran"
              description="Tambah anggaran untuk mengontrol pengeluaranmu"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {statuses.map((s) => {
              const pct = Math.min(s.percentage, 100);
              const barColor = s.isOver
                ? "bg-red-500"
                : s.percentage >= 80
                  ? "bg-amber-500"
                  : "bg-emerald-500";

              return (
                <Card key={s.budget.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${s.budget.categories.color}15` }}
                      >
                        {s.budget.categories.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {s.budget.categories.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Budget: {formatRupiah(s.budget.amount)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(s.budget.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">
                        {formatRupiah(s.spent)} terpakai
                      </span>
                      <span className={s.isOver ? "text-red-600 font-semibold" : "text-emerald-600"}>
                        {s.isOver
                          ? `Over ${formatRupiah(Math.abs(s.remaining))}`
                          : `Sisa ${formatRupiah(s.remaining)}`}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Budget Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Tambah Anggaran">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Kategori
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availableCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 transition-all text-center ${
                    selectedCat === cat.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-100 bg-gray-50 hover:border-gray-200"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[11px] font-medium text-gray-700 leading-tight">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
            {availableCategories.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">
                Semua kategori sudah memiliki anggaran
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Budget (ribu Rp)
            </label>
            <input
              type="number"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="contoh: 200 (= Rp200.000)"
              min={1}
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={saving || !selectedCat || !budgetAmount}
            className="w-full"
            size="lg"
          >
            {saving ? "Menyimpan..." : "Simpan Anggaran"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
