"use client";

import type { CategorySummary } from "@/lib/types";
import { formatRupiah } from "@/lib/queries";
import { chartColorForIndex } from "@/lib/chartColors";

interface CategoryListProps {
  summaries: CategorySummary[];
  maxTotal: number;
}

export function CategoryList({ summaries, maxTotal }: CategoryListProps) {
  if (summaries.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-6">
        Belum ada pengeluaran
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {summaries.map((summary, index) => (
        <CategoryRow
          key={summary.category.id}
          summary={summary}
          maxTotal={maxTotal}
          barColor={chartColorForIndex(index)}
        />
      ))}
    </div>
  );
}

function CategoryRow({
  summary,
  maxTotal,
  barColor,
}: {
  summary: CategorySummary;
  maxTotal: number;
  barColor: string;
}) {
  const barWidth = maxTotal > 0 ? (summary.total / maxTotal) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ring-1 ring-black/5"
        style={{ backgroundColor: `${barColor}18` }}
      >
        {summary.category.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {summary.category.name}
          </span>
          <span className="text-sm font-semibold text-gray-900 shrink-0 tabular-nums">
            {formatRupiah(summary.total)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${barWidth}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
          <span className="text-[10px] text-gray-400 tabular-nums w-8 text-right shrink-0">
            {summary.count}x
          </span>
        </div>
      </div>
    </div>
  );
}
