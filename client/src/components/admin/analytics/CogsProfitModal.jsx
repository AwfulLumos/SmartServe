import { useState } from "react";
import {
  IoCalculatorOutline,
  IoCloseOutline,
  IoSearchOutline,
  IoPencilOutline,
} from "react-icons/io5";
import { formatCurrency, CustomFilterSelect } from "./AnalyticsConstants";

export default function CogsProfitModal({ isOpen, onClose, items, onSaveItemCost }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editCost, setEditCost] = useState("");

  if (!isOpen) return null;

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const hasDemandHistory = items.some((item) => (item.forecastDailyDemand || 0) > 0);

  const totals = items.reduce(
    (acc, item) => {
      const stock = item.currentStock || 0;
      const unitCost = item.price || item.unitCost || 0;
      const dailyDemand = item.forecastDailyDemand > 0 ? item.forecastDailyDemand : (hasDemandHistory ? 0 : 1);

      acc.totalStockValue += stock * unitCost;
      acc.total30DayCogs += dailyDemand * unitCost * 30;
      acc.sumUnitCost += unitCost;
      return acc;
    },
    { totalStockValue: 0, total30DayCogs: 0, sumUnitCost: 0 }
  );

  const avgUnitCost = items.length > 0 ? totals.sumUnitCost / items.length : 0;

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditCost(item.price ?? item.unitCost ?? 0);
  };

  const saveEdit = (item) => {
    const val = Number(editCost);
    if (!Number.isNaN(val) && val >= 0) {
      onSaveItemCost(item, val);
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[85vh] flex flex-col border border-gray-100 animate-student-page-fade-in">
        <div className="bg-[#4a6741] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IoCalculatorOutline className="text-2xl" />
            <div>
              <h3 className="text-lg font-bold">COGS & Ingredient Cost Tracking</h3>
              <p className="text-xs text-white/80">Raw ingredient purchase costs, current inventory value & monthly COGS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition text-white cursor-pointer"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[#f5faf3] p-4 rounded-2xl border border-[#d4e8cc]">
              <p className="text-xs text-gray-500 font-medium">Total Inventory Value</p>
              <p className="text-xl font-bold text-[#4a6741] mt-1">{formatCurrency(totals.totalStockValue)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Current on-hand stock value</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <p className="text-xs text-amber-700 font-medium">Est. 30-Day COGS</p>
              <p className="text-xl font-bold text-amber-900 mt-1">{formatCurrency(totals.total30DayCogs)}</p>
              <p className="text-[10px] text-amber-600/70 mt-0.5">{hasDemandHistory ? "Based on usage forecast" : "Baseline (1 unit/day sample)"}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium">Avg Ingredient Unit Cost</p>
              <p className="text-xl font-bold text-emerald-900 mt-1">{formatCurrency(avgUnitCost)}</p>
              <p className="text-[10px] text-emerald-600/70 mt-0.5">Average raw ingredient cost</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-700 font-medium">Total Tracked Items</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{items.length} items</p>
              <p className="text-[10px] text-blue-600/70 mt-0.5">Raw ingredients in database</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div className="relative flex-grow">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#4a6741]"
              />
            </div>
            <div className="flex items-center gap-2">
              <CustomFilterSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={categories.map((c) => ({
                  value: c,
                  label: c === "all" ? "All Categories" : c,
                }))}
              />
            </div>
          </div>

          <div className="border border-gray-100 rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full min-w-[720px] table-fixed divide-y divide-gray-100">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-100">
                <tr>
                  <th className="w-[20%] px-3 py-3.5 text-left">Ingredient Item</th>
                  <th className="w-[17%] px-3 py-3.5 text-left">Unit Cost (Price)</th>
                  <th className="w-[15%] px-3 py-3.5 text-left">Current Stock</th>
                  <th className="w-[17%] px-3 py-3.5 text-left">Total Stock Value</th>
                  <th className="w-[16%] px-3 py-3.5 text-left">Est. 30-Day COGS</th>
                  <th className="w-[15%] px-3 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredItems.map((item) => {
                  const unitCost = item.price || item.unitCost || 0;
                  const stock = item.currentStock || 0;
                  const stockValue = stock * unitCost;
                  const dailyDemand = item.forecastDailyDemand > 0 ? item.forecastDailyDemand : (hasDemandHistory ? 0 : 1);
                  const cogs30Days = dailyDemand * unitCost * 30;

                  const isEditing = editingId === item._id;

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition">
                      <td className="px-3 py-3 align-middle text-left">
                        <p className="font-semibold text-gray-800 truncate" title={item.name}>{item.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{item.category}</p>
                      </td>
                      <td className="px-3 py-3 text-left font-medium text-amber-900 align-middle">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editCost}
                            onChange={(e) => setEditCost(e.target.value)}
                            className="w-20 px-2 py-1 text-left border border-[#4a6741] rounded-lg text-xs font-semibold focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          formatCurrency(unitCost)
                        )}
                      </td>
                      <td className="px-3 py-3 text-left font-medium text-gray-800 align-middle">
                        {stock} <span className="text-gray-400 text-[11px]">{item.unit || "pcs"}</span>
                      </td>
                      <td className="px-3 py-3 text-left font-semibold text-[#4a6741] align-middle">
                        {formatCurrency(stockValue)}
                      </td>
                      <td className="px-3 py-3 text-left font-semibold text-gray-700 align-middle">
                        {formatCurrency(cogs30Days)}
                      </td>
                      <td className="px-3 py-3 text-right align-middle">
                        {isEditing ? (
                          <button
                            onClick={() => saveEdit(item)}
                            className="px-3 py-1.5 rounded-lg text-xs bg-[#4a6741] text-white font-semibold hover:bg-[#3d5535] transition shadow-sm whitespace-nowrap cursor-pointer"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(item)}
                            className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                          >
                            <IoPencilOutline className="text-sm" />
                            <span>Edit Cost</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">Unit costs update directly in your inventory database.</p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#4a6741] text-white hover:bg-[#3d5535] transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
