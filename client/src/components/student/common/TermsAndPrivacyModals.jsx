import React from "react";
import { IoCloseOutline, IoShieldCheckmarkOutline, IoDocumentTextOutline, IoQrCodeOutline, IoLeafOutline, IoServerOutline } from "react-icons/io5";

export function TermsOfServiceSheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px] px-0 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl w-full max-w-[420px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Grab bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IoDocumentTextOutline className="text-lg" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-800 text-sm">Terms of Service</h3>
              <p className="text-[10px] text-gray-600 font-medium">Updated September 16, 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:text-gray-900 flex items-center justify-center hover:bg-gray-200 transition active:scale-95"
            aria-label="Close Terms"
          >
            <IoCloseOutline className="text-lg" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-5 pt-3 pb-6 overflow-y-auto text-xs text-gray-600 leading-relaxed flex flex-col gap-3.5 scrollbar-thin">
          <div className="p-3 bg-emerald-50/70 border border-emerald-100/80 rounded-xl text-emerald-950 text-[11px] leading-normal font-medium">
            Welcome to SmartServe. By accessing our mobile canteen portal, digital campus pass, or ordering services, you agree to these terms and campus regulations.
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a6741]"></span>
              1. Student Accounts & Authentication
            </div>
            <p className="mt-1 text-[11.5px]">
              Access is granted exclusively to enrolled students and staff. You are responsible for safeguarding your credentials. Sharing accounts or authentication tokens is prohibited.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs uppercase tracking-wide">
              <IoQrCodeOutline className="text-[#4a6741] text-xs" />
              2. Digital Campus Pass & QR Scanner
            </div>
            <p className="mt-1 text-[11.5px]">
              Your Digital Campus Pass QR code is personal and non-transferable. Passes must be scanned at cashier counters for meal verification and BYOC validation. Selling, sharing screenshots, or forging pass QR codes is strictly forbidden.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a6741]"></span>
              3. Mobile Ordering & Kitchen Operations
            </div>
            <p className="mt-1 text-[11.5px]">
              Orders placed are dispatched immediately to the canteen queue. Once food preparation begins (&quot;Preparing&quot;), orders cannot be cancelled. Prepared meals must be claimed within 20 minutes of &quot;Ready for Pickup&quot; status.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs uppercase tracking-wide">
              <IoLeafOutline className="text-[#4a6741] text-xs" />
              4. BYOC & Eco Rewards Program
            </div>
            <p className="mt-1 text-[11.5px]">
              Bring Your Own Container (BYOC) items must be clean, dry, and food-safe. Cashiers verify containers prior to awarding Eco Points. Eco Points hold no cash value and are redeemable exclusively within the SmartServe Rewards Catalog.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs uppercase tracking-wide">
              <IoServerOutline className="text-[#4a6741] text-xs" />
              5. System Security & Telemetry Protection
            </div>
            <p className="mt-1 text-[11.5px]">
              SmartServe logs device telemetry, client IP, and security attempts to defend against botting, credential abuse, and unauthorized intrusions. System abuse or queue tampering will result in immediate suspension.
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#4a6741] text-white font-bold rounded-xl hover:bg-[#3d5635] active:scale-[0.99] transition shadow-sm text-xs"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicySheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px] px-0 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl w-full max-w-[420px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Grab bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IoShieldCheckmarkOutline className="text-lg" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-800 text-sm">Privacy Policy</h3>
              <p className="text-[10px] text-gray-600 font-medium">Updated September 16, 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:text-gray-900 flex items-center justify-center hover:bg-gray-200 transition active:scale-95"
            aria-label="Close Privacy"
          >
            <IoCloseOutline className="text-lg" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-5 pt-3 pb-6 overflow-y-auto text-xs text-gray-600 leading-relaxed flex flex-col gap-3.5 scrollbar-thin">
          <div className="p-3 bg-emerald-50/70 border border-emerald-100/80 rounded-xl text-emerald-950 text-[11px] leading-normal font-medium">
            SmartServe safeguards personal data in full compliance with campus data protection policies. Here is how your information is handled.
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a6741]"></span>
              1. Information We Collect
            </div>
            <p className="mt-1 text-[11.5px]">
              We collect essential identity info (Full Name, School ID, Email, Section/Course), voluntary profile photos for pass verification, meal order transaction records, BYOC scan histories, and security telemetry (client IP, device type, failed login reasons).
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a6741]"></span>
              2. How Your Data is Used
            </div>
            <p className="mt-1 text-[11.5px]">
              Your information is used strictly for kitchen order scheduling, Digital Campus Pass cashier verification, Eco Points balances, and security telemetry to defend your account from unauthorized intrusions.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a6741]"></span>
              3. Data Security & Encryption
            </div>
            <p className="mt-1 text-[11.5px]">
              Account credentials are encrypted using industry-standard bcrypt hashing. Sessions use signed JSON Web Tokens (JWT). We never sell, rent, or monetize personal data with commercial advertisers.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a6741]"></span>
              4. Security Audit Logs & Retention
            </div>
            <p className="mt-1 text-[11.5px]">
              Network telemetry and failed authentication records are restricted strictly to authorized canteen administrators for security auditing, after which they are safely pruned.
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#4a6741] text-white font-bold rounded-xl hover:bg-[#3d5635] active:scale-[0.99] transition shadow-sm text-xs"
            >
              Close Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
