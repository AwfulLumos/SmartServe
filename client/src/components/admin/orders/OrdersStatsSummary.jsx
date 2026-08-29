export default function OrdersStatsSummary({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 lg:col-span-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
        <p className="text-3xl font-extrabold text-gray-800">{stats.total}</p>
      </div>
      <div className="bg-amber-50 rounded-2xl border border-amber-100 shadow-sm px-5 py-4">
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Pending</p>
        <p className="text-3xl font-extrabold text-amber-600">{stats.pending}</p>
      </div>
      <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-sm px-5 py-4">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Preparing</p>
        <p className="text-3xl font-extrabold text-blue-600">{stats.preparing}</p>
      </div>
      <div className="bg-[#f0f7ec] rounded-2xl border border-[#d7ecc8] shadow-sm px-5 py-4">
        <p className="text-xs font-semibold text-[#4a6741] uppercase tracking-wider mb-1">Ready</p>
        <p className="text-3xl font-extrabold text-[#4a6741]">{stats.ready}</p>
      </div>
      <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Completed</p>
        <p className="text-3xl font-extrabold text-gray-500">{stats.completed}</p>
      </div>
    </div>
  );
}
