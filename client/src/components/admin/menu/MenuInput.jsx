import { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

export default function MenuInput({ label, required, error, type = "text", ...props }) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPassword ? (showPwd ? "text" : "password") : type}
          {...props}
          className={`w-full px-4 ${isPassword ? "pr-10" : ""} py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-white
            ${error ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"}`}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            {showPwd ? <IoEyeOffOutline className="text-base" /> : <IoEyeOutline className="text-base" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
