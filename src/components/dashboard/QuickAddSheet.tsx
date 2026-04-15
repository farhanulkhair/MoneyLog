"use client";

import { useEffect, useRef } from "react";
import { X, Receipt, ArrowDownToLine } from "lucide-react";

interface QuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPickExpense: () => void;
  onPickTransfer: () => void;
}

export function QuickAddSheet({
  isOpen,
  onClose,
  onPickExpense,
  onPickTransfer,
}: QuickAddSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[65] flex items-end justify-center md:items-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-2xl animate-slide-up pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Tambah</h2>
            <p className="text-xs text-gray-500 mt-0.5">Pilih jenis pencatatan</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Tutup"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onPickExpense();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 text-left transition-colors active:scale-[0.99] hover:bg-emerald-50"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#136f2b] text-white shadow-sm">
              <Receipt size={22} strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-gray-900">Pengeluaran</span>
              <span className="block text-xs text-gray-500 mt-0.5">
                Catat belanja, tagihan, atau pengeluaran lain
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onPickTransfer();
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-amber-100 bg-gradient-to-br from-[#fffbeb] to-[#fff3c4] text-left transition-colors active:scale-[0.99] hover:from-[#fff8e6] hover:to-[#ffecb0]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFD300] text-[#136f2b] shadow-sm">
              <ArrowDownToLine size={22} strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-gray-900">Uang masuk</span>
              <span className="block text-xs text-gray-600 mt-0.5">
                Catat transfer atau pemasukan ke dompet
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
