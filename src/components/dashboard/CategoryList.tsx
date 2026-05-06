"use client";

import { ChevronRight } from "lucide-react";
import type { CategorySummary } from "@/lib/types";
import { formatRupiah } from "@/lib/queries";
import { chartColorForIndex } from "@/lib/chartColors";

interface CategoryListProps {
  summaries: CategorySummary[];
  maxTotal: number;
  /** Ketuka baris kategori — membuka detail transaksi (opsional). */
  onCategoryClick?: (summary: CategorySummary) => void;
}

export function CategoryList({ summaries, maxTotal, onCategoryClick }: CategoryListProps) {
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
          onClick={
            onCategoryClick ? () => onCategoryClick(summary) : undefined
          }
        />
      ))}
    </div>
  );
}

function CategoryRow({
  summary,
  maxTotal,
  barColor,
  onClick,
}: {
  summary: CategorySummary;
  maxTotal: number;
  barColor: string;
  onClick?: () => void;
}) {
  const barWidth = maxTotal > 0 ? (summary.total / maxTotal) * 100 : 0;

  const inner = (
    <>
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
      {onClick && (
        <ChevronRight
          size={18}
          className="text-gray-300 shrink-0"
          aria-hidden
        />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-3 w-full text-left rounded-xl py-1 -mx-1 px-1 hover:bg-gray-50/80 active:bg-gray-100/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={`Lihat riwayat ${summary.category.name}`}
      >
        {inner}
      </button>
    );
  }

  return <div className="flex items-center gap-3">{inner}</div>;
}
