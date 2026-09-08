import { useNavigate } from "react-router-dom";
import StudentLayout from "../../components/StudentLayout";
import logo from "../../assets/logo/logo.png";

export default function StudentSplash() {
  const navigate = useNavigate();

  return (
    <StudentLayout>
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Logo */}
        <img src={logo} alt="SmartServe" className="w-28 h-28 object-contain" />

        {/* App Name */}
        <div>
          <h1 className="text-4xl font-bold text-[#4a6741] leading-tight">SmartServe</h1>
          <p className="text-gray-600 text-base mt-1 font-medium">Student & Employee Portal</p>
        </div>

        {/* Tagline */}
        <p className="text-gray-500 text-sm leading-relaxed px-4">
          Earn points with every purchase. Track your eco-impact with BYOC. Redeem rewards!
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate("/student/login")}
          className="w-full bg-[#4a6741] hover:bg-[#3a5333] active:bg-[#2e4228] text-white font-semibold py-4 rounded-2xl transition text-base shadow-md mt-4"
        >
          Get Started
        </button>
      </div>
    </StudentLayout>
  );
}
