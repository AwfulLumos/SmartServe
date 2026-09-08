import { IoCubeOutline, IoCreateOutline, IoTrashOutline } from "react-icons/io5";
import { SkeletonTable } from "../../SkeletonLoader";
import { STATUS, deriveStatus } from "./InventoryConstants";

export default function InventoryTable({
  items,
  loading,
  search,
  editingQtyId,
  qtyDraft,
  qtyInputRef,
  onStartEditQty,
  onQtyDraftChange,
  onCommitQty,
  onCancelEditQty,
  onOpenEdit,
  onConfirmDelete,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[2fr_1.2fr_1.1fr_1.1fr_0.9fr_1fr_80px] items-center px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
        <span>Item Name</span>
        <span>Category</span>
        <span>Quantity</span>
        <span>Min Threshold</span>
        <span>Price</span>
        <span>Status</span>
        <span className="text-center">Actions</span>
      </div>

      {loading ? (
        <div className="p-4">
          <SkeletonTable rows={6} columns={6} showHeader={false} />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <IoCubeOutline className="text-4xl text-gray-300" />
          <p className="text-sm">{search ? "No items match your search." : "No inventory items yet."}</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {items.map((item) => {
            const st = deriveStatus(item.quantity, item.minThreshold);
            const statusInfo = STATUS[st];
            const isEditingQty = editingQtyId === item._id;

            return (
              <li
                key={item._id}
                className="grid grid-cols-[2fr_1.2fr_1.1fr_1.1fr_0.9fr_1fr_80px] items-center px-5 py-3.5 hover:bg-gray-50 transition"
              >
                {/* Name */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <IoCubeOutline className="text-gray-400 text-sm" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 truncate">{item.name}</span>
                </div>

                {/* Category */}
                <span className="text-xs text-gray-500 truncate">{item.category}</span>

                {/* Quantity — inline editable */}
                <div className="flex flex-col gap-0.5">
                  {isEditingQty ? (
                    <input
                      ref={qtyInputRef}
                      type="number"
                      min="0"
                      value={qtyDraft}
                      onChange={(e) => onQtyDraftChange(e.target.value)}
                      onBlur={() => onCommitQty(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onCommitQty(item);
                        if (e.key === "Escape") onCancelEditQty();
                      }}
                      className="w-20 px-2 py-1 border border-[#4a6741] rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#4a6741]/30"
                    />
                  ) : (
                    <button
                      onClick={() => onStartEditQty(item)}
                      className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 text-left hover:border-[#4a6741]/50 transition bg-white cursor-pointer"
                      title="Click to edit"
                    >
                      {item.quantity}
                    </button>
                  )}
                  <span className="text-[11px] text-gray-400 pl-2">{item.unit}</span>
                </div>

                {/* Min Threshold */}
                <span className="text-xs text-gray-500">
                  {item.minThreshold} {item.unit}
                </span>

                {/* Price */}
                <span className="text-sm font-bold text-gray-800">
                  ₱{Number(item.price).toLocaleString()}
                </span>

                {/* Status */}
                <span>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${statusInfo.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusInfo.dot}`} />
                    {statusInfo.label}
                  </span>
                </span>

                {/* Actions */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onOpenEdit(item)}
                    className="text-gray-400 hover:text-[#4a6741] transition p-1 cursor-pointer"
                    title="Edit"
                  >
                    <IoCreateOutline className="text-lg" />
                  </button>
                  <button
                    onClick={() => onConfirmDelete(item)}
                    className="text-gray-400 hover:text-red-500 transition p-1 cursor-pointer"
                    title="Delete"
                  >
                    <IoTrashOutline className="text-lg" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        <p className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-700">{items.length}</span> item{items.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
