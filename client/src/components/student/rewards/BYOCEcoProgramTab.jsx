import React from "react";
import { IoLeafOutline, IoCheckmarkOutline } from "react-icons/io5";

export default function BYOCEcoProgramTab({ ecoInfo, byocCount, co2Saved }) {
  return (
    <div className="px-4 mt-5 flex flex-col gap-4 font-sans">
      {/* Info card */}
      <div className="bg-[#7fb060] rounded-3xl px-5 py-5">
        <div className="flex items-center gap-3 mb-3">
          <IoLeafOutline className="text-white text-2xl" />
          <p className="text-white font-extrabold text-lg">Bring Your Own Container</p>
        </div>
        <p className="text-white/90 text-sm leading-relaxed mb-4">
          Help save the planet! Bring your own reusable container and earn{" "}
          <span className="font-extrabold">eco points</span> each time the staff scans your QR.
        </p>
        <div className="bg-white/20 rounded-2xl px-4 py-4">
          <p className="text-white font-bold text-xs mb-2">How it works:</p>
          <div className="flex flex-col gap-1.5">
            {[
              "Bring a clean, reusable container",
              "Show it to the cashier when ordering",
              "Earn eco points instantly!",
            ].map((step) => (
              <div key={step} className="flex items-center gap-2 text-sm text-white/90">
                <IoCheckmarkOutline className="text-white flex-shrink-0" />
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Eco Level & Impact Metrics */}
      <div className="bg-white dark:bg-[#1a2416] rounded-3xl border border-gray-100 dark:border-[#2b3924] shadow-sm px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">
            Your Eco Milestone
          </p>
          <span className="text-xs font-extrabold bg-[#d7ecc8] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] px-3 py-1 rounded-full flex items-center gap-1">
            <span>{ecoInfo.icon}</span> {ecoInfo.name}
          </span>
        </div>

        {/* Level Stepper Bar */}
        <div className="bg-gray-50 dark:bg-[#24301f] rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
            <span>Progress to {ecoInfo.nextTier || "Max Tier"}</span>
            <span className="text-[#4a6741] dark:text-[#8ebd7e]">{ecoInfo.progress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-[#4a6741] dark:bg-[#8ebd7e] rounded-full transition-all duration-500"
              style={{ width: `${ecoInfo.progress}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {ecoInfo.level < 4
              ? `Bring your container ${ecoInfo.remaining} more time${ecoInfo.remaining !== 1 ? "s" : ""
              } to unlock ${ecoInfo.nextTier} status!`
              : "You've reached the highest Eco Tier status!"}
          </p>
        </div>

        {/* Impact Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-[#d7ecc8]/70 dark:bg-[#2e4028]/80 border border-[#4a6741]/20 dark:border-[#8ebd7e]/30 rounded-2xl px-4 py-3.5">
            <p className="text-xs font-semibold text-[#4a6741]/80 dark:text-[#8ebd7e]/90 mb-1">
              Plastics Prevented
            </p>
            <p className="text-2xl font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">
              {byocCount} <span className="text-xs font-semibold">containers</span>
            </p>
          </div>
          <div className="bg-[#d7ecc8]/70 dark:bg-[#2e4028]/80 border border-[#4a6741]/20 dark:border-[#8ebd7e]/30 rounded-2xl px-4 py-3.5">
            <p className="text-xs font-semibold text-[#4a6741]/80 dark:text-[#8ebd7e]/90 mb-1">
              CO₂ Reduction
            </p>
            <p className="text-2xl font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">
              {co2Saved} <span className="text-xs font-semibold">kg CO₂</span>
            </p>
          </div>
        </div>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 italic">
          {byocCount > 0
            ? `Awesome job! You have kept ${byocCount} single-use container${byocCount !== 1 ? "s" : ""
            } out of campus landfills.`
            : "Start your eco journey — bring a reusable container next time you visit!"}
        </p>
      </div>
    </div>
  );
}
