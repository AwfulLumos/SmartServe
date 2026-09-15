import { useState, useEffect } from "react";
import {
  IoWifiOutline,
  IoDesktopOutline,
  IoPhonePortraitOutline,
  IoLaptopOutline,
  IoArrowForwardOutline,
  IoShieldCheckmarkOutline,
  IoLocationOutline,
  IoCheckmarkOutline,
  IoCopyOutline,
} from "react-icons/io5";
import { SkeletonTable } from "../../SkeletonLoader";
import api from "../../../utils/api";

const fmt = (date) => {
  if (!date) return "Never";
  const d = new Date(date);
  const isToday = new Date().toDateString() === d.toDateString();
  const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  return isToday ? `Today, ${timeStr}` : `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`;
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
  };

  const stats = data?.stats || { totalSessions: 0, studentWifiSessions: 0, adminLanSessions: 0 };
  const sessions = (data?.sessions || []).slice(0, 6);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#e8f5e2] text-[#4a6741] flex items-center justify-center text-lg flex-shrink-0">
            <IoShieldCheckmarkOutline />
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
        <div className="flex items-center gap-3 sm:self-center">
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
              <IoWifiOutline /> {stats.studentsOnWifi ?? stats.studentWifiSessions ?? 0} Wi-Fi (VLAN 20)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-100">
              <IoDesktopOutline /> {stats.adminsOnLan ?? stats.adminLanSessions ?? 0} LAN (VLAN 10)
            </span>
          </div>

          <button
            onClick={() => navigate("/dashboard/settings/network?subTab=sessions", { state: { subTab: "sessions" } })}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4a6741] hover:underline cursor-pointer ml-auto"
          >
            View All <IoArrowForwardOutline />
          </button>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="p-4">
          <SkeletonTable rows={4} columns={6} showHeader={false} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
          <IoWifiOutline className="text-4xl text-gray-300" />
          <p className="text-sm">No connected client telemetry recorded yet today.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Client / User</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Account Role</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">IP Address & VLAN</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Region</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Device</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sessions.map((item, idx) => {
                const ip = item.ipAddress || item.ip || "";
                const device = item.deviceType || item.device || "Unknown Device";
                const isMobile = device.toLowerCase().includes("mobile") || device.toLowerCase().includes("phone") || device.toLowerCase().includes("smart");
                const isVlan20 = item.vlanId === 20;
                const lastActive = item.lastActive || item.lastActiveAt;
                const identifier = item.userId || item.schoolId || item.identifier || "—";
                const role = item.userType || item.role || "student";
                const isStudent = role !== "admin";

                const displayRegion = "Philippines";

                return (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/80 transition cursor-pointer"
                    onClick={() => navigate("/dashboard/settings/network?subTab=sessions", { state: { subTab: "sessions" } })}
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#d7ecc8] text-[#4a6741] flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {item.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm leading-tight truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono truncate">
                            {identifier}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${isStudent
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {item.roleLabel || (isStudent ? "Student" : "Staff / Admin")}
                      </span>
                    </td>

                    {/* IP & VLAN */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {ip ? (
                          <>
                            <code className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                              {ip}
                            </code>
                            <button
                              onClick={(e) => copyIp(ip, e)}
                              title="Copy IP"
                              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
                            >
                              {copiedIp === ip ? (
                                <IoCheckmarkOutline className="text-emerald-600 text-xs" />
                              ) : (
                                <IoCopyOutline className="text-xs" />
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="font-mono text-xs text-gray-400 italic">No IP recorded</span>
                        )}
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${isVlan20
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                        >
                          VLAN {item.vlanId || (isStudent ? 20 : 10)}
                        </span>
                      </div>
                    </td>

                    {/* Zone / Region */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700 max-w-[220px] truncate" title={displayRegion}>
                        <IoLocationOutline className="text-emerald-600 flex-shrink-0 text-sm" />
                        <span className="truncate">{displayRegion}</span>
                      </div>
                    </td>

                    {/* Device */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        {isMobile ? (
                          <IoPhonePortraitOutline className="text-emerald-600 text-base flex-shrink-0" />
                        ) : (
                          <IoLaptopOutline className="text-blue-600 text-base flex-shrink-0" />
                        )}
                        <span className="truncate">{device}</span>
                      </div>
                    </td>

                    {/* Last Active */}
                    <td className="px-5 py-3.5 text-xs text-gray-400 font-mono whitespace-nowrap">
                      {fmt(lastActive)}
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
