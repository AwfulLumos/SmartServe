import { formatCurrency } from "./AnalyticsConstants";

export default function TopDishesAndCategories({ topDishes = [], categoryBreakdown = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 bg-gray-100 rounded-xl animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const maxDishRevenue = topDishes.length ? Math.max(...topDishes.map((d) => d.totalRevenue), 1) : 1;

  const categoryColors = [
    "bg-[#4a6741]",
    "bg-amber-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-emerald-500",
    "bg-rose-500",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 5 Best Selling Dishes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                Top 5 Best-Selling Dishes
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Highest revenue-generating items in this period</p>
            </div>
            <span className="text-xs font-semibold text-[#4a6741] bg-[#e8f5e2] px-3 py-1 rounded-full">
              {topDishes.length} Items
            </span>
          </div>

          {!topDishes.length ? (
            <p className="text-sm text-gray-400 py-8 text-center">No dish sales data available for this range.</p>
          ) : (
            <div className="space-y-3.5">
              {topDishes.map((dish, rank) => {
                const pct = Math.round((dish.totalRevenue / maxDishRevenue) * 100);
                return (
                  <div key={dish.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0 ${
                          rank === 0 ? "bg-amber-500" : rank === 1 ? "bg-gray-400" : rank === 2 ? "bg-amber-700" : "bg-gray-300 text-gray-700"
                        }`}>
                          #{rank + 1}
                        </span>
                        <span className="font-bold text-gray-800 truncate">{dish.name}</span>
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md hidden sm:inline-block">
                          {dish.category}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-[#4a6741]">{formatCurrency(dish.totalRevenue)}</span>
                        <span className="text-[11px] text-gray-400 font-normal ml-2">({dish.totalQty} sold)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#4a6741] to-[#8ebd7e] h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Category Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                Revenue by Category
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Share of total menu sales by category</p>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              {categoryBreakdown.length} Categories
            </span>
          </div>

          {!categoryBreakdown.length ? (
            <p className="text-sm text-gray-400 py-8 text-center">No category breakdown data available.</p>
          ) : (
            <div className="space-y-4">
              {/* Stacked Progress Bar */}
              <div className="w-full bg-gray-100 h-4 rounded-xl overflow-hidden flex shadow-inner">
                {categoryBreakdown.map((cat, idx) => (
                  <div
                    key={cat.category}
                    className={`h-full ${categoryColors[idx % categoryColors.length]} transition-all duration-500`}
                    style={{ width: `${cat.percentage}%` }}
                    title={`${cat.category}: ${cat.percentage}% (${formatCurrency(cat.revenue)})`}
                  />
                ))}
              </div>

              {/* Category Legend list */}
              <div className="space-y-2.5 pt-1">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${categoryColors[idx % categoryColors.length]}`} />
                      <span className="font-semibold text-gray-700">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">{cat.percentage}%</span>
                      <span className="text-gray-400 font-mono text-[11px] w-20 text-right">{formatCurrency(cat.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
