import { useState, useEffect, useRef } from "react";
import {
  IoStar,
  IoStarOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";

export const resolveStudentImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (apiBase.startsWith("http")) {
    return `${apiBase.replace(/\/api\/?$/, "")}${url}`;
  }
  return url;
};

export function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} hour${h !== 1 ? "s" : ""} ago`;
  }
  const d = Math.floor(diff / 86400);
  if (d < 7) return `${d} day${d !== 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function StarRating({ rating = 5 }) {
  return (
    <div className="flex items-center gap-1 text-amber-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <IoStar className="text-base" />
          ) : (
            <IoStarOutline className="text-base text-gray-300" />
          )}
        </span>
      ))}
      <span className="text-xs font-bold text-gray-700 ml-1.5">{rating}.0</span>
    </div>
  );
}

export const CATEGORY_STYLES = {
  General: "bg-blue-50 text-blue-700 border-blue-200",
  "Food Quality": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Canteen Service": "bg-purple-50 text-purple-700 border-purple-200",
  "App Issue": "bg-rose-50 text-rose-700 border-rose-200",
  Suggestion: "bg-amber-50 text-amber-700 border-amber-200",
};

export const STATUS_CFG = {
  pending: { label: "Pending", badge: "bg-amber-100 text-amber-800 border-amber-300", icon: <IoTimeOutline /> },
  reviewed: { label: "Reviewed", badge: "bg-blue-100 text-blue-800 border-blue-300", icon: <IoCheckmarkCircleOutline /> },
  resolved: { label: "Resolved", badge: "bg-[#e8f5e2] text-[#4a6741] border-[#4a6741]/30", icon: <IoCheckmarkCircleOutline /> },
};

export function CustomSelect({ value, onChange, options, className = "" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#4a6741] text-gray-700 text-sm font-medium rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-sm transition outline-none cursor-pointer"
      >
        <span className="truncate flex items-center gap-2">
          {selectedOpt?.icon}
          {selectedOpt?.label}
        </span>
        <IoChevronDownOutline
          className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180 text-[#4a6741]" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-full min-w-[170px] bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? "bg-[#e8f5e2] text-[#4a6741] font-bold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  {opt.icon}
                  {opt.label}
                </span>
                {isSelected && <IoCheckmarkOutline className="text-sm text-[#4a6741]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
