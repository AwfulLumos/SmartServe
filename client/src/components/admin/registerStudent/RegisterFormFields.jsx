import { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline, IoChevronDownOutline } from "react-icons/io5";

export const Field = ({ label, required, icon, error, type = "text", ...props }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
          {icon}
        </span>
        <input
          type={isPassword ? (showPwd ? "text" : "password") : type}
          {...props}
          className={`w-full pl-10 ${isPassword ? "pr-9" : "pr-4"} py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-white
            ${error
              ? "border-red-300 focus:ring-red-200 focus:border-red-400"
              : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
            }`}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            {showPwd ? <IoEyeOffOutline className="text-base" /> : <IoEyeOutline className="text-base" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export const SelectField = ({ label, required, icon, error, children, ...props }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
          {icon}
        </span>
        <select
          {...props}
          className={`w-full appearance-none no-custom-arrow pl-10 pr-9 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-white
            ${error
              ? "border-red-300 focus:ring-red-200 focus:border-red-400"
              : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
            }`}
        >
          {children}
        </select>
        <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
