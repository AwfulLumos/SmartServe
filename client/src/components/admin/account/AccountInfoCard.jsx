import {
  IoPersonOutline,
  IoMailOutline,
  IoShieldCheckmarkOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import { fmtDate } from "./AccountConstants";

export default function AccountInfoCard({ user }) {
  const accountRows = [
    { icon: <IoPersonOutline className="text-[#4a6741] text-lg" />, label: "Full Name", value: user?.fullName || "Not set" },
    { icon: <IoPersonOutline className="text-[#4a6741] text-lg" />, label: "Username", value: user?.username || "Not set" },
    { icon: <IoMailOutline className="text-[#4a6741] text-lg" />, label: "Email", value: user?.email || "Not set" },
    {
      icon: <IoShieldCheckmarkOutline className="text-[#4a6741] text-lg" />,
      label: "Role",
      value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Administrator",
    },
    { icon: <IoCalendarOutline className="text-[#4a6741] text-lg" />, label: "Member Since", value: fmtDate(user?.createdAt) },
  ];

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-[#4a6741]">Account Information</h2>
        <p className="text-sm text-gray-500 mt-1">Your personal details and account settings</p>
      </div>
      <div className="divide-y divide-gray-100">
        {accountRows.map((row) => (
          <div key={row.label} className="px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5be] flex items-center justify-center flex-shrink-0">
              {row.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 leading-none mb-1">{row.label}</p>
              <p className="text-base font-semibold text-gray-800 leading-tight">{row.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
