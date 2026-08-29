import { useState, useEffect, useRef } from "react";
import { IoChevronDownOutline, IoCheckmarkOutline } from "react-icons/io5";

export default function CustomFilterSelect({ value, onChange, options, icon: Icon, className = "" }) {
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

  const selectedOpt = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#4a6741] text-gray-700 text-xs font-semibold rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-sm transition outline-none"
      >
        <span className="flex items-center gap-1.5 truncate">
          {Icon && <Icon className="text-gray-400 text-sm flex-shrink-0" />}
          <span>{selectedOpt?.label}</span>
        </span>
        <IoChevronDownOutline
          className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180 text-[#4a6741]" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition ${isSelected
                  ? "bg-[#e8f5e2] text-[#4a6741] font-bold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <span>{opt.label}</span>
                {isSelected && <IoCheckmarkOutline className="text-sm text-[#4a6741]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
