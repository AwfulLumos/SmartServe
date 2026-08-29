import { IoArrowForwardOutline, IoBagOutline } from "react-icons/io5";
import { SkeletonTable } from "../../SkeletonLoader";

const fmt = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const peso = (n) =>
  "₱" + Number(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_STYLES = {
  pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-700" },
  preparing: { label: "Preparing", cls: "bg-blue-100 text-blue-700" },
  ready: { label: "Ready", cls: "bg-purple-100 text-purple-700" },
  completed: { label: "Completed", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-500" },
};

export default function AdminRecentOrdersTable({ recentOrders = [], loading, navigate }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-[#4a6741]">Recent Orders</h2>
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#4a6741] hover:underline"
        >
          View All <IoArrowForwardOutline />
        </button>
      </div>

      {loading ? (
        <div className="p-4">
          <SkeletonTable rows={5} columns={6} showHeader={false} />
        </div>
      ) : !recentOrders?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <IoBagOutline className="text-4xl text-gray-300" />
          <p className="text-sm">No orders yet today.</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Order</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Student</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Items</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentOrders.map((o) => {
              const st = STATUS_STYLES[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-600" };
              return (
                <tr key={o._id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => navigate("/dashboard/orders")}>
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-[#4a6741]">{o.orderNumber}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800 text-sm leading-tight truncate">{o.studentName}</p>
                    <p className="text-xs text-gray-400 font-mono">{o.schoolId}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0} item(s)</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-gray-800">{peso(o.total)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{fmt(o.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
