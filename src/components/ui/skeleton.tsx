import { cn } from '@/lib/utils';

/* ─── Base Skeleton ─── */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-md bg-neutral-200', className)}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

/* ─── KPI Card Skeleton ─── */
export function SkeletonKPI() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-16" />
    </div>
  );
}

/* ─── Text Lines Skeleton ─── */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3'];
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', widths[i % widths.length])}
        />
      ))}
    </div>
  );
}

/* ─── Card Skeleton ─── */
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <SkeletonText lines={2} />
    </div>
  );
}

/* ─── List Item Skeleton ─── */
function SkeletonListItem() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 flex items-center gap-3">
      <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/5" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12 rounded-full" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
      <Skeleton className="h-5 w-12 rounded-full flex-shrink-0" />
    </div>
  );
}

/* ─── List Skeleton ─── */
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonListItem key={i} />
      ))}
    </div>
  );
}

/* ─── Progress Bar Skeleton ─── */
export function SkeletonProgressBar() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-10" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-2.5 w-full rounded-full" />
    </div>
  );
}

/* ─── Chart Skeleton ─── */
export function SkeletonChart() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
      <Skeleton className="h-4 w-36" />
      <div className="flex items-end gap-1.5 h-32">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <Skeleton className="h-2.5 w-6" />
            <Skeleton
              className="w-full rounded-t"
              style={{ height: `${20 + Math.random() * 60}%` }}
            />
            <Skeleton className="h-2.5 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Table Skeleton ─── */
export function SkeletonTable({ rows = 5, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
      <Skeleton className="h-4 w-36" />
      <div className="space-y-3">
        {/* Header */}
        <div className="flex gap-3 pb-2 border-b border-neutral-100">
          {Array.from({ length: cols }, (_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex gap-3">
            {Array.from({ length: cols }, (_, c) => (
              <Skeleton key={c} className="h-3 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Form Area Skeleton ─── */
export function SkeletonFormArea() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

/* ─── Post Item Skeleton ─── */
function SkeletonPostItem() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

/* ─── Post List Skeleton ─── */
export function SkeletonPostList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonPostItem key={i} />
      ))}
    </div>
  );
}

/* ─── Source Badges Skeleton ─── */
export function SkeletonSourceBadges({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-20" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: count }, (_, i) => (
          <Skeleton key={i} className="h-6 rounded-full" style={{ width: `${60 + Math.random() * 40}px` }} />
        ))}
      </div>
    </div>
  );
}
