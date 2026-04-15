"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Hanya membaca query modal — dipisah + Suspense agar hidrasi stabil. */
export function DashboardModalQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const m = searchParams.get("modal");
    if (m === "expense") {
      window.dispatchEvent(new CustomEvent("moneylog:open-expense"));
      router.replace("/", { scroll: false });
    } else if (m === "transfer") {
      window.dispatchEvent(new CustomEvent("moneylog:open-transfer"));
      router.replace("/", { scroll: false });
    } else if (m === "pick") {
      window.dispatchEvent(new CustomEvent("moneylog:open-quick-add"));
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}
