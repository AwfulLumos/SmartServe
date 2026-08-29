import React from "react";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

export default function OrderPlacedView({ order, onDone }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 font-sans">
      <div className="w-24 h-24 rounded-full bg-[#d7ecc8] flex items-center justify-center text-[#4a6741] mb-5 shadow-inner animate-bounce">
        <IoCheckmarkCircleOutline className="text-6xl" />
      </div>

      <h2 className="text-3xl font-black text-[#4a6741] mb-1">Order Placed!</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Your order has been sent to the canteen staff. Show your QR code or wait for your pickup call!
      </p>

      {order && (
        <div className="bg-white rounded-3xl border border-gray-100 p-5 w-full max-w-xs shadow-sm mb-8 text-left">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
            <span className="text-xs text-gray-400 font-bold">ORDER NUMBER</span>
            <span className="text-lg font-black text-[#4a6741]">{order.orderNumber}</span>
          </div>

          <div className="flex flex-col gap-1.5 mb-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs text-gray-700">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="font-bold">₱{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm font-extrabold text-[#4a6741]">
            <span>Total Paid</span>
            <span>₱{order.total}</span>
          </div>
        </div>
      )}

      <button
        onClick={onDone}
        className="w-full max-w-xs py-4 rounded-2xl bg-[#4a6741] hover:bg-[#3a5333] text-white font-extrabold text-sm shadow-md transition"
      >
        Track My Order
      </button>
    </div>
  );
}
