import { IoChatbubblesOutline, IoRefreshOutline } from "react-icons/io5";

export default function FeedbacksHeader({ onRefresh, loading }) {
  return (
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
        onClick={onRefresh}
        className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:border-[#4a6741]/40 hover:text-[#4a6741] transition text-sm font-semibold shadow-sm cursor-pointer"
      >
        <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );
}
