import { useState, useEffect, useRef } from "react";
import {
  IoGiftOutline,
  IoStarOutline,
  IoLeafOutline,
  IoChevronDownOutline,
  IoCheckmarkOutline,
  IoCalendarOutline,
} from "react-icons/io5";

export const ICON_MAP = {
  gift: <IoGiftOutline />,
  star: <IoStarOutline />,
  leaf: <IoLeafOutline />,
};

export const TYPE_LABEL = {
  free_item: "Free Item",
  discount: "Discount",
  eco_badge: "Eco Badge",
};

export const TYPE_BADGE = {
  free_item: "bg-[#d7ecc8] text-[#4a6741]",
  discount: "bg-yellow-100 text-yellow-700",
  eco_badge: "bg-teal-100 text-teal-700",
};

export const fmt = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const roleBadge = (role) =>
  role === "admin" ? "bg-[#d7ecc8] text-[#4a6741]" : "bg-gray-100 text-gray-600";

export const TABS = [
  { key: "redeem", label: "Redeem Rewards", icon: <IoGiftOutline /> },
  { key: "configure", label: "Configure Rewards", icon: <IoStarOutline /> },
  { key: "history", label: "Redemption History", icon: <IoCalendarOutline /> },
  { key: "byoc", label: "BYOC Records", icon: <IoLeafOutline /> },
];

export const CONFIG_FIELDS = [
  {
    key: "pointsPerPeso",
    label: "Points Per Peso Spent",
    hint: (v) => `Current: ${v} points per ₱1`,
    step: "0.01",
    min: "0",
  },
  {
    key: "ecoPointsPerByoc",
    label: "Eco Points Per BYOC",
    hint: () => "Eco points awarded when students bring their own containers",
    step: "1",
    min: "0",
  },
  {
    key: "minRedemptionPoints",
    label: "Minimum Redemption Points",
    hint: (v) => `Students need at least ${v} points to redeem a reward`,
    step: "1",
    min: "0",
  },
];

export const emptyRewardForm = {
  name: "",
  description: "",
  type: "free_item",
  pointsCost: "",
  icon: "gift",
};

export function CustomFilterSelect({ value, onChange, options, icon: Icon, placeholder = "Select...", className = "" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = options.find((o) => String(o.value) === String(value)) || options[0];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`bg-gray-50 hover:bg-white border text-gray-700 text-xs font-semibold rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-sm transition outline-none ${
          value && value !== "all" && value !== "" ? "border-[#4a6741] text-[#4a6741] bg-[#d7ecc8]/25" : "border-gray-200"
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {Icon && <Icon className="text-gray-400 text-sm flex-shrink-0" />}
          <span>{selectedOpt?.label || placeholder}</span>
        </span>
        <IoChevronDownOutline
          className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180 text-[#4a6741]" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition ${
                  isSelected
                    ? "bg-[#e8f5e2] text-[#4a6741] font-bold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <IoCheckmarkOutline className="text-[#4a6741] text-sm flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
