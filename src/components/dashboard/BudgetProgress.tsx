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
        className="flex items-center justify-between px-4 py-3.5 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
      >
        <div>
          <p className="text-sm font-medium text-indigo-700">Atur Anggaran</p>
          <p className="text-xs text-indigo-500 mt-0.5">
            Buat budget per kategori untuk kontrol pengeluaran
          </p>
        </div>
        <ChevronRight size={16} className="text-indigo-400" />
      </Link>
    );
  }

  const overCount = statuses.filter((s) => s.isOver).length;
  const nearCount = statuses.filter((s) => !s.isOver && s.percentage >= 80).length;

  return (
    <div className="space-y-3">
      {(overCount > 0 || nearCount > 0) && (
        <div className={`px-3.5 py-2.5 rounded-xl text-xs font-medium ${overCount > 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
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
          <div key={s.budget.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">
                {s.budget.categories.icon} {s.budget.categories.name}
              </span>
              <span className="text-[11px] text-gray-400 tabular-nums">
                {formatRupiah(s.spent)} / {formatRupiah(s.budget.amount)}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
          className="block text-center text-xs text-indigo-600 font-medium hover:underline"
        >
          Lihat semua ({statuses.length}) →
        </Link>
      )}
    </div>
  );
}
