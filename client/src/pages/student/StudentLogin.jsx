import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoLockClosed, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { MdTag } from "react-icons/md";
import StudentLayout from "../../components/StudentLayout";
import logo from "../../assets/logo/logo.png";
import { useStudentAuth } from "../../context/StudentAuthContext";

export default function StudentLogin() {
  const navigate = useNavigate();
  const { login, loading } = useStudentAuth();

  const [form, setForm] = useState({ schoolId: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(form.schoolId, form.password);
    if (result.success) {
      navigate("/student/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <StudentLayout>
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl px-6 py-8 w-full">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="SmartServe" className="w-24 h-24 object-contain mb-3" />
          <h2 className="text-2xl font-bold text-[#4a6741] text-center">Welcome Back</h2>
          <p className="text-gray-500 text-sm text-center mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* School ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ID Number
            </label>
            <div className="relative">
              <MdTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                name="schoolId"
                value={form.schoolId}
                onChange={handleChange}
                placeholder="ID Number"
                required
                autoCapitalize="characters"
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition bg-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <IoLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
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

          {/* Remember me / Forgot */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#4a6741] rounded"
              />
              <span className="text-sm text-gray-700 font-semibold">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/student/forgot-password")}
              className="text-sm text-[#4a6741] font-semibold hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a6741] hover:bg-[#3a5333] active:bg-[#2e4228] text-white font-semibold py-4 rounded-xl transition disabled:opacity-60 text-base mt-1 shadow-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Info box */}
        <div className="mt-5 bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 leading-relaxed">
          <p>Earn points with every purchase</p>
          <p>Track your eco-impact with BYOC. Redeem rewards!</p>
        </div>
      </div>
    </StudentLayout>
  );
}
