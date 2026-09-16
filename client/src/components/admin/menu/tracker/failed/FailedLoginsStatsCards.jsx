import React from "react";
import {
  IoWarningOutline,
  IoPhonePortraitOutline,
  IoShieldOutline,
  IoTimeOutline,
} from "react-icons/io5";

export default function FailedLoginsStatsCards({ stats = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Failed Logins */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Total Failed Attempts
          </span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {stats.total ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Recorded unsuccessful logins</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl flex-shrink-0">
          <IoWarningOutline />
        </div>
      </div>

      {/* Card 2: Student Failed Logins */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Student Attempts
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {stats.studentTotal ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Invalid student login attempts</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl flex-shrink-0">
          <IoPhonePortraitOutline />
        </div>
      </div>

      {/* Card 3: Staff & Admin Failed Logins */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Staff & Admin Attempts
          </span>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {stats.staffAdminTotal ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Staff portal failed logins</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
          <IoShieldOutline />
        </div>
      </div>

      {/* Card 4: Last 24 Hours */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Recent (24 Hours)
          </span>
          <div className="text-2xl font-black text-indigo-600 mt-1 flex items-center gap-2">
            {stats.recent24h ?? 0}
            {stats.recent24h > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Attempts in past 24 hours</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl flex-shrink-0">
          <IoTimeOutline />
        </div>
      </div>
    </div>
  );
}
