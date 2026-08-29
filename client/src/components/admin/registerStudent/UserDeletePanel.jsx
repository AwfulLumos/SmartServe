import { IoCloseOutline, IoAlertCircleOutline, IoTrashOutline } from "react-icons/io5";
import { resolveStudentImageUrl } from "./RegisterConstants";

export default function UserDeletePanel({
  selectedStudent,
  submitting,
  apiError,
  onDeleteSubmit,
  onClose,
}) {
  if (!selectedStudent) return null;

  const profileUrl = resolveStudentImageUrl(selectedStudent.profileImage || selectedStudent.profileImageUrl);

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <p className="font-bold text-red-600 text-base">Delete User</p>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer">
          <IoCloseOutline className="text-xl" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-5">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-2xl font-bold text-red-500 overflow-hidden shadow-md border-2 border-red-100 flex-shrink-0">
          {profileUrl ? (
            <img
              src={profileUrl}
              alt={selectedStudent.fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.style.display = "block";
              }}
            />
          ) : null}
          <span className={profileUrl ? "hidden" : "block"}>
            {selectedStudent.fullName?.[0]?.toUpperCase()}
          </span>
        </div>
        <div className="text-center">
          <p className="font-bold text-gray-800 text-lg">{selectedStudent.fullName}</p>
          <p className="text-xs font-mono text-gray-400">{selectedStudent.schoolId}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2 w-full text-sm text-amber-800">
          <IoAlertCircleOutline className="text-lg flex-shrink-0 mt-0.5 text-amber-600" />
          <span>
            This user account will be soft-deleted. The user will be hidden from active lists and unable to log in, but no data will be erased from MongoDB. You can restore this account anytime from the <strong>Deleted Accounts</strong> tab.
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
          onClick={onDeleteSubmit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60 cursor-pointer"
        >
          <IoTrashOutline />
          {submitting ? "Deleting…" : "Soft Delete Account"}
        </button>
        <button onClick={onClose} className="px-4 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition cursor-pointer">
          Cancel
        </button>
      </div>
    </>
  );
}
