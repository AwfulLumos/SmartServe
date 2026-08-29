import React from "react";
import {
  IoLeafOutline,
  IoGiftOutline,
  IoReceiptOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";
import { MdQrCode2 } from "react-icons/md";

import LiveOrderProgressTracker from "../orders/LiveOrderProgressTracker";
import MyUsualCard from "../menu/MyUsualCard";
import { SkeletonList } from "../../SkeletonLoader";
import { calculateEcoLevel } from "../rewards/RewardsView";

export default function StudentHomeTab({
  student,
  firstName,
  handleNavChange,
  activeOrders,
  usualOrder,
  handleReOrder,
  handleClearUsual,
  activity,
  activityLoading,
}) {
  const byocCount = student?.byocCount ?? 0;
  const ecoInfo = calculateEcoLevel(byocCount);

  return (
    <main className="flex-1 overflow-y-auto pb-20 font-sans">
      {/* ── Hero Banner ── */}
      <div className="bg-[#4a6741] px-5 pt-5 pb-28 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" />
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-white/80 text-base">✦</span>
          <p className="text-sm text-white/80">Good to see you</p>
        </div>
        <h1 className="text-4xl font-extrabold text-white leading-tight">Hi, {firstName}</h1>
        <p className="text-sm text-white/70 mt-1">Ready for a tasty day?</p>
      </div>

      {/* ── Floating Card ── */}
      <div className="mx-4 -mt-20 bg-white dark:bg-[#1a2416] rounded-3xl shadow-xl p-5 relative z-10 border border-transparent dark:border-[#2b3924]">
        <div className="bg-gradient-to-br from-[#7fb060] to-[#4a6741] rounded-2xl px-5 py-5 mb-4 text-white shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <IoLeafOutline className="text-white text-lg" />
              </div>
              <p className="text-white font-semibold text-base">Eco Points</p>
            </div>
            <span className="text-xs font-extrabold bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>{ecoInfo.icon}</span> {ecoInfo.name}
            </span>
          </div>

          <p className="text-5xl font-extrabold text-white leading-none mb-1">
            {student?.points ?? 0}
          </p>
          <div className="mt-3 bg-black/20 rounded-xl p-2.5">
            <div className="flex justify-between items-center text-xs mb-1 font-medium">
              <span>Level {ecoInfo.level} Progress</span>
              <span>{ecoInfo.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${ecoInfo.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleNavChange("qr")}
            className="flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3 rounded-2xl transition text-sm"
          >
            <MdQrCode2 className="text-base" />
            Show QR
          </button>
          <button
            onClick={() => handleNavChange("rewards")}
            className="flex items-center justify-center gap-2 bg-white dark:bg-[#24301f] border-2 border-[#4a6741] dark:border-[#8ebd7e] text-[#4a6741] dark:text-[#8ebd7e] hover:bg-[#f0f7ec] dark:hover:bg-[#2e4028] font-semibold py-3 rounded-2xl transition text-sm"
          >
            <IoGiftOutline className="text-base" />
            Rewards
          </button>
        </div>
      </div>

      {/* ── Active Live Order Tracker Banner ── */}
      {activeOrders.length > 0 && (
        <div className="px-4 mt-5">
          <p className="text-xs font-extrabold text-[#4a6741] dark:text-[#8ebd7e] uppercase tracking-wider mb-2">
            Live Order Status
          </p>
          <LiveOrderProgressTracker
            order={activeOrders[0]}
            onTrackClick={() => handleNavChange("orders")}
          />
        </div>
      )}

      {/* ── 1-Click Order My Usual Widget ── */}
      {usualOrder && (
        <div className="px-4 mt-4">
          <MyUsualCard
            usualOrder={usualOrder}
            onReOrder={handleReOrder}
            onClearUsual={handleClearUsual}
          />
        </div>
      )}

      {/* ── Explore ── */}
      <div className="px-4 mt-6">
        <p className="text-sm font-bold text-[#4a6741] dark:text-[#8ebd7e] mb-3">Explore</p>
        <div
          onClick={() => handleNavChange("orders")}
          className="cursor-pointer bg-white dark:bg-[#1a2416] border border-gray-100 dark:border-[#2b3924] rounded-2xl shadow-sm flex items-center gap-4 px-4 py-4"
        >
          <div className="w-12 h-12 bg-[#d7ecc8] dark:bg-[#2e4028] rounded-2xl flex items-center justify-center flex-shrink-0">
            <IoReceiptOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-xl" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">Order History</p>
            <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5 leading-snug">
              Review your past transactions and points
            </p>
          </div>
          <IoChevronForwardOutline className="text-gray-300 dark:text-gray-500 text-lg flex-shrink-0" />
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-[#4a6741] dark:text-[#8ebd7e]">Recent Activity</p>
          <button
            onClick={() => handleNavChange("orders")}
            className="text-xs font-semibold text-[#4a6741] dark:text-[#8ebd7e] hover:underline"
          >
            View All
          </button>
        </div>
        <div className="bg-white dark:bg-[#1a2416] border border-gray-100 dark:border-[#2b3924] rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-[#2b3924]">
          {activityLoading ? (
            <div className="p-2">
              <SkeletonList count={3} />
            </div>
          ) : activity.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-400 text-sm">
              No recent activity yet
            </div>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-4 py-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    item.type === "redeem"
                      ? "bg-[#4a6741]"
                      : item.type === "byoc"
                      ? "bg-[#7fb060]"
                      : "bg-[#d7ecc8] dark:bg-[#2e4028]"
                  }`}
                >
                  {item.type === "redeem" ? (
                    <IoGiftOutline className="text-white text-lg" />
                  ) : item.type === "byoc" ? (
                    <IoLeafOutline className="text-white text-lg" />
                  ) : (
                    <IoReceiptOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-lg" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">{item.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">{item.pts}</p>
                  {item.label && (
                    <p className="text-[10px] font-semibold text-[#4a6741]/70 dark:text-[#8ebd7e]/70">
                      {item.label}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
