"use client";

import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { formatRupiah } from "@/lib/queries";
import type { Transfer, ExpenseWithCategory } from "@/lib/types";

interface SummaryCardsProps {
  transfers: Transfer[];
  expenses: ExpenseWithCategory[];
  dateRange: { start: string; end: string };
}

export function SummaryCards({
  transfers,
  expenses,
  dateRange,
}: SummaryCardsProps) {
  const totalTransfer = transfers
    .filter(
      (t) =>
        t.transfer_date >= dateRange.start && t.transfer_date <= dateRange.end
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalTransfer - totalExpense;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-indigo-600 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp size={14} className="opacity-70" />
          <span className="text-[11px] font-medium opacity-70">Masuk</span>
        </div>
        <p className="text-lg font-bold leading-tight">
          {totalTransfer > 0 ? formatRupiah(totalTransfer) : "-"}
        </p>
      </div>
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingDown size={14} className="text-red-400" />
          <span className="text-[11px] font-medium text-gray-400">Keluar</span>
        </div>
        <p className="text-lg font-bold text-gray-900 leading-tight">
          {totalExpense > 0 ? formatRupiah(totalExpense) : "-"}
        </p>
      </div>
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <Wallet size={14} className="text-emerald-500" />
          <span className="text-[11px] font-medium text-gray-400">Sisa</span>
        </div>
        <p
          className={`text-lg font-bold leading-tight ${remaining >= 0 ? "text-emerald-600" : "text-red-500"}`}
        >
          {totalTransfer > 0 ? formatRupiah(remaining) : "-"}
        </p>
      </div>
    </div>
  );
}
