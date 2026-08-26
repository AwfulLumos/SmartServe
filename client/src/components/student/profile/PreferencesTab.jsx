import React, { useState } from "react";
import { IoArrowBackOutline, IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

export default function PreferencesTab({
  onBack,
  darkMode,
  onDarkModeToggle,
  notifPrefs: propNotifPrefs,
  onNotifToggle,
}) {
  const [localNotifPrefs, setLocalNotifPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem("smartserve_notif_prefs");
      return saved ? JSON.parse(saved) : { orderUpdates: true, ecoPoints: true, newRewards: true };
    } catch {
      return { orderUpdates: true, ecoPoints: true, newRewards: true };
    }
  });

  const notifPrefs = propNotifPrefs || localNotifPrefs;

  const handleToggle = (key) => {
    if (onNotifToggle) {
      onNotifToggle(key);
    } else {
      setLocalNotifPrefs((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        localStorage.setItem("smartserve_notif_prefs", JSON.stringify(next));
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
        <p className="text-base font-extrabold text-[#4a6741]">Preferences</p>
      </div>

      {/* Dark Mode toggle */}
      <div className="mx-4 mt-4 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 font-sans border border-transparent dark:border-[#2b3924]">
        <div className="flex items-center justify-between font-sans">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f0f7ec] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] flex items-center justify-center">
              {darkMode ? <IoMoonOutline className="text-xl" /> : <IoSunnyOutline className="text-xl" />}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">Dark Mode</p>
              <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">Toggle dark theme for night usage</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(darkMode)}
              onChange={onDarkModeToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a6741]"></div>
          </label>
        </div>
      </div>

      {/* Notifications toggles */}
      <div className="mx-4 mt-3 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 font-sans border border-transparent dark:border-[#2b3924]">
        <p className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e] mb-4">Notifications</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">Order Updates</p>
              <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">Notify when status changes (e.g. Ready)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(notifPrefs?.orderUpdates)}
                onChange={() => handleToggle("orderUpdates")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a6741]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2b3924]">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">Eco Points</p>
              <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">Alerts when new Eco Points are awarded</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(notifPrefs?.ecoPoints)}
                onChange={() => handleToggle("ecoPoints")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a6741]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2b3924]">
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">Rewards Catalog</p>
              <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">Notifications about new items available</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(notifPrefs?.newRewards)}
                onChange={() => handleToggle("newRewards")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a6741]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
