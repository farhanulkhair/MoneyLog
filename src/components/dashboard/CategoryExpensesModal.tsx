"use client";

import type { ExpenseWithCategory } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { formatRupiah } from "@/lib/queries";

interface CategoryExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  categoryIcon: string;
  total: number;
  count: number;
  expenses: ExpenseWithCategory[];
  onDelete?: (id: string) => void;
  onEdit?: (expense: ExpenseWithCategory) => void;
}

export function CategoryExpensesModal({
  isOpen,
  onClose,
  categoryName,
  categoryIcon,
  total,
  count,
  expenses,
  onDelete,
  onEdit,
}: CategoryExpensesModalProps) {
  const title = `${categoryIcon} ${categoryName}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-1 pb-2 border-b border-gray-100 mb-4">
        <p className="text-xs text-gray-500">Total dalam periode ini</p>
        <p className="text-lg font-bold text-gray-900 tabular-nums">
          {formatRupiah(total)}
        </p>
        <p className="text-xs text-gray-400">{count} transaksi</p>
      </div>
      <div className="max-h-[min(55vh,420px)] overflow-y-auto -mx-1 px-1">
        <TransactionList
          expenses={expenses}
          onDelete={onDelete}
          onEdit={onEdit}
          showCategorySubline={false}
        />
      </div>
    </Modal>
  );
}
