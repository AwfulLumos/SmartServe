import React from "react";
import {
  IoGlobeOutline,
  IoLocationOutline,
  IoCheckmarkOutline,
  IoCopyOutline,
  IoInformationCircleOutline,
  IoRadioOutline,
  IoPhonePortraitOutline,
  IoTabletPortraitOutline,
  IoDesktopOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";
import { SkeletonTable } from "../../../../SkeletonLoader";
import { resolveImageUrl, formatTimeAgo } from "../trackerConstants";

export default function UsersTelemetryTable({
  loading,
  filteredSessions,
  paginatedSessions,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
  onResetFilters,
  onSelectUser,
  onPing,
  pingingUser,
  pingResults,
  copiedIp,
  onCopyIp,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {loading ? (
        <div className="p-5">
          <SkeletonTable rows={8} columns={7} showHeader={false} />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-3xl mb-3">
            <IoGlobeOutline />
          </div>
          <h3 className="text-base font-bold text-gray-800">No matching users found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Try adjusting your search keywords or clearing active filters to see all registered users.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3d5535] transition shadow-sm cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">User / Student</th>
                <th className="py-3.5 px-4">Account Type</th>
                <th className="py-3.5 px-4">Assigned IP Address</th>
                <th className="py-3.5 px-4">Region</th>
                <th className="py-3.5 px-4">Device Form Factor</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {paginatedSessions.map((session, idx) => {
                const ip = session.ipAddress || session.ip || "";
                const device = session.deviceType || session.device || "Unknown Device";
                const deviceLower = device.toLowerCase();
                const isMobile = deviceLower.includes("phone") || deviceLower.includes("mobile");
                const isTablet = deviceLower.includes("tablet") || deviceLower.includes("ipad");
                const isStudent = session.userType !== "admin";
                const lastActive = session.lastActive || session.lastActiveAt;
                const isPinging = pingingUser === session._id;
                const pingData = pingResults[session._id];

                return (
                  <tr
                    key={session._id || `user-row-${idx}`}
                    onClick={() => onSelectUser(session)}
                    className="hover:bg-[#d7ecc8]/10 transition cursor-pointer group"
                  >
                    {/* Column 1: User / Student */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#d7ecc8]/40 border border-[#4a6741]/20 flex items-center justify-center text-[#4a6741] font-bold text-xs flex-shrink-0 overflow-hidden">
                          {session.avatar ? (
                            <img
                              src={resolveImageUrl(session.avatar)}
                              alt={session.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (session.name || "U")[0]?.toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-gray-900 block truncate group-hover:text-[#4a6741] transition">
                            {session.name || "Unknown User"}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono block truncate">
                            {session.userId || session.identifier || "—"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Account Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isStudent
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : session.role === "admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                          }`}
                      >
                        {session.roleLabel || (isStudent ? "Student (BYOD)" : "Staff")}
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
                            title="Copy assigned IP"
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

                    {/* Column 6: Last Activity */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {(() => {
                        const timeInfo = formatTimeAgo(lastActive);
                        return (
                          <div
                            className="text-gray-500 font-mono text-[11px] flex items-center gap-1.5"
                            title={timeInfo.full}
                          >
                            {timeInfo.isRecent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                            )}
                            <span>{timeInfo.relative}</span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Column 7: Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Ping Test Button */}
                        <button
                          onClick={(e) => onPing(session, e)}
                          disabled={isPinging}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${pingData
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-50 hover:bg-[#4a6741] hover:text-white text-gray-700 border-gray-200"
                            }`}
                          title="Test connection latency with ICMP Ping"
                        >
                          <IoRadioOutline
                            className={`text-xs ${isPinging ? "animate-spin text-[#4a6741]" : ""}`}
                          />
                          {isPinging
                            ? "Pinging..."
                            : pingData
                              ? `${pingData.roundTripTimeMs}ms`
                              : "Ping"}
                        </button>

                        {/* Inspect Modal Trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectUser(session);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-[#4a6741] hover:text-white rounded-lg text-[10px] font-bold text-gray-700 transition cursor-pointer"
                          title="Inspect user telemetry details"
                        >
                          <IoInformationCircleOutline className="text-xs" />
                          Inspect
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

      {/* Table Pagination Bar */}
      {!loading && filteredSessions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-gray-100 gap-3 bg-gray-50/50">
          <div className="text-xs text-gray-500 flex items-center gap-3">
            <span>
              Showing{" "}
              <strong className="text-gray-800">
                {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, filteredSessions.length)}
              </strong>{" "}
              of <strong className="text-gray-800">{filteredSessions.length}</strong> users
            </span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
              title="Previous Page"
            >
              <IoChevronBackOutline />
            </button>

            <div className="text-xs font-semibold px-2 text-gray-700">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
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
