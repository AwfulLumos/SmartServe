import { IoDownloadOutline, IoCloseOutline } from "react-icons/io5";

export default function ExportReportModal({ isOpen, onClose, income, restockItems, granularity, method }) {
  if (!isOpen) return null;

  const downloadRestockCSV = () => {
    const headers = [
      "Item Name",
      "Category",
      "Current Stock",
      "Unit",
      "Price (PHP)",
      "Unit Cost (PHP)",
      "Margin (%)",
      "Forecast Daily Demand",
      "Days Until Stockout",
      "Min Threshold",
      "Recommended Reorder Qty",
    ];
    const rows = restockItems.map((item) => [
      item.name,
      item.category,
      item.currentStock,
      item.unit,
      item.price,
      item.unitCost,
      item.profitMarginPct,
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

  const downloadIncomeCSV = () => {
    const summary = income.summary || {};
    const historical = income.historicalSeries || [];
    const forecast = income.forecastSeries || [];

    let csvText = "Period,Type,Revenue (PHP)\n";
    historical.forEach((h) => {
      csvText += `"${h.label}",Actual,${h.value}\n`;
    });
    forecast.forEach((f) => {
      csvText += `"${f.label}",Forecast,${f.value}\n`;
    });
    csvText += `\nSUMMARY METRICS\n`;
    csvText += `Next Forecast Window Total,${summary.forecastWindowTotal || 0}\n`;
    csvText += `Previous Period Actual,${summary.previousPeriodActual || 0}\n`;
    csvText += `Change Amount,${summary.changeAmount || 0}\n`;
    csvText += `Change Percentage,${summary.changePct ?? "N/A"}%\n`;

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvText);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Income_Forecast_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-student-page-fade-in">
        <div className="bg-[#4a6741] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IoDownloadOutline className="text-2xl" />
            <div>
              <h3 className="text-lg font-bold">Export Analytics Reports</h3>
              <p className="text-xs text-white/80">Download CSV Datasets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition text-white cursor-pointer"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-gray-800">Restock & COGS Predictions CSV</p>
              <p className="text-xs text-gray-500 mt-0.5">Includes stock, forecast demand, reorder levels, and profit margins.</p>
            </div>
            <button
              onClick={downloadRestockCSV}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4a6741] text-white hover:bg-[#3d5535] transition flex items-center gap-1.5 whitespace-nowrap shadow-sm cursor-pointer"
            >
              <IoDownloadOutline className="text-base" />
              Restock CSV
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-gray-800">Income & Revenue Forecast CSV</p>
              <p className="text-xs text-gray-500 mt-0.5">Includes historical sales series, model predictions, and breakdown.</p>
            </div>
            <button
              onClick={downloadIncomeCSV}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4a6741] text-white hover:bg-[#3d5535] transition flex items-center gap-1.5 whitespace-nowrap shadow-sm cursor-pointer"
            >
              <IoDownloadOutline className="text-base" />
              Income CSV
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
