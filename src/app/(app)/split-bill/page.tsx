"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  Percent,
  Receipt,
  Share2,
  FileDown,
  Copy,
  PlusCircle,
  AlertCircle,
  Info,
  Sparkles,
  X,
  History,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { generateSplitBillPDF } from "@/lib/pdf";

interface MenuItem {
  id: string;
  name: string;
  qty: number;
  totalPrice: number; // total price for this item quantity
}

interface Participant {
  id: string;
  name: string;
}

interface SavedBillParticipant {
  name: string;
  items: string[];
  subtotal: number;
  tax: number;
  total: number;
}

interface SavedBill {
  id: string;
  title: string;
  date: string;
  subtotal: number;
  tax: number;
  total: number;
  participants: SavedBillParticipant[];
  rawResults: any[];
}

export default function SplitBillPage() {
  const [mounted, setMounted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [savedBills, setSavedBills] = useState<SavedBill[]>([]);
  const [selectedBill, setSelectedBill] = useState<SavedBill | null>(null);

  // Stepper state
  const [step, setStep] = useState(1);

  // Step 1: Info Transaksi
  const [title, setTitle] = useState("");

  // Step 2: Daftar Menu & Tax
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(""); // total price
  
  const [hasTax, setHasTax] = useState(false);
  const [taxMode, setTaxMode] = useState<"percent" | "nominal">("percent");
  const [taxPercent, setTaxPercent] = useState(10);
  const [taxNominal, setTaxNominal] = useState("");

  // Step 3: Peserta
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newPersonName, setNewPersonName] = useState("");

  // Step 4: Assignment (menuId -> list of participantIds)
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setMounted(true);
    loadSavedBills();
  }, []);

  const loadSavedBills = () => {
    try {
      const stored = localStorage.getItem("moneylog:split_bills");
      if (stored) {
        setSavedBills(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading split bills from localStorage:", err);
    }
  };

  const resetWizard = () => {
    setTitle("");
    setMenus([]);
    setNewItemName("");
    setNewItemQty(1);
    setNewItemPrice("");
    setHasTax(false);
    setTaxMode("percent");
    setTaxPercent(10);
    setTaxNominal("");
    setParticipants([]);
    setNewPersonName("");
    setAssignments({});
    setStep(1);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // --- Step 2 Handlers ---
  const handleAddMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;
    const item: MenuItem = {
      id: Math.random().toString(36).substring(7),
      name: newItemName.trim(),
      qty: Number(newItemQty),
      totalPrice: Number(newItemPrice),
    };
    setMenus((prev) => [...prev, item]);
    setNewItemName("");
    setNewItemQty(1);
    setNewItemPrice("");
  };

  const handleDeleteMenu = (id: string) => {
    setMenus((prev) => prev.filter((m) => m.id !== id));
    setAssignments((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // --- Step 3 Handlers ---
  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    
    // Avoid duplicates
    if (participants.some((p) => p.name.toLowerCase() === newPersonName.trim().toLowerCase())) {
      alert("Nama ini sudah ditambahkan!");
      return;
    }

    const person: Participant = {
      id: Math.random().toString(36).substring(7),
      name: newPersonName.trim(),
    };
    setParticipants((prev) => [...prev, person]);
    setNewPersonName("");
  };

  const handleDeleteParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    // Remove from assignments
    setAssignments((prev) => {
      const updated: Record<string, string[]> = {};
      for (const [menuId, pIds] of Object.entries(prev)) {
        updated[menuId] = pIds.filter((pId) => pId !== id);
      }
      return updated;
    });
  };

  // --- Step 4 Assignment Helpers ---
  const toggleAssignment = (menuId: string, participantId: string) => {
    setAssignments((prev) => {
      const current = prev[menuId] ?? [];
      const updated = current.includes(participantId)
        ? current.filter((id) => id !== participantId)
        : [...current, participantId];
      return { ...prev, [menuId]: updated };
    });
  };

  // --- Calculations ---
  const subtotal = menus.reduce((sum, m) => sum + m.totalPrice, 0);

  const calculatedTax = (() => {
    if (!hasTax) return 0;
    if (taxMode === "percent") {
      return (subtotal * taxPercent) / 100;
    }
    return Number(taxNominal) || 0;
  })();

  const grandTotal = subtotal + calculatedTax;

  // Breakdown of what each participant owes
  const results = participants.map((p) => {
    const itemsAssigned: { name: string; sharePrice: number }[] = [];
    let pSubtotal = 0;

    menus.forEach((menu) => {
      const assignedIds = assignments[menu.id] ?? [];
      if (assignedIds.includes(p.id)) {
        const sharePrice = menu.totalPrice / assignedIds.length;
        itemsAssigned.push({
          name: `${menu.name} (1/${assignedIds.length})`,
          sharePrice,
        });
        pSubtotal += sharePrice;
      }
    });

    // Proportional tax sharing
    const pTaxShare = subtotal > 0 ? (pSubtotal / subtotal) * calculatedTax : 0;
    const pTotal = pSubtotal + pTaxShare;

    return {
      id: p.id,
      name: p.name,
      items: itemsAssigned,
      subtotal: Math.round(pSubtotal),
      tax: Math.round(pTaxShare),
      total: Math.round(pTotal),
    };
  });

  const sumAssignedSubtotal = results.reduce((sum, r) => sum + r.subtotal, 0);
  const isAllAssigned = Math.abs(sumAssignedSubtotal - subtotal) < 2; // allowance for float rounding

  // --- Save / Complete Handler ---
  const handleSaveBill = () => {
    const formattedParticipants = results.map((r) => ({
      name: r.name,
      items: r.items.map((it) => `${it.name} (Rp ${Math.round(it.sharePrice).toLocaleString("id-ID")})`),
      subtotal: r.subtotal,
      tax: r.tax,
      total: r.total,
    }));

    const bill: SavedBill = {
      id: Math.random().toString(36).substring(7),
      title: title || "Makan-Makan",
      date: new Date().toISOString(),
      subtotal,
      tax: calculatedTax,
      total: grandTotal,
      participants: formattedParticipants,
      rawResults: results,
    };

    const updated = [bill, ...savedBills];
    setSavedBills(updated);
    localStorage.setItem("moneylog:split_bills", JSON.stringify(updated));
    resetWizard();
    setIsCreating(false);
  };

  // --- Delete Saved Bill ---
  const handleDeleteSavedBill = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Hapus riwayat split bill ini?")) return;
    const updated = savedBills.filter((b) => b.id !== id);
    setSavedBills(updated);
    localStorage.setItem("moneylog:split_bills", JSON.stringify(updated));
  };

  // --- Share Options ---
  const generateReceiptTextForData = (bill: SavedBill) => {
    let text = `*Split Bill - ${bill.title}*\n`;
    text += `Tanggal: ${new Date(bill.date).toLocaleDateString("id-ID")}\n\n`;

    bill.participants.forEach((r) => {
      text += `*${r.name}*\n`;
      r.items.forEach((item) => {
        text += `- ${item}\n`;
      });
      if (bill.tax > 0 && r.tax > 0) {
        text += `- Porsi Pajak/PPN: Rp ${r.tax.toLocaleString("id-ID")}\n`;
      }
      text += `*Total: Rp ${r.total.toLocaleString("id-ID")}*\n\n`;
    });

    text += `---------------------------------\n`;
    text += `Subtotal Makanan: Rp ${bill.subtotal.toLocaleString("id-ID")}\n`;
    if (bill.tax > 0) {
      text += `Pajak / PPN: Rp ${Math.round(bill.tax).toLocaleString("id-ID")}\n`;
    }
    text += `*Total Pembayaran: Rp ${Math.round(bill.total).toLocaleString("id-ID")}*\n`;
    text += `_Dihitung via MoneyLog App_`;
    return text;
  };

  const handleCopyText = async (bill: SavedBill) => {
    try {
      await navigator.clipboard.writeText(generateReceiptTextForData(bill));
      alert("Teks struk berhasil disalin!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPDF = (bill: SavedBill) => {
    generateSplitBillPDF({
      title: bill.title,
      subtotal: bill.subtotal,
      tax: bill.tax,
      total: bill.total,
      participants: bill.participants,
    });
  };

  const handleShareWhatsApp = (bill: SavedBill) => {
    const text = encodeURIComponent(generateReceiptTextForData(bill));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-brand-mint/60 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Split Bill</h1>
            <p className="text-xs md:text-sm text-gray-400">Bagi rata tagihan belanja</p>
          </div>
          {isCreating && (
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-primary rounded-full">
              Langkah {step} dari 5
            </span>
          )}
        </div>
      </header>

      {/* VIEW A: Landing Page (Daftar Riwayat Split Bill) */}
      {!isCreating ? (
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-5 space-y-5">
          {savedBills.length === 0 ? (
            <Card>
              <EmptyState
                icon={<History size={40} />}
                title="Belum ada riwayat split bill"
                description="Tekan tombol tambah di sudut kiri bawah untuk membagi tagihan baru."
              />
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {savedBills.map((bill) => (
                <Card
                  key={bill.id}
                  padding={false}
                  className="hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50/10 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 flex flex-col justify-between h-full min-h-[140px]">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          {new Date(bill.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <h3 className="text-base font-bold text-gray-900 mt-0.5 truncate">
                          {bill.title}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedBill(bill.id, e)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Hapus riwayat"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="mt-4 pt-2 border-t border-gray-50 flex items-center justify-between w-full">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                          Total Tagihan
                        </span>
                        <p className="text-sm font-extrabold text-gray-900 tabular-nums leading-none mt-1">
                          Rp {bill.total.toLocaleString("id-ID")}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedBill(bill)}
                        className="text-xs font-semibold text-primary hover:text-primary-dark bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        Detail ({bill.participants.length} Orang)
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Floating Action Button (FAB) on bottom-right */}
          <button
            type="button"
            onClick={() => {
              resetWizard();
              setIsCreating(true);
            }}
            className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none"
            title="Mulai Split Bill Baru"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        /* VIEW B: Stepper Wizard */
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-5 space-y-5">
          {/* Step Indicator Visualizer */}
          <div className="flex items-center gap-1.5 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-full flex-1 transition-all duration-300 ${
                  s <= step ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* STEP 1: Informasi Belanja */}
          {step === 1 && (
            <Card className="space-y-4 animate-fade-in">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Receipt size={18} className="text-primary" />
                1. Informasi Transaksi
              </h3>
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-600">
                  Judul Belanja / Nama Tempat
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="contoh: Makan Gacoan, Kopi Nako"
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                  required
                />
              </div>
              
              <div className="pt-2 flex justify-between gap-3">
                <Button variant="ghost" onClick={() => setIsCreating(false)}>
                  <ChevronLeft size={16} />
                  Batal
                </Button>
                <Button onClick={() => setStep(2)} disabled={!title.trim()} className="flex-1 sm:flex-none">
                  Lanjut
                  <ChevronRight size={16} />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: Input Menu & Tax */}
          {step === 2 && (
            <Card className="space-y-5 animate-fade-in">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <PlusCircle size={18} className="text-primary" />
                2. Masukkan Item Menu & Pajak
              </h3>

              {/* Form item */}
              <form onSubmit={handleAddMenu} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-gray-700">Tambah Item Baru</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Nama Menu
                    </label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Mie Setan, Es Teh"
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Porsi (Qty)
                    </label>
                    <input
                      type="number"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(Number(e.target.value))}
                      min={1}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Harga Total
                    </label>
                    <input
                      type="number"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      placeholder="Harga keseluruhan porsi"
                      min={1}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" className="w-full">
                  <Plus size={14} />
                  Tambah ke Daftar
                </Button>
              </form>

              {/* List items added */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Daftar Menu ({menus.length})</h4>
                {menus.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-2xl">
                    Belum ada item menu yang dimasukkan
                  </p>
                ) : (
                  <div className="space-y-2">
                    {menus.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{m.qty} porsi</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-900 tabular-nums">
                            Rp {m.totalPrice.toLocaleString("id-ID")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteMenu(m.id)}
                            className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tax Section */}
              <div className="border-t border-gray-100 pt-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent size={16} className="text-primary" />
                    <div>
                      <label htmlFor="tax-toggle" className="text-sm font-semibold text-gray-900">
                        Tambahkan PPN / Pajak
                      </label>
                      <p className="text-[11px] text-gray-400">Pajak restoran atau diskon (input nominal negatif untuk diskon)</p>
                    </div>
                  </div>
                  <input
                    id="tax-toggle"
                    type="checkbox"
                    checked={hasTax}
                    onChange={(e) => setHasTax(e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                  />
                </div>

                {hasTax && (
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Jenis Perhitungan
                      </label>
                      <select
                        value={taxMode}
                        onChange={(e) => setTaxMode(e.target.value as "percent" | "nominal")}
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="percent">Persentase (%)</option>
                        <option value="nominal">Nominal Langsung (Rp)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        {taxMode === "percent" ? "Persen (%)" : "Jumlah Pajak (Rp)"}
                      </label>
                      <input
                        type="number"
                        value={taxMode === "percent" ? taxPercent : taxNominal}
                        onChange={(e) =>
                          taxMode === "percent"
                            ? setTaxPercent(Number(e.target.value))
                            : setTaxNominal(e.target.value)
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        min={0}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Subtotal summary preview */}
              {menus.length > 0 && (
                <div className="bg-[#dee7d9]/25 p-3 rounded-2xl border border-brand-mint/40 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal Makanan</span>
                    <span className="font-semibold text-gray-800">Rp {subtotal.toLocaleString("id-ID")}</span>
                  </div>
                  {hasTax && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pajak ({taxMode === "percent" ? `${taxPercent}%` : "Nominal"})</span>
                      <span className="font-semibold text-gray-800">Rp {calculatedTax.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-brand-mint/20 font-bold text-sm text-gray-900">
                    <span>Estimasi Total</span>
                    <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              )}

              {/* Stepper buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-50">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} />
                  Kembali
                </Button>
                <Button onClick={() => setStep(3)} disabled={menus.length === 0} className="flex-1 sm:flex-none">
                  Lanjut
                  <ChevronRight size={16} />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: Input Nama Orang */}
          {step === 3 && (
            <Card className="space-y-5 animate-fade-in">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-primary" />
                3. Tentukan Peserta Split Bill
              </h3>

              <form onSubmit={handleAddParticipant} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-gray-700">Tambah Nama Teman</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    placeholder="contoh: Jacob, Farhan, Andi"
                    className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  <Button type="submit" size="md">
                    Tambah
                  </Button>
                </div>
              </form>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Peserta ({participants.length})</h4>
                {participants.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6 border border-dashed border-gray-200 rounded-2xl">
                    Belum ada peserta yang dimasukkan
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {participants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between py-2.5 px-3.5 bg-white border border-gray-100 rounded-xl shadow-sm animate-fade-in"
                      >
                        <span className="text-sm font-semibold text-gray-800 truncate">{p.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteParticipant(p.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-50">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ChevronLeft size={16} />
                  Kembali
                </Button>
                <Button onClick={() => setStep(4)} disabled={participants.length === 0} className="flex-1 sm:flex-none">
                  Lanjut
                  <ChevronRight size={16} />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4: Assign Menu ke Orang */}
          {step === 4 && (
            <Card className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Check size={18} className="text-primary" />
                  4. Hubungkan Menu dengan Orang
                </h3>
              </div>
              
              <div className="p-3.5 bg-emerald-50 text-[11px] text-emerald-800 rounded-2xl border border-emerald-100 flex gap-2">
                <Info size={16} className="shrink-0 text-primary mt-0.5" />
                <span>Ketuk nama orang pada setiap menu yang ikut memakannya. Tagihan menu tersebut akan dibagi rata secara otomatis.</span>
              </div>

              {/* Menu-centric mapping */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {menus.map((menu) => {
                  const assignedPeople = assignments[menu.id] ?? [];
                  
                  return (
                    <div key={menu.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{menu.name}</h4>
                          <span className="text-[10px] text-gray-400 mt-0.5 block">
                            Total: Rp {menu.totalPrice.toLocaleString("id-ID")} ({menu.qty} porsi)
                          </span>
                        </div>
                        
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-semibold">
                          {assignedPeople.length === 0 
                            ? "Belum ada yang makan" 
                            : `${assignedPeople.length} orang patungan`}
                        </span>
                      </div>

                      {/* Participant choice list */}
                      <div className="flex flex-wrap gap-1.5">
                        {participants.map((person) => {
                          const isSelected = assignedPeople.includes(person.id);
                          
                          return (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() => toggleAssignment(menu.id, person.id)}
                              className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-50 border-primary text-primary shadow-sm"
                                  : "bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200"
                              }`}
                            >
                              {person.name}
                              {isSelected && <span className="ml-1 text-[10px] font-bold">✔</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Allocation sanity checker */}
              {!isAllAssigned && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[11px] text-amber-800">
                  <AlertCircle size={15} className="shrink-0 text-amber-500" />
                  <span>Ada item menu yang belum dihubungkan ke siapa pun. Pastikan semua item ada penanggung jawabnya.</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-50">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  <ChevronLeft size={16} />
                  Kembali
                </Button>
                <Button onClick={() => setStep(5)} disabled={!isAllAssigned} className="flex-1 sm:flex-none">
                  Hitung Tagihan
                  <ChevronRight size={16} />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 5: Hasil Akhir & Sharing */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <Card className="space-y-5">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  5. Rincian Pembagian Tagihan
                </h3>

                {/* Transaction Summary */}
                <div className="p-4 bg-[#dee7d9]/20 border border-brand-mint/40 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Nama Tagihan
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {title}
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                    <div>
                      <span className="text-gray-400">Subtotal</span>
                      <p className="font-bold text-gray-800 mt-0.5">Rp {subtotal.toLocaleString("id-ID")}</p>
                    </div>
                    {hasTax && (
                      <div>
                        <span className="text-gray-400">Pajak / PPN</span>
                        <p className="font-bold text-gray-800 mt-0.5">Rp {Math.round(calculatedTax).toLocaleString("id-ID")}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-primary font-semibold">Total Tagihan</span>
                      <p className="font-extrabold text-primary mt-0.5 text-sm">Rp {Math.round(grandTotal).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </div>

                {/* Breakdowns per person */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Rincian Per Orang</h4>
                  
                  <div className="space-y-3">
                    {results.map((r) => (
                      <div key={r.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-2.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-bold text-gray-900">{r.name}</span>
                          <span className="text-base font-extrabold text-gray-900 tabular-nums">
                            Rp {r.total.toLocaleString("id-ID")}
                          </span>
                        </div>

                        {/* Display what items they ordered */}
                        {r.items.length === 0 ? (
                          <p className="text-[11px] text-red-500 italic">Tidak memesan menu apapun.</p>
                        ) : (
                          <div className="text-xs text-gray-500 space-y-1">
                            {r.items.map((item, i) => (
                              <div key={i} className="flex justify-between">
                                <span className="truncate max-w-[200px]">{item.name}</span>
                                <span className="tabular-nums">Rp {Math.round(item.sharePrice).toLocaleString("id-ID")}</span>
                              </div>
                            ))}
                            {hasTax && r.tax > 0 && (
                              <div className="flex justify-between border-t border-dashed border-gray-100 pt-1 text-[11px]">
                                <span>PPN / Pajak (proporsional)</span>
                                <span className="tabular-nums">Rp {r.tax.toLocaleString("id-ID")}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stepper buttons (Back to assigner) */}
                <div className="pt-2 flex justify-start">
                  <Button variant="ghost" onClick={() => setStep(4)}>
                    <ChevronLeft size={16} />
                    Kembali ke Hubungkan
                  </Button>
                </div>
              </Card>

              {/* Action Buttons to Share & Settle */}
              <Card className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Tindakan</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <Button variant="secondary" className="w-full" onClick={() => handleCopyText({ title, subtotal, tax: calculatedTax, total: grandTotal, participants: results.map(r => ({ name: r.name, items: r.items.map(it => `${it.name} (Rp ${Math.round(it.sharePrice).toLocaleString("id-ID")})`), subtotal: r.subtotal, tax: r.tax, total: r.total })), id: "", date: "", rawResults: [] })}>
                    <Copy size={16} />
                    Salin Teks Struk
                  </Button>

                  <Button variant="secondary" className="w-full" onClick={() => handleExportPDF({ title, subtotal, tax: calculatedTax, total: grandTotal, participants: results.map(r => ({ name: r.name, items: r.items.map(it => `${it.name} (Rp ${Math.round(it.sharePrice).toLocaleString("id-ID")})`), subtotal: r.subtotal, tax: r.tax, total: r.total })), id: "", date: "", rawResults: [] })}>
                    <FileDown size={16} />
                    Ekspor PDF Struk
                  </Button>

                  <Button className="w-full" onClick={() => handleShareWhatsApp({ title, subtotal, tax: calculatedTax, total: grandTotal, participants: results.map(r => ({ name: r.name, items: r.items.map(it => `${it.name} (Rp ${Math.round(it.sharePrice).toLocaleString("id-ID")})`), subtotal: r.subtotal, tax: r.tax, total: r.total })), id: "", date: "", rawResults: [] })}>
                    <Share2 size={16} />
                    Kirim ke WhatsApp
                  </Button>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <Button className="w-full" size="lg" onClick={handleSaveBill}>
                    <CheckCircle2 size={18} />
                    Simpan &amp; Selesaikan Split Bill
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail Bill Saved */}
      <Modal
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        title={selectedBill?.title ?? "Detail Split Bill"}
      >
        {selectedBill && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="p-4 bg-[#dee7d9]/20 border border-brand-mint/40 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal Makanan</span>
                <span className="font-semibold text-gray-800">Rp {selectedBill.subtotal.toLocaleString("id-ID")}</span>
              </div>
              {selectedBill.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Pajak / PPN</span>
                  <span className="font-semibold text-gray-800">Rp {Math.round(selectedBill.tax).toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-brand-mint/20 font-bold text-sm text-gray-900">
                <span>Total Akhir</span>
                <span>Rp {Math.round(selectedBill.total).toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Rincian Per Orang</h4>
              
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {selectedBill.participants.map((r, idx) => (
                  <div key={idx} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-bold text-gray-900">{r.name}</span>
                      <span className="text-base font-extrabold text-gray-900 tabular-nums">
                        Rp {r.total.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      {r.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="truncate max-w-[200px]">{item}</span>
                        </div>
                      ))}
                      {selectedBill.tax > 0 && r.tax > 0 && (
                        <div className="flex justify-between border-t border-dashed border-gray-100 pt-1 text-[11px]">
                          <span>PPN / Pajak (proporsional)</span>
                          <span className="tabular-nums">Rp {r.tax.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sharing Methods */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={() => handleCopyText(selectedBill)}>
                <Copy size={13} />
                Salin Teks
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleExportPDF(selectedBill)}>
                <FileDown size={13} />
                Ekspor PDF
              </Button>
              <Button size="sm" onClick={() => handleShareWhatsApp(selectedBill)}>
                <Share2 size={13} />
                WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
