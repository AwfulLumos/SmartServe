import {
  IoPersonAddOutline,
  IoEllipsisVertical,
  IoSearchOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import { SkeletonTable } from "../../SkeletonLoader";
import { statusBadge } from "./RegisterConstants";

export default function RegisterTable({
  students = [],
  listLoading,
  search,
  viewDeleted,
  page,
  totalPages,
  onPageChange,
  openMenuId,
  menuRef,
  onToggleMenu,
  onOpenView,
  onOpenEdit,
  onOpenDelete,
  onOpenRestore,
  currentUserRole,
}) {
  const safeStudents = Array.isArray(students) ? students : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="hidden md:grid grid-cols-[1fr_1.4fr_1fr_0.7fr_0.7fr_0.6fr_0.5fr_80px] items-center px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
        <span>ID</span>
        <span>Name</span>
        <span>Email</span>
        <span>Grade / Dept</span>
        <span>Section / Title</span>
        <span>Type</span>
        <span>Status</span>
        <span className="text-center">Actions</span>
      </div>

      {listLoading ? (
        <div className="p-4">
          <SkeletonTable rows={6} columns={5} showHeader={false} />
        </div>
      ) : safeStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <IoPersonAddOutline className="text-4xl" />
          <p className="text-sm">
            {search
              ? "No users match your search."
              : viewDeleted
                ? "No soft-deleted accounts found."
                : "No users registered yet."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {safeStudents.map((s, idx) => {
            if (!s) return null;
            const isLastRow = idx >= safeStudents.length - 2 && safeStudents.length > 2;
            return (
              <li
                key={s._id}
                onClick={() => onOpenView(s)}
                className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr_0.7fr_0.7fr_0.6fr_0.5fr_80px] items-center px-5 py-3.5 hover:bg-gray-50 transition cursor-pointer"
              >
                <span className="font-mono text-xs font-semibold text-[#4a6741]">{s.schoolId}</span>
                <span className="text-sm font-medium text-gray-800 truncate">{s.fullName}</span>
                <span className="text-xs text-gray-500 truncate">{s.email}</span>
                <span className="text-xs text-gray-500">
                  {s.userType === "employee" ? (s.department || "—") : (s.gradeLevel || "—")}
                </span>
                <span className="text-xs text-gray-500">
                  {s.userType === "employee" ? (s.jobTitle || "—") : (s.section || "—")}
                </span>
                <span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.userType === "employee" ? "bg-blue-100 text-blue-600" : "bg-[#d7ecc8] text-[#4a6741]"
                    }`}>
                    {s.userType === "employee" ? "Employee" : "Student"}
                  </span>
                </span>
                <span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.isDeleted ? "bg-red-100 text-red-600" : statusBadge(s.isActive)}`}>
                    {s.isDeleted ? "Deleted" : s.isActive ? "Active" : "Inactive"}
                  </span>
                </span>
                <div className="relative flex justify-center" ref={openMenuId === s._id ? menuRef : null}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleMenu(s._id); }}
                    className="text-gray-400 hover:text-gray-600 transition flex justify-center p-1 rounded-md hover:bg-gray-100 cursor-pointer"
                  >
                    <IoEllipsisVertical />
                  </button>
                  {openMenuId === s._id && (
                    <div className={`absolute right-0 ${isLastRow ? "bottom-8" : "top-8"} w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden`}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onOpenView(s); }}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        <IoSearchOutline className="text-[#4a6741]" /> User Lookup
                      </button>
                      {s.isDeleted ? (
                        currentUserRole === "admin" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenRestore(s); }}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 font-semibold cursor-pointer"
                          >
                            <IoRefreshOutline className="text-base" /> Restore
                          </button>
                        )
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenEdit(s); }}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <IoPencilOutline className="text-blue-500" /> Edit
                          </button>
                          {currentUserRole === "admin" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onOpenDelete(s); }}
                              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                            >
                              <IoTrashOutline /> Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:border-[#4a6741]/40 hover:text-[#4a6741] transition cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:border-[#4a6741]/40 hover:text-[#4a6741] transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
