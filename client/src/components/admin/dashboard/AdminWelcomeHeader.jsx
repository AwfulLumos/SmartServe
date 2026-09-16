import {
  IoCalendarOutline,
  IoRefreshOutline,
  IoFlameOutline,
  IoArrowForwardOutline,
  IoStorefrontOutline,
} from "react-icons/io5";

const fmtTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};

export default function AdminWelcomeHeader({ user, today, loading, lastRefreshed, onRefresh, navigate }) {
  const hours = new Date().getHours();
  const isServiceHours = hours >= 6 && hours < 18;

  let shiftName = "Pre-Opening";
  if (hours >= 6 && hours < 10) shiftName = "Breakfast Shift";
  else if (hours >= 10 && hours < 14) shiftName = "Lunch Rush Shift";
  else if (hours >= 14 && hours < 18) shiftName = "Afternoon Snack Shift";
  else shiftName = "Closed / Prep Mode";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#3d5933] via-[#4a6741] to-[#2d4227] rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-md border border-[#5d8152]/30">
      {/* Decorative ambient background accents */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-36 -bottom-10 w-36 h-36 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />
      <div className="absolute left-1/3 -top-10 w-28 h-28 rounded-full bg-white/5 blur-lg pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        {/* Left Column: Greeting & Status Badges */}
        <div className="space-y-2.5 sm:space-y-3">
          {/* Status & Live Meta Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Live Service Indicator */}
            <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold backdrop-blur-md border ${isServiceHours
              ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
              : "bg-amber-500/20 text-amber-200 border-amber-400/30"
              }`}>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isServiceHours ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <IoStorefrontOutline className="text-xs" />
              <span>{shiftName}</span>
            </div>

            {/* Date Badge */}
            <span className="flex items-center gap-1.5 bg-black/20 text-white/90 text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
              <IoCalendarOutline className="text-xs text-white/80" />
              {today}
            </span>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh dashboard data"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white/90 text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md border border-white/15 transition-all disabled:opacity-60 cursor-pointer"
            >
              <IoRefreshOutline className={`text-sm ${loading ? "animate-spin" : ""}`} />
              {lastRefreshed ? `Updated ${fmtTime(lastRefreshed)}` : "Refresh"}
            </button>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs">
              Welcome back, {user?.fullName?.split(" ")[0] ?? "Admin"}
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-xl font-normal leading-relaxed">
              SmartServe Cafeteria operations hub. Monitor transactions, student traffic, orders, and real-time network telemetry.
            </p>
          </div>
        </div>

        {/* Right Column: Quick Portal Navigation Buttons (Thumb-friendly on mobile) */}
        <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:items-center sm:gap-3 sm:w-auto flex-shrink-0 self-stretch lg:self-center">
          <button
            onClick={() => navigate("/dashboard/orders")}
            className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-xl border border-white/25 shadow-xs backdrop-blur-md cursor-pointer w-full sm:w-auto"
          >
            <IoFlameOutline className="text-amber-300 text-base sm:text-lg" />
            <span>Live Orders</span>
          </button>
          <button
            onClick={() => navigate("/dashboard/analytics")}
            className="flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 active:scale-95 transition-all text-[#3d5933] text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-xl shadow-md hover:shadow-lg cursor-pointer w-full sm:w-auto"
          >
            <span>Analytics</span>
            <IoArrowForwardOutline className="text-sm sm:text-base" />
          </button>
        </div>
      </div>
    </div>
  );
}
