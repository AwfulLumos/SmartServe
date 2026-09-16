import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

import AdminWelcomeHeader from "../../components/admin/dashboard/AdminWelcomeHeader";
import AdminStatCards from "../../components/admin/dashboard/AdminStatCards";
import AdminHourlyRushChart from "../../components/admin/dashboard/AdminHourlyRushChart";
import AdminLowStockAlert from "../../components/admin/dashboard/AdminLowStockAlert";
import AdminRecentOrdersTable from "../../components/admin/dashboard/AdminRecentOrdersTable";
import AdminQuickActions from "../../components/admin/dashboard/AdminQuickActions";
import AdminRecentRedemptions from "../../components/admin/dashboard/AdminRecentRedemptions";
import AdminNetworkTelemetryTable from "../../components/admin/dashboard/AdminNetworkTelemetryTable";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/stats");
      setData(res.data);
      setLastRefreshed(new Date());
    } catch {
      // Handled silently or via interceptor
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const s = data?.stats ?? {};

  return (
    <AdminLayout breadcrumb="Dashboard">
      <div className="space-y-4 sm:space-y-6 max-w-[1240px] pb-10">
        {/* Hero Header with Live Clock & Shift Badge */}
        <AdminWelcomeHeader
          user={user}
          today={today}
          loading={loading}
          lastRefreshed={lastRefreshed}
          onRefresh={load}
          navigate={navigate}
        />

        {/* 6 Key Performance Indicator Cards with Sparklines */}
        <AdminStatCards stats={s} loading={loading} />

        {/* Inventory Stock Health & Critical Warning Bar */}
        <AdminLowStockAlert
          lowStockItems={data?.lowStockItems}
          outOfStockItems={data?.outOfStockItems}
          lowStockCount={s.lowStockCount}
          outOfStockCount={s.outOfStockCount}
          stockHealthPct={s.stockHealthPct}
          totalInventoryCount={s.totalInventoryCount}
          navigate={navigate}
        />

        {/* Interactive Hourly Rush & Volume Chart */}
        <AdminHourlyRushChart
          hourlyData={data?.hourlyDistribution}
          loading={loading}
        />

        {/* Filterable Recent Orders Table with Avatar Monograms & Live Status Tabs */}
        <AdminRecentOrdersTable
          recentOrders={data?.recentOrders}
          loading={loading}
          navigate={navigate}
        />

        {/* Operations Hub: Quick Actions & Recent Eco-Redemptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminQuickActions navigate={navigate} />

          <AdminRecentRedemptions
            recentRedemptions={data?.recentRedemptions}
            navigate={navigate}
          />
        </div>

        {/* Full-width Table: Campus Network & Device Telemetry */}
        <AdminNetworkTelemetryTable navigate={navigate} />
      </div>
    </AdminLayout>
  );
}
