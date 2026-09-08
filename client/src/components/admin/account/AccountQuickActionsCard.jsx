import { IoShieldCheckmarkOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

export default function AccountQuickActionsCard({ onNavigate }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-[#4a6741]">Quick Actions</h3>
      </div>
      <div className="p-4 space-y-2">
        <button
          onClick={() => onNavigate("/dashboard/settings/staff")}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f0f7ec] transition text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#e8f5be] flex items-center justify-center flex-shrink-0">
            <IoShieldCheckmarkOutline className="text-[#4a6741] text-base" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-800">Account Settings</p>
            <p className="text-sm text-gray-500">Manage your preferences</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("/dashboard")}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#f0f7ec] transition text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#d7ecc8] flex items-center justify-center flex-shrink-0">
            <IoCheckmarkCircleOutline className="text-[#4a6741] text-base" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-800">View Dashboard</p>
            <p className="text-sm text-gray-500">Go to main dashboard</p>
          </div>
        </button>
      </div>
    </section>
  );
}
