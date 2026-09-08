import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IoPerson,
  IoMail,
  IoLockClosed,
  IoShield,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";
import logo from "../assets/logo/logo.png";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: <IoShield className="text-xl" />,
    title: "Secure Platform",
    desc: "Your data is protected with enterprise-grade security",
  },
  {
    icon: <IoPerson className="text-xl" />,
    title: "Easy Setup",
    desc: "Get started in minutes with our intuitive interface",
  },
  {
    icon: <IoCheckmarkCircle className="text-xl" />,
    title: "Full Access",
    desc: "Access all features based on your role immediately",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await register(form);
    if (result.success) {
      setSuccessMsg(result.message);
    } else {
      setError(result.message);
    }
  };

  // --- Success / pending-approval screen ---
  if (successMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <IoTimeOutline className="text-amber-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Account Submitted</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{successMsg}</p>
          <Link
            to="/login"
            className="inline-block w-full bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 relative overflow-hidden bg-gradient-to-br from-[#3a5230] to-[#4d7040]">
        {/* Background overlay pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_80%,_#ffffff_1px,_transparent_1px),radial-gradient(circle_at_80%_20%,_#ffffff_1px,_transparent_1px)] bg-[length:40px_40px]" />

        {/* Top — Badge + Logo */}
        <div className="relative z-10 space-y-4">
          <span className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium px-4 py-1.5 rounded-full">
            Join Our Platform
          </span>
          <div className="flex items-center gap-3">
            <img src={logo} alt="SmartServe" className="w-20 h-20 object-contain drop-shadow-lg" />
            <div>
              <h1 className="text-white text-2xl font-bold leading-tight">SmartServe</h1>
              <p className="text-white/70 text-sm">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Center — Tagline + Features */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-white text-3xl font-semibold leading-snug">
            Create your account and start managing
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
        <div className="w-full max-w-[440px]">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="SmartServe" className="w-24 h-24 object-contain mb-3" />
            <h2 className="text-3xl font-bold text-brand mb-1">Create Account</h2>
            <p className="text-gray-500 text-sm">Register as staff or admin</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row: Full Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <IoPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition"
                  />
                </div>
              </div>
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
                    placeholder="john@example.com"
                    required
                    className="w-full pl-11 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition"
                  />
                </div>
              </div>
            </div>

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
                  placeholder="johndoe"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Role
              </label>
              <div className="relative">
                <IoShield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>

            {/* Row: Password + Confirm */}
            <div className="grid grid-cols-2 gap-4">
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
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <IoEyeOffOutline className="text-base" /> : <IoEyeOutline className="text-base" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <IoLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741] transition"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirm ? <IoEyeOffOutline className="text-base" /> : <IoEyeOutline className="text-base" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60 mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
