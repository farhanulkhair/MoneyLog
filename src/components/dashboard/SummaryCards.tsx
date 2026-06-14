"use client";

import { ArrowUpRight, ArrowDownLeft, TrendingDown } from "lucide-react";
import { formatRupiah } from "@/lib/queries";

interface SummaryCardsProps {
  totalSpending: number;
  incomeMonth: number;
  expenseToday: number;
  periodLabel: string;
}

export function SummaryCards({
  totalSpending,
  incomeMonth,
  expenseToday,
  periodLabel,
}: SummaryCardsProps) {
  return (
    <div className="space-y-3">
      {/* Premium Main Balance Card (Now Total Pengeluaran) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#136f2b] to-[#0a4818] p-5 text-white shadow-md shadow-[#136f2b]/15 min-h-[120px]">
        {/* Soft card decoration shapes */}
        <div className="absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute left-[-30px] bottom-[-30px] h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[#FFD300] backdrop-blur-sm">
                <TrendingDown size={15} />
              </div>
              <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Total Pengeluaran</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/90 backdrop-blur-sm">
              {periodLabel}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
              {formatRupiah(totalSpending)}
            </p>
            <p className="text-[10px] text-white/60 mt-1">
              Total pengeluaran untuk {periodLabel.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Income & Expense sub-cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Monthly Income Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100/80 shadow-sm flex flex-col justify-between min-h-[85px] hover:border-emerald-100 hover:shadow-emerald-50/20 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-gray-400 tracking-wide">Pemasukan Bulan Ini</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ArrowUpRight size={13} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold text-emerald-600 truncate tabular-nums">
            {incomeMonth > 0 ? formatRupiah(incomeMonth) : "Rp 0"}
          </p>
        </div>

        {/* Today's Expense Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100/80 shadow-sm flex flex-col justify-between min-h-[85px] hover:border-red-100 hover:shadow-red-50/20 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-gray-400 tracking-wide">Pengeluaran Hari Ini</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-600">
              <ArrowDownLeft size={13} strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold text-red-600 truncate tabular-nums">
            {expenseToday > 0 ? formatRupiah(expenseToday) : "Rp 0"}
          </p>
        </div>
      </div>
    </div>
  );
}
