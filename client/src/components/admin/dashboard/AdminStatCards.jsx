import {
  IoBagOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoFlameOutline,
  IoAlertOutline,
  IoPeopleOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
} from "react-icons/io5";

const peso = (n) =>
  "₱" + Number(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function PctBadge({ pct }) {
  const up = pct >= 0;
  return (
    <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${up ? "bg-[#e8f5e2] text-[#4a6741]" : "bg-red-100 text-red-600"}`}>
      {up ? <IoArrowUpOutline className="text-[10px]" /> : <IoArrowDownOutline className="text-[10px]" />}
      {Math.abs(pct)}%
    </span>
  );
}

export default function AdminStatCards({ stats = {}, loading }) {
  const s = stats;

  const statCards = [
    {
      label: "Transactions Today",
      value: loading ? "—" : s.transactionsToday ?? 0,
      icon: <IoBagOutline className="text-[#4a6741] text-2xl" />,
      iconBg: "bg-[#e8f5e2]",
      pct: s.transactionsPct ?? 0,
      note: "vs yesterday",
    },
    {
      label: "Revenue Today",
      value: loading ? "—" : peso(s.revenueToday),
      icon: <IoCashOutline className="text-[#4a6741] text-2xl" />,
      iconBg: "bg-[#dff0d6]",
      pct: s.revenuePct ?? 0,
      note: "vs yesterday",
    },
    {
      label: "Items Sold",
      value: loading ? "—" : s.itemsSoldToday ?? 0,
      icon: <IoTrendingUpOutline className="text-[#4a6741] text-2xl" />,
      iconBg: "bg-[#e8f5e2]",
      pct: s.itemsSoldPct ?? 0,
      note: "vs yesterday",
    },
    {
      label: "Active Orders",
      value: loading ? "—" : s.activeOrders ?? 0,
      valueColor: (s.activeOrders ?? 0) > 0 ? "text-blue-600" : "text-gray-800",
      icon: <IoFlameOutline className={`text-2xl ${(s.activeOrders ?? 0) > 0 ? "text-blue-500" : "text-[#4a6741]"}`} />,
      iconBg: (s.activeOrders ?? 0) > 0 ? "bg-blue-50" : "bg-[#e8f5e2]",
      sub: s.pendingOrders > 0 ? `${s.pendingOrders} pending` : "All clear",
      subColor: s.pendingOrders > 0 ? "text-yellow-600" : "text-gray-400",
    },
    {
      label: "Low Stock Items",
      value: loading ? "—" : (s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0),
      valueColor: (s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0) > 0 ? "text-red-600" : "text-gray-800",
      icon: <IoAlertOutline className={`text-2xl ${(s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0) > 0 ? "text-red-500" : "text-[#4a6741]"}`} />,
      iconBg: (s.lowStockCount ?? 0) + (s.outOfStockCount ?? 0) > 0 ? "bg-red-50" : "bg-[#e8f5e2]",
      sub: s.outOfStockCount > 0 ? `${s.outOfStockCount} out of stock` : "No critical issues",
      subColor: s.outOfStockCount > 0 ? "text-red-500" : "text-gray-400",
    },
    {
      label: "Active Students",
      value: loading ? "—" : s.totalStudents ?? 0,
      icon: <IoPeopleOutline className="text-[#4a6741] text-2xl" />,
      iconBg: "bg-[#e8f5e2]",
      sub: "Registered accounts",
      subColor: "text-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {statCards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <p className="text-sm text-gray-500 font-medium leading-snug">{card.label}</p>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>
          <p className={`text-3xl font-bold tracking-tight ${card.valueColor ?? "text-gray-800"}`}>
            {card.value}
          </p>
          <div className="flex items-center gap-2 text-xs">
            {card.pct !== undefined ? (
              <>
                <PctBadge pct={card.pct} />
                <span className="text-gray-400">{card.note}</span>
              </>
            ) : (
              <span className={`text-xs font-medium ${card.subColor}`}>{card.sub}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
