import { IoPeopleOutline, IoPersonAddOutline } from "react-icons/io5";

export default function RegisterHeader({
  viewDeleted,
  onToggleViewDeleted,
  deletedCount,
  onOpenCreate,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
          <IoPeopleOutline className="text-3xl" />
          {viewDeleted ? "Deleted Accounts" : "User Management"}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage registered student and staff accounts, view activity, and issue credentials
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1 border border-gray-200">
          <button
            onClick={() => onToggleViewDeleted(false)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${!viewDeleted
              ? "bg-white text-[#4a6741] shadow-sm font-bold"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Active Accounts
          </button>
          <button
            onClick={() => onToggleViewDeleted(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${viewDeleted
              ? "bg-white text-red-600 shadow-sm font-bold"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <span>Deleted Accounts</span>
            {deletedCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${viewDeleted ? "bg-red-100 text-red-700 font-bold" : "bg-gray-200 text-gray-600"}`}>
                {deletedCount}
              </span>
            )}
          </button>
        </div>
        {!viewDeleted && (
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <IoPersonAddOutline className="text-base" />
            Add User
          </button>
        )}
      </div>
    </div>
  );
}
