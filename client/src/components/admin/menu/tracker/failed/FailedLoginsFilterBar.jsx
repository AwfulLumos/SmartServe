import React from "react";
import { IoSearchOutline, IoCloseOutline, IoRefreshOutline } from "react-icons/io5";
import CustomFilterSelect from "../../CustomFilterSelect";
import { FAILED_ACCOUNT_OPTIONS, DEVICE_OPTIONS } from "../trackerConstants";

export default function FailedLoginsFilterBar({
  failedSearch,
  setFailedSearch,
  failedAccountType,
  setFailedAccountType,
  failedDevice,
  setFailedDevice,
  failedLoading,
  onRefresh,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex-1 min-w-[240px] relative">
        <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
        <input
          type="text"
          value={failedSearch}
          onChange={(e) => setFailedSearch(e.target.value)}
          placeholder="Search by name, student ID, username, IP, or failure reason…"
          className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:bg-white transition"
        />
        {failedSearch && (
          <button
            onClick={() => setFailedSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            title="Clear search"
          >
            <IoCloseOutline className="text-lg" />
          </button>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <CustomFilterSelect
            value={failedAccountType}
            onChange={setFailedAccountType}
            options={FAILED_ACCOUNT_OPTIONS}
          />
          <CustomFilterSelect
            value={failedDevice}
            onChange={setFailedDevice}
            options={DEVICE_OPTIONS}
          />
        </div>

        <button
          onClick={onRefresh}
          disabled={failedLoading}
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0 cursor-pointer disabled:opacity-50"
          title="Refresh Failed Logins"
        >
          <IoRefreshOutline
            className={`text-base ${failedLoading ? "animate-spin text-[#4a6741]" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
