import { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoKeyOutline, IoArrowBack } from "react-icons/io5";
import api from "../utils/api";

export default function VerifyResetCode() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputsRef = useRef([]);

  // Redirect back if somehow accessed directly without email
  if (!email) {
    navigate("/forgot-password");
    return null;
  }

  const handleChange = (index, value) => {
    // Accept only single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...digits];
    updated[index] = digit;
    setDigits(updated);
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputsRef.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-reset-code", { email, code });
      navigate("/reset-password", { state: { email, code } });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch {
      setError("Failed to resend code. Please try again.");
    }
  };

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
          to="/forgot-password"
          className="inline-flex items-center gap-1.5 text-sm text-[#4a6741] font-medium hover:underline mb-6"
        >
          <IoArrowBack className="text-base" />
          Back to login
        </Link>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 bg-[#c8dfc0] rounded-full flex items-center justify-center">
            <IoKeyOutline className="text-[#4a6741] text-2xl" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-[#4a6741] text-center mb-1">
          Enter Reset Code
        </h2>
        <p className="text-gray-500 text-sm text-center mb-1">
          We sent a 6-digit code to
        </p>
        <p className="text-[#4a6741] font-semibold text-sm text-center mb-7">{email}</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Inputs */}
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#4a6741] focus:ring-2 focus:ring-[#4a6741]/20 transition"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Didn't receive a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="text-[#4a6741] font-semibold hover:underline"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
