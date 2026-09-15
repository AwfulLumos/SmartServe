import { useState } from "react";
import QRCode from "react-qr-code";
import {
  IoCloseOutline,
  IoInformationCircleOutline,
  IoReceiptOutline,
  IoLeafOutline,
  IoGiftOutline,
  IoBriefcaseOutline,
  IoIdCardOutline,
  IoMailOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoEllipsisVertical,
  IoDownloadOutline,
  IoPencilOutline,
  IoGlobeOutline,
  IoWifiOutline,
  IoLocationOutline,
  IoPhonePortraitOutline,
  IoLaptopOutline,
  IoTimeOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import { SkeletonList } from "../../SkeletonLoader";
import { resolveStudentImageUrl, downloadQR } from "./RegisterConstants";

export default function UserLookupPanel({
  selectedStudent,
  viewTab,
  onSetViewTab,
  userOrders,
  userByoc,
  userRedemptions,
  loadingUserData,
  qrRef,
  onOpenEdit,
  onClose,
}) {
  const [copiedIp, setCopiedIp] = useState(false);
  if (!selectedStudent) return null;

  const copyIp = (ip) => {
    if (!ip) return;
    navigator.clipboard.writeText(ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const profileUrl = resolveStudentImageUrl(selectedStudent.profileImage || selectedStudent.profileImageUrl);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f9fbf8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#d7ecc8] flex items-center justify-center text-lg font-bold text-[#4a6741] overflow-hidden shadow-sm border border-[#4a6741]/20 flex-shrink-0">
            {profileUrl ? (
              <img
                src={profileUrl}
                alt={selectedStudent.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = "block";
                }}
              />
            ) : null}
            <span className={profileUrl ? "hidden" : "block"}>
              {selectedStudent.fullName?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-base leading-tight">{selectedStudent.fullName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-[#4a6741] font-semibold">{selectedStudent.schoolId}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${selectedStudent.userType === "employee" ? "bg-blue-100 text-blue-600" : "bg-[#d7ecc8] text-[#4a6741]"}`}>
                {selectedStudent.userType === "employee" ? "Employee" : "Student"}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition cursor-pointer">
          <IoCloseOutline className="text-xl" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 bg-white px-4 gap-1 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: <IoInformationCircleOutline className="text-base" /> },
          { id: "orders", label: `Orders (${userOrders.length})`, icon: <IoReceiptOutline className="text-base" /> },
          { id: "byoc", label: `BYOC (${userByoc.length})`, icon: <IoLeafOutline className="text-base" /> },
          { id: "redemptions", label: `Redemptions (${userRedemptions.length})`, icon: <IoGiftOutline className="text-base" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSetViewTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${viewTab === tab.id
              ? "border-[#4a6741] text-[#4a6741]"
              : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {loadingUserData ? (
          <div className="p-4">
            <SkeletonList count={4} />
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {viewTab === "overview" && (
              <div className="space-y-5">
                {/* Quick Eco Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f0f7ec] p-3.5 rounded-xl border border-[#d7ecc8] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#4a6741] text-white flex items-center justify-center text-lg flex-shrink-0">
                      <IoLeafOutline />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#4a6741] uppercase tracking-wider">Eco Points</p>
                      <p className="text-lg font-bold text-gray-800">{selectedStudent.points ?? 0} <span className="text-xs font-normal text-gray-500">pts</span></p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg flex-shrink-0">
                      <IoBriefcaseOutline />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">BYOC Count</p>
                      <p className="text-lg font-bold text-gray-800">{selectedStudent.byocCount ?? 0} <span className="text-xs font-normal text-gray-500">times</span></p>
                    </div>
                  </div>
                </div>

                {/* Info Table */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100 text-xs">
                  {[
                    [<IoIdCardOutline className="text-[#4a6741]" />, selectedStudent.userType === "employee" ? "Employee ID" : "School ID", selectedStudent.schoolId],
                    [<IoMailOutline className="text-[#4a6741]" />, "Email Address", selectedStudent.email],
                    selectedStudent.userType === "employee"
                      ? [<IoBriefcaseOutline className="text-[#4a6741]" />, "Job Title", selectedStudent.jobTitle || "—"]
                      : [<IoCalendarOutline className="text-[#4a6741]" />, "Grade Level", selectedStudent.gradeLevel || "—"],
                    selectedStudent.userType === "employee"
                      ? [<IoPeopleOutline className="text-[#4a6741]" />, "Department", selectedStudent.department || "—"]
                      : [<IoPeopleOutline className="text-[#4a6741]" />, "Section", selectedStudent.section || "—"],
                    [<IoEllipsisVertical className="text-[#4a6741]" />, "Account Status", selectedStudent.isDeleted ? "Soft-Deleted" : selectedStudent.isActive ? "Active" : "Inactive"],
                  ].map(([icon, label, value], i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-base flex-shrink-0">{icon}</span>
                      <span className="text-gray-400 w-32 flex-shrink-0">{label}</span>
                      <span className="font-semibold text-gray-700 truncate">{String(value)}</span>
                    </div>
                  ))}
                </div>

                {/* Network & Security Telemetry */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-sm">
                        <IoGlobeOutline />
                      </div>
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        Network Telemetry
                      </span>
                    </div>
                    {selectedStudent.lastLoginIp ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Tracked
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">Offline</span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* IP Row */}
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        <IoWifiOutline className="text-gray-400 text-sm" /> Last Known IP
                      </span>
                      {selectedStudent.lastLoginIp ? (
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {selectedStudent.lastLoginIp}
                          </code>
                          <button
                            onClick={() => copyIp(selectedStudent.lastLoginIp)}
                            title="Copy IP address"
                            className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition cursor-pointer"
                          >
                            {copiedIp ? <IoCheckmarkOutline className="text-emerald-600" /> : <IoCopyOutline />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No network login recorded</span>
                      )}
                    </div>

                    {/* Region Row */}
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        <IoLocationOutline className="text-gray-400 text-sm" /> Region
                      </span>
                      <span className="font-medium text-gray-700 text-right">
                        Philippines
                      </span>
                    </div>

                    {/* Hardware Device Row */}
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        {selectedStudent.lastDevice?.toLowerCase().includes("mobile") || selectedStudent.lastDevice?.toLowerCase().includes("phone") ? (
                          <IoPhonePortraitOutline className="text-blue-500 text-sm" />
                        ) : (
                          <IoLaptopOutline className="text-indigo-500 text-sm" />
                        )}
                        Device Form Factor
                      </span>
                      <span className="font-semibold text-gray-700">
                        {selectedStudent.lastDevice || "Unknown Device"}
                      </span>
                    </div>

                    {/* Last Active Timestamp */}
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-500 font-medium flex items-center gap-1.5">
                        <IoTimeOutline className="text-gray-400 text-sm" /> Last Active
                      </span>
                      <span className="text-gray-600 font-mono text-[11px]">
                        {selectedStudent.lastActiveAt
                          ? new Date(selectedStudent.lastActiveAt).toLocaleString()
                          : "Never"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                {selectedStudent.qrToken && (
                  <div className="flex flex-col items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide">Personal QR Code</p>
                    <div ref={qrRef} className="p-4 border-2 border-[#4a6741]/20 rounded-2xl bg-white shadow-sm">
                      <QRCode value={selectedStudent.qrToken} size={150} fgColor="#4a6741" bgColor="#ffffff" level="M" />
                    </div>
                    <button
                      onClick={() => downloadQR(qrRef.current?.querySelector("svg"), `${selectedStudent.schoolId}-QR.png`)}
                      className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
                    >
                      <IoDownloadOutline /> Download QR Code
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ORDERS */}
            {viewTab === "orders" && (
              <div className="space-y-3">
                {userOrders.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                    <IoReceiptOutline className="text-3xl" />
                    <p>No canteen orders found for this user.</p>
                  </div>
                ) : (
                  userOrders.map((ord) => (
                    <div key={ord._id} className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[#4a6741]">{ord.orderNumber}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${ord.status === "completed" ? "bg-green-100 text-green-700" :
                          ord.status === "cancelled" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                          }`}>
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {ord.items?.map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-mono">₱{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200/60 text-xs font-bold text-gray-800">
                        <span className="text-[10px] font-normal text-gray-400">
                          {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>Total: ₱{Number(ord.total).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: BYOC */}
            {viewTab === "byoc" && (
              <div className="space-y-3">
                {userByoc.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                    <IoLeafOutline className="text-3xl" />
                    <p>No BYOC container logs found for this user.</p>
                  </div>
                ) : (
                  userByoc.map((b) => (
                    <div key={b._id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-gray-800">+{b.ecoPoints} Eco Points Earned 🌿</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Approved by: {b.confirmedByName || "Staff"}</p>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: REDEMPTIONS */}
            {viewTab === "redemptions" && (
              <div className="space-y-3">
                {userRedemptions.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                    <IoGiftOutline className="text-3xl" />
                    <p>No reward redemptions found for this user.</p>
                  </div>
                ) : (
                  userRedemptions.map((r) => (
                    <div key={r._id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-gray-800">🎁 {r.rewardName}</p>
                        <p className="text-[10px] text-purple-600 font-medium mt-0.5">Used {r.pointsUsed} points</p>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50">
        <button
          onClick={() => onOpenEdit(selectedStudent)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold py-2.5 rounded-xl transition cursor-pointer"
        >
          <IoPencilOutline /> Edit Account
        </button>
        <button onClick={onClose} className="px-4 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition cursor-pointer">
          Close
        </button>
      </div>
    </>
  );
}
