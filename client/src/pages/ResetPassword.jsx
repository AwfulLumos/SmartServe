import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoLockClosed, IoArrowBack, IoCheckmarkCircle, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import api from "../utils/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";
  const code = state?.code || "";

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!email || !code) {
    navigate("/forgot-password");
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
      await api.post("/auth/reset-password", {
        email,
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
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundImage: "url('/bg-cafeteria.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#4a6741]/60" />
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center space-y-5">
          <div className="w-16 h-16 bg-[#c8dfc0] rounded-full flex items-center justify-center mx-auto">
            <IoCheckmarkCircle className="text-[#4a6741] text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-[#4a6741]">Password Reset!</h2>
          <p className="text-gray-500 text-sm">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <Link
            to="/login"
            className="inline-block w-full bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3.5 rounded-xl transition text-sm"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('/bg-cafeteria.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#4a6741]/60" />

      {/* Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Back */}
        <Link
          to="/verify-reset-code"
          state={{ email }}
          className="inline-flex items-center gap-1.5 text-sm text-[#4a6741] font-medium hover:underline mb-6"
        >
          <IoArrowBack className="text-base" />
          Back to login
        </Link>

        {/* Icon */}
        <div className="flex justify-center mb-5">
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
                className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition"
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
                className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition"
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
            className="w-full bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
