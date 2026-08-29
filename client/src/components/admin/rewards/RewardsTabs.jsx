import { TABS } from "./RewardsConstants";

export default function RewardsTabs({ activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-0 border-b border-gray-200 mb-6 mt-4">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition border-b-2 -mb-px cursor-pointer ${
            activeTab === t.key
              ? "border-[#4a6741] text-[#4a6741]"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <span className="text-base">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}
