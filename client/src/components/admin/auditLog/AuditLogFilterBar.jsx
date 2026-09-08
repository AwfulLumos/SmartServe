import { IoSearchOutline, IoCloseOutline, IoRefreshOutline } from "react-icons/io5";
import CustomFilterSelect from "../menu/CustomFilterSelect";
import { CATEGORY_LABELS, ACTOR_LABELS } from "./AuditLogConstants";

export default function AuditLogFilterBar({
  search,
  setSearch,
  category,
  setCategory,
  actorType,
  setActorType,
  loading,
  onRefresh,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="flex-1 min-w-[240px] relative">
        <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search action, actor, or description…"
          className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:bg-white transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
            title="Clear search"
          >
            <IoCloseOutline className="text-lg" />
          </button>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <CustomFilterSelect
            value={category}
            onChange={setCategory}
            options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({ value: k, label: v }))}
          />
          <CustomFilterSelect
            value={actorType}
            onChange={setActorType}
            options={Object.entries(ACTOR_LABELS).map(([k, v]) => ({ value: k, label: v }))}
          />
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
