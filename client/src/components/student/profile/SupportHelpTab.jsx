import React, { useState } from "react";
import logo from "../../../assets/logo/logo.png";
import { IoArrowBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { TermsOfServiceSheet, PrivacyPolicySheet } from "../common/TermsAndPrivacyModals";

export default function SupportHelpTab({ onBack }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const FAQS = [
    { q: "How do I earn Eco Points?", a: "Bring your own container (BYOC) when ordering at the canteen. Canteen staff will scan your QR code and award you 5 Eco Points!" },
    { q: "How do I redeem rewards?", a: "Go to the 'Rewards' tab, select a reward, and click 'Redeem'. You can show your redeemed coupon code to the canteen staff." },
    { q: "Can I cancel an order?", a: "Orders can be cancelled as long as they are still 'Pending'. Once the kitchen starts 'Preparing' your order, it cannot be cancelled." },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0f170a] overflow-y-auto pb-10 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 font-sans">
        <button onClick={onBack} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
          <IoArrowBackOutline className="text-xl" />
        </button>
        <p className="text-base font-extrabold text-[#4a6741]">Support & Help</p>
      </div>

      {/* FAQs */}
      <div className="mx-4 mt-4 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 font-sans border border-transparent dark:border-[#2b3924]">
        <p className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e] mb-3">Frequently Asked Questions</p>
        <div className="space-y-3 font-sans">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={faq.q} className="border-b border-gray-100 dark:border-[#2b3924] last:border-b-0 pb-3 last:pb-0">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-1"
                >
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{faq.q}</span>
                  <IoChevronForwardOutline className={`text-sm text-[#4a6741] dark:text-[#8ebd7e] transition-transform ${isOpen ? "rotate-90" : ""}`} />
                </button>
                {isOpen && (
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-2 leading-relaxed bg-gray-50 dark:bg-[#24301f] p-3 rounded-xl">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* About App */}
      <div className="mx-4 mt-3 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 text-center font-sans border border-transparent dark:border-[#2b3924]">
        <img src={logo} alt="SmartServe" className="w-12 h-12 mx-auto object-contain mb-2 font-sans" />
        <p className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">SmartServe</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-400 font-mono mt-0.5">Version 2.0.4 (Build 2026.08)</p>
        <p className="text-xs text-gray-500 dark:text-gray-300 mt-3 leading-relaxed">
          SmartServe is a smart-canteen ordering system promoting zero waste and high efficiency inside school campuses.
        </p>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2b3924] flex justify-center gap-4 text-xs font-bold text-[#4a6741] dark:text-[#8ebd7e] font-sans">
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="hover:underline font-sans text-[#4a6741] dark:text-[#8ebd7e] font-bold outline-none"
          >
            Terms of Service
          </button>
          <span className="text-gray-300 dark:text-gray-600 font-sans">•</span>
          <button
            type="button"
            onClick={() => setShowPrivacy(true)}
            className="hover:underline font-sans text-[#4a6741] font-bold outline-none"
          >
            Privacy Policy
          </button>
        </div>
      </div>

      {/* Modal Sheets */}
      {showTerms && <TermsOfServiceSheet onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyPolicySheet onClose={() => setShowPrivacy(false)} />}
    </div>
  );
}
