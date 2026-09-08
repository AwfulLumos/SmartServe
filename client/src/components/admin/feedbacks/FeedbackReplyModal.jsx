import { createPortal } from "react-dom";
import {
  IoChatbubblesOutline,
  IoCloseOutline,
  IoSendOutline,
} from "react-icons/io5";

export default function FeedbackReplyModal({
  replyTarget,
  replyText,
  setReplyText,
  submittingReply,
  onClose,
  onSubmitReply,
}) {
  if (!replyTarget) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-admin-page-fade-in">
        {/* Modal Header */}
        <div className="bg-[#4a6741] px-6 py-4 flex items-center justify-between text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <IoChatbubblesOutline />
            Reply to {replyTarget.student?.fullName || replyTarget.studentName}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition cursor-pointer"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitReply} className="p-6 space-y-4">
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
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReply}
              className="px-5 py-2.5 rounded-xl bg-[#4a6741] hover:bg-[#3a5333] text-white font-bold text-sm transition disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              <IoSendOutline />
              {submittingReply ? "Sending..." : "Post Response"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
