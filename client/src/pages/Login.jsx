import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoPerson,
  IoLockClosed,
  IoTrendingUp,
  IoPeople,
  IoCube,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";
import logo from "../assets/logo/logo.png";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: <IoTrendingUp className="text-xl" />,
    title: "Sales Analytics",
    desc: "Track revenue, best sellers, and peak hours with detailed reports",
  },
  {
    icon: <IoPeople className="text-xl" />,
    title: "Student Management",
    desc: "Register students, track points, and manage rewards seamlessly",
  },
  {
    icon: <IoCube className="text-xl" />,
    title: "Inventory Control",
    desc: "Monitor stock with smart alerts and AI-powered recommendations",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(form.username, form.password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 relative overflow-hidden bg-gradient-to-br from-[#3a5230] to-[#4d7040]">
        {/* Background overlay pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_80%,_#ffffff_1px,_transparent_1px),radial-gradient(circle_at_80%_20%,_#ffffff_1px,_transparent_1px)] bg-[length:40px_40px]" />

        {/* Top — Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 p-2 shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={logo} alt="SmartServe" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold leading-tight">SmartServe</h1>
            <p className="text-white/70 text-sm">Admin Portal</p>
          </div>
        </div>

        {/* Center — Tagline + Features */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-white text-3xl font-semibold leading-snug">
            Manage your school cafeteria with ease
          </h2>
          <div className="space-y-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4"
              >
                <div className="w-10 h-10 bg-[#7fb060]/80 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-white/70 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-white/50 text-sm">
          Trusted by schools nationwide for cafeteria excellence
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-[#f4f8f1] border border-[#4a6741]/20 flex items-center justify-center p-2 mb-4 shadow-md overflow-hidden">
              <img src={logo} alt="SmartServe" className="w-full h-full object-cover rounded-full" />
            </div>
            <h2 className="text-3xl font-bold text-brand mb-1">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Sign in to manage your cafeteria</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <IoPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition"
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

            {/* Remember me / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-brand rounded"
                />
                <span className="text-sm text-gray-600 font-medium">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-[#4a6741] font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Need an account?{" "}
            <Link to="/register" className="text-brand font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
