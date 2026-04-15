"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Category, Transfer, ExpenseWithCategory } from "@/lib/types";
import { format } from "date-fns";

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseWithCategory | null;
  categories: Category[];
  transfers: Transfer[];
  onSubmit: (
    id: string,
    data: {
      description?: string;
      amount?: number;
      expense_date?: string;
      category_id?: string;
      transfer_id?: string | null;
    }
  ) => Promise<void>;
}

export function EditExpenseModal({
  isOpen,
  onClose,
  expense,
  categories,
  transfers,
  onSubmit,
}: EditExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [transferId, setTransferId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(String(expense.amount));
      setDate(expense.expense_date);
      setCategoryId(expense.category_id ?? "");
      setTransferId(expense.transfer_id ?? "");
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense || !description || !amount || !categoryId) return;

    setLoading(true);
    try {
      await onSubmit(expense.id, {
        description: description.toLowerCase(),
        amount: Number(amount),
        expense_date: date,
        category_id: categoryId,
        transfer_id: transferId || null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Pengeluaran">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Deskripsi
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Jumlah (ribu Rp)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Tanggal
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Kategori
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 transition-all text-center ${
                  categoryId === cat.id
                    ? "border-primary bg-emerald-50"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-[11px] font-medium text-gray-700 leading-tight">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Transfer (opsional)
          </label>
          <select
            value={transferId}
            onChange={(e) => setTransferId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
          >
            <option value="">-- Pilih transfer --</option>
            {transfers.map((t) => (
              <option key={t.id} value={t.id}>
                {format(new Date(t.transfer_date), "d MMM yyyy")} - {t.amount}rb
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
            size="lg"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={loading || !description || !amount || !categoryId}
            className="flex-1"
            size="lg"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
