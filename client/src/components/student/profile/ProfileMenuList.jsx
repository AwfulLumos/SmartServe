import React from "react";
import {
  IoCloseOutline,
  IoPerson,
  IoCameraOutline,
  IoLeafOutline,
  IoChevronForwardOutline,
  IoLogOutOutline,
  IoPersonCircleOutline,
  IoSettingsOutline,
  IoChatbubbleEllipsesOutline,
  IoHelpCircleOutline,
} from "react-icons/io5";

export default function ProfileMenuList({
  student,
  profileImageUrl,
  photoUploading,
  handlePhotoSelected,
  onSelectTab,
  myFeedbacksCount,
  onClose,
  onLogout,
}) {
  const MENU_ITEMS = [
    { key: "account", label: "Account Settings", desc: "Edit Profile, Change Password", icon: <IoPersonCircleOutline className="text-xl" /> },
    { key: "preferences", label: "Preferences", desc: "Notifications, Dark Mode", icon: <IoSettingsOutline className="text-xl" /> },
    { key: "eco", label: "Eco Program", desc: "Daily Reminders", icon: <IoLeafOutline className="text-xl" /> },
    { key: "feedback", label: "Feedback & Replies", desc: "Send Feedback, Admin Responses", icon: <IoChatbubbleEllipsesOutline className="text-xl" /> },
    { key: "support", label: "Support & Help", desc: "FAQs, Terms, About", icon: <IoHelpCircleOutline className="text-xl" /> },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0f170a] font-sans">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2b3924] bg-white dark:bg-[#1a2416]">
        <p className="text-base font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">Settings</p>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#24301f] text-gray-400">
          <IoCloseOutline className="text-xl" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-10">
        {/* Hero Card */}
        <div className="mx-4 mt-4 bg-[#4a6741] rounded-3xl px-6 py-6 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <IoPerson className="text-white/80 text-4xl" />
              )}
            </div>
            <label className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-white text-[#4a6741] shadow flex items-center justify-center cursor-pointer hover:bg-gray-100 transition">
              <IoCameraOutline className="text-base" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelected}
                disabled={photoUploading}
              />
            </label>
          </div>
          <p className="text-white font-extrabold text-xl">{student?.fullName ?? "—"}</p>
          <p className="text-white/70 text-xs font-mono mt-0.5">{student?.schoolId ?? "—"}</p>
          {photoUploading && <p className="text-white/80 text-xs mt-1">Uploading photo...</p>}
        </div>

        {/* Points Summary Card */}
        <div className="mx-4 mt-3 bg-white dark:bg-[#1a2416] border border-transparent dark:border-[#2b3924] rounded-3xl shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#f0f7ec] dark:bg-[#2e4028] flex items-center justify-center">
              <IoLeafOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-400 font-semibold leading-none">Eco Points</p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mt-1">Balance</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">{student?.points ?? 0}</p>
          </div>
        </div>

        {/* Menu list */}
        <div className="mx-4 mt-3 bg-white dark:bg-[#1a2416] border border-transparent dark:border-[#2b3924] rounded-3xl shadow-sm divide-y divide-gray-100 dark:divide-[#2b3924] overflow-hidden font-sans">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-[#24301f] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f0f7ec] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">{item.label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.key === "feedback" && myFeedbacksCount > 0 && (
                  <span className="text-[11px] font-bold bg-[#e8f5e2] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] px-2 py-0.5 rounded-full">
                    {myFeedbacksCount}
                  </span>
                )}
                <IoChevronForwardOutline className="text-gray-400 dark:text-gray-400 text-lg" />
              </div>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mx-4 mt-5">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-200 text-red-500 hover:bg-red-50 font-bold text-sm transition"
          >
            <IoLogOutOutline className="text-lg" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
