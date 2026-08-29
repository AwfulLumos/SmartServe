import {
  IoLayersOutline,
  IoFlameOutline,
  IoCheckmarkCircleOutline,
  IoCheckmarkDoneCircleOutline,
} from "react-icons/io5";

export default function OrdersBatchActions({ stats, orders, setBulkConfirm, handleBulkStatusChange }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <IoLayersOutline className="text-[#4a6741] text-lg" />
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quick Batch Actions:</span>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Prepare All Pending */}
        {stats.pending > 0 && (
          <button
            onClick={() =>
              setBulkConfirm({
                title: "Prepare All Pending Orders?",
                description: `This will mark all ${stats.pending} pending order(s) as "Preparing" immediately.`,
                onConfirm: () => handleBulkStatusChange("preparing", "pending"),
              })
            }
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 transition flex items-center gap-1.5 shadow-sm"
          >
            <IoFlameOutline className="text-sm" />
            Prepare All Pending ({stats.pending})
          </button>
        )}

        {/* Mark All Ready */}
        {stats.preparing > 0 && (
          <button
            onClick={() =>
              setBulkConfirm({
                title: "Mark All Preparing Orders as Ready?",
                description: `This will mark all ${stats.preparing} preparing order(s) as "Ready" for pickup.`,
                onConfirm: () => handleBulkStatusChange("ready", "preparing"),
              })
            }
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-100 hover:bg-blue-200 text-blue-800 transition flex items-center gap-1.5 shadow-sm"
          >
            <IoCheckmarkCircleOutline className="text-sm" />
            Mark All Ready ({stats.preparing})
          </button>
        )}

        {/* Complete All Ready */}
        {stats.ready > 0 && (
          <button
            onClick={() =>
              setBulkConfirm({
                title: "Complete All Ready Orders?",
                description: `This will complete all ${stats.ready} ready order(s) immediately.`,
                onConfirm: () => handleBulkStatusChange("completed", "ready"),
              })
            }
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#d7ecc8] hover:bg-[#c4e3b1] text-[#4a6741] transition flex items-center gap-1.5 shadow-sm"
          >
            <IoCheckmarkDoneCircleOutline className="text-sm" />
            Complete All Ready ({stats.ready})
          </button>
        )}

        {/* Complete All Active (Pending + Preparing + Ready) */}
        {(stats.pending > 0 || stats.preparing > 0 || stats.ready > 0) && (
          <button
            onClick={() => {
              const activeCount = stats.pending + stats.preparing + stats.ready;
              const activeIds = orders
                .filter((o) => ["pending", "preparing", "ready"].includes(o.status))
                .map((o) => o._id);
              setBulkConfirm({
                title: "Complete ALL Active Orders?",
                description: `This will complete all ${activeCount} active orders across all stages at once.`,
                onConfirm: () => handleBulkStatusChange("completed", null, activeIds),
              });
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#4a6741] hover:bg-[#3a5333] text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <IoCheckmarkDoneCircleOutline className="text-sm" />
            Complete All Active ({stats.pending + stats.preparing + stats.ready})
          </button>
        )}

        {stats.pending === 0 && stats.preparing === 0 && stats.ready === 0 && (
          <span className="text-xs text-gray-400 font-medium italic">No active orders pending action</span>
        )}
      </div>
    </div>
  );
}
