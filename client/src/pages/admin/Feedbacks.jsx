import { useState, useEffect, useCallback, useRef } from "react";
import {
  IoChatbubblesOutline,
  IoStar,
  IoStarOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoSendOutline,
  IoFunnelOutline,
  IoPersonOutline,
  IoCreateOutline,
  IoChevronDownOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { SkeletonList } from "../../components/SkeletonLoader";

const resolveStudentImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (apiBase.startsWith("http")) {
    return `${apiBase.replace(/\/api\/?$/, "")}${url}`;
  }
  return url;
};

function CustomSelect({ value, onChange, options, className = "" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#4a6741] text-gray-700 text-sm font-medium rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-sm transition outline-none"
      >
        <span className="truncate flex items-center gap-2">
          {selectedOpt?.icon}
          {selectedOpt?.label}
        </span>
        <IoChevronDownOutline
          className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180 text-[#4a6741]" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-full min-w-[170px] bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition ${isSelected
                  ? "bg-[#e8f5e2] text-[#4a6741] font-bold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <span className="flex items-center gap-2">
                  {opt.icon}
                  {opt.label}
                </span>
                {isSelected && <IoCheckmarkOutline className="text-sm text-[#4a6741]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} hour${h !== 1 ? "s" : ""} ago`;
  }
  const d = Math.floor(diff / 86400);
  if (d < 7) return `${d} day${d !== 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function StarRating({ rating = 5 }) {
  return (
    <div className="flex items-center gap-1 text-amber-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <IoStar className="text-base" />
          ) : (
            <IoStarOutline className="text-base text-gray-300" />
          )}
        </span>
      ))}
      <span className="text-xs font-bold text-gray-700 ml-1.5">{rating}.0</span>
    </div>
  );
}

const CATEGORY_STYLES = {
  General: "bg-blue-50 text-blue-700 border-blue-200",
  "Food Quality": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Canteen Service": "bg-purple-50 text-purple-700 border-purple-200",
  "App Issue": "bg-rose-50 text-rose-700 border-rose-200",
  Suggestion: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_CFG = {
  pending: { label: "Pending", badge: "bg-amber-100 text-amber-800 border-amber-300", icon: <IoTimeOutline /> },
  reviewed: { label: "Reviewed", badge: "bg-blue-100 text-blue-800 border-blue-300", icon: <IoCheckmarkCircleOutline /> },
  resolved: { label: "Resolved", badge: "bg-[#e8f5e2] text-[#4a6741] border-[#4a6741]/30", icon: <IoCheckmarkCircleOutline /> },
};

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, reviewed: 0, resolved: 0, averageRating: 5.0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [rating, setRating] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reply Modal State
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(search && { search }),
        ...(category !== "all" && { category }),
        ...(status !== "all" && { status }),
        ...(rating !== "all" && { rating }),
      });

      const { data } = await api.get(`/feedback?${params}`);
      setFeedbacks(data.feedbacks || []);
      setStats(data.stats || { total: 0, pending: 0, reviewed: 0, resolved: 0, averageRating: 5.0 });
      setTotalPages(data.pages || 1);
    } catch {
      toast.error("Failed to load feedbacks.");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, status, rating]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Handle status toggle
  const handleUpdateStatus = async (item, newStatus) => {
    try {
      await api.patch(`/feedback/${item._id}/status`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchFeedbacks();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  // Open Reply Modal
  const openReplyModal = (item) => {
    setReplyTarget(item);
    setReplyText(item.adminResponse || "");
  };

  // Submit Reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await api.patch(`/feedback/${replyTarget._id}/status`, {
        adminResponse: replyText.trim(),
        status: replyTarget.status === "pending" ? "reviewed" : replyTarget.status,
      });
      toast.success("Admin response posted successfully!");
      setReplyTarget(null);
      setReplyText("");
      fetchFeedbacks();
    } catch {
      toast.error("Failed to post response.");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/feedback/${deleteTarget._id}`);
      toast.success("Feedback deleted.");
      setDeleteTarget(null);
      fetchFeedbacks();
    } catch {
      toast.error("Failed to delete feedback.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout breadcrumb="Feedbacks">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
            <IoChatbubblesOutline className="text-3xl" />
            User Feedbacks
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review, reply to, and action ratings & feedback submitted by students
          </p>
        </div>
        <button
          onClick={fetchFeedbacks}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-[#4a6741]/40 hover:text-[#4a6741] transition text-sm font-semibold shadow-sm"
        >
          <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Feedbacks</p>
            <p className="text-3xl font-extrabold text-gray-800 mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#e8f5e2] text-[#4a6741] flex items-center justify-center text-2xl font-bold">
            <IoChatbubblesOutline />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average Rating</p>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-3xl font-extrabold text-amber-500">{stats.averageRating}</p>
              <span className="text-xs text-gray-400 font-bold">/ 5.0</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl font-bold">
            <IoStar />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Review</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold">
            <IoTimeOutline />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resolved</p>
            <p className="text-3xl font-extrabold text-[#4a6741] mt-1">{stats.resolved}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
            <IoCheckmarkCircleOutline />
          </div>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, ID, or feedback message..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:bg-white transition"
          />
        </div>

        {/* Custom Category Filter */}
        <CustomSelect
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: "All Categories" },
            { value: "General", label: "General" },
            { value: "Food Quality", label: "Food Quality" },
            { value: "Canteen Service", label: "Canteen Service" },
            { value: "App Issue", label: "App Issue" },
            { value: "Suggestion", label: "Suggestion" },
          ]}
          className="min-w-[160px]"
        />

        {/* Custom Rating Filter */}
        <CustomSelect
          value={rating}
          onChange={setRating}
          options={[
            { value: "all", label: "All Ratings" },
            { value: "5", label: "5 Stars ⭐⭐⭐⭐⭐" },
            { value: "4", label: "4 Stars ⭐⭐⭐⭐" },
            { value: "3", label: "3 Stars ⭐⭐⭐" },
            { value: "2", label: "2 Stars ⭐⭐" },
            { value: "1", label: "1 Star ⭐" },
          ]}
          className="min-w-[150px]"
        />

        {/* Custom Status Filter */}
        <CustomSelect
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All Statuses" },
            { value: "pending", label: "Pending" },
            { value: "reviewed", label: "Reviewed" },
            { value: "resolved", label: "Resolved" },
          ]}
          className="min-w-[140px]"
        />
      </div>

      {/* Feedback List */}
      {loading ? (
        <SkeletonList count={4} />
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
          <IoChatbubblesOutline className="text-5xl mx-auto mb-3 text-gray-300" />
          <p className="text-base font-semibold text-gray-700">No feedbacks found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((item) => {
            const stCfg = STATUS_CFG[item.status] || STATUS_CFG.pending;
            const catBadgeClass = CATEGORY_STYLES[item.category] || "bg-gray-100 text-gray-700 border-gray-200";

            // Resolve student info dynamically (using populated student object for real-time profile updates)
            const studentName = item.student?.fullName || item.studentName || "Student";
            const studentSchoolId = item.student?.schoolId || item.studentSchoolId;
            const rawImg = item.student?.profileImage || item.studentImage;
            const profileUrl = resolveStudentImageUrl(rawImg);

            // Compute 2-letter uppercase initials fallback (e.g. "Kiyoshi Tetta Kazuu" -> "KK")
            const nameWords = studentName.trim().split(" ").filter(Boolean);
            const initials =
              nameWords.length >= 2
                ? (nameWords[0][0] + nameWords[nameWords.length - 1][0]).toUpperCase()
                : nameWords.length === 1
                  ? nameWords[0].slice(0, 2).toUpperCase()
                  : "ST";

            return (
              <div
                key={item._id}
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
                        onClick={() => handleUpdateStatus(item, stKey)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${item.status === stKey
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
                      onClick={() => openReplyModal(item)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-[#e8f5e2] text-[#4a6741] hover:bg-[#d5ebcc] transition"
                    >
                      <IoCreateOutline className="text-sm" />
                      {item.adminResponse ? "Edit Reply" : "Reply"}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition"
                    >
                      <IoTrashOutline className="text-sm" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-admin-page-fade-in">
            {/* Modal Header */}
            <div className="bg-[#4a6741] px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <IoChatbubblesOutline />
                Reply to {replyTarget.student?.fullName || replyTarget.studentName}
              </h3>
              <button
                onClick={() => setReplyTarget(null)}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
              >
                <IoCloseOutline className="text-xl" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendReply} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-xs text-gray-600">
                <p className="font-bold text-gray-800 mb-1">Original Feedback:</p>
                <p className="italic">"{replyTarget.message}"</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Admin Response / Message
                </label>
                <textarea
                  rows="4"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the student..."
                  className="w-full p-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:ring-1 focus:ring-[#4a6741] transition"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="px-5 py-2.5 rounded-xl bg-[#4a6741] hover:bg-[#3a5333] text-white font-bold text-sm transition disabled:opacity-60 flex items-center gap-2"
                >
                  <IoSendOutline />
                  {submittingReply ? "Sending..." : "Post Response"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 text-center shadow-2xl">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              <IoAlertCircleOutline />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Delete Feedback Entry?</h3>
            <p className="text-xs text-gray-500 mb-6">
              Feedback from <span className="font-bold text-gray-700">{deleteTarget.studentName}</span> will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
