import React from "react";

/**
 * Base primitive Skeleton component
 */
export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  style = {},
  ...props
}) {
  const baseClasses = "animate-pulse bg-gray-200/90 dark:bg-slate-700/60 transition-all duration-200";

  let variantClasses = "rounded-xl";
  if (variant === "text") variantClasses = "rounded-md h-4";
  if (variant === "circular") variantClasses = "rounded-full";
  if (variant === "badge") variantClasses = "rounded-full h-6";
  if (variant === "button") variantClasses = "rounded-xl h-10";

  const inlineStyles = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
}

/**
 * Page Header Skeleton
 */
export function SkeletonHeader({ className = "" }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="w-8 h-8 flex-shrink-0" />
          <Skeleton className="h-7 w-48 sm:w-64 rounded-xl" />
        </div>
        <Skeleton className="h-4 w-64 sm:w-80 rounded-lg ml-11" />
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Stat Cards Grid Skeleton (used in Dashboards, Orders, Inventory, Analytics, Rewards)
 */
export function SkeletonStats({ count = 4, columns = 4, className = "" }) {
  const colClass =
    columns === 5
      ? "grid-cols-2 lg:grid-cols-5"
      : columns === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${colClass} gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-700/60 p-5 shadow-sm space-y-3"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton variant="circular" className="w-9 h-9" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/**
 * Data Table Skeleton (used in Orders, Inventory, RegisterStudent, Audit Log, Staff Accounts, Feedbacks)
 */
export function SkeletonTable({
  rows = 5,
  columns = 6,
  showHeader = true,
  className = "",
}) {
  return (
    <div className={`bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-sm overflow-hidden ${className}`}>
      {showHeader && (
        <div className="px-5 py-4 bg-gray-50/80 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700/60 flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      )}

      {/* Table Header Columns */}
      <div className="px-5 py-3.5 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700/60 flex items-center justify-between gap-4">
        {Array.from({ length: columns }).map((_, cIdx) => (
          <Skeleton
            key={cIdx}
            className={`h-3.5 rounded-md ${
              cIdx === 0 ? "w-8" : cIdx === 1 ? "w-28" : "w-20"
            }`}
          />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-50 dark:divide-slate-700/50">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="px-5 py-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" className="w-5 h-5 flex-shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 sm:w-40 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-4 w-20 rounded-md hidden sm:block" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-md hidden md:block" />
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Card Grid Skeleton (used in Student Menu, Menu Management, Rewards Grid)
 */
export function SkeletonCardGrid({ count = 6, columns = 3, className = "" }) {
  const colClass =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${colClass} gap-5 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-sm overflow-hidden flex flex-col"
        >
          <Skeleton className="w-full h-44 rounded-none" />
          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-4/5 rounded-md" />
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * List View Skeleton (used in Orders list, Feedbacks list, Activity log, Recent orders)
 */
export function SkeletonList({ count = 4, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-700/60 p-4 shadow-sm flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
            <div className="space-y-1.5 min-w-0">
              <Skeleton className="h-4 w-40 sm:w-56 rounded-md" />
              <Skeleton className="h-3 w-28 sm:w-36 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Form / Profile Skeleton (used in Account settings, User profile, Edit dialogs)
 */
export function SkeletonForm({ fields = 4, className = "" }) {
  return (
    <div className={`bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-700/60 p-6 shadow-sm space-y-6 ${className}`}>
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-slate-700/60 pb-6">
        <Skeleton variant="circular" className="w-16 h-16 flex-shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded-lg" />
          <Skeleton className="h-3.5 w-32 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700/60">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Wide Banner / Widget Skeleton (used in Student Hero Banner, Live ETA Progress Tracker)
 */
export function SkeletonBanner({ className = "" }) {
  return (
    <div className={`bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-700/60 p-5 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="w-9 h-9" />
          <Skeleton className="h-5 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3.5 w-3/4 rounded-md" />
      <Skeleton className="h-4 w-full rounded-full" />
    </div>
  );
}

/**
 * Full Page Dashboard Composite Skeleton
 */
export function SkeletonDashboard({ className = "" }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <SkeletonHeader />
      <SkeletonStats count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonTable rows={5} columns={5} className="lg:col-span-2" />
        <SkeletonList count={4} className="lg:col-span-1" />
      </div>
    </div>
  );
}

/**
 * Master Reusable SkeletonLoader component dispatcher
 */
export default function SkeletonLoader({
  type = "table",
  rows = 5,
  columns = 4,
  count = 4,
  fields = 4,
  className = "",
  showHeader = true,
  ...props
}) {
  switch (type) {
    case "header":
      return <SkeletonHeader className={className} {...props} />;
    case "stats":
    case "stat-cards":
      return <SkeletonStats count={count} columns={columns} className={className} {...props} />;
    case "table":
      return (
        <SkeletonTable
          rows={rows}
          columns={columns}
          showHeader={showHeader}
          className={className}
          {...props}
        />
      );
    case "card-grid":
    case "menu":
    case "cards":
      return <SkeletonCardGrid count={count} columns={columns} className={className} {...props} />;
    case "list":
      return <SkeletonList count={count} className={className} {...props} />;
    case "form":
    case "profile":
      return <SkeletonForm fields={fields} className={className} {...props} />;
    case "banner":
      return <SkeletonBanner className={className} {...props} />;
    case "dashboard":
      return <SkeletonDashboard className={className} {...props} />;
    default:
      return <Skeleton className={className} {...props} />;
  }
}
