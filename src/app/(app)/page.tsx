"use client";

import { Suspense } from "react";
import { DashboardModalQuery } from "./DashboardModalQuery";
import { DashboardContent } from "./DashboardContent";

export default function Dashboard() {
  return (
    <>
      <Suspense fallback={null}>
        <DashboardModalQuery />
      </Suspense>
      <DashboardContent />
    </>
  );
}
