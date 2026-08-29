import { useState } from "react";
import {
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";

export default function AccountPasswordForm({
  pwForm,
  setPwForm,
  changingPw,
  onChangePassword,
}) {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-[#4a6741] flex items-center gap-2">
          <IoLockClosedOutline />
          Change Password
        </h3>
        <p className="text-sm text-gray-500 mt-1">Update your login password. You will be logged out after a successful change.</p>
      </div>
      <form onSubmit={onChangePassword} className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Password */}
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
          Current Password
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              value={pwForm.oldPassword}
              onChange={(e) => setPwForm((prev) => ({ ...prev, oldPassword: e.target.value }))}
              placeholder="Enter current password"
              className="w-full h-10 rounded-xl border border-gray-200 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
              required
            />
            <button
              type="button"
              onClick={() => setShowOld((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4a6741] transition cursor-pointer"
              tabIndex={-1}
            >
              {showOld ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </div>
        </label>

        {/* New Password */}
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
          New Password
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Min. 6 characters"
              className="w-full h-10 rounded-xl border border-gray-200 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4a6741] transition cursor-pointer"
              tabIndex={-1}
            >
              {showNew ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </div>
        </label>

        {/* Confirm New Password */}
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
          Confirm New Password
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Repeat new password"
              className="w-full h-10 rounded-xl border border-gray-200 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4a6741] transition cursor-pointer"
              tabIndex={-1}
            >
              {showConfirm ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </div>
        </label>

        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={changingPw}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4a6741] text-white hover:bg-[#3a5333] text-sm transition font-semibold disabled:opacity-70 cursor-pointer"
          >
            <IoLockClosedOutline />
            {changingPw ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  );
}
