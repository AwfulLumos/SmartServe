import { IoAlertOutline, IoArrowForwardOutline } from "react-icons/io5";

export default function AdminLowStockAlert({ lowStockItems = [], lowStockCount = 0, outOfStockCount = 0, navigate }) {
  if (!lowStockItems || lowStockItems.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <IoAlertOutline className="text-red-500 text-lg" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-600">Low Stock Alert</p>
            <p className="text-xs text-gray-500">{lowStockCount} low · {outOfStockCount} out of stock</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/inventory")}
          className="flex-shrink-0 flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          Manage <IoArrowForwardOutline className="text-sm" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {lowStockItems.map((item) => (
          <span key={item._id} className={`text-xs font-semibold px-3 py-1 rounded-full ${item.quantity === 0 ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
            {item.name} — {item.quantity === 0 ? "Out of stock" : `${item.quantity} ${item.unit} left`}
          </span>
        ))}
      </div>
    </div>
  );
}
