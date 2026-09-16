import React from "react";
import { createPortal } from "react-dom";
import {
  IoGlobeOutline,
  IoLocationOutline,
  IoCheckmarkOutline,
  IoCopyOutline,
  IoCloseOutline,
  IoPhonePortraitOutline,
  IoDesktopOutline,
  IoWarningOutline,
  IoLockClosedOutline,
} from "react-icons/io5";

export default function FailedInspectorModal({
  attempt,
  onClose,
  onOpenDelete,
  copiedIp,
  onCopyIp,
}) {
  if (!attempt) return null;

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
        <div className="bg-rose-700 text-white px-6 py-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs border-2 border-white/40 flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-xs">
              <IoWarningOutline />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold leading-tight text-white truncate">
                Failed Login Security Incident
              </h3>
              <p className="text-[11px] text-white/80 font-mono mt-0.5 truncate">
                Attempted: {attempt.identifier}
              </p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-rose-700 shadow-2xs">
                {attempt.roleLabel}
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
          {/* Security Reason Banner */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
            <IoLockClosedOutline className="text-2xl text-rose-600 flex-shrink-0" />
            <div>
              <span className="font-bold block text-sm">Failure Reason</span>
              <span className="text-rose-700 mt-0.5 block">{attempt.reason}</span>
            </div>
          </div>

          {/* Telemetry Grid */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <IoGlobeOutline className="text-base text-rose-600" /> Origin Telemetry & Network
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-semibold block">
                  Client IP Address
                </span>
                <div className="flex items-center justify-between mt-1">
                  <code className="font-mono font-bold text-gray-800">{attempt.ipAddress}</code>
                  <button
                    onClick={() => onCopyIp(attempt.ipAddress)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition cursor-pointer"
                    title="Copy IP"
                  >
                    {copiedIp === attempt.ipAddress ? (
                      <IoCheckmarkOutline className="text-emerald-600 text-xs" />
                    ) : (
                      <IoCopyOutline className="text-xs" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-semibold block">Region & Country</span>
                <div className="font-bold text-gray-800 mt-1 flex items-center gap-1">
                  <IoLocationOutline className="text-red-500 text-xs" />
                  Philippines
                </div>
                <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                  Designated Telemetry Zone
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-semibold block">Device Form Factor</span>
                <div className="font-bold text-gray-800 mt-1 flex items-center gap-1">
                  {attempt.deviceType?.toLowerCase().includes("phone") ||
                    attempt.deviceType?.toLowerCase().includes("mobile") ? (
                    <IoPhonePortraitOutline className="text-emerald-600 text-xs" />
                  ) : (
                    <IoDesktopOutline className="text-purple-600 text-xs" />
                  )}
                  <span className="truncate">{attempt.deviceType}</span>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-400 font-semibold block">Attempt Timestamp</span>
                <div className="font-bold text-gray-800 mt-1">
                  {new Date(attempt.attemptedAt || attempt.createdAt).toLocaleTimeString()}
                </div>
                <span className="text-[10px] text-gray-400 block truncate">
                  {new Date(attempt.attemptedAt || attempt.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
            <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">
              Attempt Information
            </span>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500">Attempted Identifier</span>
              <span className="font-mono font-bold text-gray-800">{attempt.identifier}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500">Matched Account Name</span>
              <span className="font-bold text-gray-800">{attempt.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500">Email Address</span>
              <span className="font-mono text-gray-700">{attempt.email || "—"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500">Target Account Classification</span>
              <span className="font-bold text-gray-800">{attempt.roleLabel}</span>
            </div>
            {attempt.userAgent && (
              <div className="pt-2">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider mb-1">
                  Raw User-Agent
                </span>
                <code className="text-[11px] font-mono text-gray-600 bg-white p-2 rounded-lg border border-gray-200 block break-all">
                  {attempt.userAgent}
                </code>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => {
                onOpenDelete(attempt);
                onClose();
              }}
              className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Delete Entry
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-xl text-xs font-bold hover:bg-gray-700 transition cursor-pointer shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
