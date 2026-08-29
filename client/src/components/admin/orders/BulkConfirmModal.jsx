import { IoLayersOutline } from "react-icons/io5";

export default function BulkConfirmModal({ config, onClose, onConfirm, updating }) {
  if (!config) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm my-auto p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#d7ecc8] text-[#4a6741] flex items-center justify-center text-2xl font-bold">
            <IoLayersOutline />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-800 text-lg">{config.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{config.description}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            disabled={updating}
            onClick={onConfirm}
            className="flex-1 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-bold py-3 rounded-xl transition shadow-sm disabled:opacity-60"
          >
            {updating ? "Updating..." : "Yes, Confirm"}
          </button>
          <button
            disabled={updating}
            onClick={onClose}
            className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 text-sm font-medium py-3 rounded-xl transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
