import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  IoWifiOutline,
  IoDesktopOutline,
  IoPhonePortraitOutline,
  IoArrowForwardOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoCheckmarkOutline,
  IoCopyOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { SkeletonTable } from "../../SkeletonLoader";
import api from "../../../utils/api";

const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (apiBase.startsWith("http")) {
    return `${apiBase.replace(/\/api\/?$/, "")}${url}`;
  }
  return url;
};

const formatLastActive = (rawDate) => {
  if (!rawDate) return { relative: "No activity", full: "No recorded activity", isRecent: false };
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return { relative: "Unknown", full: String(rawDate), isRecent: false };

  const now = Date.now();
  const diffMs = now - d.getTime();
  const full = d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  if (diffMs < 45000 && diffMs > -10000) {
    return { relative: "Just now", full, isRecent: true };
  }
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return { relative: `${diffMin}m ago`, full, isRecent: diffMin <= 5 };
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return { relative: `${diffHours}h ago`, full, isRecent: false };
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return { relative: `${diffDays}d ago`, full, isRecent: false };

  const shortDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { relative: shortDate, full, isRecent: false };
};

export default function AdminNetworkTelemetryTable({ navigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedIp, setCopiedIp] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const res = await api.get("/network/sessions");
        if (isMounted) {
          setData(res.data);
        }
      } catch {
        // silent fail for dashboard
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTelemetry();
    return () => {
      isMounted = false;
    };
  }, []);

  const copyIp = (ip, e) => {
    e.stopPropagation();
    if (!ip) return;
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
    toast.success(`Copied IP ${ip}`);
  };

  const stats = data?.stats || { totalSessions: 0, studentWifiSessions: 0, adminLanSessions: 0 };
  const sessions = (data?.sessions || []).slice(0, 6);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#e8f5e2] text-[#4a6741] flex items-center justify-center text-lg flex-shrink-0">
            <IoPeopleOutline className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#4a6741]">Campus Network & IP Telemetry</h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Active student BYOD Wi-Fi & administrative management clients
            </p>
          </div>
        </div>

        {/* Quick Counters & View All Link */}
        <div className="flex items-center gap-2.5 sm:self-center">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
              <IoWifiOutline /> {stats.studentsOnWifi ?? stats.totalStudents ?? 0} Students
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold border border-purple-100">
              <IoDesktopOutline /> {stats.adminsOnLan ?? stats.totalStaffAdmins ?? 0} Staff & Admins
            </span>
          </div>

          <button
            onClick={() => navigate("/dashboard/settings/tracker")}
            className="flex items-center gap-1 text-xs font-semibold text-[#4a6741] hover:underline cursor-pointer"
          >
            View All <IoArrowForwardOutline />
          </button>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="p-4">
          <SkeletonTable rows={4} columns={7} showHeader={false} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
          <IoWifiOutline className="text-4xl text-gray-300" />
          <p className="text-sm">No connected client telemetry recorded yet today.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px]">
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
              {sessions.map((session, idx) => {
                const ip = session.ipAddress || session.ip || "";
                const device = session.deviceType || session.device || "Unknown Device";
                const isMobile =
                  device.toLowerCase().includes("smartphone") ||
                  device.toLowerCase().includes("mobile") ||
                  device.toLowerCase().includes("phone");
                const isStudent = session.userType !== "admin";
                const lastActive = session.lastActive || session.lastActiveAt;
                const identifier = session.userId || session.schoolId || session.identifier || "—";

                const rawAvatar = session.avatar || session.profileImage || session.profileImageUrl || "";
                const avatarUrl = resolveImageUrl(rawAvatar);
                const nameWords = (session.name || "").trim().split(" ").filter(Boolean);
                const initials =
                  nameWords.length >= 2
                    ? (nameWords[0][0] + nameWords[nameWords.length - 1][0]).toUpperCase()
                    : nameWords.length === 1
                      ? nameWords[0].slice(0, 2).toUpperCase()
                      : "U";

                return (
                  <tr
                    key={session._id || idx}
                    className="hover:bg-gray-50/60 transition cursor-pointer"
                    onClick={() => navigate("/dashboard/settings/tracker")}
                  >
                    {/* User / Student */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#d7ecc8] text-[#4a6741] flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden border border-[#4a6741]/20 shadow-2xs">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={session.name || "User"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget.nextElementSibling;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <span
                            className={`w-full h-full flex items-center justify-center ${avatarUrl ? "hidden" : "flex"
                              }`}
                          >
                            {initials}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{session.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{identifier}</div>
                        </div>
                      </div>
                    </td>

                    {/* Account Type */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${isStudent
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-purple-100 text-purple-800"
                          }`}
                      >
                        {session.roleLabel || (isStudent ? "Student" : "Staff / Admin")}
                      </span>
                    </td>

                    {/* Assigned IP Address */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-gray-800">
                          {ip || "—"}
                        </span>
                        {ip && (
                          <button
                            onClick={(e) => copyIp(ip, e)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition"
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

                    {/* Region */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <IoLocationOutline className="text-red-500 text-sm flex-shrink-0" />
                        <div className="font-semibold text-gray-800 text-xs leading-tight">
                          Philippines
                        </div>
                      </div>
                    </td>

                    {/* Device Form Factor */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        {isMobile ? (
                          <IoPhonePortraitOutline className="text-sm text-emerald-600 flex-shrink-0" />
                        ) : (
                          <IoDesktopOutline className="text-sm text-purple-600 flex-shrink-0" />
                        )}
                        <span>{device}</span>
                      </div>
                    </td>

                    {/* Last Activity */}
                    {(() => {
                      const timeInfo = formatLastActive(lastActive);
                      return (
                        <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]" title={timeInfo.full}>
                          <div className="flex items-center gap-1.5">
                            {timeInfo.isRecent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                            )}
                            <span>{timeInfo.relative}</span>
                          </div>
                        </td>
                      );
                    })()}

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/dashboard/settings/tracker");
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-[#4a6741] hover:text-white rounded-lg text-[10px] font-bold text-gray-700 transition cursor-pointer"
                        title="View all in Users & IP Tracker"
                      >
                        <IoInformationCircleOutline className="text-xs" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

