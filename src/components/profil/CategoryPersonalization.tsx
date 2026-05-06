"use client";

import { useCallback, useEffect, useState } from "react";
import { Tags, Trash2, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  getCategories,
  addCategory,
  deleteCategory,
} from "@/lib/queries";
import type { Category } from "@/lib/types";
import { CHART_SEGMENT_COLORS } from "@/lib/chartColors";

const PRESET_ICONS = ["🍜", "☕", "🚗", "🏠", "💊", "🎮", "📱", "🛒", "✈️", "👕", "🎬", "📚", "💳"];

export function CategoryPersonalization() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📦");
  const [color, setColor] = useState(CHART_SEGMENT_COLORS[0]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await addCategory({ name: trimmed, icon, color });
      setName("");
      setIcon("📦");
      await load();
    } catch (err) {
      console.error(err);
      alert("Gagal menambah kategori. Coba lagi atau periksa koneksi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (cat.is_default) return;
    const ok = window.confirm(
      `Hapus kategori "${cat.name}"? Jika masih dipakai transaksi, penghapusan bisa ditolak oleh sistem.`
    );
    if (!ok) return;
    try {
      await deleteCategory(cat.id);
      await load();
    } catch (err) {
      console.error(err);
      alert(
        "Tidak bisa menghapus kategori ini (mungkin masih dipakai transaksi atau ada aturan di basis data)."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-emerald-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const palette = CHART_SEGMENT_COLORS.slice(0, 10);

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary">
            <Tags size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900">Kategori pengeluaran</h3>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Tambah kategori sesuai kebiasaanmu (misalnya &quot;Streaming&quot;, &quot;Kampus&quot;).
              Kategori bawaan aplikasi tidak bisa dihapus.
            </p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label htmlFor="cat-name" className="block text-xs font-medium text-gray-600 mb-1.5">
              Nama kategori
            </label>
            <input
              id="cat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Langganan app"
              maxLength={48}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-shadow"
            />
          </div>

          <div>
            <p className="block text-xs font-medium text-gray-600 mb-1.5">Ikon (ketuk untuk pakai)</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ICONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`h-10 w-10 rounded-xl text-lg flex items-center justify-center border transition-colors ${
                    icon === em
                      ? "border-[#136f2b] bg-emerald-50 ring-2 ring-[#136f2b]/25"
                      : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                  }`}
                  aria-label={`Pilih ikon ${em}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="block text-xs font-medium text-gray-600 mb-1.5">Warna di grafik</p>
            <div className="flex flex-wrap gap-2">
              {palette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform ${
                    color === c ? "border-gray-900 scale-110" : "border-white shadow-sm"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Warna ${c}`}
                />
              ))}
            </div>
          </div>

          <Button type="submit" disabled={saving || !name.trim()} className="w-full sm:w-auto">
            <Plus size={16} />
            {saving ? "Menyimpan..." : "Tambah kategori"}
          </Button>
        </form>
      </Card>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900">Daftar kategori</h4>
          <p className="text-[11px] text-gray-400 mt-0.5">{categories.length} kategori</p>
        </div>
        <ul className="divide-y divide-gray-50">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center gap-3 px-5 py-3.5"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ring-1 ring-black/5"
                style={{ backgroundColor: `${cat.color}18` }}
              >
                {cat.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{cat.name}</p>
                {cat.is_default && (
                  <span className="inline-block mt-0.5 text-[10px] font-medium uppercase tracking-wide text-primary bg-emerald-50 px-1.5 py-0.5 rounded">
                    Bawaan
                  </span>
                )}
              </div>
              {!cat.is_default && (
                <button
                  type="button"
                  onClick={() => void handleDelete(cat)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  aria-label={`Hapus ${cat.name}`}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
