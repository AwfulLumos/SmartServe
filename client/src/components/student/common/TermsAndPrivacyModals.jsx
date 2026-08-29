import React from "react";
import { IoCloseOutline, IoShieldCheckmarkOutline } from "react-icons/io5";

export function TermsOfServiceSheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 font-sans">
      <div className="bg-white rounded-t-3xl w-full max-w-[390px] overflow-hidden shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <IoShieldCheckmarkOutline className="text-[#4a6741] text-xl" />
            <h3 className="font-extrabold text-gray-800 text-base">Terms of Service</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <IoCloseOutline className="text-gray-500 text-lg" />
          </button>
        </div>
        <div className="px-5 pt-4 pb-6 overflow-y-auto max-h-[65vh] text-xs text-gray-600 leading-relaxed flex flex-col gap-3">
          <p className="font-bold text-gray-800 text-sm">Welcome to SmartServe Canteen System</p>
          <p>
            By accessing or using the SmartServe platform, you agree to comply with and be bound by the following Terms of Service. Please review them carefully.
          </p>

          <p className="font-extrabold text-gray-800 text-xs uppercase tracking-wider mt-1">1. Student Accounts & Authentication</p>
          <p>
            Students are responsible for maintaining the confidentiality of their login credentials and QR code identifiers. Any activity occurring under your account is your sole responsibility.
          </p>

          <p className="font-extrabold text-gray-800 text-xs uppercase tracking-wider mt-1">2. Ordering & Payment</p>
          <p>
            All food orders placed via the SmartServe app are final upon canteen counter processing. Please ensure item selections and BYOC preferences are correct before placing an order.
          </p>

          <p className="font-extrabold text-gray-800 text-xs uppercase tracking-wider mt-1">3. BYOC & Eco Program Policy</p>
          <p>
            Eco points earned through the Bring Your Own Container (BYOC) program are non-transferable and subject to verification by canteen cashiers upon QR verification.
          </p>

          <p className="font-extrabold text-gray-800 text-xs uppercase tracking-wider mt-1">4. Code of Conduct</p>
          <p>
            Misuse of student IDs, submitting false feedback, or attempting to tamper with order queues will result in account suspension and referral to campus discipline administration.
          </p>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#4a6741] text-white font-bold rounded-2xl hover:bg-[#3a5333] transition"
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 font-sans">
      <div className="bg-white rounded-t-3xl w-full max-w-[390px] overflow-hidden shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <IoShieldCheckmarkOutline className="text-[#4a6741] text-xl" />
            <h3 className="font-extrabold text-gray-800 text-base">Privacy Policy</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <IoCloseOutline className="text-gray-500 text-lg" />
          </button>
        </div>
        <div className="px-5 pt-4 pb-6 overflow-y-auto max-h-[65vh] text-xs text-gray-600 leading-relaxed flex flex-col gap-3">
          <p className="font-bold text-gray-800 text-sm">Data Privacy & Security Statement</p>
          <p>
            SmartServe is committed to protecting your personal information and complying with applicable data protection laws.
          </p>

          <p className="font-extrabold text-gray-800 text-xs uppercase tracking-wider mt-1">1. Information We Collect</p>
          <p>
            We collect your student number, full name, year level, course, email address, and order transaction history to fulfill canteen operations and award rewards points.
          </p>

          <p className="font-extrabold text-gray-800 text-xs uppercase tracking-wider mt-1">2. How Information is Used</p>
          <p>
            Your data is strictly utilized for meal order tracking, eco point calculations, and account authentication. We never sell or share your data with external third-party advertisers.
          </p>

          <p className="font-extrabold text-gray-800 text-xs uppercase tracking-wider mt-1">3. Data Retention & Security</p>
          <p>
            Passwords are encrypted using industry-standard hashing algorithms (bcrypt). Sessions are protected using secure JSON Web Tokens (JWT).
          </p>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#4a6741] text-white font-bold rounded-2xl hover:bg-[#3a5333] transition"
            >
              Close Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
