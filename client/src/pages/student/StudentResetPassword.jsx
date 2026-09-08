import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoLockClosed, IoArrowBack, IoCheckmarkCircle, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import StudentLayout from "../../components/StudentLayout";
import api from "../../utils/api";

export default function StudentResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const schoolId = state?.schoolId || "";
  const code = state?.code || "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!schoolId || !code) {
    navigate("/student/forgot-password");
    return null;
  }

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/student/auth/reset-password", {
        schoolId,
        code,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <StudentLayout>
        <div className="bg-white rounded-3xl shadow-xl px-6 py-8 w-full text-center space-y-5">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#c8dfc0] rounded-full flex items-center justify-center">
              <IoCheckmarkCircle className="text-[#4a6741] text-3xl" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#4a6741]">Password Reset!</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <button
            onClick={() => navigate("/student/login")}
            className="w-full bg-[#4a6741] hover:bg-[#3a5333] active:bg-[#2e4228] text-white font-semibold py-4 rounded-xl transition text-base shadow-sm"
          >
            Back to Sign In
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="bg-white rounded-3xl shadow-xl px-6 py-8 w-full">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 font-medium mb-5 hover:text-[#4a6741] transition"
        >
          <IoArrowBack className="text-base" />
          Back
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#c8dfc0] rounded-full flex items-center justify-center">
            <IoLockClosed className="text-[#4a6741] text-2xl" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-[#4a6741] text-center mb-1">
          Set New Password
        </h2>
        <p className="text-gray-500 text-sm text-center mb-7">
          Create a new password for your account
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <IoLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className="w-full pl-11 pr-11 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition bg-white"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <IoEyeOffOutline className="text-lg" /> : <IoEyeOutline className="text-lg" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <IoLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat new password"
                required
                minLength={6}
                className="w-full pl-11 pr-11 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition bg-white"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showConfirm ? <IoEyeOffOutline className="text-lg" /> : <IoEyeOutline className="text-lg" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a6741] hover:bg-[#3a5333] active:bg-[#2e4228] text-white font-semibold py-4 rounded-xl transition disabled:opacity-60 text-base shadow-sm mt-2"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </StudentLayout>
  );
}
