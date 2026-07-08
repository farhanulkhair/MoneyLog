"use client";

import { ReactNode } from "react";

/* ── Skeleton primitives ── */

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Base skeleton block with shimmer animation. */
export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} />;
}

/** Rounded circle skeleton (avatar, icon). */
export function SkeletonCircle({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`skeleton shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
      }}
    />
  );
}

/** Text-line skeleton. */
export function SkeletonLine({
  width = "100%",
  height = 12,
  className = "",
}: {
  width?: string | number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: 6 }}
    />
  );
}

/* ── Page-level skeleton presets ── */

/** Dashboard: main spending card + donut area + transaction list. */
export function DashboardChartSkeleton() {
  return (
    <div className="space-y-5">
      {/* Donut placeholder */}
      <div className="flex flex-col items-center py-6 gap-3">
        <div className="skeleton rounded-full" style={{ width: 140, height: 140 }} />
        <SkeletonLine width={100} height={14} />
      </div>
      {/* Category bars */}
      <div className="space-y-3 px-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="skeleton rounded-lg" style={{ width: 32, height: 32 }} />
            <div className="flex-1 space-y-1.5">
              <SkeletonLine width={`${70 - i * 10}%`} height={10} />
              <SkeletonLine width={`${90 - i * 8}%`} height={6} />
            </div>
            <SkeletonLine width={60} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardTransactionSkeleton() {
  return (
    <div className="space-y-3 px-1">
      {/* Date label */}
      <SkeletonLine width={100} height={8} />
      {/* Transaction rows */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2.5 py-2">
          <div className="skeleton rounded-lg" style={{ width: 32, height: 32 }} />
          <div className="flex-1 space-y-1.5">
            <SkeletonLine width={`${80 - i * 8}%`} height={10} />
            <SkeletonLine width={`${50 - i * 5}%`} height={7} />
          </div>
          <SkeletonLine width={55} height={11} />
        </div>
      ))}
    </div>
  );
}

/** Profile page skeleton */
export function ProfileSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <SkeletonLine width={60} height={18} />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
        <div className="flex-1 py-2.5 rounded-lg skeleton" style={{ height: 40 }} />
        <div className="flex-1 py-2.5 rounded-lg skeleton" style={{ height: 40 }} />
      </div>

      {/* Profile card */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          <div className="skeleton rounded-2xl" style={{ width: 64, height: 64 }} />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="60%" height={16} />
            <SkeletonLine width="80%" height={11} />
          </div>
        </div>
      </div>

      {/* Info rows */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 last:border-0">
            <SkeletonCircle size={18} />
            <div className="flex-1 space-y-1.5">
              <SkeletonLine width={50} height={8} />
              <SkeletonLine width={`${60 + i * 5}%`} height={11} />
            </div>
          </div>
        ))}
      </div>

      {/* Logout button */}
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

/** Hutang page skeleton — card grid */
export function HutangSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <SkeletonLine width={100} height={14} />
              <SkeletonLine width={70} height={8} />
            </div>
            <div className="space-y-2 flex flex-col items-end">
              <SkeletonLine width={80} height={8} />
              <SkeletonLine width={90} height={16} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Anggaran page skeleton */
export function AnggaranSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="skeleton rounded-xl" style={{ width: 40, height: 40 }} />
              <div className="space-y-1.5">
                <SkeletonLine width={90} height={12} />
                <SkeletonLine width={110} height={9} />
              </div>
            </div>
            <SkeletonCircle size={20} />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-2 w-full" style={{ borderRadius: 999 }} />
            <div className="flex justify-between">
              <SkeletonLine width={80} height={9} />
              <SkeletonLine width={70} height={9} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Split bill page skeleton */
export function SplitBillSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 space-y-4"
        >
          <div className="space-y-2">
            <SkeletonLine width={80} height={8} />
            <SkeletonLine width="70%" height={14} />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="space-y-1.5">
              <SkeletonLine width={70} height={7} />
              <SkeletonLine width={100} height={12} />
            </div>
            <SkeletonLine width={90} height={28} className="rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Category list skeleton for personalization */
export function CategoryListSkeleton() {
  return (
    <div className="space-y-5">
      {/* Form placeholder */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="skeleton rounded-xl" style={{ width: 40, height: 40 }} />
          <div className="flex-1 space-y-1.5">
            <SkeletonLine width="50%" height={13} />
            <SkeletonLine width="90%" height={9} />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Category list */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 space-y-1.5">
          <SkeletonLine width={110} height={12} />
          <SkeletonLine width={70} height={8} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0">
            <div className="skeleton rounded-xl" style={{ width: 44, height: 44 }} />
            <div className="flex-1 space-y-1.5">
              <SkeletonLine width={`${50 + i * 5}%`} height={11} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
