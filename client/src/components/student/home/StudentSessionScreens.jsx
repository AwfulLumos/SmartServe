import React from "react";
import logo from "../../../assets/logo/logo.png";
import { IoLogOutOutline } from "react-icons/io5";

export function StudentLoginLoadingScreen({ progress, statusText, onSkip }) {
  const remainingSec = Math.max(0, (3000 - (progress / 100) * 3000) / 1000).toFixed(1);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2e16] via-[#2a4023] to-[#4a6741] text-white p-6 select-none font-sans">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7fb060]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d7ecc8]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-xs w-full text-center">
        {/* Brand Logo */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center p-2 shadow-2xl overflow-hidden">
            <img src={logo} alt="SmartServe" className="w-full h-full object-cover rounded-full drop-shadow-md" />
          </div>
        </div>

        {/* Brand Titles */}
        <h2 className="text-2xl font-black tracking-wide text-white drop-shadow">SmartServe</h2>
        <p className="text-[11px] uppercase tracking-widest text-[#d7ecc8] font-bold mt-0.5 mb-6">
          Student Portal
        </p>

        {/* Status Text */}
        <div className="h-7 mb-4 flex items-center justify-center">
          <p className="text-sm font-medium text-white/90 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#d7ecc8] animate-ping" />
            {statusText}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/35 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-inner mb-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-[#7fb060] via-[#a3cf5a] to-[#d7ecc8] transition-all duration-75 ease-out shadow-lg shadow-[#7fb060]/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Percentage & Time */}
        <div className="w-full flex justify-between items-center text-xs font-semibold text-white/70 px-1 mb-6">
          <span>Loading your profile...</span>
          <span className="text-[#d7ecc8] font-mono text-sm font-bold">{Math.round(progress)}%</span>
          <span className="font-mono text-[#d7ecc8]">{remainingSec}s</span>
        </div>

        {/* Skip button */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white/80 hover:text-white transition"
          >
            Skip loading ›
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-[11px] text-white/50 tracking-wider">
        SmartServe Canteen System • Student Session
      </div>
    </div>
  );
}

export function StudentLogoutScreen({ countdown, progress, student, profileImageUrl }) {
  const initials = student?.fullName
    ? student.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "S";

  const strokeDashoffset = 2 * Math.PI * 46 * (1 - progress / 100);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#141b13] via-[#1e2e1a] to-[#152314] text-white p-6 select-none font-sans">
      {/* Background Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-red-900/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[#4a6741]/25 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-xs w-full text-center">
        {/* Avatar with countdown ring */}
        <div className="relative mb-5 flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="transparent" />
            <circle
              cx="56"
              cy="56"
              r="46"
              stroke="#ef4444"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-75 ease-linear"
            />
          </svg>
          <div className="absolute w-20 h-20 rounded-full bg-[#4a6741] border-2 border-white/40 shadow-2xl overflow-hidden flex items-center justify-center text-white font-bold text-xl">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt={student?.fullName || "Student"} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>

        {/* Countdown badge */}
        <div className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-extrabold text-sm mb-3 shadow-inner">
          Logging out in {countdown}s
        </div>

        {/* Farewell text */}
        <h2 className="text-2xl font-black text-white tracking-wide">Logging Out...</h2>
        <p className="text-sm text-gray-200 mt-1 mb-1 font-medium">
          Goodbye, <span className="font-bold text-[#d7ecc8]">{student?.fullName || "Student"}</span>!
        </p>
        <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-6">
          Safely ending your student session and clearing local data...
        </p>

        {/* Progress bar */}
        <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/15 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-[#d7ecc8] transition-all duration-75 ease-out shadow-md shadow-red-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1.5 font-medium">
          <IoLogOutOutline className="text-red-400 text-sm animate-pulse" />
          Redirecting to student login screen...
        </p>
      </div>
    </div>
  );
}
