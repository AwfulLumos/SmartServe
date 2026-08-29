import React, { useState } from "react";
import studentApi from "../../../utils/studentApi";
import {
  IoGiftOutline,
  IoStarOutline,
  IoLeafOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

const REWARD_ICON_MAP = {
  gift: <IoGiftOutline className="text-[#4a6741] text-2xl" />,
  star: <IoStarOutline className="text-[#4a6741] text-2xl" />,
  leaf: <IoLeafOutline className="text-[#4a6741] text-2xl" />,
};

export function RedeemConfirmSheet({ reward, student, onClose, onSuccess }) {
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState("");
  const canAfford = (student?.points ?? 0) >= reward.pointsCost;

  async function handleRedeem() {
    setRedeeming(true);
    setError("");
    try {
      const res = await studentApi.post("/redemptions/student", { rewardId: reward._id });
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to redeem. Try again.");
      setRedeeming(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="bg-white rounded-t-3xl w-full max-w-[390px] overflow-hidden shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="px-6 pt-4 pb-8">
          {/* Reward icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#d7ecc8] flex items-center justify-center">
              {REWARD_ICON_MAP[reward.icon] || REWARD_ICON_MAP.gift}
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-center text-gray-800 mb-1">{reward.name}</h3>
          {reward.description && (
            <p className="text-sm text-center text-gray-400 mb-4">{reward.description}</p>
          )}
          {/* Points summary */}
          <div className="bg-gray-50 rounded-2xl px-5 py-4 mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Your Points</span>
              <span className="font-bold text-gray-800">{student?.points ?? 0} pts</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Cost</span>
              <span className="font-bold text-red-500">−{reward.pointsCost} pts</span>
            </div>
            <div className="border-t border-gray-200 my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remaining</span>
              <span className={`font-extrabold ${canAfford ? "text-[#4a6741]" : "text-red-500"}`}>
                {canAfford ? (student?.points ?? 0) - reward.pointsCost : "Not enough"} pts
              </span>
            </div>
          </div>
          {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}
          {!canAfford && !error && (
            <p className="text-xs text-red-500 text-center mb-3">
              You need {reward.pointsCost - (student?.points ?? 0)} more points to redeem this reward.
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleRedeem}
              disabled={redeeming || !canAfford}
              className="flex-1 py-3.5 rounded-2xl bg-[#4a6741] hover:bg-[#3a5333] disabled:opacity-50 text-white font-bold text-sm transition"
            >
              {redeeming ? "Redeeming…" : "Confirm Redeem"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RewardSuccessSheet({ reward, newPoints, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="bg-white rounded-t-3xl w-full max-w-[390px] shadow-2xl pb-8">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="px-6 pt-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#d7ecc8] flex items-center justify-center mx-auto mb-4">
            <IoCheckmarkCircleOutline className="text-[#4a6741] text-5xl" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#4a6741] mb-1">Redeemed!</h3>
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-bold text-gray-800">{reward.name}</span> has been redeemed.
          </p>
          <p className="text-sm text-gray-400 mb-6">Show this to the cashier to claim your reward.</p>
          <div className="bg-[#d7ecc8] rounded-2xl px-5 py-3 mb-6">
            <p className="text-xs text-[#4a6741]/70 mb-0.5">Remaining Points</p>
            <p className="text-3xl font-extrabold text-[#4a6741]">{newPoints}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#4a6741] text-white font-bold text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
