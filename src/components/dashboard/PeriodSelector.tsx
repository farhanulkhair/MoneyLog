"use client";

import { format, subMonths, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PeriodType } from "@/lib/types";

interface PeriodSelectorProps {
  periodType: PeriodType;
  onPeriodTypeChange: (type: PeriodType) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const periodOptions: { value: PeriodType; label: string }[] = [
  { value: "week", label: "Minggu" },
  { value: "month", label: "Bulan" },
];

export function PeriodSelector({
  periodType,
  onPeriodTypeChange,
  currentDate,
  onDateChange,
}: PeriodSelectorProps) {
  const handlePrev = () => {
    if (periodType === "month") {
      onDateChange(subMonths(currentDate, 1));
    } else {
      onDateChange(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (periodType === "month") {
      onDateChange(subMonths(currentDate, -1));
    } else {
      onDateChange(subWeeks(currentDate, -1));
    }
  };

  const getLabel = () => {
    if (periodType === "month") {
      return format(currentDate, "MMMM yyyy", { locale: localeId });
    }
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return `${format(start, "d MMM", { locale: localeId })} - ${format(end, "d MMM yyyy", { locale: localeId })}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1">
        {periodOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onPeriodTypeChange(opt.value)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              periodType === opt.value
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-800 capitalize">
          {getLabel()}
        </span>
        <button
          onClick={handleNext}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
