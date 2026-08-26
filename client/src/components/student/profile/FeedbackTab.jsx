import React, { useState, useEffect, useCallback } from "react";
import studentApi from "../../../utils/studentApi";
import toast from "react-hot-toast";
import {
  IoArrowBackOutline,
  IoStar,
  IoStarOutline,
  IoTrashOutline,
  IoSendOutline,
  IoTimeOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";
import { SkeletonList } from "../../SkeletonLoader";

function StudentCustomDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative font-sans">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50 dark:bg-[#24301f] border border-gray-200 dark:border-[#2b3924] rounded-xl text-xs font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2e4028] transition focus:outline-none"
      >
        <span>{selected.label}</span>
        <IoChevronForwardOutline
          className={`text-xs text-[#4a6741] dark:text-[#8ebd7e] transition-transform ${open ? "rotate-90" : "rotate-0"}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#1a2416] border border-gray-100 dark:border-[#2b3924] rounded-2xl shadow-xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-bold transition flex items-center justify-between ${opt.value === value
                    ? "bg-[#e8f5e2] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e]"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24301f]"
                  }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <span className="w-1.5 h-1.5 rounded-full bg-[#4a6741] dark:bg-[#8ebd7e]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function timeAgoShort(dateStr) {
  if (!dateStr) return "now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function FeedbackTab({
  onBack,
  feedbackCategory: propCategory,
  setFeedbackCategory: setPropCategory,
  feedbackRating: propRating,
  setFeedbackRating: setPropRating,
  supportMessage: propMessage,
  setSupportMessage: setPropMessage,
  sendingSupport: propSending,
  handleSupportSubmit: propSubmit,
  myFeedbacks: propFeedbacks,
  loadingFeedbacks: propLoading,
  deletingFeedbackId: propDeletingId,
  handleDeleteMyFeedback: propDelete,
}) {
  // Local state fallbacks
  const [localCategory, setLocalCategory] = useState("General");
  const [localRating, setLocalRating] = useState(5);
  const [localMessage, setLocalMessage] = useState("");
  const [localSending, setLocalSending] = useState(false);
  const [localFeedbacks, setLocalFeedbacks] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localDeletingId, setLocalDeletingId] = useState(null);

  const category = propCategory ?? localCategory;
  const setCategory = setPropCategory ?? setLocalCategory;
  const rating = propRating ?? localRating;
  const setRating = setPropRating ?? setLocalRating;
  const message = propMessage ?? localMessage;
  const setMessage = setPropMessage ?? setLocalMessage;
  const sending = propSending ?? localSending;
  const feedbacks = Array.isArray(propFeedbacks) ? propFeedbacks : localFeedbacks;
  const loading = propLoading ?? localLoading;
  const deletingId = propDeletingId ?? localDeletingId;

  const fetchFeedbacks = useCallback(() => {
    setLocalLoading(true);
    studentApi
      .get("/feedback/student/my")
      .then((res) => {
        const list = Array.isArray(res.data?.feedbacks)
          ? res.data.feedbacks
          : Array.isArray(res.data)
            ? res.data
            : [];
        setLocalFeedbacks(list);
      })
      .catch(() => setLocalFeedbacks([]))
      .finally(() => setLocalLoading(false));
  }, []);

  useEffect(() => {
    if (!propFeedbacks) {
      fetchFeedbacks();
    }
  }, [fetchFeedbacks, propFeedbacks]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (propSubmit) {
      propSubmit(e);
      return;
    }

    if (!message.trim()) return;
    setLocalSending(true);
    studentApi
      .post("/feedback/student", {
        category,
        rating,
        message,
      })
      .then(() => {
        toast.success("Feedback submitted successfully!");
        setMessage("");
        fetchFeedbacks();
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to send feedback"))
      .finally(() => setLocalSending(false));
  };

  const handleDelete = (id) => {
    if (propDelete) {
      propDelete(id);
      return;
    }

    setLocalDeletingId(id);
    studentApi
      .delete(`/feedback/student/${id}`)
      .then(() => {
        toast.success("Feedback deleted");
        setLocalFeedbacks((prev) => prev.filter((f) => f._id !== id));
      })
      .catch(() => toast.error("Failed to delete feedback"))
      .finally(() => setLocalDeletingId(null));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0f170a] overflow-y-auto pb-10 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 font-sans">
        <button onClick={onBack} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
          <IoArrowBackOutline className="text-xl" />
        </button>
        <p className="text-base font-extrabold text-[#4a6741]">Feedback & Replies</p>
      </div>

      {/* Feedback Form */}
      <div className="mx-4 mt-4 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 font-sans border border-transparent dark:border-[#2b3924]">
        <p className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e] mb-3">Send Feedback</p>
        <form onSubmit={handleSubmit} className="space-y-3 font-sans">
          {/* Category & Star Rating Selection */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Category</label>
              <StudentCustomDropdown
                value={category}
                onChange={setCategory}
                options={[
                  { value: "General", label: "General" },
                  { value: "Food Quality", label: "Food Quality" },
                  { value: "Canteen Service", label: "Canteen Service" },
                  { value: "App Issue", label: "App Issue" },
                  { value: "Suggestion", label: "Suggestion" },
                ]}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Rating</label>
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#24301f] border border-gray-200 dark:border-[#2b3924] rounded-xl px-3 py-1.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5 hover:scale-110 transition focus:outline-none"
                  >
                    {star <= rating ? (
                      <IoStar className="text-lg text-amber-400" />
                    ) : (
                      <IoStarOutline className="text-lg text-gray-300 dark:text-gray-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us how we can improve SmartServe or report a canteen issue..."
            className="w-full px-4 py-3 border border-gray-200 dark:border-[#2b3924] bg-white dark:bg-[#24301f] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 dark:focus:ring-[#8ebd7e]/30 focus:border-[#4a6741] dark:focus:border-[#8ebd7e] resize-none"
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="w-full py-3 bg-[#4a6741] text-white rounded-2xl font-bold text-sm transition hover:bg-[#3a5333] disabled:opacity-50"
          >
            {sending ? "Sending..." : "Submit Feedback"}
          </button>
        </form>
      </div>

      {/* My Feedback History & Admin Replies */}
      <div className="mx-4 mt-3 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 font-sans border border-transparent dark:border-[#2b3924]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">My Submitted Feedbacks</p>
          {feedbacks.length > 0 && (
            <span className="text-xs font-semibold bg-[#e8f5e2] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] px-2.5 py-0.5 rounded-full">
              {feedbacks.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-2">
            <SkeletonList count={2} />
          </div>
        ) : feedbacks.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-400 text-center py-4">
            You haven't submitted any feedback yet. Use the form above to share your thoughts!
          </p>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((item) => {
              const statusBadge =
                item.status === "resolved"
                  ? "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/60"
                  : item.status === "reviewed"
                    ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60"
                    : "bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/60";

              return (
                <div key={item._id} className="border border-gray-100 dark:border-[#2b3924] rounded-2xl p-4 bg-gray-50/50 dark:bg-[#24301f] space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700 dark:text-gray-200">{item.category}</span>
                      <div className="flex items-center text-amber-400 text-xs">
                        <IoStar />
                        <span className="font-bold text-gray-700 dark:text-gray-200 ml-1">{item.rating}.0</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${statusBadge}`}>
                        {item.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                        className="p-1 text-gray-400 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition disabled:opacity-50"
                        title="Delete feedback"
                      >
                        <IoTrashOutline className="text-sm" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                    "{item.message}"
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-400">{timeAgoShort(item.createdAt)} ago</p>

                  {/* Admin Response Box */}
                  {item.adminResponse ? (
                    <div className="mt-2 bg-[#f0f7ec] dark:bg-[#1a2b16] border border-[#4a6741]/20 dark:border-[#8ebd7e]/30 rounded-xl p-3.5 text-xs text-gray-800 dark:text-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-[#4a6741] dark:text-[#8ebd7e] flex items-center gap-1.5 text-[11px]">
                          <IoSendOutline className="rotate-180" /> Response from {item.respondedBy || "Admin"}
                        </span>
                        {item.respondedAt && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-400">{timeAgoShort(item.respondedAt)} ago</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-medium mt-1">
                        {item.adminResponse}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1 text-[11px] text-gray-400 dark:text-gray-400 italic flex items-center gap-1">
                      <IoTimeOutline className="text-xs text-amber-500" /> Pending response from canteen management
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
