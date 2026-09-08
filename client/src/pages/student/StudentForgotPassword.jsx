import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoPhonePortraitOutline, IoArrowBack, IoMail } from "react-icons/io5";
import { MdTag } from "react-icons/md";
import StudentLayout from "../../components/StudentLayout";
import api from "../../utils/api";

export default function StudentForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ schoolId: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/student/auth/forgot-password", form);
      navigate("/student/verify-reset-code", { state: { schoolId: form.schoolId.toUpperCase().trim(), email: form.email.trim() } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout>
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl px-6 py-8 w-full">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/student/login")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 font-medium mb-5 hover:text-[#4a6741] transition"
        >
          <IoArrowBack className="text-base" />
          Back to Login
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#4a6741] rounded-full flex items-center justify-center shadow-md">
            <IoPhonePortraitOutline className="text-white text-3xl" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-[#4a6741] text-center mb-1">
          Forgot Password?
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          No worries, we'll help you reset it
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* School ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              School ID
            </label>
            <div className="relative">
              <MdTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                name="schoolId"
                value={form.schoolId}
                onChange={handleChange}
                placeholder="STU-2024-001"
                required
                autoCapitalize="characters"
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition bg-white"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <IoMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your.email@school.edu"
                required
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a6741] hover:bg-[#3a5333] active:bg-[#2e4228] text-white font-semibold py-4 rounded-xl transition disabled:opacity-60 text-base shadow-sm"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Help box */}
        <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
          <span className="font-bold">Need help?</span> Contact your school administrator if
          you're unable to reset your password.
        </div>
      </div>
    </StudentLayout>
  );
}
