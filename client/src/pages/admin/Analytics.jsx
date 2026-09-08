import { useEffect, useMemo, useState } from "react";
import {
  IoTrendingUpOutline,
  IoStorefrontOutline,
  IoArrowUpOutline,
  IoWarningOutline,
} from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";

import { formatCurrency, compareChange } from "../../components/admin/analytics/AnalyticsConstants";
import MetricCard from "../../components/admin/analytics/MetricCard";
import AnalyticsHeader from "../../components/admin/analytics/AnalyticsHeader";
import AnalyticsChart from "../../components/admin/analytics/AnalyticsChart";
import TopDishesAndCategories from "../../components/admin/analytics/TopDishesAndCategories";
import RestockTable from "../../components/admin/analytics/RestockTable";
import ExportReportModal from "../../components/admin/analytics/ExportReportModal";
import CogsProfitModal from "../../components/admin/analytics/CogsProfitModal";
import PriceElasticitySimulatorModal from "../../components/admin/analytics/PriceElasticitySimulatorModal";
import AnalyticsGuideModal from "../../components/admin/analytics/AnalyticsGuideModal";
import AnalyticsNotesAndSnapshots from "../../components/admin/analytics/AnalyticsNotesAndSnapshots";

export default function Analytics() {
  const [granularity, setGranularity] = useState("day");
  const [method, setMethod] = useState("holt");
  const [reloadKey, setReloadKey] = useState(0);
  const [restock, setRestock] = useState({ items: [], meta: {}, loading: true });
  const [income, setIncome] = useState({ historicalSeries: [], forecastSeries: [], summary: {}, meta: {}, loading: true });
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCogsModal, setShowCogsModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);

  const handleSaveItemCost = async (item, newCost) => {
    try {
      await api.put(`/inventory/${item._id}`, {
        name: item.name,
        category: item.category,
        quantity: item.currentStock,
        unit: item.unit,
        minThreshold: item.minThreshold,
        price: newCost,
        unitCost: newCost,
      });
      setReloadKey((k) => k + 1);
    } catch {
      setRestock((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i._id === item._id ? { ...i, price: newCost, unitCost: newCost } : i)),
      }));
    }
  };

  const params = useMemo(() => {
    const base = { granularity, method };
    if (granularity === "day") {
      return {
        restock: { ...base, lookaheadDays: 7, safetyStockDays: 3, historyDays: 90 },
        income: { ...base, forecastPeriods: 14, historyDays: 90 },
      };
    }
    if (granularity === "week") {
      return {
        restock: { ...base, lookaheadDays: 7, safetyStockDays: 3, historyDays: 180 },
        income: { ...base, forecastPeriods: 4, historyDays: 180 },
      };
    }
    return {
      restock: { ...base, lookaheadDays: 30, safetyStockDays: 7, historyDays: 365 },
      income: { ...base, forecastPeriods: 3, historyDays: 365 },
    };
  }, [granularity, method]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError("");
      setRestock((prev) => ({ ...prev, loading: true }));
      setIncome((prev) => ({ ...prev, loading: true }));
      try {
        const [restockRes, incomeRes] = await Promise.all([
          api.get("/forecast/restock", { params: params.restock }),
          api.get("/forecast/income", { params: params.income }),
        ]);

        if (cancelled) return;
        setRestock({ ...restockRes.data, loading: false });
        setIncome({ ...incomeRes.data, loading: false });
      } catch {
        if (cancelled) return;
        setError("Forecast data is unavailable right now.");
        setRestock((prev) => ({ ...prev, loading: false }));
        setIncome((prev) => ({ ...prev, loading: false }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, [params, reloadKey]);

  const incomeSummary = income.summary || {};
  const restockItems = restock.items || [];
  const urgentCount = restockItems.filter(
    (item) => (item.daysUntilStockout != null && item.daysUntilStockout <= 7) || item.currentStock <= item.minThreshold
  ).length;

  return (
    <AdminLayout breadcrumb="Analytics">
      <div className="space-y-6 max-w-[1280px]">
        {/* Header Section */}
        <AnalyticsHeader
          granularity={granularity}
          setGranularity={setGranularity}
          method={method}
          setMethod={setMethod}
          setReloadKey={setReloadKey}
          restockLoading={restock.loading}
          incomeLoading={income.loading}
          setShowGuide={setShowGuide}
          setShowExportModal={setShowExportModal}
          setShowCogsModal={setShowCogsModal}
          setShowSimulatorModal={setShowSimulatorModal}
        />

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Key Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="Projected Income"
            value={income.loading ? "—" : formatCurrency(incomeSummary.nextPeriodForecast)}
            note="Next forecast window"
            icon={<IoTrendingUpOutline className="text-[#4a6741] text-2xl" />}
            tone="green"
          />
          <MetricCard
            label="Previous Period"
            value={income.loading ? "—" : formatCurrency(incomeSummary.previousPeriodActual)}
            note="Actual revenue from the prior window"
            icon={<IoStorefrontOutline className="text-[#4a6741] text-2xl" />}
            tone="blue"
          />
          <MetricCard
            label="Expected Change"
            value={income.loading ? "—" : compareChange(incomeSummary.changePct)}
            note="Forecast vs previous actuals"
            icon={<IoArrowUpOutline className="text-[#4a6741] text-2xl" />}
            tone="amber"
          />
          <MetricCard
            label="Urgent Restocks"
            value={restock.loading ? "—" : urgentCount}
            note="Items at or below 7 days of demand"
            icon={<IoWarningOutline className="text-red-600 text-2xl" />}
            tone="red"
          />
        </div>

        {/* Main Analytics Content */}
        <div className="grid grid-cols-1 gap-6">
          <AnalyticsChart
            title="Projected Income Trend"
            loading={income.loading}
            historical={income.historicalSeries || []}
            forecast={income.forecastSeries || []}
            method={method}
          />

          <TopDishesAndCategories
            topDishes={income.topDishes || []}
            categoryBreakdown={income.categoryBreakdown || []}
            loading={income.loading}
          />

          <AnalyticsNotesAndSnapshots
            granularity={granularity}
            method={method}
            income={income}
            restock={restock}
            urgentCount={urgentCount}
            restockItemsCount={restockItems.length}
            incomeSummary={incomeSummary}
          />

          <RestockTable items={restockItems} loading={restock.loading} />
        </div>
      </div>

      {/* Modals */}
      <AnalyticsGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />

      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        income={income}
        restockItems={restockItems}
        granularity={granularity}
        method={method}
      />

      <CogsProfitModal
        isOpen={showCogsModal}
        onClose={() => setShowCogsModal(false)}
        items={restockItems}
        onSaveItemCost={handleSaveItemCost}
      />

      <PriceElasticitySimulatorModal
        isOpen={showSimulatorModal}
        onClose={() => setShowSimulatorModal(false)}
        items={restockItems}
      />
    </AdminLayout>
  );
}