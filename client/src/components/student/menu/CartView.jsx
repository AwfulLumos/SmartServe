import React, { useState } from "react";
import studentApi from "../../../utils/studentApi";
import {
  IoArrowBackOutline,
  IoTrashOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoLeafOutline,
} from "react-icons/io5";

export default function CartView({ cart, setCart, onBack, student, onOrderPlaced }) {
  const [byoc, setByoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);

  function addItem(item) {
    setCart((prev) =>
      prev.map((i) => (i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i))
    );
  }

  function removeItem(itemId) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter((i) => i.menuItemId !== itemId);
      }
      return prev.map((i) => (i.menuItemId === itemId ? { ...i, quantity: i.quantity - 1 } : i));
    });
  }

  function clearCart() {
    setCart([]);
  }

  async function handleCheckout() {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        byocOption: byoc,
      };

      const res = await studentApi.post("/orders", payload);
      onOrderPlaced(res.data.order);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 font-sans relative overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-gray-50 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
          >
            <IoArrowBackOutline className="text-lg" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-[#4a6741]">Your Cart</h2>
            <p className="text-xs text-gray-400">
              {cart.reduce((a, b) => a + b.quantity, 0)} items
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1"
          >
            <IoTrashOutline />
            Clear
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3 text-2xl">
            🛒
          </div>
          <p className="font-bold text-gray-600">Your cart is empty</p>
          <p className="text-xs text-gray-400 mt-1 mb-6">Browse our canteen menu and add some food!</p>
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-2xl bg-[#4a6741] text-white font-bold text-sm shadow-md"
          >
            Go to Menu
          </button>
        </div>
      ) : (
        <>
          {/* Scrollable Items Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            {cart.map((item) => (
              <div
                key={item.menuItemId}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-[#4a6741] font-bold mt-0.5">
                    ₱{item.price} × {item.quantity} = ₱{item.price * item.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#f0f7ec] rounded-xl px-2 py-1 flex-shrink-0">
                  <button
                    onClick={() => removeItem(item.menuItemId)}
                    className="w-7 h-7 rounded-lg bg-white text-[#4a6741] flex items-center justify-center shadow-xs text-xs hover:bg-gray-50"
                  >
                    <IoRemoveOutline />
                  </button>
                  <span className="text-xs font-extrabold text-[#4a6741] min-w-[16px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => addItem(item)}
                    className="w-7 h-7 rounded-lg bg-[#4a6741] text-white flex items-center justify-center shadow-xs text-xs hover:bg-[#3a5333]"
                  >
                    <IoAddOutline />
                  </button>
                </div>
              </div>
            ))}

            {/* BYOC Toggle */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 mt-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#d7ecc8] flex items-center justify-center text-[#4a6741]">
                    <IoLeafOutline className="text-xl" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Bring Your Own Container (BYOC)</p>
                    <p className="text-xs text-gray-400 mt-0.5">Earn eco points & help the environment</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={byoc}
                  onChange={(e) => setByoc(e.target.checked)}
                  className="w-5 h-5 accent-[#4a6741] rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Sticky Bottom Summary Container */}
          <div className="bg-white border-t border-gray-200 p-5 shadow-2xl z-30 flex-shrink-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500 font-semibold">Subtotal</span>
              <span className="text-sm font-bold text-gray-800">₱{subtotal}</span>
            </div>
            {byoc && (
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#4a6741] font-semibold flex items-center gap-1">
                  <IoLeafOutline /> BYOC Eco Bonus
                </span>
                <span className="text-xs font-extrabold text-[#4a6741]">+5 Eco Pts</span>
              </div>
            )}
            <div className="border-t border-gray-100 my-2" />
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-extrabold text-gray-800">Total</span>
              <span className="text-2xl font-black text-[#4a6741]">₱{subtotal}</span>
            </div>

            {error && <p className="text-xs text-red-500 text-center mb-3 font-semibold">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-[#4a6741] hover:bg-[#3a5333] disabled:opacity-50 text-white font-extrabold text-base shadow-lg transition active:scale-[0.99]"
            >
              {submitting ? "Placing Order…" : "Place Order Now"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
