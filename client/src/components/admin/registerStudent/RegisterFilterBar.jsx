import { IoSearchOutline, IoCloseOutline, IoRefreshOutline } from "react-icons/io5";
import CustomFilterSelect from "./CustomFilterSelect";
import { studentGradeOptions, employeeDepartmentOptions } from "./RegisterConstants";

export default function RegisterFilterBar({
  search,
  onSearchChange,
  userTypeFilter,
  onUserTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  gradeLevelFilter,
  onGradeLevelFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  onResetFilters,
  onRefresh,
  listLoading,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="flex-1 min-w-[240px] relative">
        <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
        <input
          type="text"
          placeholder="Search by name, School ID or email…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
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

      {/* Action Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* User Type Filter */}
          <CustomFilterSelect
            value={userTypeFilter}
            onChange={onUserTypeFilterChange}
            options={[
              { value: "", label: "All Types" },
              { value: "student", label: "Student" },
              { value: "employee", label: "Employee" },
            ]}
          />

          {/* Status Filter */}
          <CustomFilterSelect
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={[
              { value: "", label: "All Statuses" },
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
          />

          {/* Grade Level (Conditional) */}
          {userTypeFilter === "student" && (
            <CustomFilterSelect
              value={gradeLevelFilter}
              onChange={onGradeLevelFilterChange}
              options={[
                { value: "", label: "All Grades" },
                ...studentGradeOptions.map((g) => ({ value: g, label: g })),
              ]}
            />
          )}

          {/* Department (Conditional) */}
          {userTypeFilter === "employee" && (
            <CustomFilterSelect
              value={departmentFilter}
              onChange={onDepartmentFilterChange}
              options={[
                { value: "", label: "All Departments" },
                ...employeeDepartmentOptions.map((d) => ({ value: d, label: d })),
              ]}
            />
          )}

          {(userTypeFilter || statusFilter || gradeLevelFilter || departmentFilter) && (
            <button
              onClick={onResetFilters}
              className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 transition cursor-pointer"
              title="Clear all filters"
            >
              Reset
            </button>
          )}
        </div>

        <button
          onClick={onRefresh}
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0 cursor-pointer"
          title="Refresh"
        >
          <IoRefreshOutline className={`text-base ${listLoading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}
