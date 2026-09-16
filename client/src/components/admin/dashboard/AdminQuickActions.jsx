import toast from "react-hot-toast";
import {
  IoPersonAddOutline,
  IoSearchOutline,
  IoCubeOutline,
  IoGiftOutline,
  IoBarChartOutline,
  IoArrowForwardOutline,
  IoFlashOutline,
} from "react-icons/io5";

export default function AdminQuickActions({ navigate }) {
  const quickActions = [
    {
      label: "Register Student",
      desc: "Enroll new student card or account",
      icon: <IoPersonAddOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-xl" />,
      to: "/dashboard/register-student",
    },
    {
      label: "Student Lookup",
      desc: "Search student profile and records",
      icon: <IoSearchOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-xl" />,
      to: "/dashboard/student-lookup",
      wip: true,
    },
    {
      label: "Add / Update Inventory",
      desc: "Restock items & ingredients",
      icon: <IoCubeOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-xl" />,
      to: "/dashboard/inventory",
    },
    {
      label: "Manage Rewards & BYOC",
      desc: "Configure tiers & eco-incentives",
      icon: <IoGiftOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-xl" />,
      to: "/dashboard/rewards",
    },
    {
      label: "View Advanced Analytics",
      desc: "Forecasts & sales trend reports",
      icon: <IoBarChartOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-xl" />,
      to: "/dashboard/analytics",
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1a2416] rounded-2xl border border-gray-100 dark:border-[#2b3924] shadow-sm overflow-hidden flex flex-col h-full transition-all duration-200">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-[#2b3924] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#e8f5e2] dark:bg-[#24301f] flex items-center justify-center text-[#4a6741] dark:text-[#8ebd7e]">
            <IoFlashOutline className="text-lg" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Quick Actions</h3>
            <p className="text-xs text-gray-400 dark:text-gray-400">Essential shortcuts & workflows</p>
          </div>
        </div>
      </div>

      {/* Action Items List */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() =>
              action.wip ? toast("Not yet implemented", { icon: "🚧" }) : navigate(action.to)
            }
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#f0f7ec] dark:hover:bg-[#24301f] active:scale-[0.99] transition-all text-left group w-full cursor-pointer border border-transparent hover:border-[#4a6741]/20 dark:hover:border-[#8ebd7e]/20"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f5e2] dark:bg-[#24301f] flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-[#d7ecc8] dark:group-hover:bg-[#2f4028] transition-all">
              {action.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-100 group-hover:text-[#4a6741] dark:group-hover:text-[#8ebd7e] transition-colors truncate">
                  {action.label}
                </p>
                {action.wip && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    WIP
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-400 truncate mt-0.5">
                {action.desc}
              </p>
            </div>

            <IoArrowForwardOutline className="text-gray-300 dark:text-gray-600 group-hover:text-[#4a6741] dark:group-hover:text-[#8ebd7e] group-hover:translate-x-0.5 transition-all text-sm flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
