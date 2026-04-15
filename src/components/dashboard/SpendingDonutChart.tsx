"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import type { CategorySummary } from "@/lib/types";
import { formatRupiahShort } from "@/lib/queries";

interface SpendingDonutChartProps {
  summaries: CategorySummary[];
  totalSpending: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Makan: "#6366f1",
  Jajan: "#8b5cf6",
  "Cafe/Warkop": "#a78bfa",
  Laundry: "#c4b5fd",
  Bensin: "#818cf8",
  Lainnya: "#4f46e5",
};

const DEFAULT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#818cf8",
  "#4f46e5",
];

export function SpendingDonutChart({
  summaries,
  totalSpending,
}: SpendingDonutChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = summaries.map((s, i) => ({
    name: s.category.name,
    value: s.total,
    color:
      CATEGORY_COLORS[s.category.name] ??
      DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  if (chartData.length === 0) {
    chartData.push({ name: "Kosong", value: 1, color: "#e2e8f0" });
  }

  const size = 200;
  const center = size / 2;

  return (
    <div className="relative w-full flex justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {mounted && (
          <PieChart width={size} height={size}>
            <Pie
              data={chartData}
              cx={center - 1}
              cy={center - 1}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={summaries.length > 1 ? 3 : 0}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        )}
        <div
          className="absolute flex flex-col items-center justify-center pointer-events-none"
          style={{
            top: 0,
            left: 0,
            width: size,
            height: size,
          }}
        >
          <span className="text-xl font-bold text-gray-900 leading-none">
            {formatRupiahShort(totalSpending)}
          </span>
          <span className="text-[11px] text-gray-400 mt-1">Total</span>
        </div>
      </div>
    </div>
  );
}
