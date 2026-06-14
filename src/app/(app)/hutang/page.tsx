"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Receipt,
  Plus,
  Trash2,
  Check,
  UserPlus,
  Clock,
  CheckCircle,
  HelpCircle,
  X,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getDebtPeople,
  addDebtPerson,
  deleteDebtPerson,
  getDebtsByPerson,
  addDebt,
  updateDebtPaidStatus,
  payAllDebtsForPerson,
  deleteDebt,
  formatRupiah,
} from "@/lib/queries";

type TabType = "active" | "completed";

interface Person {
  id: string;
  name: string;
  created_at: string;
}

interface Debt {
  id: string;
  person_id: string;
  description: string;
  amount: number;
  is_paid: boolean;
  created_at: string;
}

export default function HutangPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [people, setPeople] = useState<Person[]>([]);
  const [debtsMap, setDebtsMap] = useState<Record<string, Debt[]>>({});
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Add Debt state (inside details modal)
  const [debtDesc, setDebtDesc] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [submittingDebt, setSubmittingDebt] = useState(false);
  const [submittingPerson, setSubmittingPerson] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const allPeople = await getDebtPeople();
      setPeople(allPeople);

      // Fetch debts for all people
      const debtsData: Record<string, Debt[]> = {};
      await Promise.all(
        allPeople.map(async (person) => {
          const personDebts = await getDebtsByPerson(person.id);
          debtsData[person.id] = personDebts;
        })
      );
      setDebtsMap(debtsData);
    } catch (err) {
      console.error("Error fetching debts data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [mounted, fetchData]);

  // Separate people based on whether they have active (unpaid) debts
  const categorizedPeople = people.map((person) => {
    const personDebts = debtsMap[person.id] ?? [];
    const activeDebts = personDebts.filter((d) => !d.is_paid);
    const completedDebts = personDebts.filter((d) => d.is_paid);
    const totalActive = activeDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalCompleted = completedDebts.reduce((sum, d) => sum + d.amount, 0);

    return {
      ...person,
      debts: personDebts,
      activeDebts,
      completedDebts,
      totalActive,
      totalCompleted,
    };
  });

  const activePeopleList = categorizedPeople.filter((p) => p.activeDebts.length > 0);
  // Completed list has people who have completed debts AND no active debts
  const completedPeopleList = categorizedPeople.filter(
    (p) => p.completedDebts.length > 0 && p.activeDebts.length === 0
  );
  // Also people with no debts at all (just empty names created by user) default to Active tab so they can add debts easily
  const emptyPeopleList = categorizedPeople.filter((p) => p.debts.length === 0);

  const displayedPeople =
    activeTab === "active" ? [...activePeopleList, ...emptyPeopleList] : completedPeopleList;

  // Handlers
  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    setSubmittingPerson(true);
    try {
      await addDebtPerson(newPersonName);
      setNewPersonName("");
      setShowAddPerson(false);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPerson(false);
    }
  };

  const handleDeletePerson = async (personId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus nama ini beserta riwayat hutangnya?")) return;
    try {
      await deleteDebtPerson(personId);
      setSelectedPerson(null);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDebtEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson || !debtDesc.trim() || !debtAmount) return;
    setSubmittingDebt(true);
    try {
      await addDebt({
        person_id: selectedPerson.id,
        description: debtDesc,
        amount: Number(debtAmount),
      });
      setDebtDesc("");
      setDebtAmount("");
      
      // Keep details open but refresh data
      const allPeople = await getDebtPeople();
      setPeople(allPeople);
      const personDebts = await getDebtsByPerson(selectedPerson.id);
      setDebtsMap((prev) => ({ ...prev, [selectedPerson.id]: personDebts }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingDebt(false);
    }
  };

  const handleSettleItem = async (debtId: string, currentStatus: boolean) => {
    try {
      await updateDebtPaidStatus(debtId, !currentStatus);
      if (selectedPerson) {
        const personDebts = await getDebtsByPerson(selectedPerson.id);
        setDebtsMap((prev) => ({ ...prev, [selectedPerson.id]: personDebts }));
      }
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettleAll = async (personId: string) => {
    if (!confirm("Apakah Anda yakin ingin melunasi seluruh hutang aktif orang ini?")) return;
    try {
      await payAllDebtsForPerson(personId);
      if (selectedPerson) {
        const personDebts = await getDebtsByPerson(selectedPerson.id);
        setDebtsMap((prev) => ({ ...prev, [selectedPerson.id]: personDebts }));
      }
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDebtEntry = async (debtId: string) => {
    if (!confirm("Hapus catatan hutang ini?")) return;
    try {
      await deleteDebt(debtId);
      if (selectedPerson) {
        const personDebts = await getDebtsByPerson(selectedPerson.id);
        setDebtsMap((prev) => ({ ...prev, [selectedPerson.id]: personDebts }));
      }
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Find active details for modal
  const selectedDetails = selectedPerson
    ? categorizedPeople.find((p) => p.id === selectedPerson.id)
    : null;

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-brand-mint/60 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Pencatatan Hutang</h1>
            <p className="text-xs md:text-sm text-gray-400">Catat hutang teman atau keluarga</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-5 space-y-5">
        {/* Navigation Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl" role="tablist" aria-label="Tab Hutang">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "active"}
            onClick={() => setActiveTab("active")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "active"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Clock size={16} className="shrink-0 opacity-70" />
            Hutang Aktif
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "completed"}
            onClick={() => setActiveTab("completed")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === "completed"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <CheckCircle size={16} className="shrink-0 opacity-70" />
            Riwayat Lunas
          </button>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-200 border-t-primary rounded-full animate-spin" />
          </div>
        ) : displayedPeople.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Receipt size={40} />}
              title={activeTab === "active" ? "Belum ada hutang aktif" : "Belum ada riwayat lunas"}
              description={
                activeTab === "active"
                  ? "Tambah nama orang terlebih dahulu untuk mulai mencatat hutang."
                  : "Hutang yang telah dilunasi akan tampil di tab ini."
              }
            />
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {displayedPeople.map((p) => {
              const displayAmount = activeTab === "active" ? p.totalActive : p.totalCompleted;
              const hasActiveDebts = p.activeDebts.length > 0;

              return (
                <Card
                  key={p.id}
                  padding={false}
                  className="hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50/10 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedPerson(p)}
                    className="w-full text-left p-5 flex flex-col justify-between h-full min-h-[120px] focus:outline-none cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Nama Orang
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-0.5 truncate">
                        {p.name}
                      </h3>
                    </div>

                    <div className="mt-4 flex items-end justify-between w-full">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                          {activeTab === "active" ? "Hutang Aktif" : "Total Dilunasi"}
                        </span>
                        <p className={`text-base font-extrabold tabular-nums leading-none mt-1 ${
                          activeTab === "active" ? (hasActiveDebts ? "text-red-500" : "text-gray-500") : "text-emerald-600"
                        }`}>
                          {formatRupiah(displayAmount)}
                        </p>
                      </div>
                      
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        hasActiveDebts ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {hasActiveDebts ? `${p.activeDebts.length} hutang` : "Lunas"}
                      </span>
                    </div>
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Tambah Orang */}
      <Modal isOpen={showAddPerson} onClose={() => setShowAddPerson(false)} title="Tambah Nama Orang">
        <form onSubmit={handleAddPerson} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Nama Lengkap/Panggilan
            </label>
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder="contoh: Jacob, Farhan"
              className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              required
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={submittingPerson}>
            {submittingPerson ? "Menyimpan..." : "Simpan Nama"}
          </Button>
        </form>
      </Modal>

      {/* Modal Detail & Kelola Hutang Orang */}
      <Modal
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        title={selectedPerson?.name ?? "Detail Hutang"}
      >
        {selectedDetails && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Total Hutang Aktif
                </p>
                <p className="text-xl font-extrabold text-red-500 tabular-nums">
                  {formatRupiah(selectedDetails.totalActive)}
                </p>
              </div>
              
              {selectedDetails.activeDebts.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSettleAll(selectedDetails.id)}
                >
                  <Check size={14} />
                  Lunasi Semua
                </Button>
              )}
            </div>

            {/* List of Debts */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                Daftar Catatan Hutang
              </h4>

              {selectedDetails.debts.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl">
                  <p className="text-xs text-gray-400">Belum ada catatan hutang untuk orang ini.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {selectedDetails.debts.map((debt) => (
                    <div
                      key={debt.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                        debt.is_paid 
                          ? "bg-emerald-50/20 border-emerald-100/50 opacity-75" 
                          : "bg-white border-gray-100 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleSettleItem(debt.id, debt.is_paid)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            debt.is_paid 
                              ? "bg-emerald-500 border-emerald-500 text-white" 
                              : "border-gray-300 hover:border-emerald-500"
                          }`}
                          aria-label={debt.is_paid ? "Tandai belum lunas" : "Tandai sudah lunas"}
                        >
                          {debt.is_paid && <Check size={12} strokeWidth={3} />}
                        </button>
                        
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold text-gray-900 truncate leading-tight ${
                            debt.is_paid ? "line-through text-gray-400" : ""
                          }`}>
                            {debt.description}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {format(new Date(debt.created_at), "d MMMM yyyy HH:mm", {
                              locale: localeId,
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`text-sm font-bold tabular-nums ${
                          debt.is_paid ? "text-emerald-600 line-through" : "text-red-500"
                        }`}>
                          {formatRupiah(debt.amount)}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleDeleteDebtEntry(debt.id)}
                          className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label="Hapus catatan"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add new Debt Form */}
            <form onSubmit={handleAddDebtEntry} className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <PlusCircle size={14} className="text-primary" />
                Tambah Nominal Hutang Baru
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">
                    Detail Hutang
                  </label>
                  <input
                    type="text"
                    value={debtDesc}
                    onChange={(e) => setDebtDesc(e.target.value)}
                    placeholder="contoh: Beli kado, Makan"
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">
                    Nominal (ribu Rp)
                  </label>
                  <input
                    type="number"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(e.target.value)}
                    placeholder="contoh: 50 (= Rp50.000)"
                    min={1}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                    required
                  />
                </div>
              </div>
              <Button type="submit" size="sm" className="w-full" disabled={submittingDebt}>
                {submittingDebt ? "Menambahkan..." : "Tambah Catatan"}
              </Button>
            </form>

            <div className="border-t border-gray-100 pt-4 flex justify-between">
              <Button
                variant="danger"
                size="sm"
                className="w-full justify-center"
                onClick={() => handleDeletePerson(selectedDetails.id)}
              >
                <Trash2 size={14} />
                Hapus Nama dari MoneyLog
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Floating Action Button (FAB) on bottom-right */}
      <button
        type="button"
        onClick={() => setShowAddPerson(true)}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none"
        title="Tambah Orang"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </>
  );
}
