import React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  IoGlobeOutline,
  IoLocationOutline,
  IoCheckmarkOutline,
  IoCopyOutline,
  IoCloseOutline,
  IoPhonePortraitOutline,
  IoDesktopOutline,
} from "react-icons/io5";
import { resolveImageUrl } from "../trackerConstants";

export default function UserInspectorModal({
  user,
  onClose,
  copiedIp,
  onCopyIp,
}) {
  const navigate = useNavigate();

  if (!user) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden animate-scaleUp my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#4a6741] text-white px-6 py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs border-2 border-white/40 flex items-center justify-center text-lg font-bold flex-shrink-0 overflow-hidden shadow-xs">
              {user.avatar ? (
                <img
                  src={resolveImageUrl(user.avatar)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user.name || "U")[0]?.toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold leading-tight text-white truncate">
                {user.name}
              </h3>
              <p className="text-[11px] text-white/80 font-mono mt-0.5 truncate">
                {user.userId || user.identifier || "ID"} {user.email ? `• ${user.email}` : ""}
              </p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#4a6741] shadow-2xs">
                {user.roleLabel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex-shrink-0"
            title="Close modal"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Telemetry Grid */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold text-[#4a6741] uppercase tracking-wider flex items-center gap-1.5">
              <IoGlobeOutline className="text-base" /> Network & IP Telemetry
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-semibold block">
                  Assigned IP Address
                </span>
                <div className="flex items-center justify-between mt-1">
                  <code className="font-mono font-bold text-gray-800">{user.ipAddress}</code>
                  <button
                    onClick={() => onCopyIp(user.ipAddress)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition cursor-pointer"
                    title="Copy IP"
                  >
                    {copiedIp === user.ipAddress ? (
                      <IoCheckmarkOutline className="text-emerald-600 text-xs" />
                    ) : (
                      <IoCopyOutline className="text-xs" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-semibold block">Network Status</span>
                <div className="font-bold text-gray-800 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online & Active
                </div>
                <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                  {user.networkZone || (user.userType === "admin" ? "Management Station" : "Campus Wi-Fi Client")}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-semibold block">Region & Country</span>
                <div className="font-bold text-gray-800 mt-1 flex items-center gap-1">
                  <IoLocationOutline className="text-red-500 text-xs" />
                  Philippines
                </div>
                <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                  {user.networkZone || "Campus Network Zone"}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-semibold block">Device Form Factor</span>
                <div className="font-bold text-gray-800 mt-1 flex items-center gap-1">
                  {user.deviceType?.toLowerCase().includes("phone") ||
                    user.deviceType?.toLowerCase().includes("mobile") ? (
                    <IoPhonePortraitOutline className="text-emerald-600 text-xs" />
                  ) : (
                    <IoDesktopOutline className="text-purple-600 text-xs" />
                  )}
                  <span className="truncate">{user.deviceType}</span>
                </div>
                <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                  Physical Hardware Profile
                </span>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
            <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">
              Account Information
            </span>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500">Account Classification</span>
              <span className="font-bold text-gray-800">{user.roleLabel}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500">Unique Identifier</span>
              <span className="font-mono font-bold text-gray-800">
                {user.userId || user.identifier}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500">Email Address</span>
              <span className="font-mono text-gray-700">{user.email || "—"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Last Telemetry Timestamp</span>
              <span className="font-mono text-gray-700">
                {user.lastActive ? new Date(user.lastActive).toLocaleString() : "Never"}
              </span>
            </div>
          </div>

          {/* Action Shortcuts */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => {
                onClose();
                if (user.userType === "admin") {
                  navigate("/dashboard/settings/staff");
                } else {
                  navigate(`/dashboard/orders?search=${encodeURIComponent(user.userId)}`);
                }
              }}
              className="px-4 py-2 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3d5535] transition cursor-pointer shadow-sm"
            >
              {user.userType === "admin" ? "Manage Staff Account" : "View Student Records"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
