export default function InventoryStatsSummary({ summary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Items */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Total Items</p>
        <p className="text-3xl font-bold text-gray-800">{summary.total}</p>
      </div>
      {/* In Stock */}
      <div className="bg-[#d7ecc8] rounded-2xl px-5 py-4 shadow-sm">
        <p className="text-sm text-[#4a6741] font-medium mb-1">In Stock</p>
        <p className="text-3xl font-bold text-[#4a6741]">{summary.inStock}</p>
      </div>
      {/* Low Stock */}
      <div className="bg-red-50 rounded-2xl px-5 py-4 shadow-sm">
        <p className="text-sm text-red-400 font-medium mb-1">Low Stock</p>
        <p className="text-3xl font-bold text-red-500">{summary.lowStock}</p>
      </div>
      {/* Out of Stock */}
      <div className="bg-white border-2 border-red-300 rounded-2xl px-5 py-4 shadow-sm">
        <p className="text-sm text-red-400 font-medium mb-1">Out of Stock</p>
        <p className="text-3xl font-bold text-red-600">{summary.outOfStock}</p>
      </div>
    </div>
  );
}
