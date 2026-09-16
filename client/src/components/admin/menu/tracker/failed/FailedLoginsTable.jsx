import React from "react";
import {
  IoCheckmarkOutline,
  IoLocationOutline,
  IoCopyOutline,
  IoInformationCircleOutline,
  IoTrashOutline,
  IoAlertCircleOutline,
  IoLockClosedOutline,
  IoPhonePortraitOutline,
  IoTabletPortraitOutline,
  IoDesktopOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";
import { SkeletonTable } from "../../../../SkeletonLoader";
import { formatTimeAgo } from "../trackerConstants";

export default function FailedLoginsTable({
  failedLoading,
  failedData,
  failedSearch,
  failedAccountType,
  failedDevice,
  failedPage,
  setFailedPage,
  failedPageSize,
  setFailedPageSize,
  onResetFilters,
  onSelectFailed,
  onDeleteTarget,
  copiedIp,
  onCopyIp,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {failedLoading ? (
        <div className="p-5">
          <SkeletonTable rows={6} columns={8} showHeader={false} />
        </div>
      ) : failedData.attempts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-3">
            <IoCheckmarkOutline />
          </div>
          <h3 className="text-base font-bold text-gray-800">No failed login attempts recorded</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            {failedSearch || failedAccountType !== "all" || failedDevice !== "all"
              ? "No attempts match your current search or filter criteria."
              : "All recent login attempts for both students and staff have succeeded."}
          </p>
          {(failedSearch || failedAccountType !== "all" || failedDevice !== "all") && (
            <button
              onClick={onResetFilters}
              className="mt-4 px-4 py-2 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3d5535] transition shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">User / Attempted Identifier</th>
                <th className="py-3.5 px-4">Account Type</th>
                <th className="py-3.5 px-4">Assigned IP Address</th>
                <th className="py-3.5 px-4">Region</th>
                <th className="py-3.5 px-4">Device Form Factor</th>
                <th className="py-3.5 px-4">Failure Reason</th>
                <th className="py-3.5 px-4">Attempted At</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {failedData.attempts.map((attempt) => {
                const ip = attempt.ipAddress || attempt.ip || "";
                const device = attempt.deviceType || attempt.device || "Unknown Device";
                const deviceLower = device.toLowerCase();
                const isMobile = deviceLower.includes("phone") || deviceLower.includes("mobile");
                const isTablet = deviceLower.includes("tablet") || deviceLower.includes("ipad");
                const isStudent = attempt.accountType === "student";
                const isAdmin = attempt.accountType === "admin";
                const isStaff = attempt.accountType === "staff";
                const timeInfo = formatTimeAgo(attempt.attemptedAt || attempt.createdAt);

                return (
                  <tr
                    key={attempt._id}
                    onClick={() => onSelectFailed(attempt)}
                    className="hover:bg-rose-50/20 transition cursor-pointer group"
                  >
                    {/* Column 1: User / Attempted Identifier */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-bold text-xs flex-shrink-0 overflow-hidden">
                          <IoAlertCircleOutline className="text-lg text-rose-600" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-gray-900 block truncate group-hover:text-rose-700 transition">
                            {attempt.name || "Unregistered Account"}
                          </span>
                          <span className="text-[11px] text-gray-500 font-mono block truncate">
                            {attempt.identifier || "—"} {attempt.email ? `• ${attempt.email}` : ""}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Account Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isStudent
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isAdmin
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : isStaff
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                      >
                        {attempt.roleLabel ||
                          (isStudent ? "Student" : isStaff ? "Staff" : isAdmin ? "Admin" : "Unknown")}
                      </span>
                    </td>

                    {/* Column 3: Assigned IP Address */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-gray-800">
                          {ip || "—"}
                        </span>
                        {ip && (
                          <button
                            onClick={(e) => onCopyIp(ip, e)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition cursor-pointer"
                            title="Copy IP"
                          >
                            {copiedIp === ip ? (
                              <IoCheckmarkOutline className="text-emerald-600 text-sm" />
                            ) : (
                              <IoCopyOutline className="text-xs" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Column 4: Region */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <IoLocationOutline className="text-red-500 text-sm flex-shrink-0" />
                        <span className="font-semibold text-gray-800 text-xs">Philippines</span>
                      </div>
                    </td>

                    {/* Column 5: Device Form Factor */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        {isMobile ? (
                          <IoPhonePortraitOutline className="text-sm text-emerald-600 flex-shrink-0" />
                        ) : isTablet ? (
                          <IoTabletPortraitOutline className="text-sm text-amber-600 flex-shrink-0" />
                        ) : (
                          <IoDesktopOutline className="text-purple-600 text-xs flex-shrink-0" />
                        )}
                        <span className="truncate max-w-[140px]" title={device}>
                          {device}
                        </span>
                      </div>
                    </td>

                    {/* Column 6: Failure Reason */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                        <IoLockClosedOutline className="text-xs" />
                        {attempt.reason}
                      </span>
                    </td>

                    {/* Column 7: Attempted At */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div
                        className="text-gray-500 font-mono text-[11px] flex items-center gap-1.5"
                        title={timeInfo.full}
                      >
                        {timeInfo.isRecent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                        )}
                        <span>{timeInfo.relative}</span>
                      </div>
                    </td>

                    {/* Column 8: Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Inspect Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFailed(attempt);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-bold text-gray-700 transition cursor-pointer"
                          title="Inspect attempt details"
                        >
                          <IoInformationCircleOutline className="text-xs" />
                          Inspect
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTarget(attempt);
                          }}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete log entry"
                        >
                          <IoTrashOutline className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Failed Logins Pagination Bar */}
      {!failedLoading && failedData.attempts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-gray-100 gap-3 bg-gray-50/50">
          <div className="text-xs text-gray-500 flex items-center gap-3">
            <span>
              Showing{" "}
              <strong className="text-gray-800">
                {(failedPage - 1) * failedPageSize + 1} -{" "}
                {Math.min(failedPage * failedPageSize, failedData.total)}
              </strong>{" "}
              of <strong className="text-gray-800">{failedData.total}</strong> records
            </span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Per page:</span>
              <select
                value={failedPageSize}
                onChange={(e) => {
                  setFailedPageSize(Number(e.target.value));
                  setFailedPage(1);
                }}
                className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-[#4a6741] cursor-pointer shadow-xs"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFailedPage((p) => Math.max(1, p - 1))}
              disabled={failedPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
              title="Previous Page"
            >
              <IoChevronBackOutline />
            </button>

            <div className="text-xs font-semibold px-2 text-gray-700">
              Page {failedPage} of {failedData.pages || 1}
            </div>

            <button
              onClick={() => setFailedPage((p) => Math.min(failedData.pages || 1, p + 1))}
              disabled={failedPage >= (failedData.pages || 1)}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
              title="Next Page"
            >
              <IoChevronForwardOutline />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
