export default function OrdersBulkSelectionBar({ selectedIds, setSelectedIds, setBulkConfirm, handleBulkStatusChange }) {
  if (!selectedIds || selectedIds.length === 0) return null;

  return (
    <div className="bg-[#4a6741] text-white rounded-2xl px-5 py-3.5 shadow-xl flex items-center justify-between flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-3">
      <div className="flex items-center gap-3">
        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide">
          {selectedIds.length} Selected
        </span>
        <span className="text-xs text-white/80 hidden sm:inline">Choose action for selected orders:</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() =>
            setBulkConfirm({
              title: `Mark ${selectedIds.length} Order(s) as Preparing?`,
              description: `Selected orders will be updated to "Preparing".`,
              onConfirm: () => handleBulkStatusChange("preparing", null, selectedIds),
            })
          }
          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs rounded-xl transition"
        >
          Mark Preparing
        </button>
        <button
          onClick={() =>
            setBulkConfirm({
              title: `Mark ${selectedIds.length} Order(s) as Ready?`,
              description: `Selected orders will be updated to "Ready".`,
              onConfirm: () => handleBulkStatusChange("ready", null, selectedIds),
            })
          }
          className="px-3 py-1.5 bg-blue-400 hover:bg-blue-500 text-blue-950 font-bold text-xs rounded-xl transition"
        >
          Mark Ready
        </button>
        <button
          onClick={() =>
            setBulkConfirm({
              title: `Complete ${selectedIds.length} Order(s)?`,
              description: `Selected orders will be completed immediately.`,
              onConfirm: () => handleBulkStatusChange("completed", null, selectedIds),
            })
          }
          className="px-3 py-1.5 bg-white text-[#4a6741] hover:bg-gray-100 font-bold text-xs rounded-xl transition"
        >
          Complete Selected
        </button>
        <button
          onClick={() =>
            setBulkConfirm({
              title: `Cancel ${selectedIds.length} Order(s)?`,
              description: `Selected orders will be marked as "Cancelled".`,
              onConfirm: () => handleBulkStatusChange("cancelled", null, selectedIds),
            })
          }
          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition"
        >
          Cancel Selected
        </button>
        <button
          onClick={() => setSelectedIds([])}
          className="px-2.5 py-1.5 text-xs text-white/70 hover:text-white underline ml-1"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
