import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

import AdminWelcomeHeader from "../../components/admin/dashboard/AdminWelcomeHeader";
import AdminStatCards from "../../components/admin/dashboard/AdminStatCards";
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
    weekday: "long", month: "long", day: "numeric",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/stats");
      setData(res.data);
      setLastRefreshed(new Date());
    } catch {
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const s = data?.stats ?? {};

  return (
    <AdminLayout breadcrumb="Dashboard">
      <div className="space-y-6 max-w-[1200px]">
        <AdminWelcomeHeader
          user={user}
          today={today}
          loading={loading}
          lastRefreshed={lastRefreshed}
          onRefresh={load}
          navigate={navigate}
        />

        <AdminStatCards stats={s} loading={loading} />

        <AdminLowStockAlert
          lowStockItems={data?.lowStockItems}
          lowStockCount={s.lowStockCount}
          outOfStockCount={s.outOfStockCount}
          navigate={navigate}
        />

        {/* Full-width Table: Recent Orders */}
        <AdminRecentOrdersTable
          recentOrders={data?.recentOrders}
          loading={loading}
          navigate={navigate}
        />

        {/* Full-width Table: Campus Network & IP Telemetry */}
        <AdminNetworkTelemetryTable
          navigate={navigate}
        />

        {/* Bottom 2 Boxes: Quick Actions (left) & Recent Redemptions (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminQuickActions navigate={navigate} />

          <AdminRecentRedemptions
            recentRedemptions={data?.recentRedemptions}
            navigate={navigate}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
