import React from "react";
import { IoPeopleOutline, IoWarningOutline, IoTrashOutline } from "react-icons/io5";

export default function TrackerSubNav({
  activeView,
  setActiveView,
  usersCount = 0,
  failedCount = 0,
  onOpenClearModal,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveView("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeView === "users"
              ? "bg-[#4a6741] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
        >
          <IoPeopleOutline className="text-base" />
          <span>Registered Users & Telemetry</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeView === "users" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
              }`}
          >
            {usersCount}
          </span>
        </button>

        <button
          onClick={() => setActiveView("failedLogins")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeView === "failedLogins"
              ? "bg-rose-700 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
        >
          <IoWarningOutline className="text-base" />
          <span>Failed Login Attempts</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeView === "failedLogins"
                ? "bg-white/20 text-white"
                : failedCount > 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-gray-100 text-gray-700"
              }`}
          >
            {failedCount}
          </span>
        </button>
      </div>

      {activeView === "failedLogins" && failedCount > 0 && (
        <button
          onClick={onOpenClearModal}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
        >
          <IoTrashOutline className="text-sm" />
          <span>Clear Failed Logs</span>
        </button>
      )}
    </div>
  );
}
