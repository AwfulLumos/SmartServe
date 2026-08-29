import { IoSearchOutline, IoCalendarOutline, IoSwapVerticalOutline } from "react-icons/io5";
import CustomFilterSelect from "./CustomFilterSelect";
import { FILTER_TABS } from "./OrdersConstants";

export default function OrdersFilterBar({
  search,
  onSearchChange,
  dateFilter,
  setDateFilter,
  sortBy,
  setSortBy,
  activeFilter,
  onFilterChange,
  orders,
}) {
  return (
    <div className="space-y-4">
      {/* Filter bar: Search, Date Filter, Sort Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input with debounce */}
        <div className="relative flex-1 max-w-md">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] bg-gray-50 transition"
            placeholder="Search by order ID, student name, or ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Filter Dropdown */}
          <CustomFilterSelect
            value={dateFilter}
            onChange={setDateFilter}
            icon={IoCalendarOutline}
            options={[
              { value: "all", label: "All Dates" },
              { value: "today", label: "Today" },
              { value: "yesterday", label: "Yesterday" },
              { value: "week", label: "Last 7 Days" },
            ]}
          />

          {/* Sort Order Dropdown */}
          <CustomFilterSelect
            value={sortBy}
            onChange={setSortBy}
            icon={IoSwapVerticalOutline}
            options={[
              { value: "newest", label: "Newest First" },
              { value: "oldest", label: "Oldest First" },
              { value: "total-desc", label: "Total: High to Low" },
              { value: "total-asc", label: "Total: Low to High" },
            ]}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition ${activeFilter === tab.key
              ? "bg-[#4a6741] text-white border-[#4a6741]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#4a6741] hover:text-[#4a6741]"
              }`}
          >
            {tab.label}
            {tab.key !== "all" &&
              orders.filter((o) => o.status === tab.key).length > 0 && (
                <span className="ml-1.5 text-[10px] font-bold opacity-80">
                  {orders.filter((o) => o.status === tab.key).length}
                </span>
              )}
          </button>
        ))}
      </div>
    </div>
  );
}
