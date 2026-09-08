import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../../components/AdminLayout";
import {
  IoCalendarOutline,
  IoRefreshOutline,
  IoAlertOutline,
  IoBagOutline,
  IoTrendingUpOutline,
  IoArrowForwardOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoCashOutline,
  IoGiftOutline,
  IoPersonAddOutline,
  IoSearchOutline,
  IoCubeOutline,
  IoBarChartOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoEllipseOutline,
  IoFlameOutline,
  IoPeopleOutline,
} from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const peso = (n) =>
  "₱" + Number(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_STYLES = {
  pending:   { label: "Pending",   cls: "bg-yellow-100 text-yellow-700" },
  preparing: { label: "Preparing", cls: "bg-blue-100 text-blue-700" },
  ready:     { label: "Ready",     cls: "bg-purple-100 text-purple-700" },
  completed: { label: "Completed", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-500" },
};

function PctBadge({ pct }) {
  const up = pct >= 0;
  return (
    <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${up ? "bg-[#e8f5e2] text-[#4a6741]" : "bg-red-100 text-red-600"}`}>
      {up ? <IoArrowUpOutline className="text-[10px]" /> : <IoArrowDownOutline className="text-[10px]" />}
      {Math.abs(pct)}%
    </span>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/stats");
      setData(res.data);
      setLastRefreshed(new Date());
    } catch {
      // keep previous data on error
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const s = data?.stats ?? {};

  const statCards = [
    {
      label: "Transactions Today",
      value: loading ? "—" : s.transactionsToday ?? 0,
      icon: <IoBagOutline className="text-[#4a6741] text-2xl" />,
      iconBg: "bg-[#e8f5e2]",
      pct: s.transactionsPct ?? 0,
      note: "vs yesterday",
    },
    {
      label: "Revenue Today",
      value: loading ? "—" : peso(s.revenueToday),
      icon: <IoCashOutline className="text-[#4a6741] text-2xl" />,
      iconBg: "bg-[#dff0d6]",
      pct: s.revenuePct ?? 0,
      note: "vs yesterday",
    },
    {
      label: "Items Sold",
      value: loading ? "—" : s.itemsSoldToday ?? 0,
      icon: <IoTrendingUpOutline className="text-[#4a6741] text-2xl" />,
      iconBg: "bg-[#e8f5e2]",
      pct: s.itemsSoldPct ?? 0,
      note: "vs yesterday",
    },
    {
      label: "Active Orders",
      value: loading ? "—" : s.activeOrders ?? 0,
      valueColor: (s.activeOrders ?? 0) > 0 ? "text-blue-600" : "text-gray-800",
      icon: <IoFlameOutline className={`text-2xl ${(s.activeOrders ?? 0) > 0 ? "text-blue-500" : "text-[#4a6741]"}`} />,
      iconBg: (s.activeOrders ?? 0) > 0 ? "bg-blue-50" : "bg-[#e8f5e2]",
      sub: s.pendingOrders > 0 ? `${s.pendingOrders} pending` : "All clear",
      subColor: s.pendingOrders > 0 ? "text-yellow-600" : "text-gray-400",
    },
    {
      label: "Low Stock Items",
      value: loading ? "—" : (s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0),
      valueColor: (s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0) > 0 ? "text-red-600" : "text-gray-800",
      icon: <IoAlertOutline className={`text-2xl ${(s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0) > 0 ? "text-red-500" : "text-[#4a6741]"}`} />,
      iconBg: (s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0) > 0 ? "bg-red-50" : "bg-[#e8f5e2]",
      sub: s.outOfStockCount > 0 ? `${s.outOfStockCount} out of stock` : "No critical issues",
      subColor: s.outOfStockCount > 0 ? "text-red-500" : "text-gray-400",
    },
    {
      label: "Active Students",
      value: loading ? "—" : s.totalStudents ?? 0,
      icon: <IoPeopleOutline className="text-[#4a6741] text-2xl" />,
      iconBg: "bg-[#e8f5e2]",
      sub: "Registered accounts",
      subColor: "text-gray-400",
    },
  ];

  const quickActions = [
    { label: "Register Student & Employee", desc: "Add a new student or employee account",   icon: <IoPersonAddOutline className="text-[#4a6741] text-2xl" />, to: "/dashboard/register-student" },
    { label: "Student & Employee Lookup",   desc: "Search student and employee records",       icon: <IoSearchOutline className="text-[#4a6741] text-2xl" />,    to: "/dashboard/student-lookup", wip: true },
    { label: "Add Inventory",    desc: "Update stock levels",          icon: <IoCubeOutline className="text-[#4a6741] text-2xl" />,      to: "/dashboard/inventory" },
    { label: "Manage Rewards",   desc: "Update reward tiers",          icon: <IoGiftOutline className="text-[#4a6741] text-2xl" />,      to: "/dashboard/rewards" },
    { label: "View Analytics",   desc: "Sales and trend reports",      icon: <IoBarChartOutline className="text-[#4a6741] text-2xl" />,  to: "/dashboard/analytics", wip: true },
  ];

  return (
    <AdminLayout breadcrumb="Dashboard">
      <div className="space-y-6 max-w-[1200px]">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-[#4a6741] rounded-2xl px-6 py-6 text-white">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute right-24 bottom-[-30px] w-28 h-28 rounded-full bg-white/5" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="flex items-center gap-1.5 bg-white/15 text-white/90 text-xs font-medium px-3 py-1 rounded-full">
                  <IoCalendarOutline className="text-sm" />
                  {today}
                </span>
                <button
                  onClick={load}
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white/90 text-xs font-medium px-3 py-1 rounded-full transition disabled:opacity-60"
                >
                  <IoRefreshOutline className={`text-sm ${loading ? "animate-spin" : ""}`} />
                  {lastRefreshed ? `Updated ${fmt(lastRefreshed)}` : "Refresh"}
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                Welcome back, {user?.fullName?.split(" ")[0] ?? "Admin"}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                Here's what's happening in your cafeteria today.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate("/dashboard/orders")}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/20"
              >
                <IoFlameOutline className="text-base" />
                Live Orders
              </button>
              <button
                onClick={() => toast("Not yet implemented", { icon: "🚧" })}
                className="flex items-center gap-2 bg-white hover:bg-gray-100 transition text-[#4a6741] text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm"
              >
                Analytics
                <IoArrowForwardOutline className="text-base" />
              </button>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-500 font-medium leading-snug">{card.label}</p>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                  {card.icon}
                </div>
              </div>
              <p className={`text-3xl font-bold tracking-tight ${card.valueColor ?? "text-gray-800"}`}>
                {card.value}
              </p>
              <div className="flex items-center gap-2 text-xs">
                {card.pct !== undefined ? (
                  <>
                    <PctBadge pct={card.pct} />
                    <span className="text-gray-400">{card.note}</span>
                  </>
                ) : (
                  <span className={`text-xs font-medium ${card.subColor}`}>{card.sub}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Low Stock Alert Banner */}
        {(data?.lowStockItems?.length > 0) && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <IoAlertOutline className="text-red-500 text-lg" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-600">Low Stock Alert</p>
                  <p className="text-xs text-gray-500">{s.lowStockCount} low · {s.outOfStockCount} out of stock</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard/inventory")}
                className="flex-shrink-0 flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                Manage <IoArrowForwardOutline className="text-sm" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.lowStockItems.map((item) => (
                <span key={item._id} className={`text-xs font-semibold px-3 py-1 rounded-full ${item.quantity === 0 ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                  {item.name} — {item.quantity === 0 ? "Out of stock" : `${item.quantity} ${item.unit} left`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Grid: Recent Orders + Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#4a6741]">Recent Orders</h2>
              <button
                onClick={() => navigate("/dashboard/orders")}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#4a6741] hover:underline"
              >
                View All <IoArrowForwardOutline />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-7 h-7 border-4 border-[#4a6741] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !data?.recentOrders?.length ? (
              <div className="text-center py-10 text-gray-400 text-sm">No orders yet today.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentOrders.map((o) => {
                    const st = STATUS_STYLES[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-600" };
                    return (
                      <tr key={o._id} className="hover:bg-gray-50/60 transition">
                        <td className="px-5 py-3 font-mono text-xs text-gray-500">{o.orderNumber}</td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-gray-800 text-sm leading-tight">{o.studentName}</p>
                          <p className="text-xs text-gray-400">{o.schoolId}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-500">{o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0} item(s)</td>
                        <td className="px-5 py-3 font-bold text-gray-800">{peso(o.total)}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-400">{fmt(o.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Right Column: Quick Actions + Recent Redemptions */}
          <div className="flex flex-col gap-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-[#4a6741]">Quick Actions</h2>
              </div>
              <div className="p-3 flex flex-col gap-1">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => action.wip ? toast("Not yet implemented", { icon: "🚧" }) : navigate(action.to)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#f0f7ec] transition text-left group w-full"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#e8f5e2] flex items-center justify-center flex-shrink-0 group-hover:bg-[#d7ecc8] transition">
                      {action.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                      <p className="text-xs text-gray-400">{action.desc}</p>
                    </div>
                    <IoArrowForwardOutline className="ml-auto text-gray-300 group-hover:text-[#4a6741] transition" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Redemptions */}
            {data?.recentRedemptions?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-[#4a6741]">Recent Redemptions</h2>
                  <button
                    onClick={() => navigate("/dashboard/rewards")}
                    className="text-xs font-semibold text-[#4a6741] hover:underline"
                  >
                    View All
                  </button>
                </div>
                <ul className="divide-y divide-gray-50">
                  {data.recentRedemptions.map((r) => (
                    <li key={r._id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 rounded-xl bg-[#d7ecc8] flex items-center justify-center flex-shrink-0">
                        <IoGiftOutline className="text-[#4a6741] text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{r.rewardName}</p>
                        <p className="text-xs text-gray-400 truncate">{r.studentName} · {r.schoolId}</p>
                      </div>
                      <span className="text-xs font-bold text-[#4a6741] flex-shrink-0">−{r.pointsUsed} pts</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
