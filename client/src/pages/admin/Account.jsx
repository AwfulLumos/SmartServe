import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  IoArrowBackOutline,
  IoCalendarOutline,
  IoCameraOutline,
  IoCheckmarkCircleOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoLogOutOutline,
  IoMailOutline,
  IoPersonOutline,
  IoPulseOutline,
  IoSaveOutline,
  IoShieldCheckmarkOutline,
  IoTrashOutline,
} from "react-icons/io5";
import AdminLayout, { triggerAdminLogout } from "../../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";

const fmtDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const fmtTime = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const resolveProfileImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (apiBase.startsWith("http")) {
    return `${apiBase.replace(/\/api\/?$/, "")}${url}`;
  }
  return url;
};

export default function Account() {
  const navigate = useNavigate();
  const { user, updateProfile, uploadProfileImage, deleteMyAccount, logout, changePassword } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ fullName: "", username: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Change-password form state
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPw, setChangingPw] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setForm({
      fullName: user?.fullName || "",
      username: user?.username || "",
      email: user?.email || "",
    });
  }, [user?.fullName, user?.username, user?.email]);

  const initials = useMemo(() => {
    if (!user?.fullName) return "A";
    return user.fullName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.fullName]);

  const profileImage = resolveProfileImageUrl(user?.profileImageUrl || "");

  const accountRows = [
    { icon: <IoPersonOutline className="text-[#4a6741] text-lg" />, label: "Full Name", value: user?.fullName || "Not set" },
    { icon: <IoPersonOutline className="text-[#4a6741] text-lg" />, label: "Username", value: user?.username || "Not set" },
    { icon: <IoMailOutline className="text-[#4a6741] text-lg" />, label: "Email", value: user?.email || "Not set" },
    {
      icon: <IoShieldCheckmarkOutline className="text-[#4a6741] text-lg" />,
      label: "Role",
      value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Administrator",
    },
    { icon: <IoCalendarOutline className="text-[#4a6741] text-lg" />, label: "Member Since", value: fmtDate(user?.createdAt) },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile({
      fullName: form.fullName,
      username: form.username,
      email: form.email,
    });
    setSaving(false);

    if (result.success) {
      toast.success("Account information updated");
    } else {
      toast.error(result.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setChangingPw(true);
    const result = await changePassword(pwForm.oldPassword, pwForm.newPassword, pwForm.confirmPassword);
    setChangingPw(false);
    if (result.success) {
      toast.success(result.message || "Password changed. Please log in again.");
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(result.message);
    }
  };

  const handlePickImage = () => fileInputRef.current?.click();

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    setUploading(true);
    const result = await uploadProfileImage(file);
    setUploading(false);
    e.target.value = "";

    if (result.success) {
      toast.success("Profile picture updated");
    } else {
      toast.error(result.message);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete your account permanently? This cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    const result = await deleteMyAccount();
    setDeleting(false);

    if (result.success) {
      toast.success(result.message || "Account deleted");
      navigate("/login", { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <AdminLayout breadcrumb="Account">
      <div className="max-w-[1100px] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
              <IoPersonOutline className="text-3xl" />
              Account Settings
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage your personal profile details, account credentials, and security settings
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#4a6741] bg-white border border-gray-200 hover:border-[#4a6741]/40 px-3.5 py-2.5 rounded-xl transition shadow-sm self-start sm:self-auto"
          >
            <IoArrowBackOutline className="text-sm" />
            Back to Dashboard
          </button>
        </div>

        <section className="relative overflow-hidden bg-[#6c944d] rounded-2xl p-5 sm:p-6">
          <div className="absolute -left-16 -top-10 w-72 h-72 rounded-full bg-black/10" />
          <div className="absolute -right-20 -top-12 w-72 h-72 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#e8f5be] shadow-xl overflow-hidden border border-white/30 flex items-center justify-center text-[#4a6741] font-bold text-2xl">
              {profileImage ? (
                <img src={profileImage} alt={user?.fullName || "User"} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <div className="text-white flex-1 min-w-0">
              <p className="text-2xl font-bold truncate">{user?.fullName || "Admin"}</p>
              <p className="text-white/90 text-sm mt-0.5">@{user?.username || "admin"}</p>
              <span className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full border border-white/35 bg-white/15 text-white text-xs font-medium">
                <IoShieldCheckmarkOutline />
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Admin"}
              </span>
            </div>

            <div className="sm:self-start">
              <button
                onClick={handlePickImage}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-[#4a6741] hover:bg-[#f0f7ec] text-xs font-semibold transition disabled:opacity-70"
              >
                <IoCameraOutline />
                {uploading ? "Uploading..." : "Update Photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-[#4a6741]">Account Information</h2>
            <p className="text-sm text-gray-500 mt-1">Your personal details and account settings</p>
          </div>
          <div className="divide-y divide-gray-100">
            {accountRows.map((row) => (
              <div key={row.label} className="px-5 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e8f5be] flex items-center justify-center flex-shrink-0">
                  {row.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500 leading-none mb-1">{row.label}</p>
                  <p className="text-base font-semibold text-gray-800 leading-tight">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-[#4a6741]">Edit Account</h3>
          </div>
          <form onSubmit={handleSave} className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
              Full Name
              <input
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                className="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
              Username
              <input
                value={form.username}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                className="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
                required
              />
            </label>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4a6741] text-white hover:bg-[#3a5333] text-sm transition font-semibold disabled:opacity-70"
              >
                <IoSaveOutline />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* ── Change Password ── */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-[#4a6741] flex items-center gap-2">
              <IoLockClosedOutline />
              Change Password
            </h3>
            <p className="text-sm text-gray-500 mt-1">Update your login password. You will be logged out after a successful change.</p>
          </div>
          <form onSubmit={handleChangePassword} className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4a6741] transition"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4a6741] transition"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4a6741] transition"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4a6741] text-white hover:bg-[#3a5333] text-sm transition font-semibold disabled:opacity-70"
              >
                <IoLockClosedOutline />
                {changingPw ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-[#4a6741] flex items-center gap-2">
              <IoPulseOutline />
              Activity Summary
            </h3>
            <p className="text-sm text-gray-500 mt-1">Your recent activity overview</p>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Last Login</p>
              <p className="text-[#4a6741] text-2xl font-bold mt-1">{user?.lastLoginAt ? "Today" : "Not set"}</p>
              <p className="text-sm text-gray-500 mt-1">{fmtTime(user?.lastLoginAt)}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Sessions This Week</p>
              <p className="text-[#4a6741] text-2xl font-bold mt-1">{user?.loginCount ?? 0}</p>
              <p className="text-sm text-gray-500 mt-1">Across all devices</p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="text-green-600 text-2xl font-bold mt-1">Active</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-[#4a6741]">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-2">
            <button
              onClick={() => navigate("/dashboard/settings/staff")}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f0f7ec] transition text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#e8f5be] flex items-center justify-center">
                <IoShieldCheckmarkOutline className="text-[#4a6741] text-base" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-800">Account Settings</p>
                <p className="text-sm text-gray-500">Manage your preferences</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f0f7ec] transition text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#d7ecc8] flex items-center justify-center">
                <IoCheckmarkCircleOutline className="text-[#4a6741] text-base" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-800">View Dashboard</p>
                <p className="text-sm text-gray-500">Go to main dashboard</p>
              </div>
            </button>
          </div>
        </section>

        {/* ── Action Buttons (Delete Account on Left, Logout on Right) ── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full sm:flex-1 h-12 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center gap-2 text-sm font-semibold transition disabled:opacity-70 cursor-pointer"
          >
            <IoTrashOutline className="text-base" />
            <span>{deleting ? "Deleting account..." : "Delete My Account"}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              triggerAdminLogout();
            }}
            className="w-full sm:flex-1 h-12 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 flex items-center justify-center gap-2 text-sm font-semibold transition cursor-pointer"
          >
            <IoLogOutOutline className="text-base" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
