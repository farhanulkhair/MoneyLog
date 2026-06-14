"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
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

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: any) => {
  if (name === "Kosong" || percent < 0.05) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[11px] font-extrabold tabular-nums select-none"
      style={{
        pointerEvents: "none",
        textShadow: "0px 1px 2px rgba(0, 0, 0, 0.4)",
      }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function SpendingDonutChart({
  summaries,
  totalSpending,
  activeIndex,
  onActiveIndexChange,
  onViewDetails,
}: SpendingDonutChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = summaries.map((s, i) => ({
    name: s.category.name,
    value: s.total,
    color: chartColorForIndex(i),
  }));

  if (chartData.length === 0) {
    chartData.push({ name: "Kosong", value: 1, color: "#e2e8f0" });
  }

  const size = 200;
  const center = size / 2;

  const handlePieClick = (_: any, index: number) => {
    if (summaries.length === 0) return;
    onActiveIndexChange(activeIndex === index ? null : index);
  };

  const activeSummary = activeIndex !== null ? summaries[activeIndex] : null;

  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {mounted && (
          <PieChart width={size} height={size}>
            <Pie
              data={chartData}
              cx={center - 1}
              cy={center - 1}
              innerRadius={0}
              outerRadius={96}
              paddingAngle={summaries.length > 1 ? 1.5 : 0}
              dataKey="value"
              strokeWidth={summaries.length > 1 ? 1.5 : 0}
              stroke="#ffffff"
              onClick={handlePieClick}
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {chartData.map((entry, index) => {
                const isActive = activeIndex === index;
                const isAnyActive = activeIndex !== null;
                const opacity = isAnyActive ? (isActive ? 1 : 0.45) : 1;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    opacity={opacity}
                    style={{
                      cursor: summaries.length > 0 ? "pointer" : "default",
                      transform: isActive ? "scale(1.03)" : "scale(1)",
                      transformOrigin: `${center}px ${center}px`,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        )}
      </div>
      {activeSummary && onViewDetails && (
        <button
          type="button"
          onClick={() => onViewDetails(activeSummary)}
          className="mt-3 text-xs font-semibold text-primary hover:text-primary-dark transition-colors px-3 py-1 bg-emerald-50 rounded-full hover:bg-emerald-100/75 animate-fade-in"
        >
          Lihat Transaksi: {activeSummary.category.icon} {activeSummary.category.name} ({activeSummary.percentage.toFixed(0)}%)
        </button>
      )}
    </div>
  );
}
