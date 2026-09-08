import { IoReceiptOutline, IoRefreshOutline } from "react-icons/io5";

export default function OrdersHeader({ onRefresh }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
          <IoReceiptOutline className="text-3xl" />
          Order Management
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Monitor and batch manage all student food orders
        </p>
      </div>
      <button
        onClick={onRefresh}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition shadow-sm self-start sm:self-auto"
      >
        <IoRefreshOutline className="text-base" />
        Refresh
      </button>
    </div>
  );
}
