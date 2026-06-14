"use client";

import { ChevronRight } from "lucide-react";
import type { CategorySummary } from "@/lib/types";
import { formatRupiah } from "@/lib/queries";
import { chartColorForIndex } from "@/lib/chartColors";

interface CategoryListProps {
  summaries: CategorySummary[];
  maxTotal: number;
  activeIndex: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  onCategoryClick?: (summary: CategorySummary) => void;
}

export function CategoryList({
  summaries,
  maxTotal,
  activeIndex,
  onActiveIndexChange,
  onCategoryClick,
}: CategoryListProps) {
  if (summaries.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-6">
        Belum ada pengeluaran
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {summaries.map((summary, index) => {
        const isActive = activeIndex === index;
        const isAnyActive = activeIndex !== null;
        
        return (
          <CategoryRow
            key={summary.category.id}
            summary={summary}
            maxTotal={maxTotal}
            barColor={chartColorForIndex(index)}
            isActive={isActive}
            isAnyActive={isAnyActive}
            onClick={() => {
              if (isActive) {
                if (onCategoryClick) onCategoryClick(summary);
              } else {
                if (onActiveIndexChange) onActiveIndexChange(index);
              }
            }}
            onDetailClick={
              onCategoryClick
                ? (e) => {
                    e.stopPropagation();
                    onCategoryClick(summary);
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

function CategoryRow({
  summary,
  maxTotal,
  barColor,
  isActive,
  isAnyActive,
  onClick,
  onDetailClick,
}: {
  summary: CategorySummary;
  maxTotal: number;
  barColor: string;
  isActive: boolean;
  isAnyActive: boolean;
  onClick: () => void;
  onDetailClick?: (e: React.MouseEvent) => void;
}) {
  const barWidth = maxTotal > 0 ? (summary.total / maxTotal) * 100 : 0;

  const rowStyle: React.CSSProperties = {};
  if (isActive) {
    rowStyle.backgroundColor = `${barColor}0a`;
    rowStyle.borderColor = `${barColor}30`;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={rowStyle}
      className={`flex items-center gap-3 w-full text-left rounded-xl p-2 border border-transparent transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer ${
        isAnyActive && !isActive ? "opacity-55 hover:opacity-90" : "opacity-100"
      } ${isActive ? "shadow-sm shadow-black/[0.02]" : "hover:bg-gray-50/50"}`}
      aria-label={`Pilih kategori ${summary.category.name}`}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ring-1 ring-black/5 transition-transform duration-300"
        style={{
          backgroundColor: `${barColor}18`,
          transform: isActive ? "scale(1.05)" : "scale(1)",
        }}
      >
        {summary.category.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {summary.category.name}
          </span>
          <span className="text-sm font-bold text-gray-900 shrink-0 tabular-nums">
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

      {onDetailClick && (
        <button
          type="button"
          onClick={onDetailClick}
          className="p-1 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
          aria-label={`Lihat riwayat ${summary.category.name}`}
        >
          <ChevronRight size={18} aria-hidden />
        </button>
      )}
    </div>
  );
}
