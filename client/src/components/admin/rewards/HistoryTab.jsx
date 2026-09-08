import { useState, useEffect, useCallback } from "react";
import {
  IoGiftOutline,
  IoCalendarOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import api from "../../../utils/api";
import { SkeletonTable } from "../../SkeletonLoader";
import { fmt, CustomFilterSelect } from "./RewardsConstants";

export default function HistoryTab() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/redemptions", { params: { search } });
      setRecords(data.redemptions);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchHistory, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchHistory]);

  const filteredRecords = records.filter((r) => {
    if (timeframeFilter !== "all") {
      const recordDate = new Date(r.createdAt);
      const now = new Date();
      if (timeframeFilter === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (recordDate < today) return false;
      } else if (timeframeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (recordDate < weekAgo) return false;
      } else if (timeframeFilter === "month") {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        if (recordDate < monthAgo) return false;
      }
    }
    return true;
  });

  return (
    <div>
      {/* Controls Card: Search & Refresh */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or ID..."
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:bg-white transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              title="Clear search"
            >
              <IoCloseOutline className="text-lg" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <CustomFilterSelect
            value={timeframeFilter}
            onChange={setTimeframeFilter}
            options={[
              { value: "all", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
            ]}
          />

          <button
            onClick={fetchHistory}
            className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0"
            title="Refresh"
          >
            <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_0.8fr_1fr] items-center px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
          <span>Student</span>
          <span>School ID</span>
          <span>Reward</span>
          <span>Points Used</span>
          <span>Timestamp</span>
        </div>

        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={6} columns={5} showHeader={false} />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <IoCalendarOutline className="text-4xl text-gray-300" />
            <p className="text-sm">{search || timeframeFilter !== "all" ? "No records match." : "No redemption history yet."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filteredRecords.map((r) => (
              <li key={r._id} className="grid grid-cols-[1.5fr_1.2fr_1.2fr_0.8fr_1fr] items-center px-5 py-3.5 hover:bg-gray-50 transition">
                <span className="text-sm font-medium text-gray-800 truncate">{r.studentName}</span>
                <span className="font-mono text-xs font-semibold text-[#4a6741]">{r.schoolId}</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                  <IoGiftOutline className="text-[#4a6741]" />
                  {r.rewardName}
                </span>
                <span className="text-xs font-bold text-red-500">-{r.pointsUsed} pts</span>
                <span className="text-xs text-gray-400 font-mono">{fmt(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}

        {!loading && filteredRecords.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-700">{filteredRecords.length}</span> record{filteredRecords.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
