import { IoCloseOutline, IoRefreshOutline, IoCheckmarkCircle } from "react-icons/io5";

export default function UserRestorePanel({
  selectedStudent,
  submitting,
  apiError,
  onRestoreSubmit,
  onClose,
}) {
  if (!selectedStudent) return null;

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <p className="font-bold text-emerald-600 text-base">Restore User Account</p>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer">
          <IoCloseOutline className="text-xl" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-600">
          <IoRefreshOutline className="text-3xl" />
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-800 text-lg">{selectedStudent.fullName}</p>
          <p className="text-xs font-mono text-gray-400">{selectedStudent.schoolId}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-2 w-full text-sm text-emerald-800">
          <IoCheckmarkCircle className="text-lg flex-shrink-0 mt-0.5 text-emerald-600" />
          <span>
            Restoring this account will set its status to active, allowing the user to sign in and appear in active user lists again.
          </span>
        </div>
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 w-full">
            {apiError}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
        <button
          onClick={onRestoreSubmit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60 cursor-pointer"
        >
          <IoRefreshOutline className="text-base" />
          {submitting ? "Restoring…" : "Restore Account"}
        </button>
        <button onClick={onClose} className="px-4 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition cursor-pointer">
          Cancel
        </button>
      </div>
    </>
  );
}
