"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Trash2, Pencil, Receipt } from "lucide-react";
import type { ExpenseWithCategory } from "@/lib/types";
import { formatRupiah } from "@/lib/queries";
import { EmptyState } from "@/components/ui/EmptyState";

interface TransactionListProps {
  expenses: ExpenseWithCategory[];
  onDelete?: (id: string) => void;
  onEdit?: (expense: ExpenseWithCategory) => void;
  showDate?: boolean;
}

export function TransactionList({
  expenses,
  onDelete,
  onEdit,
  showDate = true,
}: TransactionListProps) {
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
    <div className="space-y-5">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          {showDate && (
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2.5">
              {format(new Date(date), "EEEE, d MMMM yyyy", {
                locale: localeId,
              })}
            </p>
          )}
          <div className="space-y-1">
            {items.map((expense) => (
              <TransactionRow
                key={expense.id}
                expense={expense}
                onDelete={onDelete}
                onEdit={onEdit}
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
}: {
  expense: ExpenseWithCategory;
  onDelete?: (id: string) => void;
  onEdit?: (expense: ExpenseWithCategory) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-sm shrink-0">
        {expense.categories?.icon ?? "📦"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate capitalize">
          {expense.description}
        </p>
        <p className="text-[11px] text-gray-400">
          {expense.categories?.name ?? "Lainnya"}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-semibold text-gray-900 tabular-nums">
          -{formatRupiah(expense.amount)}
        </span>
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
          {onEdit && (
            <button
              onClick={() => onEdit(expense)}
              className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <Pencil size={13} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(expense.id)}
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
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
