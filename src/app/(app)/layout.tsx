import { BottomNav } from "@/components/navigation/BottomNav";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopSidebar />
      <div className="md:pl-64">
        <main className="pb-20 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
