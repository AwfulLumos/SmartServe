import { IoGiftOutline } from "react-icons/io5";

export default function AdminRecentRedemptions({ recentRedemptions = [], navigate }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-[#4a6741]">Recent Redemptions</h2>
        <button
          onClick={() => navigate("/dashboard/rewards")}
          className="text-xs font-semibold text-[#4a6741] hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>
      {!recentRedemptions || recentRedemptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2 flex-1">
          <IoGiftOutline className="text-4xl text-gray-300" />
          <p className="text-xs">No reward redemptions yet today.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50 flex-1">
          {recentRedemptions.map((r) => (
            <li key={r._id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-[#d7ecc8] flex items-center justify-center flex-shrink-0">
                <IoGiftOutline className="text-[#4a6741] text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{r.rewardName}</p>
                <p className="text-xs text-gray-400 truncate">{r.studentName} · {r.schoolId}</p>
              </div>
              <span className="text-xs font-bold text-[#4a6741] flex-shrink-0">−{r.pointsUsed} pts</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
