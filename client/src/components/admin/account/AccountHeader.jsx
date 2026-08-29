import { IoPersonOutline, IoArrowBackOutline } from "react-icons/io5";

export default function AccountHeader({ onNavigateBack }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
          <IoPersonOutline className="text-3xl" />
          Account Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage your personal profile details, account credentials, and security settings
        </p>
      </div>
      <button
        onClick={onNavigateBack}
        className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-[#4a6741] bg-white border border-gray-200 hover:border-[#4a6741]/40 px-3.5 py-2.5 rounded-xl transition shadow-sm self-start sm:self-auto cursor-pointer"
      >
        <IoArrowBackOutline className="text-sm" />
        Back to Dashboard
      </button>
    </div>
  );
}
