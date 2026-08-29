import {
  IoSendOutline,
  IoCreateOutline,
  IoTrashOutline,
} from "react-icons/io5";
import {
  resolveStudentImageUrl,
  timeAgo,
  StarRating,
  CATEGORY_STYLES,
  STATUS_CFG,
} from "./FeedbacksConstants";

export default function FeedbackCard({
  item,
  onUpdateStatus,
  onOpenReply,
  onSetDeleteTarget,
}) {
  const stCfg = STATUS_CFG[item.status] || STATUS_CFG.pending;
  const catBadgeClass = CATEGORY_STYLES[item.category] || "bg-gray-100 text-gray-700 border-gray-200";

  // Resolve student info dynamically
  const studentName = item.student?.fullName || item.studentName || "Student";
  const studentSchoolId = item.student?.schoolId || item.studentSchoolId;
  const rawImg = item.student?.profileImage || item.studentImage;
  const profileUrl = resolveStudentImageUrl(rawImg);

  // Compute 2-letter uppercase initials fallback
  const nameWords = studentName.trim().split(" ").filter(Boolean);
  const initials =
    nameWords.length >= 2
      ? (nameWords[0][0] + nameWords[nameWords.length - 1][0]).toUpperCase()
      : nameWords.length === 1
      ? nameWords[0].slice(0, 2).toUpperCase()
      : "ST";

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5 flex flex-col gap-4"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#e8f5e2] text-[#4a6741] flex items-center justify-center font-bold text-sm border border-[#4a6741]/20 flex-shrink-0 overflow-hidden shadow-sm">
            {profileUrl ? (
              <img
                src={profileUrl}
                alt={studentName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallbackElem = e.currentTarget.nextElementSibling;
                  if (fallbackElem) fallbackElem.style.display = "block";
                }}
              />
            ) : null}
            <span className={profileUrl ? "hidden" : "block"}>{initials}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-800 text-base">{studentName}</p>
              {studentSchoolId && (
                <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                  ID: {studentSchoolId}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{timeAgo(item.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Category pill */}
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${catBadgeClass}`}>
            {item.category}
          </span>

          {/* Status pill */}
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1 ${stCfg.badge}`}>
            {stCfg.icon}
            {stCfg.label}
          </span>
        </div>
      </div>

      {/* Rating */}
      <div>
        <StarRating rating={item.rating} />
      </div>

      {/* Student Message Box */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-700 leading-relaxed font-normal">
        <p className="whitespace-pre-line">"{item.message}"</p>
      </div>

      {/* Admin Reply Box if present */}
      {item.adminResponse && (
        <div className="bg-[#f2f8ee] rounded-xl p-4 border border-[#4a6741]/20 text-sm text-[#2c4226]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#4a6741] flex items-center gap-1.5">
              <IoSendOutline className="rotate-180" /> Response from {item.respondedBy || "Admin"}
            </span>
            {item.respondedAt && (
              <span className="text-[11px] text-gray-400">{timeAgo(item.respondedAt)}</span>
            )}
          </div>
          <p className="text-sm font-medium">{item.adminResponse}</p>
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 mr-1">Status:</span>
          {["pending", "reviewed", "resolved"].map((stKey) => (
            <button
              key={stKey}
              onClick={() => onUpdateStatus(item, stKey)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                item.status === stKey
                  ? "bg-[#4a6741] text-white border-[#4a6741]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#4a6741]/40"
              }`}
            >
              {stKey.charAt(0).toUpperCase() + stKey.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReply(item)}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-[#e8f5e2] text-[#4a6741] hover:bg-[#d5ebcc] transition cursor-pointer"
          >
            <IoCreateOutline className="text-sm" />
            {item.adminResponse ? "Edit Reply" : "Reply"}
          </button>
          <button
            onClick={() => onSetDeleteTarget(item)}
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition cursor-pointer"
          >
            <IoTrashOutline className="text-sm" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
