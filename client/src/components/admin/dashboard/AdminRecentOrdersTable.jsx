import { useState, useMemo } from "react";
import {
  IoArrowForwardOutline,
  IoBagOutline,
  IoReceiptOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { SkeletonTable } from "../../SkeletonLoader";

const fmtTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const getRelativeTime = (date) => {
  if (!date) return "—";
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const peso = (n) =>
  "₱" + Number(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/80 dark:border-amber-800",
    dot: "bg-amber-500 animate-pulse",
  },
  preparing: {
    label: "Preparing",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/80 dark:border-blue-800",
    dot: "bg-blue-500 animate-pulse",
  },
  ready: {
    label: "Ready",
    badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/80 dark:border-purple-800",
    dot: "bg-purple-500",
  },
  completed: {
    label: "Completed",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300 border-red-200/80 dark:border-red-800",
    dot: "bg-red-400",
  },
};

const getInitials = (name = "") => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function AdminRecentOrdersTable({ recentOrders = [], loading, navigate }) {
  const [activeTab, setActiveTab] = useState("all");

  const counts = useMemo(() => {
    const res = { all: recentOrders.length, pending: 0, preparing: 0, ready: 0, completed: 0 };
    recentOrders.forEach((o) => {
      if (res[o.status] !== undefined) res[o.status] += 1;
    });
    return res;
  }, [recentOrders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return recentOrders;
    return recentOrders.filter((o) => o.status === activeTab);
  }, [recentOrders, activeTab]);

  const tabs = [
    { id: "all", label: "All Orders", count: counts.all },
    { id: "pending", label: "Pending", count: counts.pending, dot: "bg-amber-500" },
    { id: "preparing", label: "Preparing", count: counts.preparing, dot: "bg-blue-500" },
    { id: "ready", label: "Ready", count: counts.ready, dot: "bg-purple-500" },
    { id: "completed", label: "Completed", count: counts.completed, dot: "bg-emerald-500" },
  ];

  return (
    <div className="bg-white dark:bg-[#1a2416] rounded-2xl border border-gray-100 dark:border-[#2b3924] shadow-sm overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-[#2b3924] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#e8f5e2] dark:bg-[#24301f] flex items-center justify-center text-[#4a6741] dark:text-[#8ebd7e]">
            <IoReceiptOutline className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-800 dark:text-white">Recent Orders</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#24301f] text-gray-600 dark:text-gray-300">
                {recentOrders.length} Latest
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-400">
              Live cafeteria order stream and student fulfillment status
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard/orders")}
          className="flex items-center gap-1.5 text-xs font-bold text-[#4a6741] dark:text-[#8ebd7e] hover:underline self-start sm:self-auto cursor-pointer"
        >
          View Full Order Board <IoArrowForwardOutline />
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="relative">
        <div className="px-4 sm:px-5 py-2.5 bg-gray-50/70 dark:bg-[#151e12] border-b border-gray-100 dark:border-[#2b3924] flex items-center gap-2 overflow-x-auto scrollbar-hide overscroll-x-contain touch-pan-x">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${isActive
                  ? "bg-white dark:bg-[#24301f] text-[#4a6741] dark:text-[#8ebd7e] shadow-xs border border-gray-200/80 dark:border-[#2b3924]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
              >
                {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive
                    ? "bg-[#e8f5e2] text-[#4a6741] dark:bg-[#1a2416] dark:text-[#8ebd7e]"
                    : "bg-gray-200/70 dark:bg-[#202b1b] text-gray-600 dark:text-gray-400"
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-4">
          <SkeletonTable rows={5} columns={6} showHeader={false} />
        </div>
      ) : !filteredOrders?.length ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-gray-400 gap-2 px-4 text-center">
          <IoBagOutline className="text-3xl sm:text-4xl text-gray-300 dark:text-gray-600" />
          <p className="text-xs sm:text-sm font-medium">No orders found in "{activeTab}" filter.</p>
          <button
            onClick={() => setActiveTab("all")}
            className="text-xs text-[#4a6741] dark:text-[#8ebd7e] font-semibold hover:underline"
          >
            Reset to All Orders
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Card List (md:hidden) - Effortless one-thumb viewing without horizontal scrolling */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-[#24301f]">
            {filteredOrders.map((o) => {
              const cfg = STATUS_CONFIG[o.status] ?? {
                label: o.status,
                badge: "bg-gray-100 text-gray-600 dark:bg-[#24301f] dark:text-gray-400 border-gray-200",
                dot: "bg-gray-400",
              };
              const totalItemsCount = o.items?.reduce((s, i) => s + (i.quantity || 1), 0) ?? 0;

              return (
                <div
                  key={`m-${o._id}`}
                  onClick={() => navigate("/dashboard/orders")}
                  className="p-3.5 hover:bg-[#f8fbf6] dark:hover:bg-[#202b1b] active:bg-gray-50 dark:active:bg-[#222f1c] transition-colors cursor-pointer space-y-2"
                >
                  {/* Row 1: Order # + Relative time + Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#4a6741] dark:text-[#8ebd7e]">
                        #{o.orderNumber}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        · {getRelativeTime(o.createdAt)}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Row 2: Student Avatar, Name, and Total */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#e8f5e2] dark:bg-[#24301f] text-[#4a6741] dark:text-[#8ebd7e] font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                      {getInitials(o.studentName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 dark:text-white text-xs truncate">
                        {o.studentName || "Guest Student"}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono truncate">
                        {o.schoolId || "—"}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                      {peso(o.total)}
                    </span>
                  </div>

                  {/* Row 3: Items snippet & Clock */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-0.5 border-t border-gray-50 dark:border-[#24301f]/60">
                    <span className="truncate pr-2">
                      {totalItemsCount} item{totalItemsCount !== 1 ? "s" : ""}
                      {o.items?.[0]?.name ? ` (${o.items[0].name}${o.items.length > 1 ? ` +${o.items.length - 1}` : ""})` : ""}
                    </span>
                    <span className="text-gray-400 text-[10px] font-mono flex-shrink-0">
                      {fmtTime(o.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Table (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-[#151e12] border-b border-gray-100 dark:border-[#2b3924] text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Items Summary</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#24301f]">
                {filteredOrders.map((o) => {
                  const cfg = STATUS_CONFIG[o.status] ?? {
                    label: o.status,
                    badge: "bg-gray-100 text-gray-600 dark:bg-[#24301f] dark:text-gray-400 border-gray-200",
                    dot: "bg-gray-400",
                  };
                  const totalItemsCount = o.items?.reduce((s, i) => s + (i.quantity || 1), 0) ?? 0;

                  return (
                    <tr
                      key={o._id}
                      onClick={() => navigate("/dashboard/orders")}
                      className="hover:bg-[#f8fbf6] dark:hover:bg-[#202b1b] transition-colors cursor-pointer group"
                    >
                      {/* Order Number */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#4a6741] dark:text-[#8ebd7e] group-hover:underline">
                            #{o.orderNumber}
                          </span>
                        </div>
                      </td>

                      {/* Student Name & Initials */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#e8f5e2] dark:bg-[#24301f] text-[#4a6741] dark:text-[#8ebd7e] font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {getInitials(o.studentName)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white text-xs leading-tight">
                              {o.studentName || "Guest Student"}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono">
                              {o.schoolId || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {totalItemsCount} item{totalItemsCount !== 1 ? "s" : ""}
                          </span>
                          {o.items?.[0]?.name && (
                            <span className="text-[11px] text-gray-400 truncate max-w-[140px] hidden md:inline">
                              ({o.items[0].name}{o.items.length > 1 ? ` +${o.items.length - 1}` : ""})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                          {peso(o.total)}
                        </span>
                      </td>

                      {/* Status Pill with dot */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <IoTimeOutline className="text-gray-400 text-xs" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {getRelativeTime(o.createdAt)}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">
                            ({fmtTime(o.createdAt)})
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
