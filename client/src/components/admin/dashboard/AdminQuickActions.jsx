import toast from "react-hot-toast";
import {
  IoPersonAddOutline,
  IoSearchOutline,
  IoCubeOutline,
  IoGiftOutline,
  IoBarChartOutline,
  IoArrowForwardOutline,
} from "react-icons/io5";

export default function AdminQuickActions({ navigate }) {
  const quickActions = [
    { label: "Register Student", desc: "Add a new student account", icon: <IoPersonAddOutline className="text-[#4a6741] text-2xl" />, to: "/dashboard/register-student" },
    { label: "Student Lookup", desc: "Search student records", icon: <IoSearchOutline className="text-[#4a6741] text-2xl" />, to: "/dashboard/student-lookup", wip: true },
    { label: "Add Inventory", desc: "Update stock levels", icon: <IoCubeOutline className="text-[#4a6741] text-2xl" />, to: "/dashboard/inventory" },
    { label: "Manage Rewards", desc: "Update reward tiers", icon: <IoGiftOutline className="text-[#4a6741] text-2xl" />, to: "/dashboard/rewards" },
    { label: "View Analytics", desc: "Sales and trend reports", icon: <IoBarChartOutline className="text-[#4a6741] text-2xl" />, to: "/dashboard/analytics" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-[#4a6741]">Quick Actions</h2>
      </div>
      <div className="p-3 flex flex-col gap-1">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => action.wip ? toast("Not yet implemented", { icon: "🚧" }) : navigate(action.to)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#f0f7ec] transition text-left group w-full"
          >
            <div className="w-9 h-9 rounded-xl bg-[#e8f5e2] flex items-center justify-center flex-shrink-0 group-hover:bg-[#d7ecc8] transition">
              {action.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{action.label}</p>
              <p className="text-xs text-gray-400">{action.desc}</p>
            </div>
            <IoArrowForwardOutline className="ml-auto text-gray-300 group-hover:text-[#4a6741] transition" />
          </button>
        ))}
      </div>
    </div>
  );
}
