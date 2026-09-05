"use client";

import type { BudgetStatus } from "@/lib/types";
import { formatRupiah } from "@/lib/queries";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BudgetProgressProps {
  statuses: BudgetStatus[];
}

export function BudgetProgress({ statuses }: BudgetProgressProps) {
  if (statuses.length === 0) {
    return (
      <Link
        href="/anggaran"
        className="flex items-center justify-between px-4 py-3.5 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors w-full min-w-0"
      >
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-sm font-medium text-primary truncate">Atur Anggaran</p>
          <p className="text-xs text-primary/70 mt-0.5 truncate">
            Buat budget per kategori untuk kontrol pengeluaran
          </p>
        </div>
        <ChevronRight size={16} className="text-primary/50 shrink-0" />
      </Link>
    );
  }

  const overCount = statuses.filter((s) => s.isOver).length;
  const nearCount = statuses.filter((s) => !s.isOver && s.percentage >= 80).length;

  return (
    <div className="space-y-3 w-full min-w-0">
      {(overCount > 0 || nearCount > 0) && (
        <div
          className={`px-3.5 py-2.5 rounded-xl text-xs font-medium min-w-0 break-words ${
            overCount > 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {overCount > 0 && `${overCount} kategori melebihi budget. `}
          {nearCount > 0 && `${nearCount} kategori hampir penuh.`}
        </div>
      )}

      {statuses.slice(0, 4).map((s) => {
        const pct = Math.min(s.percentage, 100);
        const barColor = s.isOver
          ? "bg-red-500"
          : s.percentage >= 80
            ? "bg-amber-500"
            : "bg-emerald-500";

        return (
          <div key={s.budget.id} className="space-y-1 w-full min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span
                className="text-xs font-medium text-gray-700 truncate"
                title={s.budget.categories.name}
              >
                {s.budget.categories.icon} {s.budget.categories.name}
              </span>
              <span className="text-[11px] text-gray-400 tabular-nums shrink-0 ml-1">
                {formatRupiah(s.spent)} / {formatRupiah(s.budget.amount)}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-0">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}

      {statuses.length > 4 && (
        <Link
          href="/anggaran"
          className="block text-center text-xs text-primary font-medium hover:underline"
        >
          Lihat semua ({statuses.length}) →
        </Link>
      )}
    </div>
  );
}
