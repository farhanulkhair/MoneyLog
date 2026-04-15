"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, User, Wallet } from "lucide-react";

const navItems = [
  { href: "/", label: "Beranda", icon: LayoutDashboard },
  { href: "/anggaran", label: "Anggaran", icon: Target },
  { href: "/profil", label: "Profil", icon: User },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-100">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Wallet size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">MoneyLog</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">MoneyLog v1.0</p>
      </div>
    </aside>
  );
}
