import {
  IoHelpCircleOutline,
  IoCloseOutline,
  IoStorefrontOutline,
  IoBarChartOutline,
  IoWarningOutline,
  IoTrendingUpOutline,
  IoDownloadOutline,
  IoCalculatorOutline,
  IoSparklesOutline,
} from "react-icons/io5";

export default function AnalyticsGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col border border-gray-100">
        {/* Modal Header */}
        <div className="bg-[#4a6741] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IoHelpCircleOutline className="text-2xl" />
            <div>
              <h3 className="text-lg font-bold">Analytics & Forecasting Guide</h3>
              <p className="text-xs text-white/80">How the canteen predicts sales and restock recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition text-white cursor-pointer"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-gray-600">
          {/* Section 1 — Reading the Chart */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
              Reading the Chart
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <span className="w-8 h-[3px] bg-[#4a6741] rounded-full mt-2 flex-shrink-0" />
                <span><strong className="text-gray-700">Green line</strong> — Past sales. This is what actually happened.</span>
              </div>
              <div className="flex items-start gap-3 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
                <span className="w-8 h-[3px] bg-amber-400 rounded-full mt-2 flex-shrink-0" style={{ backgroundImage: "repeating-linear-gradient(90deg,#f59e0b 0,#f59e0b 5px,transparent 5px,transparent 9px)" }} />
                <span><strong className="text-gray-700">Amber dashed line + shaded area</strong> — The prediction for future sales.</span>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <span className="flex-shrink-0 mt-0.5 w-4 flex justify-center">
                  <span className="w-[2px] h-4 border-l-2 border-dashed border-amber-400 inline-block" />
                </span>
                <span><strong className="text-gray-700">Vertical dashed line</strong> — Where history ends. Left = real. Right = forecast.</span>
              </div>
              <div className="flex items-start gap-3 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
                <span className="flex-shrink-0 mt-0.5">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-white" style={{ fontSize: "8px", fontWeight: 800 }}>₱</span>
                </span>
                <span><strong className="text-gray-700">Yellow bubbles on the chart</strong> — The predicted income for each future date (e.g. ₱12.5K).</span>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <span className="flex-shrink-0 mt-0.5">
                  <span className="inline-block px-1.5 py-0.5 rounded-full bg-amber-100 border border-amber-200" style={{ fontSize: "7px", fontWeight: 700, color: "#92400e", letterSpacing: "0.04em" }}>PILL</span>
                </span>
                <span><strong className="text-gray-700">Amber pill badges</strong> below the chart title — A quick list of all forecast periods and amounts.</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2 — Forecast Methods */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
              Holt vs Linear — Which should I use?
            </h4>
            <p className="text-xs text-gray-400 mb-3">Switch between them using the buttons at the top of the page.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#f5faf3] rounded-2xl p-4 border border-[#d4e8cc]">
                <p className="font-bold text-[#4a6741] text-xs mb-1.5 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#4a6741] inline-block flex-shrink-0" />Holt (Recommended)</p>
                <p className="text-xs leading-relaxed text-gray-600">
                  Looks at both <strong>recent sales</strong> and whether sales are going <strong>up or down</strong>. Smooths out random busy days so predictions stay steady.
                </p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <p className="font-bold text-amber-700 text-xs mb-1.5 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block flex-shrink-0" />Linear</p>
                <p className="text-xs leading-relaxed text-gray-600">
                  Draws a simple straight line based on past sales. Easy to understand, but one unusually busy day can throw it off.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3 — Restock Table */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
              Restock Table — What do the columns mean?
            </h4>
            <p className="text-xs text-gray-400 mb-3">Sorted from most urgent to least. Act on red items first.</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <IoStorefrontOutline className="text-gray-400 text-base flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-700">Current Stock</strong> — How many units are left, and the minimum safe level (threshold).</span>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <IoBarChartOutline className="text-gray-400 text-base flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-700">Forecast Daily Demand</strong> — Estimated units sold per day, based on past orders.</span>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <IoWarningOutline className="text-gray-400 text-base flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-700">Urgency / Stockout</strong> — How many days of stock remain at the current demand rate.</span>
              </div>
              <div className="flex items-start gap-3 bg-[#f5faf3] rounded-xl px-3 py-2.5 border border-[#d4e8cc]">
                <IoTrendingUpOutline className="text-[#4a6741] text-base flex-shrink-0 mt-0.5" />
                <span><strong className="text-[#4a6741]">Recommended Reorder</strong> — How much to buy to cover upcoming demand plus a safety buffer.</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 4 — Stock Badges */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
              Stock Status Badges
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-3 text-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mb-1" />
                <p className="font-bold text-xs">Out of Stock</p>
                <p className="text-[10px] text-red-500 mt-0.5">Zero left</p>
              </div>
              <div className="bg-red-50/60 text-red-700 border border-red-100/60 rounded-xl p-3 text-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-400 mb-1" />
                <p className="font-bold text-xs">Critical</p>
                <p className="text-[10px] text-red-500 mt-0.5">3 days or less</p>
              </div>
              <div className="bg-amber-50 text-amber-800 border border-amber-100 rounded-xl p-3 text-center">
                <span className="inline-block w-3 h-3 rounded-full bg-amber-400 mb-1" />
                <p className="font-bold text-xs">Low Stock</p>
                <p className="text-[10px] text-amber-700 mt-0.5">Below threshold</p>
              </div>
              <div className="bg-amber-50/50 text-amber-800 border border-amber-100/50 rounded-xl p-3 text-center">
                <span className="inline-block w-3 h-3 rounded-full bg-amber-300 mb-1" />
                <p className="font-bold text-xs">Warning</p>
                <p className="text-[10px] text-amber-700 mt-0.5">7 days or less</p>
              </div>
              <div className="bg-green-50 text-green-800 border border-green-100 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mb-1" />
                <p className="font-bold text-xs">Stable</p>
                <p className="text-[10px] text-green-700 mt-0.5">No action needed</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 5 — Advanced Analytics Header Tools */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
              Advanced Analytics Tools
            </h4>
            <p className="text-xs text-gray-400 mb-3">Access these tools from the upper-right header action buttons.</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <IoDownloadOutline className="text-[#4a6741] text-base flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-700">Export CSV</strong> — Instantly download raw spreadsheets for restock predictions (stock levels, reorder quantities, unit costs) or revenue forecasts.</span>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <IoCalculatorOutline className="text-[#4a6741] text-base flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-700">COGS & Profit Tracking</strong> — View overall Cost of Goods Sold (COGS), net profit, and profit margin %. You can inline-edit unit costs for dishes to save precise financial records.</span>
              </div>
              <div className="flex items-start gap-3 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
                <IoSparklesOutline className="text-amber-600 text-base flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-700">Price Elasticity Simulator</strong> — Perform "what-if" scenario planning. Test how dish price changes or raw ingredient cost increases impact daily order volume and net daily profit before making menu changes.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">Predictions use real order history — the more orders, the more accurate.</p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#4a6741] text-white hover:bg-[#3d5535] transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
