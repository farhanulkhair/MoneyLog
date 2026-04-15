"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

interface AddTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    transfer_date: string;
    notes?: string;
  }) => Promise<void>;
}

export function AddTransferModal({
  isOpen,
  onClose,
  onSubmit,
}: AddTransferModalProps) {
  const [amount, setAmount] = useState("600");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setLoading(true);
    try {
      await onSubmit({
        amount: Number(amount),
        transfer_date: date,
        notes: notes || undefined,
      });
      setAmount("600");
      setNotes("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catat Transfer Masuk">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Jumlah Transfer (ribu Rp)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="contoh: 600 (= Rp600.000)"
            min={1}
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Tanggal Transfer
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Catatan (opsional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="contoh: Transfer bulanan"
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !amount}
          className="w-full"
          size="lg"
        >
          {loading ? "Menyimpan..." : "Simpan Transfer"}
        </Button>
      </form>
    </Modal>
  );
}
