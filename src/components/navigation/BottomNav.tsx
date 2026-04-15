"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, User, Plus } from "lucide-react";

function openQuickAddFromNav(pathname: string, router: ReturnType<typeof useRouter>) {
  if (pathname === "/") {
    window.dispatchEvent(new CustomEvent("moneylog:open-quick-add"));
  } else {
    router.push("/?modal=pick");
  }
}

function NavIconLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-end gap-1 py-2 min-h-[52px] text-white/85 hover:text-white transition-colors"
    >
      <span className="relative flex flex-col items-center">
        <Icon size={22} strokeWidth={active ? 2.5 : 2} className={active ? "text-[#FFD300]" : ""} />
        {active && (
          <span className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-[#FFD300]" aria-hidden />
        )}
      </span>
      <span className="text-[9px] font-medium leading-none text-white/70">{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
      aria-label="Navigasi utama"
    >
      <div className="mx-auto max-w-lg px-3 pb-[max(4px,env(safe-area-inset-bottom))]">
        {/* Bar hijau + notch (cradle) untuk FAB — mirip referensi banking */}
        <div className="relative overflow-visible rounded-b-[26px] bg-[#0d4d28] shadow-[0_-8px_28px_rgba(13,77,40,0.35)]">
          {/* Lingkaran "gigit" atas = area konten, buat lekukan tempat FAB */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 z-[1] h-[52px] w-[78px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background"
            aria-hidden
          />

          {/* Tiga kolom: Beranda | FAB tengah | Profil */}
          <div className="relative z-[2] grid min-w-0 grid-cols-3 items-end px-1 pt-2 pb-2">
            <div className="flex min-w-0 justify-center">
              <NavIconLink
                href="/"
                label="Beranda"
                Icon={LayoutDashboard}
                active={pathname === "/"}
              />
            </div>

            <div className="relative flex min-h-[52px] min-w-0 justify-center">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => openQuickAddFromNav(pathname, router)}
                className="pointer-events-auto absolute left-1/2 top-0 z-[6] flex -translate-x-1/2 -translate-y-[48%]"
                aria-label="Tambah transaksi"
                title="Pengeluaran atau uang masuk"
              >
                <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-b from-[#fff2a8] via-[#FFD300] to-[#e6bc00] text-[#136f2b] shadow-[0_10px_28px_rgba(0,0,0,0.28)] transition-transform active:scale-95">
                  <Plus size={30} strokeWidth={2.8} className="drop-shadow-sm" />
                </span>
              </button>
            </div>

            <div className="flex min-w-0 justify-center">
              <NavIconLink
                href="/profil"
                label="Profil"
                Icon={User}
                active={pathname === "/profil"}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
