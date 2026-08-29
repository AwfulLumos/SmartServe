import React from "react";
import { IoBookmark, IoRepeatOutline, IoTrashOutline } from "react-icons/io5";

export default function MyUsualCard({ usualOrder, onReOrder, onClearUsual }) {
  if (!usualOrder) return null;

  const itemSummaryText = usualOrder.items
    .map((i) => `${i.quantity}x ${i.name}`)
    .join(" + ");

  return (
    <div className="bg-gradient-to-r from-[#1a2e16] to-[#4a6741] rounded-3xl p-5 text-white shadow-lg relative overflow-hidden font-sans">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <IoBookmark className="text-[#d7ecc8] text-lg" />
          <span className="text-xs font-extrabold text-[#d7ecc8] uppercase tracking-wider">
            1-Click Quick Order
          </span>
        </div>
        <button
          onClick={onClearUsual}
          className="text-white/60 hover:text-white text-xs p-1"
          title="Remove saved usual"
        >
          <IoTrashOutline />
        </button>
      </div>

      <h3 className="text-xl font-black mb-1">My Usual Meal</h3>
      <p className="text-xs text-white/80 line-clamp-1 mb-4">{itemSummaryText}</p>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-black text-white">₱{usualOrder.total}</span>
        <button
          onClick={() => onReOrder(usualOrder.items)}
          className="px-5 py-2.5 rounded-2xl bg-white text-[#4a6741] hover:bg-[#f0f7ec] font-extrabold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
        >
          <IoRepeatOutline className="text-base" />
          <span>Order Usual Now</span>
        </button>
      </div>
    </div>
  );
}
