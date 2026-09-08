import { IoCloseOutline } from "react-icons/io5";
import MenuModal from "../menu/MenuModal";

export default function AuditLogClearModal({
  clearModalOpen,
  category,
  actorType,
  clearing,
  onClose,
  onConfirmClear,
}) {
  if (!clearModalOpen) return null;

  return (
    <MenuModal onClose={onClose}>
      <div className="bg-red-500 px-6 py-5 flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">Clear Audit Log History</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg text-white transition cursor-pointer"
        >
          <IoCloseOutline className="text-lg" />
        </button>
      </div>
      <div className="px-6 py-6">
        <p className="text-sm text-gray-600 mb-3">
          {category !== "all" || actorType !== "all"
            ? "You are about to delete all audit logs matching current filter settings."
            : "You are about to delete ALL audit log history to optimize database performance."}
        </p>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 text-xs text-red-700 font-medium">
          ⚠️ Warning: This will permanently delete audit log records. Make sure you have exported a CSV copy if needed.
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirmClear}
            disabled={clearing}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition cursor-pointer"
          >
            {clearing ? "Clearing Logs…" : "Confirm Clear Logs"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold py-2.5 rounded-xl hover:border-gray-300 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </MenuModal>
  );
}
