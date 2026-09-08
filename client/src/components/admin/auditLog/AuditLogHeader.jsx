import { IoDownloadOutline, IoTrashOutline } from "react-icons/io5";

export default function AuditLogHeader({
  total,
  exporting,
  onExportCSV,
  onOpenClearModal,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      <div>
        <h2 className="text-lg font-bold text-[#4a6741]">Admin Audit Log</h2>
        <p className="text-xs text-gray-400 mt-0.5">{total} total entries</p>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={onExportCSV}
          disabled={exporting || total === 0}
          className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] active:scale-[0.98] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
          title="Export all filtered audit logs as CSV"
        >
          <IoDownloadOutline className="text-base" />
          <span>{exporting ? "Exporting..." : "Export CSV"}</span>
        </button>

        <button
          onClick={onOpenClearModal}
          disabled={total === 0}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
          title="Clear audit log entries to optimize database storage"
        >
          <IoTrashOutline className="text-base" />
          <span>Clear Logs</span>
        </button>
      </div>
    </div>
  );
}
