import { useState, useEffect, useRef } from "react";
import {
  IoChevronDownOutline,
  IoCheckmarkOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
} from "react-icons/io5";

export const GRANULARITIES = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

export const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
});

export function formatCurrency(value) {
  return currency.format(Number(value || 0));
}

export function formatDays(value) {
  if (value == null) return "N/A";
  return `${value} days`;
}

export function formatShortCurrency(value) {
  const n = Number(value || 0);
  if (n >= 1000000) return `₱${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₱${(n / 1000).toFixed(1)}K`;
  return `₱${n.toFixed(0)}`;
}

export function compareChange(pct) {
  if (pct == null) return "N/A";
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${up ? "bg-[#e8f5e2] text-[#4a6741]" : "bg-red-100 text-red-600"}`}>
      {up ? <IoArrowUpOutline /> : <IoArrowDownOutline />}
      {Math.abs(pct)}%
    </span>
  );
}

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
        className={`bg-white hover:bg-gray-50 border text-gray-700 text-xs font-semibold rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 shadow-sm transition outline-none cursor-pointer ${value && value !== "all" && value !== "" ? "border-[#4a6741] text-[#4a6741] bg-[#d7ecc8]/25" : "border-gray-200"
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
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition cursor-pointer ${isSelected
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
