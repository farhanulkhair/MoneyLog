"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CategoryPersonalization } from "@/components/profil/CategoryPersonalization";
import {
  LogOut,
  User,
  Mail,
  Calendar,
  Shield,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

type ProfileTab = "profil" | "personalisasi";

export default function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>("profil");
  const [user, setUser] = useState<{
    email: string;
    fullName: string;
    createdAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        setUser({
          email: authUser.email ?? "",
          fullName:
            profile?.full_name ??
            authUser.user_metadata?.full_name ??
            "Pengguna",
          createdAt: authUser.created_at,
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div className="md:hidden flex items-center gap-2.5 mb-1">
        <h1 className="text-lg font-bold text-gray-900">Profil</h1>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl" role="tablist" aria-label="Bagian profil">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "profil"}
          onClick={() => setTab("profil")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
            tab === "profil"
              ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <User size={16} className="shrink-0 opacity-70" />
          Akun
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "personalisasi"}
          onClick={() => setTab("personalisasi")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
            tab === "personalisasi"
              ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Sparkles size={16} className="shrink-0 opacity-70" />
          Personalisasi
        </button>
      </div>

      {tab === "profil" ? (
        <>
      {/* Profile Card */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-[#0a4818] rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/25 ring-2 ring-[#FFD300]/40">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {user?.fullName}
            </h2>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Info */}
      <Card padding={false}>
        <div className="divide-y divide-gray-50">
          <InfoRow
            icon={<User size={18} />}
            label="Nama"
            value={user?.fullName ?? "-"}
          />
          <InfoRow
            icon={<Mail size={18} />}
            label="Email"
            value={user?.email ?? "-"}
          />
          <InfoRow
            icon={<Calendar size={18} />}
            label="Bergabung"
            value={
              user?.createdAt
                ? format(new Date(user.createdAt), "d MMMM yyyy", {
                    locale: localeId,
                  })
                : "-"
            }
          />
          <InfoRow
            icon={<Shield size={18} />}
            label="Keamanan"
            value="Email & Password"
          />
        </div>
      </Card>

      {/* Logout */}
      <Button
        variant="danger"
        size="lg"
        className="w-full"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        <LogOut size={18} />
        {loggingOut ? "Keluar..." : "Keluar dari Akun"}
      </Button>
        </>
      ) : (
        <CategoryPersonalization />
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <span className="text-gray-400">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300" />
    </div>
  );
}
