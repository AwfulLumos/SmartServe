import { IoSearchOutline } from "react-icons/io5";
import { CustomSelect } from "./FeedbacksConstants";

export default function FeedbacksFilterBar({
  search,
  setSearch,
  category,
  setCategory,
  rating,
  setRating,
  status,
  setStatus,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="flex-1 min-w-[220px] relative">
        <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student, ID, or feedback message..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:bg-white transition"
        />
      </div>

      {/* Custom Category Filter */}
      <CustomSelect
        value={category}
        onChange={setCategory}
        options={[
          { value: "all", label: "All Categories" },
          { value: "General", label: "General" },
          { value: "Food Quality", label: "Food Quality" },
          { value: "Canteen Service", label: "Canteen Service" },
          { value: "App Issue", label: "App Issue" },
          { value: "Suggestion", label: "Suggestion" },
        ]}
        className="min-w-[160px]"
      />

      {/* Custom Rating Filter */}
      <CustomSelect
        value={rating}
        onChange={setRating}
        options={[
          { value: "all", label: "All Ratings" },
          { value: "5", label: "5 Stars ⭐⭐⭐⭐⭐" },
          { value: "4", label: "4 Stars ⭐⭐⭐⭐" },
          { value: "3", label: "3 Stars ⭐⭐⭐" },
          { value: "2", label: "2 Stars ⭐⭐" },
          { value: "1", label: "1 Star ⭐" },
        ]}
        className="min-w-[150px]"
      />

      {/* Custom Status Filter */}
      <CustomSelect
        value={status}
        onChange={setStatus}
        options={[
          { value: "all", label: "All Statuses" },
          { value: "pending", label: "Pending" },
          { value: "reviewed", label: "Reviewed" },
          { value: "resolved", label: "Resolved" },
        ]}
        className="min-w-[140px]"
      />
    </div>
  );
}
