import {
  IoChatbubblesOutline,
  IoStar,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

export default function FeedbacksKpiGrid({ stats }) {
  return (
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
  );
}
