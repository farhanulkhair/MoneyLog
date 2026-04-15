"use client";

import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { formatRupiahShort } from "@/lib/queries";
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
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <div className="rounded-2xl bg-[#136f2b] p-3 sm:p-4 text-white min-w-0 shadow-sm shadow-[#136f2b]/25">
        <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
          <TrendingUp size={12} className="opacity-70 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-medium opacity-70">Masuk</span>
        </div>
        <p className="text-sm sm:text-lg font-bold leading-tight truncate">
          {totalTransfer > 0 ? formatRupiahShort(totalTransfer) : "-"}
        </p>
      </div>
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm min-w-0">
        <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
          <TrendingDown size={12} className="text-red-400 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-medium text-gray-400">Keluar</span>
        </div>
        <p className="text-sm sm:text-lg font-bold text-gray-900 leading-tight truncate">
          {totalExpense > 0 ? formatRupiahShort(totalExpense) : "-"}
        </p>
      </div>
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm min-w-0">
        <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
          <Wallet size={12} className="text-emerald-500 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-medium text-gray-400">Sisa</span>
        </div>
        <p
          className={`text-sm sm:text-lg font-bold leading-tight truncate ${remaining >= 0 ? "text-emerald-600" : "text-red-500"}`}
        >
          {totalTransfer > 0 ? formatRupiahShort(remaining) : "-"}
        </p>
      </div>
    </div>
  );
}
