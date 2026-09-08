import { useState } from "react";
import {
  IoSparklesOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { formatCurrency } from "./AnalyticsConstants";

export default function PriceElasticitySimulatorModal({ isOpen, onClose, items }) {
  const [selectedItemId, setSelectedItemId] = useState(items[0]?._id || "");
  const [priceChangePct, setPriceChangePct] = useState(0);
  const [costChangePct, setCostChangePct] = useState(0);
  const [elasticity, setElasticity] = useState(-1.0);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i._id === selectedItemId) || items[0] || {
    name: "Sample Dish",
    price: 85,
    unitCost: 45,
    forecastDailyDemand: 25,
  };

  const basePrice = Number(currentItem.price) || 85;
  const baseCost = Number(currentItem.unitCost) > 0 ? Number(currentItem.unitCost) : Number((basePrice * 0.55).toFixed(2));
  const baseDemand = currentItem.forecastDailyDemand > 0 ? currentItem.forecastDailyDemand : 20;

  const baseDailyRevenue = basePrice * baseDemand;
  const baseDailyProfit = (basePrice - baseCost) * baseDemand;

  const simPrice = Math.max(1, basePrice * (1 + priceChangePct / 100));
  const simCost = Math.max(0, baseCost * (1 + costChangePct / 100));
  const demandChangePct = elasticity * priceChangePct;
  const simDemand = Math.max(0, baseDemand * (1 + demandChangePct / 100));

  const simDailyRevenue = simPrice * simDemand;
  const simDailyProfit = (simPrice - simCost) * simDemand;

  const profitDiff = simDailyProfit - baseDailyProfit;
  const profitDiffPct = baseDailyProfit > 0 ? (profitDiff / baseDailyProfit) * 100 : 0;
  const isProfitable = profitDiff >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col border border-gray-100 animate-student-page-fade-in">
        <div className="bg-gradient-to-r from-[#4a6741] to-[#3b5433] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IoSparklesOutline className="text-2xl text-amber-300" />
            <div>
              <h3 className="text-lg font-bold">Price Elasticity & Scenario Simulator</h3>
              <p className="text-xs text-white/80">Simulate price tweaks, cost changes, and forecasted profit shifts</p>
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
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Select Menu Item to Simulate
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#4a6741]"
            >
              {items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} ({item.category}) — {formatCurrency(item.price)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-700">Price Adjustment</span>
                <span className={`font-bold ${priceChangePct >= 0 ? "text-[#4a6741]" : "text-red-600"}`}>
                  {priceChangePct > 0 ? `+${priceChangePct}` : priceChangePct}%
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="50"
                step="5"
                value={priceChangePct}
                onChange={(e) => setPriceChangePct(Number(e.target.value))}
                className="w-full accent-[#4a6741] cursor-pointer"
              />
              <p className="text-[11px] text-gray-400">Simulated Price: <strong>{formatCurrency(simPrice)}</strong></p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-700">Ingredient Cost Shift</span>
                <span className={`font-bold ${costChangePct <= 0 ? "text-[#4a6741]" : "text-red-600"}`}>
                  {costChangePct > 0 ? `+${costChangePct}` : costChangePct}%
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="40"
                step="5"
                value={costChangePct}
                onChange={(e) => setCostChangePct(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-gray-400">Simulated Cost: <strong>{formatCurrency(simCost)}</strong></p>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-gray-700">Price Elasticity (Ed)</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setElasticity(-0.5)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${elasticity === -0.5 ? "bg-[#4a6741] text-white" : "text-gray-600"}`}
                  title="Inelastic (Demand changes less than price)"
                >
                  Inelastic
                </button>
                <button
                  onClick={() => setElasticity(-1.0)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${elasticity === -1.0 ? "bg-[#4a6741] text-white" : "text-gray-600"}`}
                  title="Unitary (1:1 responsiveness)"
                >
                  Unitary
                </button>
                <button
                  onClick={() => setElasticity(-1.5)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${elasticity === -1.5 ? "bg-[#4a6741] text-white" : "text-gray-600"}`}
                  title="Elastic (High price sensitivity)"
                >
                  Elastic
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Est. Volume Change: <strong className={demandChangePct >= 0 ? "text-[#4a6741]" : "text-red-600"}>{demandChangePct.toFixed(1)}%</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Baseline</p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Unit Price</span>
                <span className="font-semibold text-gray-800">{formatCurrency(basePrice)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Daily Demand</span>
                <span className="font-semibold text-gray-800">{baseDemand.toFixed(1)} units/day</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Daily Revenue</span>
                <span className="font-semibold text-gray-800">{formatCurrency(baseDailyRevenue)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold">
                <span className="text-gray-700">Daily Net Profit</span>
                <span className="text-gray-900">{formatCurrency(baseDailyProfit)}</span>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border space-y-3 ${isProfitable ? "bg-[#f5faf3] border-[#d4e8cc]" : "bg-red-50 border-red-100"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${isProfitable ? "text-[#4a6741]" : "text-red-700"}`}>
                Simulated Projection
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Simulated Price</span>
                <span className="font-semibold text-gray-800">{formatCurrency(simPrice)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Projected Demand</span>
                <span className="font-semibold text-gray-800">{simDemand.toFixed(1)} units/day</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Projected Revenue</span>
                <span className="font-semibold text-gray-800">{formatCurrency(simDailyRevenue)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200/60 flex justify-between text-sm font-bold">
                <span className="text-gray-800">Projected Daily Profit</span>
                <span className={isProfitable ? "text-[#4a6741]" : "text-red-700"}>{formatCurrency(simDailyProfit)}</span>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${isProfitable ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
            <IoCheckmarkCircleOutline className={`text-xl flex-shrink-0 mt-0.5 ${isProfitable ? "text-emerald-600" : "text-amber-600"}`} />
            <div>
              <p className="font-bold text-sm">
                {isProfitable ? `Profitable Scenario (+${profitDiffPct.toFixed(1)}% Profit Shift)` : `Caution: Profit Risk (${profitDiffPct.toFixed(1)}% Drop)`}
              </p>
              <p className="mt-1 leading-relaxed opacity-90">
                {isProfitable
                  ? `Adjusting price to ${formatCurrency(simPrice)} generates an estimated additional ${formatCurrency(profitDiff * 30)} in net monthly profit.`
                  : `Increasing cost or price elasticity reduces daily demand to ${simDemand.toFixed(1)} units, resulting in a net monthly loss of ${formatCurrency(Math.abs(profitDiff * 30))}.`}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#4a6741] text-white hover:bg-[#3d5535] transition cursor-pointer"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
