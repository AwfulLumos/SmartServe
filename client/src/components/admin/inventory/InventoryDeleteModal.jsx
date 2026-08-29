import { IoAlertCircleOutline } from "react-icons/io5";

export default function InventoryDeleteModal({
  deleteTarget,
  deleting,
  onClose,
  onConfirm,
}) {
  if (!deleteTarget) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <IoAlertCircleOutline className="text-red-500 text-2xl" />
            </div>
            <div>
              <p className="font-bold text-gray-800">Delete Item?</p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold text-gray-700">"{deleteTarget.name}"</span> will be permanently removed from inventory.
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60 cursor-pointer"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
