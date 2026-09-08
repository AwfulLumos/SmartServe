import React, { useState } from "react";
import { IoArrowBackOutline, IoLeafOutline, IoTimeOutline } from "react-icons/io5";

export default function EcoProgramTab({
  onBack,
  byocReminder: propByocReminder,
  onByocTimeChange,
}) {
  const [localReminder, setLocalReminder] = useState(() => {
    try {
      const time = localStorage.getItem("smartserve_byoc_reminder") || "08:00";
      const enabled = localStorage.getItem("smartserve_byoc_enabled") !== "false";
      return { enabled, time };
    } catch {
      return { enabled: true, time: "08:00" };
    }
  });

  const reminder = typeof propByocReminder === "object" && propByocReminder !== null
    ? propByocReminder
    : { enabled: true, time: typeof propByocReminder === "string" ? propByocReminder : localReminder.time };

  const handleToggle = (enabled) => {
    setLocalReminder((prev) => {
      const next = { ...prev, enabled };
      localStorage.setItem("smartserve_byoc_enabled", String(enabled));
      return next;
    });
  };

  const handleTimeChange = (time) => {
    if (onByocTimeChange) {
      onByocTimeChange(time);
    } else {
      setLocalReminder((prev) => {
        const next = { ...prev, time };
        localStorage.setItem("smartserve_byoc_reminder", time);
        return next;
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0f170a] overflow-y-auto pb-10 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 font-sans">
        <button onClick={onBack} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
          <IoArrowBackOutline className="text-xl" />
        </button>
        <p className="text-base font-extrabold text-[#4a6741]">Eco Program</p>
      </div>

      {/* Eco Reminder Setup */}
      <div className="mx-4 mt-4 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 font-sans border border-transparent dark:border-[#2b3924]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f0f7ec] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] flex items-center justify-center">
              <IoLeafOutline className="text-xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">Daily BYOC Reminder</p>
              <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">Get reminded to pack your container</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(reminder.enabled)}
              onChange={(e) => handleToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a6741]"></div>
          </label>
        </div>

        {reminder.enabled && (
          <div className="pt-3 border-t border-gray-100 dark:border-[#2b3924] flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-300 flex items-center gap-1.5">
              <IoTimeOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-base" /> Reminder Time
            </span>
            <input
              type="time"
              value={reminder.time || "08:00"}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-[#24301f] border border-gray-200 dark:border-[#2b3924] text-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
            />
          </div>
        )}
      </div>

      {/* Environmental info card */}
      <div className="mx-4 mt-3 bg-[#e4efe0] dark:bg-[#1c2e17] rounded-3xl p-5 border border-[#c3dfb8] dark:border-[#2f4927] font-sans">
        <h4 className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e] mb-1.5 flex items-center gap-1.5">
          <IoLeafOutline className="text-base" /> Did you know?
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-200 leading-relaxed">
          By bringing your own container (BYOC), you save up to <strong className="text-gray-800 dark:text-white font-extrabold">1.5 lbs of plastic waste</strong> weekly and help reduce single-use container footprints on campus. Every BYOC logs <strong className="text-gray-800 dark:text-white font-extrabold">5 Eco Points</strong> which can be used to redeem canteen discounts and rewards!
        </p>
      </div>
    </div>
  );
}
