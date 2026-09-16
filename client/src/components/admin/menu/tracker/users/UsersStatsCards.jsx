import React from "react";
import {
  IoPeopleOutline,
  IoPhonePortraitOutline,
  IoDesktopOutline,
  IoPulseOutline,
} from "react-icons/io5";

export default function UsersStatsCards({ stats = {}, totalSessions = 0 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Users */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Total Users Tracked
          </span>
          <div className="text-2xl font-black text-gray-800 mt-1">
            {stats.totalSessions ?? totalSessions}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">All students, staff & administrators</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#e8f5e2] text-[#4a6741] flex items-center justify-center text-2xl flex-shrink-0">
          <IoPeopleOutline />
        </div>
      </div>

      {/* Card 2: Students */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Students
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {stats.totalStudents ?? stats.studentsOnWifi ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Registered student accounts</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl flex-shrink-0">
          <IoPhonePortraitOutline />
        </div>
      </div>

      {/* Card 3: Staff & Admins */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Staff & Admins
          </span>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {stats.totalStaffAdmins ?? stats.adminsOnLan ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Active staff & administrators</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
          <IoDesktopOutline />
        </div>
      </div>

      {/* Card 4: Active Today */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Active Recently
          </span>
          <div className="text-2xl font-black text-blue-600 mt-1 flex items-center gap-2">
            {stats.liveCount ?? 0}
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Telemetry active within 30 mins</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl flex-shrink-0">
          <IoPulseOutline />
        </div>
      </div>
    </div>
  );
}
