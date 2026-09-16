import { IoGiftOutline, IoLeafOutline, IoArrowForwardOutline } from "react-icons/io5";

const getRelativeTime = (date) => {
  if (!date) return "—";
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function AdminRecentRedemptions({ recentRedemptions = [], navigate }) {
  return (
    <div className="bg-white dark:bg-[#1a2416] rounded-2xl border border-gray-100 dark:border-[#2b3924] shadow-sm overflow-hidden flex flex-col h-full transition-all duration-200">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-[#2b3924] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <IoGiftOutline className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-800 dark:text-white">Recent Redemptions</h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                BYOC Rewards
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-400">Student loyalty & eco-points claims</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard/rewards")}
          className="flex items-center gap-1 text-xs font-bold text-[#4a6741] dark:text-[#8ebd7e] hover:underline cursor-pointer"
        >
          View All <IoArrowForwardOutline className="text-xs" />
        </button>
      </div>

      {/* Content */}
      {!recentRedemptions || recentRedemptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2 flex-1 px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-400">
            <IoGiftOutline className="text-2xl" />
          </div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">No reward redemptions recorded today</p>
          <p className="text-[11px] text-gray-400">Student eco-container redemptions will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50 dark:divide-[#24301f] flex-1">
          {recentRedemptions.map((r) => (
            <li
              key={r._id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-purple-50/30 dark:hover:bg-[#202b1b] transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
                <IoLeafOutline className="text-base" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 dark:text-white truncate">
                  {r.rewardName || "Cafeteria Reward"}
                </p>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  <span className="font-medium text-gray-600 dark:text-gray-300">{r.studentName || "Student"}</span> ·{" "}
                  <span className="font-mono">{r.schoolId || "—"}</span>
                </p>
              </div>

              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg">
                  −{r.pointsUsed} pts
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  {getRelativeTime(r.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
