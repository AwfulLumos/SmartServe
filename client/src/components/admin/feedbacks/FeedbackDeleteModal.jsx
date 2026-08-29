import { createPortal } from "react-dom";
import { IoAlertCircleOutline } from "react-icons/io5";

export default function FeedbackDeleteModal({
  deleteTarget,
  deleting,
  onClose,
  onConfirmDelete,
}) {
  if (!deleteTarget) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-3xl w-full max-w-md p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <IoAlertCircleOutline />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">Delete Feedback Entry?</h3>
        <p className="text-xs text-gray-500 mb-6">
          Feedback from <span className="font-bold text-gray-700">{deleteTarget.studentName}</span> will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmDelete}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition disabled:opacity-60 cursor-pointer"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
