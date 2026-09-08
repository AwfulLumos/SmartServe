import { IoTrashOutline } from "react-icons/io5";
import { MdHistoryEdu } from "react-icons/md";
import { SkeletonTable } from "../../SkeletonLoader";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  ACTOR_COLORS,
  fmt,
} from "./AuditLogConstants";

export default function AuditLogTable({
  logs,
  loading,
  onSetDeleteTarget,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {loading ? (
        <div className="p-4">
          <SkeletonTable rows={6} columns={6} showHeader={false} />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <MdHistoryEdu className="text-4xl text-gray-300" />
          <p className="text-sm">No audit log entries found.</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-5 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Timestamp</th>
              <th className="px-5 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Action</th>
              <th className="px-5 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Category</th>
              <th className="px-5 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Actor</th>
              <th className="px-5 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Description</th>
              <th className="px-5 py-3 font-semibold text-gray-400 text-xs uppercase tracking-wide text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap font-mono">
                  {fmt(log.createdAt)}
                </td>
                <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap text-sm">{log.action}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORY_COLORS[log.category] || "bg-gray-100 text-gray-600"}`}>
                    {CATEGORY_LABELS[log.category] || log.category}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${ACTOR_COLORS[log.actorType] || "bg-gray-100 text-gray-600"}`}>
                      {log.actorType}
                    </span>
                    <span className="text-gray-700 text-xs font-medium">{log.actorName}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-500 text-xs max-w-xs truncate">{log.description}</td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => onSetDeleteTarget(log)}
                    title="Delete log entry"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                  >
                    <IoTrashOutline className="text-base" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
