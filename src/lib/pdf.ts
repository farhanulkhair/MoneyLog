import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { ExpenseWithCategory, CategorySummary } from "./types";

export function generateExpenseReport({
  expenses,
  summaries,
  totalSpending,
  periodLabel,
  userName,
}: {
  expenses: ExpenseWithCategory[];
  summaries: CategorySummary[];
  totalSpending: number;
  periodLabel: string;
  userName: string;
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Laporan Pengeluaran", pageWidth / 2, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Periode: ${periodLabel}`, pageWidth / 2, 28, { align: "center" });
  doc.text(`Oleh: ${userName}`, pageWidth / 2, 34, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    `Dibuat: ${format(new Date(), "d MMMM yyyy, HH:mm", { locale: localeId })}`,
    pageWidth / 2,
    40,
    { align: "center" }
  );
  doc.setTextColor(0);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan per Kategori", 14, 52);

  const categoryRows = summaries.map((s) => [
    s.category.name,
    `${s.count}x`,
    `Rp ${(s.total * 1000).toLocaleString("id-ID")}`,
    `${s.percentage.toFixed(1)}%`,
  ]);

  categoryRows.push([
    "TOTAL",
    "",
    `Rp ${(totalSpending * 1000).toLocaleString("id-ID")}`,
    "100%",
  ]);

  autoTable(doc, {
    startY: 56,
    head: [["Kategori", "Transaksi", "Jumlah", "%"]],
    body: categoryRows,
    theme: "grid",
    headStyles: {
      fillColor: [99, 102, 241],
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 9 },
    footStyles: { fillColor: [243, 244, 246], fontStyle: "bold" },
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });

  const afterCategoryY =
    (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 12;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Detail Transaksi", 14, afterCategoryY);

  const grouped = new Map<string, ExpenseWithCategory[]>();
  for (const exp of expenses) {
    const dateKey = exp.expense_date;
    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
    grouped.get(dateKey)!.push(exp);
  }

  const transactionRows: (string | number)[][] = [];
  const sortedDates = [...grouped.keys()].sort();
  for (const date of sortedDates) {
    const items = grouped.get(date)!;
    for (const item of items) {
      transactionRows.push([
        format(new Date(date), "d MMM yyyy", { locale: localeId }),
        item.description,
        item.categories?.name ?? "Lainnya",
        `Rp ${(item.amount * 1000).toLocaleString("id-ID")}`,
      ]);
    }
  }

  autoTable(doc, {
    startY: afterCategoryY + 4,
    head: [["Tanggal", "Deskripsi", "Kategori", "Jumlah"]],
    body: transactionRows,
    theme: "striped",
    headStyles: {
      fillColor: [99, 102, 241],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      3: { halign: "right" },
    },
  });

  doc.save(`laporan-pengeluaran-${periodLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
