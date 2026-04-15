"use client";

import type { SpendingInsight } from "@/lib/types";
import { ChevronDown, Lightbulb } from "lucide-react";

interface InsightsPanelProps {
  insights: SpendingInsight[];
  loading?: boolean;
}

const severityStyles = {
  info: "bg-sky-50 border-sky-100 text-sky-900",
  warning: "bg-amber-50 border-amber-100 text-amber-900",
  success: "bg-emerald-50 border-emerald-100 text-emerald-900",
  danger: "bg-red-50 border-red-100 text-red-900",
};

export function InsightsPanel({ insights, loading }: InsightsPanelProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <Lightbulb size={14} className="text-amber-500" />
          Insight
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <details className="rounded-2xl border border-gray-100 bg-white shadow-sm group">
      <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between select-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <Lightbulb size={14} className="text-amber-500" />
          Insight
          <span className="normal-case font-medium text-gray-400">
            ({insights.length})
          </span>
        </span>
        <ChevronDown
          size={18}
          className="text-gray-400 transition-transform shrink-0 group-open:rotate-180"
        />
      </summary>
      <div className="px-4 pb-4 space-y-2 border-t border-gray-50 pt-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`px-3.5 py-2.5 rounded-xl border text-xs ${severityStyles[insight.severity]}`}
          >
            <p className="font-semibold text-[12px] leading-tight">{insight.title}</p>
            <p className="text-[11px] mt-0.5 opacity-85 leading-snug">{insight.description}</p>
          </div>
        ))}
      </div>
    </details>
  );
}
