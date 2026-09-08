import { useState, useMemo } from "react";
import { IoDownloadOutline, IoSearchOutline } from "react-icons/io5";
import { SkeletonTable } from "../../SkeletonLoader";
import { formatDays, CustomFilterSelect } from "./AnalyticsConstants";

export default function RestockTable({ items, loading = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const name = item.name || "";
      const category = item.category || "";
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, categoryFilter]);

  const exportToCSV = () => {
    const headers = [
      "Item Name",
      "Category",
      "Current Stock",
      "Unit",
      "Forecast Daily Demand",
      "Days Until Stockout",
      "Min Threshold",
      "Recommended Reorder Qty",
    ];
    const rows = items.map((item) => [
      item.name,
      item.category,
      item.currentStock,
      item.unit,
      item.forecastDailyDemand,
      item.daysUntilStockout ?? "N/A",
      item.minThreshold,
      item.recommendedReorderQty,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Restock_Predictions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-4">
          <div className="h-5 w-44 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-3 w-64 bg-gray-100 rounded animate-pulse" />
        </div>
        <SkeletonTable rows={6} columns={5} showHeader={true} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-sm text-gray-400">
        Not enough data yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table Header Section */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Restock Predictions</h3>
          <p className="text-xs text-gray-400 mt-0.5">Sorted by urgency and safety threshold</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#e8f5e2] text-[#4a6741] hover:bg-[#d8e8d0] transition flex items-center gap-1.5 cursor-pointer"
          >
            <IoDownloadOutline className="text-sm" />
            Export CSV
          </button>
          <span className="text-xs font-semibold text-[#4a6741] bg-[#e8f5e2] px-3 py-1.5 rounded-full">
            {filteredItems.length} of {items.length} items
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-grow">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search items by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#4a6741] focus:ring-1 focus:ring-[#4a6741] placeholder-gray-400 text-gray-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <CustomFilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories.map((cat) => ({
              value: cat,
              label: cat === "all" ? "All Categories" : cat,
            }))}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3 font-semibold">Item</th>
              <th className="px-5 py-3 font-semibold">Current Stock</th>
              <th className="px-5 py-3 font-semibold">Forecast Daily Demand</th>
              <th className="px-5 py-3 font-semibold">Urgency / Stockout</th>
              <th className="px-5 py-3 font-semibold">Recommended Reorder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.map((item) => {
              const isBelowThreshold = item.currentStock <= item.minThreshold;
              const isOutOfStock = item.currentStock === 0;
              const isCritical = item.daysUntilStockout != null && item.daysUntilStockout <= 3;
              const isWarning =
                (item.daysUntilStockout != null && item.daysUntilStockout <= 7) || isBelowThreshold;

              let rowClass = "bg-white";
              let badgeClass = "bg-gray-100 text-gray-600";
              let badgeText = formatDays(item.daysUntilStockout);

              if (isOutOfStock) {
                rowClass = "bg-red-50/60";
                badgeClass = "bg-red-100 text-red-700 font-semibold";
                badgeText = "Out of Stock";
              } else if (isCritical) {
                rowClass = "bg-red-50/40";
                badgeClass = "bg-red-100 text-red-700 font-semibold";
                badgeText = `Critical (${item.daysUntilStockout} days)`;
              } else if (isBelowThreshold) {
                rowClass = "bg-amber-50/30";
                badgeClass = "bg-amber-100 text-amber-800 font-semibold";
                badgeText = `Low Stock (${item.daysUntilStockout != null ? item.daysUntilStockout + " days" : "No Active Demand"})`;
              } else if (isWarning) {
                rowClass = "bg-amber-50/20";
                badgeClass = "bg-amber-100 text-amber-800 font-semibold";
                badgeText = `Warning (${item.daysUntilStockout} days)`;
              } else {
                badgeClass = "bg-green-100 text-green-800";
                badgeText = `Stable (${item.daysUntilStockout != null ? item.daysUntilStockout + " days" : "N/A"})`;
              }

              return (
                <tr key={item._id} className={rowClass}>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-800">{item.name}</span>
                      <span className="text-xs text-gray-400">{item.category}</span>
                      {item.insufficientHistory && (
                        <span className="text-[11px] font-semibold text-amber-700">Limited history</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 font-medium">
                    <div className="flex flex-col">
                      <span>
                        {item.currentStock} {item.unit}
                      </span>
                      <span className="text-xs text-gray-400 font-normal">
                        Threshold: {item.minThreshold} {item.unit}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 font-medium">
                    {item.forecastDailyDemand.toFixed(2)} / day
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#4a6741]">
                    {item.recommendedReorderQty} {item.unit}
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-sm text-gray-400">
                  No inventory items match your search/filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
