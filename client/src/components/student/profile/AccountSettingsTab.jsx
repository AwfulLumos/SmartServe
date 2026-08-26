import React, { useState } from "react";
import {
  IoArrowBackOutline,
  IoLockClosedOutline,
  IoIdCardOutline,
  IoSchoolOutline,
  IoMailOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";

export default function AccountSettingsTab({
  student,
  editForm,
  setEditForm,
  savingProfile,
  handleSaveProfile,
  passForm,
  setPassForm,
  changingPass,
  handleChangePassword,
  onBack,
}) {
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const memberSince = student?.createdAt
    ? new Date(student.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "—";

  const isEmployee = student?.userType === "employee";
  const idLabel = isEmployee ? "Employee ID" : "School ID";
  const idValue = student?.schoolId || student?.studentNo || "—";

  const classLabel = isEmployee ? "Job Title / Dept" : "Grade & Section";
  const classValue = isEmployee
    ? [student?.jobTitle, student?.department].filter(Boolean).join(" · ") || "—"
    : [
      student?.gradeLevel && `Grade ${student.gradeLevel}`,
      student?.section && `Section ${student.section}`,
      student?.course,
      student?.yearLevel && `Year ${student.yearLevel}`,
    ]
      .filter(Boolean)
      .join(" - ") || "—";

  const accountTypeLabel = isEmployee ? "Employee Account" : "Student Account";

  const INFO_ROWS = [
    { icon: <IoIdCardOutline className="text-[#4a6741] text-lg" />, label: idLabel, value: idValue },
    { icon: <IoPersonOutline className="text-[#4a6741] text-lg" />, label: "Full Name", value: student?.fullName ?? "—" },
    { icon: <IoMailOutline className="text-[#4a6741] text-lg" />, label: "Email", value: student?.email ?? "—" },
    { icon: <IoSchoolOutline className="text-[#4a6741] text-lg" />, label: classLabel, value: classValue },
    { icon: <IoShieldCheckmarkOutline className="text-[#4a6741] text-lg" />, label: "Account Type", value: accountTypeLabel },
    { icon: <IoCalendarOutline className="text-[#4a6741] text-lg" />, label: "Member Since", value: memberSince },
  ];

  const renderHeader = (title, onBackAction) => (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 font-sans">
      <button onClick={onBackAction} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
        <IoArrowBackOutline className="text-xl" />
      </button>
      <p className="text-base font-extrabold text-[#4a6741]">{title}</p>
    </div>
  );

  if (showChangePassword) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0f170a] overflow-y-auto pb-10 font-sans">
        {renderHeader("Change Password", () => setShowChangePassword(false))}
        <div className="mx-4 mt-4 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 border border-transparent dark:border-[#2b3924]">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passForm?.currentPassword || ""}
                onChange={(e) => setPassForm((p) => ({ ...p, currentPassword: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#2b3924] rounded-xl text-sm bg-white dark:bg-[#24301f] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={passForm?.newPassword || ""}
                onChange={(e) => setPassForm((p) => ({ ...p, newPassword: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#2b3924] rounded-xl text-sm bg-white dark:bg-[#24301f] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20"
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passForm?.confirmPassword || ""}
                onChange={(e) => setPassForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#2b3924] rounded-xl text-sm bg-white dark:bg-[#24301f] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20"
                placeholder="Repeat new password"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24301f] rounded-xl font-semibold text-sm transition"
                disabled={changingPass}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changingPass}
                className="flex-1 px-4 py-2.5 bg-[#4a6741] text-white hover:bg-[#3a5333] rounded-xl font-semibold text-sm transition disabled:opacity-60"
              >
                {changingPass ? "Saving..." : "Save Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0f170a] overflow-y-auto pb-10 font-sans">
      {renderHeader("Account Settings", onBack)}

      {/* Profile details */}
      <div className="mx-4 mt-4 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 border border-transparent dark:border-[#2b3924]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">Profile Details</p>
          {!isEditingAccount && (
            <button
              onClick={() => setIsEditingAccount(true)}
              className="text-xs font-bold text-[#4a6741] dark:text-[#8ebd7e] hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingAccount ? (
          <form
            onSubmit={(e) => {
              if (handleSaveProfile) handleSaveProfile(e);
              setIsEditingAccount(false);
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs text-gray-400 mb-1">{idLabel}</label>
              <input
                type="text"
                value={idValue}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#2b3924] rounded-xl text-sm bg-gray-50 dark:bg-[#24301f] text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={editForm?.fullName ?? student?.fullName ?? ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                disabled={savingProfile}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#2b3924] rounded-xl text-sm bg-white dark:bg-[#24301f] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20"
              />
            </div>

            {!isEmployee ? (
              <>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Grade Level</label>
                  <input
                    type="text"
                    value={editForm?.gradeLevel ?? student?.gradeLevel ?? ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, gradeLevel: e.target.value }))}
                    disabled={savingProfile}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#2b3924] rounded-xl text-sm bg-white dark:bg-[#24301f] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Section</label>
                  <input
                    type="text"
                    value={editForm?.section ?? student?.section ?? ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, section: e.target.value }))}
                    disabled={savingProfile}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#2b3924] rounded-xl text-sm bg-white dark:bg-[#24301f] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={editForm?.jobTitle ?? student?.jobTitle ?? ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
                    disabled={savingProfile}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#2b3924] rounded-xl text-sm bg-white dark:bg-[#24301f] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={editForm?.department ?? student?.department ?? ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, department: e.target.value }))}
                    disabled={savingProfile}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-[#2b3924] rounded-xl text-sm bg-white dark:bg-[#24301f] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingAccount(false)}
                disabled={savingProfile}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24301f] rounded-xl font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="flex-1 px-4 py-2.5 bg-[#4a6741] text-white hover:bg-[#3a5333] rounded-xl font-semibold text-sm transition disabled:opacity-60"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3 font-sans">
            {INFO_ROWS.map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#24301f] flex items-center justify-center flex-shrink-0">
                  {row.icon}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-400 leading-none mb-0.5">{row.label}</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Password Trigger Button */}
      {!isEditingAccount && (
        <div className="mx-4 mt-3">
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm border border-gray-200 dark:border-[#2b3924] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24301f] font-bold text-sm transition"
          >
            <IoLockClosedOutline className="text-base text-[#4a6741] dark:text-[#8ebd7e]" />
            Change Password
          </button>
        </div>
      )}
    </div>
  );
}
