"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import type { CategorySummary } from "@/lib/types";
import { formatRupiah } from "@/lib/queries";

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

  return (
    <div className="relative w-full flex justify-center">
      <div className="w-56 h-56 relative">
        {mounted && (
          <PieChart width={224} height={224}>
            <Pie
              data={chartData}
              cx={112}
              cy={112}
              innerRadius={68}
              outerRadius={100}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-gray-900">
            {formatRupiah(totalSpending)}
          </span>
          <span className="text-xs text-gray-400 mt-0.5">Total</span>
        </div>
      </div>
    </div>
  );
}
