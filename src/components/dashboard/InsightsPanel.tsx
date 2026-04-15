"use client";

import type { SpendingInsight } from "@/lib/types";
import { Lightbulb } from "lucide-react";

interface InsightsPanelProps {
  insights: SpendingInsight[];
  loading?: boolean;
}

const severityStyles = {
  info: "bg-blue-50 border-blue-100 text-blue-800",
  warning: "bg-amber-50 border-amber-100 text-amber-800",
  success: "bg-emerald-50 border-emerald-100 text-emerald-800",
  danger: "bg-red-50 border-red-100 text-red-800",
};

export function InsightsPanel({ insights, loading }: InsightsPanelProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb size={14} className="text-amber-500" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Insight
        </span>
      </div>
      {insights.map((insight, idx) => (
        <div
          key={idx}
          className={`px-4 py-3 rounded-xl border text-sm ${severityStyles[insight.severity]}`}
        >
          <p className="font-semibold text-[13px] leading-tight">{insight.title}</p>
          <p className="text-xs mt-0.5 opacity-80">{insight.description}</p>
        </div>
      ))}
    </div>
  );
}
