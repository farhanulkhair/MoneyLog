"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Trash2, Pencil, Receipt, X } from "lucide-react";
import type { ExpenseWithCategory } from "@/lib/types";
import { formatRupiahShort } from "@/lib/queries";
import { EmptyState } from "@/components/ui/EmptyState";

interface TransactionListProps {
  expenses: ExpenseWithCategory[];
  onDelete?: (id: string) => void;
  onEdit?: (expense: ExpenseWithCategory) => void;
  showDate?: boolean;
  /** Saat false, sembunyikan baris nama kategori (mis. di modal filter per kategori). */
  showCategorySubline?: boolean;
}

export function TransactionList({
  expenses,
  onDelete,
  onEdit,
  showDate = true,
  showCategorySubline = true,
}: TransactionListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={<Receipt size={40} />}
        title="Belum ada transaksi"
        description="Tambah pengeluaran pertamamu"
      />
    );
  }

  const grouped = groupByDate(expenses);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          {showDate && (
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
              {format(new Date(date), "EEE, d MMM yyyy", {
                locale: localeId,
              })}
            </p>
          )}
          <div className="space-y-0.5">
            {items.map((expense) => (
              <TransactionRow
                key={expense.id}
                expense={expense}
                onDelete={onDelete}
                onEdit={onEdit}
                showCategorySubline={showCategorySubline}
                isActive={activeId === expense.id}
                onToggle={() =>
                  setActiveId(activeId === expense.id ? null : expense.id)
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TransactionRow({
  expense,
  onDelete,
  onEdit,
  showCategorySubline,
  isActive,
  onToggle,
}: {
  expense: ExpenseWithCategory;
  onDelete?: (id: string) => void;
  onEdit?: (expense: ExpenseWithCategory) => void;
  showCategorySubline: boolean;
  isActive: boolean;
  onToggle: () => void;
}) {
  const hasActions = onEdit || onDelete;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Main row */}
      <div
        className="flex items-center gap-2.5 py-2.5 px-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={hasActions ? onToggle : undefined}
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-sm shrink-0">
          {expense.categories?.icon ?? "📦"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-gray-800 truncate capitalize">
            {expense.description}
          </p>
          {showCategorySubline && (
            <p className="text-[10px] text-gray-400 leading-tight">
              {expense.categories?.name ?? "Lainnya"}
            </p>
          )}
        </div>
        <span className="text-[13px] font-semibold text-gray-900 tabular-nums shrink-0">
          -{formatRupiahShort(expense.amount)}
        </span>
      </div>

      {/* Action bar — visible on tap (mobile) */}
      {isActive && hasActions && (
        <div className="flex items-center gap-1.5 px-2 pb-2 animate-fade-in">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(expense);
                onToggle();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-primary text-xs font-medium hover:bg-emerald-100 transition-colors"
            >
              <Pencil size={12} />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(expense.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 size={12} />
              Hapus
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="ml-auto p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function groupByDate(
  expenses: ExpenseWithCategory[]
): Record<string, ExpenseWithCategory[]> {
  const groups: Record<string, ExpenseWithCategory[]> = {};
  for (const expense of expenses) {
    const date = expense.expense_date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(expense);
  }
  return groups;
}
