import { IoSearchOutline, IoCloseOutline, IoRefreshOutline } from "react-icons/io5";
import { STATUS_FILTERS } from "./InventoryConstants";

export default function InventoryFilterBar({
  search,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onRefresh,
  loading,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex-1 min-w-[240px] relative">
        <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search items by name or category…"
          className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:bg-white transition"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
            title="Clear search"
          >
            <IoCloseOutline className="text-lg" />
          </button>
        )}
      </div>

      {/* Filter Pills & Refresh */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition whitespace-nowrap cursor-pointer ${activeFilter === f.key
                ? "bg-[#4a6741] text-white border-[#4a6741] shadow-sm"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#4a6741]/40 hover:text-[#4a6741]"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0 cursor-pointer"
          title="Refresh"
        >
          <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}
