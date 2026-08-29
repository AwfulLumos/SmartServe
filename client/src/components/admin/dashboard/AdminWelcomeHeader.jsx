import { IoCalendarOutline, IoRefreshOutline, IoFlameOutline, IoArrowForwardOutline } from "react-icons/io5";

const fmt = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};

export default function AdminWelcomeHeader({ user, today, loading, lastRefreshed, onRefresh, navigate }) {
  return (
    <div className="relative overflow-hidden bg-[#4a6741] rounded-2xl px-6 py-6 text-white">
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute right-24 bottom-[-30px] w-28 h-28 rounded-full bg-white/5" />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="flex items-center gap-1.5 bg-white/15 text-white/90 text-xs font-medium px-3 py-1 rounded-full">
              <IoCalendarOutline className="text-sm" />
              {today}
            </span>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white/90 text-xs font-medium px-3 py-1 rounded-full transition disabled:opacity-60"
            >
              <IoRefreshOutline className={`text-sm ${loading ? "animate-spin" : ""}`} />
              {lastRefreshed ? `Updated ${fmt(lastRefreshed)}` : "Refresh"}
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            Welcome back, {user?.fullName?.split(" ")[0] ?? "Admin"}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Here's what's happening in your cafeteria today.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate("/dashboard/orders")}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/20"
          >
            <IoFlameOutline className="text-base" />
            Live Orders
          </button>
          <button
            onClick={() => navigate("/dashboard/analytics")}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 transition text-[#4a6741] text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm"
          >
            Analytics
            <IoArrowForwardOutline className="text-base" />
          </button>
        </div>
      </div>
    </div>
  );
}
