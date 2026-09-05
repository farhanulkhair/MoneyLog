"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import type { CategorySummary } from "@/lib/types";
import { formatRupiah } from "@/lib/queries";
import { chartColorForIndex } from "@/lib/chartColors";

interface SpendingDonutChartProps {
  summaries: CategorySummary[];
  totalSpending: number;
  activeIndex: number | null;
  onActiveIndexChange: (index: number | null) => void;
  onViewDetails?: (summary: CategorySummary) => void;
}

function CustomDonutTooltip({ active, payload, totalSpending }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data || data.name === "Kosong") return null;

  const percentage =
    totalSpending > 0 ? ((data.value / totalSpending) * 100).toFixed(1) : "0";

  return (
    <div className="bg-gray-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-white/15 text-xs pointer-events-none animate-fade-in z-50 min-w-[130px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{data.icon}</span>
        <p className="font-semibold text-gray-100 truncate max-w-[120px]">
          {data.name}
        </p>
      </div>
      <div className="flex items-baseline justify-between gap-3 text-[11px] pt-1 border-t border-white/10">
        <span className="text-emerald-300 font-bold tabular-nums">
          {formatRupiah(data.value)}
        </span>
        <span className="text-gray-300 font-medium tabular-nums">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

export function SpendingDonutChart({
  summaries,
  totalSpending,
  activeIndex,
  onActiveIndexChange,
  onViewDetails,
}: SpendingDonutChartProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasData = summaries.length > 0 && totalSpending > 0;

  const chartData = hasData
    ? summaries.map((s, i) => ({
        id: s.category.id,
        name: s.category.name,
        icon: s.category.icon,
        value: s.total,
        count: s.count,
        color: chartColorForIndex(i),
        originalSummary: s,
      }))
    : [{ id: "empty", name: "Kosong", icon: "💰", value: 1, count: 0, color: "#e2e8f0", originalSummary: null }];

  const effectiveIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;
  const activeItem =
    effectiveIndex !== null && hasData ? chartData[effectiveIndex] : null;

  const handlePieClick = (_: any, index: number) => {
    if (!hasData) return;
    onActiveIndexChange(activeIndex === index ? null : index);
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center min-w-0">
      <div className="relative w-full h-[220px] sm:h-[240px] flex items-center justify-center">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Tooltip
                content={<CustomDonutTooltip totalSpending={totalSpending} />}
                wrapperStyle={{ outline: "none", zIndex: 50 }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={hasData && chartData.length > 1 ? 3 : 0}
                cornerRadius={hasData && chartData.length > 1 ? 4 : 0}
                dataKey="value"
                strokeWidth={hasData ? 2 : 0}
                stroke="#ffffff"
                onClick={handlePieClick}
                onMouseEnter={(_, index) => hasData && setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                animationDuration={800}
                animationEasing="ease-out"
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => {
                  const isActive = effectiveIndex === index && hasData;
                  const isAnyActive = effectiveIndex !== null && hasData;
                  const opacity = isAnyActive ? (isActive ? 1 : 0.4) : 1;

                  return (
                    <Cell
                      key={`cell-${entry.id || index}`}
                      fill={entry.color}
                      opacity={opacity}
                      style={{
                        cursor: hasData ? "pointer" : "default",
                        filter: isActive
                          ? `drop-shadow(0 4px 10px ${entry.color}60)`
                          : "none",
                        transform: isActive ? "scale(1.04)" : "scale(1)",
                        transformOrigin: "center center",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none",
                      }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Center Hole Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
          {activeItem ? (
            <div className="flex flex-col items-center justify-center animate-fade-in max-w-[120px]">
              <span className="text-xl mb-0.5">{activeItem.icon}</span>
              <p className="text-[11px] font-bold text-gray-800 truncate max-w-[110px] leading-tight">
                {activeItem.name}
              </p>
              <p className="text-xs font-extrabold text-primary tabular-nums mt-0.5">
                {formatRupiah(activeItem.value)}
              </p>
              <span className="text-[10px] font-semibold text-gray-400 tabular-nums">
                {((activeItem.value / totalSpending) * 100).toFixed(0)}%
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center max-w-[125px]">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Total
              </span>
              <p className="text-sm sm:text-base font-extrabold text-gray-900 tabular-nums truncate max-w-[120px] leading-tight mt-0.5">
                {hasData ? formatRupiah(totalSpending) : "Rp 0"}
              </p>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                {hasData ? `${summaries.length} Kategori` : "Kosong"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Selected Category Detail Action Button */}
      {activeIndex !== null && hasData && summaries[activeIndex] && onViewDetails && (
        <button
          type="button"
          onClick={() => onViewDetails(summaries[activeIndex])}
          className="mt-2 text-xs font-semibold text-primary hover:text-primary-dark transition-all px-3.5 py-1.5 bg-emerald-50 rounded-full hover:bg-emerald-100 shadow-sm border border-emerald-100 flex items-center gap-1.5 animate-fade-in cursor-pointer active:scale-95"
        >
          <span>{summaries[activeIndex].category.icon}</span>
          <span className="truncate max-w-[160px]">
            Lihat Transaksi {summaries[activeIndex].category.name}
          </span>
          <span className="font-bold tabular-nums">
            ({summaries[activeIndex].percentage.toFixed(0)}%)
          </span>
        </button>
      )}
    </div>
  );
}
