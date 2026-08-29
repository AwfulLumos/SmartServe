import { IoCloseOutline } from "react-icons/io5";
import MenuModal from "../menu/MenuModal";

export default function AuditLogDeleteModal({
  deleteTarget,
  deleting,
  onClose,
  onConfirmDelete,
}) {
  if (!deleteTarget) return null;

  return (
    <MenuModal onClose={onClose}>
      <div className="bg-red-500 px-6 py-5 flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">Delete Audit Log Entry</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg text-white transition cursor-pointer"
        >
          <IoCloseOutline className="text-lg" />
        </button>
      </div>
      <div className="px-6 py-6">
        <p className="text-sm text-gray-600 mb-2">
          Are you sure you want to delete this log entry?
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 mb-5 space-y-1 text-xs">
          <p><span className="font-semibold text-gray-700">Action:</span> {deleteTarget.action}</p>
          <p><span className="font-semibold text-gray-700">Actor:</span> {deleteTarget.actorName} ({deleteTarget.actorType})</p>
          <p><span className="font-semibold text-gray-700">Description:</span> {deleteTarget.description}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirmDelete}
            disabled={deleting}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition cursor-pointer"
          >
            {deleting ? "Deleting…" : "Yes, Delete Entry"}
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
