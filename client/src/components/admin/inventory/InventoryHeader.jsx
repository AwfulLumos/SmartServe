import { IoCubeOutline, IoAddOutline } from "react-icons/io5";

export default function InventoryHeader({ onOpenAdd }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
          <IoCubeOutline className="text-3xl" />
          Inventory Management
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Track ingredient stock levels, update threshold alerts, and manage item pricing
        </p>
      </div>
      <button
        onClick={onOpenAdd}
        className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm self-start sm:self-auto cursor-pointer"
      >
        <IoAddOutline className="text-lg" />
        Add Item
      </button>
    </div>
  );
}
