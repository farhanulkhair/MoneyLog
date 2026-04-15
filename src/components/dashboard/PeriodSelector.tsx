"use client";

import {
  format,
  subMonths,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  parseISO,
  isAfter,
  isBefore,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PeriodType } from "@/lib/types";

interface PeriodSelectorProps {
  periodType: PeriodType;
  onPeriodTypeChange: (type: PeriodType) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  customStart: string;
  customEnd: string;
  onCustomRangeChange: (start: string, end: string) => void;
}

const periodOptions: { value: PeriodType; label: string }[] = [
  { value: "week", label: "Minggu" },
  { value: "month", label: "Bulan" },
  { value: "custom", label: "Rentang" },
];

export function PeriodSelector({
  periodType,
  onPeriodTypeChange,
  currentDate,
  onDateChange,
  customStart,
  customEnd,
  onCustomRangeChange,
}: PeriodSelectorProps) {
  const handlePrev = () => {
    if (periodType === "month") {
      onDateChange(subMonths(currentDate, 1));
    } else if (periodType === "week") {
      onDateChange(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (periodType === "month") {
      onDateChange(subMonths(currentDate, -1));
    } else if (periodType === "week") {
      onDateChange(subWeeks(currentDate, -1));
    }
  };

  const getLabel = () => {
    if (periodType === "month") {
      return format(currentDate, "MMMM yyyy", { locale: localeId });
    }
    if (periodType === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "d MMM", { locale: localeId })} - ${format(end, "d MMM yyyy", { locale: localeId })}`;
    }
    const a = parseISO(customStart);
    const b = parseISO(customEnd);
    return `${format(a, "d MMM yyyy", { locale: localeId })} → ${format(b, "d MMM yyyy", { locale: localeId })}`;
  };

  const handleTabChange = (next: PeriodType) => {
    if (next === "custom") {
      if (periodType === "month") {
        onCustomRangeChange(
          format(startOfMonth(currentDate), "yyyy-MM-dd"),
          format(endOfMonth(currentDate), "yyyy-MM-dd")
        );
      } else if (periodType === "week") {
        const s = startOfWeek(currentDate, { weekStartsOn: 1 });
        const e = endOfWeek(currentDate, { weekStartsOn: 1 });
        onCustomRangeChange(format(s, "yyyy-MM-dd"), format(e, "yyyy-MM-dd"));
      }
    }
    onPeriodTypeChange(next);
  };

  const setStart = (v: string) => {
    if (!v) return;
    const end = parseISO(customEnd);
    const start = parseISO(v);
    if (isAfter(start, end)) {
      onCustomRangeChange(v, v);
    } else {
      onCustomRangeChange(v, customEnd);
    }
  };

  const setEnd = (v: string) => {
    if (!v) return;
    const start = parseISO(customStart);
    const end = parseISO(v);
    if (isBefore(end, start)) {
      onCustomRangeChange(v, v);
    } else {
      onCustomRangeChange(customStart, v);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {periodOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleTabChange(opt.value)}
            className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
              periodType === opt.value
                ? "bg-white text-[#136f2b] shadow-sm ring-1 ring-[#136f2b]/15"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {periodType === "custom" ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">
                Dari tanggal
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">
                Sampai tanggal
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 text-center leading-snug">
            {getLabel()}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-semibold text-gray-800 capitalize text-center px-1">
            {getLabel()}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
