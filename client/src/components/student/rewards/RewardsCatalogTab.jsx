import React from "react";
import { SkeletonCardGrid } from "../../SkeletonLoader";
import {
  IoGiftOutline,
  IoStarOutline,
  IoLeafOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";

const REWARD_ICON_MAP = {
  gift: <IoGiftOutline className="text-[#4a6741] text-2xl" />,
  star: <IoStarOutline className="text-[#4a6741] text-2xl" />,
  leaf: <IoLeafOutline className="text-[#4a6741] text-2xl" />,
};

export default function RewardsCatalogTab({ loading, rewards, student, onSelectReward }) {
  return (
    <div className="px-4 mt-5">
      <p className="text-base font-extrabold text-[#4a6741] mb-3">Available Rewards</p>
      {loading ? (
        <SkeletonCardGrid count={3} />
      ) : rewards.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No rewards available</div>
      ) : (
        <div className="flex flex-col gap-3">
          {rewards.map((r) => {
            const canAfford = (student?.points ?? 0) >= r.pointsCost;
            return (
              <button
                key={r._id}
                onClick={() => onSelectReward(r)}
                className={`bg-white rounded-2xl border-2 px-4 py-4 flex items-center gap-4 text-left w-full transition ${canAfford
                  ? "border-[#4a6741]/30 hover:border-[#4a6741]"
                  : "border-gray-200 opacity-60"
                  }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#d7ecc8] flex items-center justify-center flex-shrink-0">
                  {REWARD_ICON_MAP[r.icon] || REWARD_ICON_MAP.gift}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{r.name}</p>
                  {r.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{r.description}</p>
                  )}
                  <p className="text-sm font-bold text-[#4a6741] mt-1 flex items-center gap-1">
                    {r.pointsCost} points
                    <IoCheckmarkOutline className="text-[#4a6741] text-xs" />
                  </p>
                </div>
                {!canAfford && (
                  <span className="text-[10px] text-red-400 font-semibold flex-shrink-0">
                    Need more pts
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
