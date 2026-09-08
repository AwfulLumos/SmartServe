import { useState, useEffect, useCallback, useRef } from "react";
import { useStudentAuth } from "../../context/StudentAuthContext";
import studentApi from "../../utils/studentApi";
import QRCode from "react-qr-code";
import {
  IoHomeOutline,
  IoHome,
  IoRestaurantOutline,
  IoRestaurant,
  IoReceiptOutline,
  IoReceipt,
  IoGiftOutline,
  IoGift,
  IoStarOutline,
  IoNotificationsOutline,
  IoPersonCircleOutline,
  IoLeafOutline,
  IoChevronForwardOutline,
  IoSunnyOutline,
  IoArrowBackOutline,
  IoTrashOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoSearchOutline,
  IoCartOutline,
  IoCheckmarkCircleOutline,
  IoCheckmarkDoneCircleOutline,
  IoCheckmarkDoneOutline,
  IoTimeOutline,
  IoFlameOutline,
  IoAlertCircleOutline,
  IoCloseOutline,
  IoLogOutOutline,
  IoIdCardOutline,
  IoSchoolOutline,
  IoMailOutline,
  IoCalendarOutline,
  IoPerson,
  IoCheckmarkOutline,
} from "react-icons/io5";
import { MdQrCode2 } from "react-icons/md";
import { useNotifications } from "../../context/NotificationContext";
import logo from "../../assets/logo/logo.png";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} hour${h !== 1 ? "s" : ""} ago`;
  }
  const d = Math.floor(diff / 86400);
  if (d < 7) return `${d} day${d !== 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function itemSummary(items) {
  if (!items || items.length === 0) return "Order";
  const names = items.slice(0, 2).map((i) => i.name);
  return names.join(" + ") + (items.length > 2 ? ` +${items.length - 2} more` : "");
}

const CATEGORIES = ["All", "Morning", "Lunch", "Snacks", "Beverages", "Others"];

const NAV = [
  { key: "home",    label: "Home",    icon: <IoHomeOutline className="text-xl" />,        activeIcon: <IoHome className="text-xl text-white" /> },
  { key: "menu",    label: "Menu",    icon: <IoRestaurantOutline className="text-xl" />,  activeIcon: <IoRestaurant className="text-xl text-white" /> },
  { key: "orders",  label: "Orders",  icon: <IoReceiptOutline className="text-xl" />,     activeIcon: <IoReceipt className="text-xl text-white" /> },
  { key: "qr",      label: "My QR",   icon: <MdQrCode2 className="text-xl" />,           activeIcon: <MdQrCode2 className="text-xl text-white" /> },
  { key: "rewards", label: "Rewards", icon: <IoGiftOutline className="text-xl" />,        activeIcon: <IoGift className="text-xl text-white" /> },
];

// ── My QR View ────────────────────────────────────────────────────────────────
function MyQRView({ student }) {
  const isEmployee = student?.userType === "employee";
  const subInfo = isEmployee
    ? [student?.jobTitle, student?.department].filter(Boolean).join(" · ")
    : [student?.gradeLevel, student?.section].filter(Boolean).join(" - Section ");

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="px-6 pt-6 pb-5 text-center">
        <h2 className="text-2xl font-extrabold text-[#4a6741]">{student?.fullName ?? "—"}</h2>
        <p className="text-sm text-gray-500 font-mono mt-1">{student?.schoolId ?? "—"}</p>
        {subInfo && <p className="text-sm text-gray-400 mt-0.5">{subInfo}</p>}
      </div>

      <div className="mx-5 bg-white rounded-3xl shadow-lg p-5">
        <div className="bg-[#d7ecc8] rounded-2xl flex items-center justify-center p-6">
          {student?.qrToken ? (
            <QRCode value={student.qrToken} size={220} fgColor="#4a6741" bgColor="#d7ecc8" level="M" />
          ) : (
            <div className="w-[220px] h-[220px] flex items-center justify-center text-[#4a6741]/40">
              <MdQrCode2 className="text-8xl" />
            </div>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 font-mono tracking-wider mt-4">
          {student?.qrToken ?? "No QR token"}
        </p>
      </div>

      <div className="mx-5 mt-4 bg-[#d7ecc8] rounded-2xl px-5 py-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <IoSunnyOutline className="text-[#4a6741] text-base" />
          <p className="text-sm font-semibold text-[#4a6741]">Auto-Brightness Active</p>
        </div>
        <p className="text-xs text-center text-[#4a6741]/80 leading-relaxed">
          Show this QR code to the cashier to make purchases and earn points
        </p>
      </div>
    </div>
  );
}

// ── Menu View ─────────────────────────────────────────────────────────────────
function MenuView({ cart, setCart, onOpenCart }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    studentApi.get("/menu/active")
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    const matchCat = category === "All" || item.category === category;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item._id);
      if (existing) {
        return prev.map((c) => c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItemId: item._id, name: item.name, category: item.category, price: item.price, quantity: 1 }];
    });
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-2xl font-extrabold text-[#4a6741]">Menu</h2>
        <button
          onClick={onOpenCart}
          className="relative w-10 h-10 bg-[#4a6741] rounded-full flex items-center justify-center shadow"
        >
          <IoCartOutline className="text-white text-xl" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
          <IoSearchOutline className="text-gray-400 text-lg flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition ${
              category === cat
                ? "bg-[#4a6741] text-white border-[#4a6741]"
                : "bg-white text-gray-600 border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#4a6741] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No items found</div>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {filtered.map((item) => {
            const inCart = cart.find((c) => c.menuItemId === item._id);
            return (
              <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      {item.category}
                    </span>
                    <span className="text-sm font-extrabold text-[#4a6741]">₱{item.price}</span>
                  </div>
                  {inCart && (
                    <p className="text-[11px] text-[#7fb060] font-semibold mt-1">{inCart.quantity}× in cart</p>
                  )}
                </div>
                <button
                  onClick={() => addToCart(item)}
                  className="w-9 h-9 bg-[#4a6741] hover:bg-[#3a5333] rounded-full flex items-center justify-center flex-shrink-0 transition"
                >
                  <IoAddOutline className="text-white text-lg" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Cart View ─────────────────────────────────────────────────────────────────
function CartView({ cart, setCart, onBack, student, onOrderPlaced }) {
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  function updateQty(menuItemId, delta) {
    setCart((prev) =>
      prev
        .map((i) => i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(menuItemId) {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }

  async function handlePlaceOrder() {
    if (cart.length === 0) return;
    setPlacing(true);
    setError("");
    try {
      const res = await studentApi.post("/orders", { items: cart });
      onOrderPlaced(res.data.order);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order. Try again.");
      setPlacing(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Cart header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <IoArrowBackOutline className="text-gray-600 text-lg" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">My Cart</h2>
          <p className="text-xs text-gray-400">{cart.length} {cart.length === 1 ? "item" : "items"}</p>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {cart.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Your cart is empty</div>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            {cart.map((item) => (
              <div key={item.menuItemId} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                  </div>
                  <button onClick={() => removeItem(item.menuItemId)} className="text-red-400 hover:text-red-600 transition">
                    <IoTrashOutline className="text-lg" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#4a6741]">
                    ₱{item.price} × {item.quantity} = <span className="font-extrabold">₱{item.price * item.quantity}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.menuItemId, -1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <IoRemoveOutline className="text-gray-600 text-sm" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.menuItemId, 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <IoAddOutline className="text-gray-600 text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary + Place Order */}
      {cart.length > 0 && (
        <div className="flex-shrink-0 px-4 pb-24 pt-2">
          <div className="bg-[#d7ecc8] rounded-2xl px-5 py-4 mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Subtotal</span>
              <span>₱{total}</span>
            </div>
            <div className="flex justify-between font-extrabold text-[#4a6741]">
              <span>Total</span>
              <span>₱{total}</span>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 text-center mb-2">{error}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full bg-[#4a6741] hover:bg-[#3a5333] disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition text-sm"
          >
            <IoCartOutline className="text-base" />
            {placing ? "Placing Order..." : "Place Order"}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            Show your QR code at the counter to complete payment
          </p>
        </div>
      )}
    </div>
  );
}

// ── Order Placed View ─────────────────────────────────────────────────────────
function OrderPlacedView({ order, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="flex-1 flex items-center justify-center px-6 pb-20">
      <div className="bg-white rounded-3xl shadow-lg p-8 text-center w-full">
        <div className="w-20 h-20 bg-[#d7ecc8] rounded-full flex items-center justify-center mx-auto mb-5">
          <IoCheckmarkCircleOutline className="text-[#4a6741] text-5xl" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#4a6741] mb-2">Order Placed!</h2>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          Your order has been received and is being prepared.
        </p>
        <div className="bg-[#d7ecc8] rounded-2xl px-5 py-4 mb-5">
          <p className="text-xs text-gray-500 mb-1">Order Number</p>
          <p className="text-2xl font-extrabold text-[#4a6741] tracking-wide">{order?.orderNumber}</p>
        </div>
        <p className="text-xs text-gray-400 animate-pulse">Redirecting to order history...</p>
      </div>
    </div>
  );
}

// ── Orders View ───────────────────────────────────────────────────────────────
const ORDER_STATUS_CFG = {
  pending:   { label: "Pending",          icon: <IoTimeOutline />,                 badge: "bg-amber-100 text-amber-700",        border: "border-amber-300",   isActive: true  },
  preparing: { label: "Being Prepared",   icon: <IoFlameOutline />,                badge: "bg-blue-100 text-blue-700",          border: "border-blue-300",    isActive: true  },
  ready:     { label: "Ready for Pickup", icon: <IoCheckmarkCircleOutline />,       badge: "bg-[#d7ecc8] text-[#4a6741]",       border: "border-[#4a6741]",   isActive: true  },
  completed: { label: "Completed",        icon: <IoCheckmarkDoneCircleOutline />,   badge: "bg-[#d7ecc8] text-[#4a6741]",       border: "border-gray-200",    isActive: false },
  cancelled: { label: "Cancelled",        icon: <IoAlertCircleOutline />,           badge: "bg-red-100 text-red-600",            border: "border-gray-200",    isActive: false },
};

const ACTIVE_STATUSES = ["pending", "preparing", "ready"];

function formatOrderDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}
function formatOrderDateTime(dateStr) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
  );
}

function PastOrderDetail({ order, onClose }) {
  const cfg = ORDER_STATUS_CFG[order.status] || ORDER_STATUS_CFG.completed;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0">
      <div className="bg-white rounded-t-3xl w-full max-w-[390px] overflow-hidden shadow-2xl">
        {/* handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
          <div>
            <p className="font-extrabold text-gray-800 text-base">{order.orderNumber}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatOrderDateTime(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <IoCloseOutline className="text-gray-500 text-lg" />
          </button>
        </div>
        <div className="px-5 pt-4 pb-6 overflow-y-auto max-h-[60vh]">
          {/* Status */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${cfg.badge}`}>
            <span className="text-sm">{cfg.icon}</span>
            {cfg.label}
          </span>
          {/* Items */}
          <div className="flex flex-col gap-2 mb-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm text-gray-700">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-semibold text-gray-800">₱{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between">
            <span className="font-extrabold text-[#4a6741] text-sm">Total</span>
            <span className="font-extrabold text-[#4a6741] text-lg">₱{order.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [detailOrder, setDetailOrder] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    studentApi.get("/orders/mine")
      .then((res) => setOrders(res.data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pastOrders   = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  const filtered =
    filter === "active"    ? activeOrders :
    filter === "completed" ? pastOrders   : orders;

  const activeCount = activeOrders.length;

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-gray-50">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-gray-50">
        <h2 className="text-3xl font-extrabold text-[#4a6741]">My Orders</h2>
        <p className="text-sm text-gray-400 mt-1">
          {activeCount > 0 ? `${activeCount} active order${activeCount !== 1 ? "s" : ""}` : "No active orders"}
        </p>
      </div>

      {/* Filter tabs — 3 equal columns */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "all",       label: "All" },
            { key: "active",    label: "Active" },
            { key: "completed", label: "Completed" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`py-3 rounded-2xl text-sm font-bold transition ${
                filter === t.key
                  ? "bg-[#4a6741] text-white shadow-sm"
                  : "bg-white text-[#4a6741] border border-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#4a6741] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No orders found</div>
      ) : (
        <div className="px-5 flex flex-col gap-5">

          {/* ── Current Orders ── */}
          {(filter === "all" || filter === "active") && activeOrders.length > 0 && (
            <div>
              <p className="text-base font-extrabold text-[#4a6741] mb-3">Current Orders</p>
              <div className="flex flex-col gap-3">
                {activeOrders.map((order) => {
                  const cfg = ORDER_STATUS_CFG[order.status] || ORDER_STATUS_CFG.pending;
                  return (
                    <div
                      key={order._id}
                      className={`bg-white rounded-2xl border-2 ${cfg.border} shadow-sm px-5 py-4`}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-extrabold text-gray-900 text-base">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatOrderDateTime(order.createdAt)}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                          <span className="text-sm">{cfg.icon}</span>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="mt-3 flex flex-col gap-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-gray-700">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-semibold text-gray-800">₱{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
                        <span className="font-extrabold text-[#4a6741] text-sm">Total</span>
                        <span className="font-extrabold text-[#4a6741] text-xl">₱{order.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Past Orders ── */}
          {(filter === "all" || filter === "completed") && pastOrders.length > 0 && (
            <div>
              <p className="text-base font-extrabold text-[#4a6741] mb-3">Past Orders</p>
              <div className="flex flex-col gap-3">
                {pastOrders.map((order) => {
                  const cfg = ORDER_STATUS_CFG[order.status] || ORDER_STATUS_CFG.completed;
                  return (
                    <button
                      key={order._id}
                      onClick={() => setDetailOrder(order)}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 text-left w-full"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-gray-900 text-base">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatOrderDate(order.createdAt)}</p>
                        </div>
                        <IoChevronForwardOutline className="text-gray-300 text-lg flex-shrink-0 ml-2" />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                          <span className="text-sm">{cfg.icon}</span>
                          {cfg.label}
                        </span>
                        <span className="font-extrabold text-[#4a6741] text-base">₱{order.total}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Detail bottom sheet */}
      {detailOrder && (
        <PastOrderDetail order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}
    </div>
  );
}

// ── Rewards View ──────────────────────────────────────────────────────────────
const REWARD_ICON_MAP = {
  gift: <IoGiftOutline className="text-[#4a6741] text-2xl" />,
  star: <IoStarOutline className="text-[#4a6741] text-2xl" />,
  leaf: <IoLeafOutline className="text-[#4a6741] text-2xl" />,
};

function RedeemConfirmSheet({ reward, student, onClose, onSuccess }) {
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState("");
  const canAfford = (student?.points ?? 0) >= reward.pointsCost;

  async function handleRedeem() {
    setRedeeming(true);
    setError("");
    try {
      const res = await studentApi.post("/redemptions/student", { rewardId: reward._id });
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to redeem. Try again.");
      setRedeeming(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="bg-white rounded-t-3xl w-full max-w-[390px] overflow-hidden shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="px-6 pt-4 pb-8">
          {/* Reward icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#d7ecc8] flex items-center justify-center">
              {REWARD_ICON_MAP[reward.icon] || REWARD_ICON_MAP.gift}
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-center text-gray-800 mb-1">{reward.name}</h3>
          {reward.description && (
            <p className="text-sm text-center text-gray-400 mb-4">{reward.description}</p>
          )}
          {/* Points summary */}
          <div className="bg-gray-50 rounded-2xl px-5 py-4 mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Your Points</span>
              <span className="font-bold text-gray-800">{student?.points ?? 0} pts</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Cost</span>
              <span className="font-bold text-red-500">−{reward.pointsCost} pts</span>
            </div>
            <div className="border-t border-gray-200 my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Remaining</span>
              <span className={`font-extrabold ${canAfford ? "text-[#4a6741]" : "text-red-500"}`}>
                {canAfford ? (student?.points ?? 0) - reward.pointsCost : "Not enough"} pts
              </span>
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-500 text-center mb-3">{error}</p>
          )}
          {!canAfford && !error && (
            <p className="text-xs text-red-500 text-center mb-3">
              You need {reward.pointsCost - (student?.points ?? 0)} more points to redeem this reward.
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleRedeem}
              disabled={redeeming || !canAfford}
              className="flex-1 py-3.5 rounded-2xl bg-[#4a6741] hover:bg-[#3a5333] disabled:opacity-50 text-white font-bold text-sm transition"
            >
              {redeeming ? "Redeeming…" : "Confirm Redeem"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RewardSuccessSheet({ reward, newPoints, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="bg-white rounded-t-3xl w-full max-w-[390px] shadow-2xl pb-8">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="px-6 pt-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#d7ecc8] flex items-center justify-center mx-auto mb-4">
            <IoCheckmarkCircleOutline className="text-[#4a6741] text-5xl" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#4a6741] mb-1">Redeemed!</h3>
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-bold text-gray-800">{reward.name}</span> has been redeemed.
          </p>
          <p className="text-sm text-gray-400 mb-6">Show this to the cashier to claim your reward.</p>
          <div className="bg-[#d7ecc8] rounded-2xl px-5 py-3 mb-6">
            <p className="text-xs text-[#4a6741]/70 mb-0.5">Remaining Points</p>
            <p className="text-3xl font-extrabold text-[#4a6741]">{newPoints}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#4a6741] text-white font-bold text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function RewardsView({ student, refreshStudent }) {
  const [tab, setTab] = useState("catalog");
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmReward, setConfirmReward] = useState(null);
  const [successReward, setSuccessReward] = useState(null);
  const [newPoints, setNewPoints] = useState(0);

  useEffect(() => {
    studentApi.get("/rewards/active")
      .then((res) => setRewards(res.data.rewards))
      .catch(() => setRewards([]))
      .finally(() => setLoading(false));
  }, []);

  function handleRedeemSuccess(data) {
    setNewPoints(data?.studentPoints ?? Math.max(0, (student?.points ?? 0) - (confirmReward?.pointsCost ?? 0)));
    setSuccessReward(confirmReward);
    setConfirmReward(null);
    refreshStudent();
  }

  const byocCount = student?.byocCount ?? 0;

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-gray-50">
      {/* Eco Points card */}
      <div className="mx-4 mt-4 bg-[#7fb060] rounded-3xl px-5 py-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <IoLeafOutline className="text-white text-xl" />
          </div>
          <p className="text-white font-bold text-base">Your Eco Points</p>
        </div>
        <p className="text-6xl font-extrabold text-white leading-none mb-1">{student?.points ?? 0}</p>
        <p className="text-sm text-white/80">Keep bringing your own container to earn more!</p>
      </div>

      {/* Tabs */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-2">
        {[
          { key: "catalog", label: "Rewards Catalog" },
          { key: "byoc",    label: "BYOC Eco Program" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-3 rounded-2xl text-sm font-bold transition ${
              tab === t.key
                ? "bg-[#4a6741] text-white shadow-sm"
                : "bg-white text-[#4a6741] border border-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Rewards Catalog ── */}
      {tab === "catalog" && (
        <div className="px-4 mt-5">
          <p className="text-base font-extrabold text-[#4a6741] mb-3">Available Rewards</p>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#4a6741] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No rewards available</div>
          ) : (
            <div className="flex flex-col gap-3">
              {rewards.map((r) => {
                const canAfford = (student?.points ?? 0) >= r.pointsCost;
                return (
                  <button
                    key={r._id}
                    onClick={() => setConfirmReward(r)}
                    className={`bg-white rounded-2xl border-2 px-4 py-4 flex items-center gap-4 text-left w-full transition ${
                      canAfford ? "border-[#4a6741]/30 hover:border-[#4a6741]" : "border-gray-200 opacity-60"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#d7ecc8] flex items-center justify-center flex-shrink-0">
                      {REWARD_ICON_MAP[r.icon] || REWARD_ICON_MAP.gift}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">{r.name}</p>
                      {r.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{r.description}</p>
                      )}
                      <p className="text-sm font-bold text-[#4a6741] mt-1 flex items-center gap-1">
                        {r.pointsCost} points
                        <IoCheckmarkOutline className="text-[#4a6741] text-xs" />
                      </p>
                    </div>
                    {!canAfford && (
                      <span className="text-[10px] text-red-400 font-semibold flex-shrink-0">Need more pts</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── BYOC Eco Program ── */}
      {tab === "byoc" && (
        <div className="px-4 mt-5 flex flex-col gap-4">
          {/* Info card */}
          <div className="bg-[#7fb060] rounded-3xl px-5 py-5">
            <div className="flex items-center gap-3 mb-3">
              <IoLeafOutline className="text-white text-2xl" />
              <p className="text-white font-extrabold text-lg">Bring Your Own Container</p>
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-4">
              Help save the planet! Bring your own reusable container and earn{" "}
              <span className="font-extrabold">eco points</span> each time the staff scans your QR.
            </p>
            <div className="bg-white/20 rounded-2xl px-4 py-4">
              <p className="text-white font-bold text-xs mb-2">How it works:</p>
              <div className="flex flex-col gap-1.5">
                {[
                  "Bring a clean, reusable container",
                  "Show it to the cashier when ordering",
                  "Earn eco points instantly!",
                ].map((step) => (
                  <div key={step} className="flex items-center gap-2 text-sm text-white/90">
                    <IoCheckmarkOutline className="text-white flex-shrink-0" />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Your Impact */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-5 py-5">
            <p className="text-base font-extrabold text-[#4a6741] mb-4">Your Impact</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#d7ecc8] rounded-2xl px-4 py-4">
                <p className="text-xs font-semibold text-[#4a6741]/70 mb-1">BYOC Count</p>
                <p className="text-3xl font-extrabold text-[#4a6741]">{byocCount}</p>
              </div>
              <div className="bg-[#d7ecc8] rounded-2xl px-4 py-4">
                <p className="text-xs font-semibold text-[#4a6741]/70 mb-1">Plastics Saved</p>
                <p className="text-3xl font-extrabold text-[#4a6741]">{byocCount}</p>
              </div>
            </div>
            <p className="text-xs text-center text-gray-500">
              {byocCount > 0
                ? `You've prevented ${byocCount} plastic container${byocCount !== 1 ? "s" : ""} from ending up in landfills!`
                : "Start your eco journey — bring your own container!"}
            </p>
          </div>
        </div>
      )}

      {/* Confirm sheet */}
      {confirmReward && (
        <RedeemConfirmSheet
          reward={confirmReward}
          student={student}
          onClose={() => setConfirmReward(null)}
          onSuccess={handleRedeemSuccess}
        />
      )}

      {/* Success sheet */}
      {successReward && (
        <RewardSuccessSheet
          reward={successReward}
          newPoints={newPoints}
          onClose={() => setSuccessReward(null)}
        />
      )}
    </div>
  );
}

// ── Profile View ─────────────────────────────────────────────────────────────
function ProfileView({ student, onClose }) {
  const { logout } = useStudentAuth();
  const isEmployee = student?.userType === "employee";
  const idLabel = isEmployee ? "Employee ID" : "School ID";
  const subInfoLabel = isEmployee ? "Job Title / Dept" : "Grade & Section";
  const subInfoValue = isEmployee
    ? [student?.jobTitle, student?.department].filter(Boolean).join(" · ") || "—"
    : [student?.gradeLevel && `Grade ${student.gradeLevel}`, student?.section && `Section ${student.section}`].filter(Boolean).join(" - ") || "—";
  const memberSince = student?.createdAt
    ? new Date(student.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  const INFO_ROWS = [
    { icon: <IoIdCardOutline className="text-[#4a6741] text-lg" />, label: idLabel,         value: student?.schoolId ?? "—" },
    { icon: <IoSchoolOutline className="text-[#4a6741] text-lg" />, label: subInfoLabel,    value: subInfoValue },
    { icon: <IoMailOutline className="text-[#4a6741] text-lg" />,   label: "Email",         value: student?.email ?? "—" },
    { icon: <IoCalendarOutline className="text-[#4a6741] text-lg" />, label: "Member Since", value: memberSince },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-6 bg-gray-50">
      {/* Hero card */}
      <div className="mx-4 mt-4 bg-[#4a6741] rounded-3xl px-6 py-8 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4">
          <IoPerson className="text-white/80 text-5xl" />
        </div>
        <p className="text-white font-extrabold text-2xl">{student?.fullName ?? "—"}</p>
        <p className="text-white/70 text-sm font-mono mt-1">{student?.schoolId ?? "—"}</p>
      </div>

      {/* Personal Information */}
      <div className="mx-4 mt-4 bg-white rounded-3xl shadow-sm px-5 py-5">
        <p className="text-base font-extrabold text-[#4a6741] mb-4">Personal Information</p>
        <div className="flex flex-col gap-4">
          {INFO_ROWS.map((row) => (
            <div key={row.label} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                {row.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400 leading-none mb-0.5">{row.label}</p>
                <p className="text-sm font-semibold text-gray-800">{row.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points Summary */}
      <div className="mx-4 mt-4 bg-white rounded-3xl shadow-sm px-5 py-5">
        <p className="text-base font-extrabold text-[#4a6741] mb-4">Points Summary</p>
        <div className="bg-[#7fb060] rounded-2xl px-5 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <IoLeafOutline className="text-white text-xl" />
            </div>
            <p className="text-white font-bold text-base">Eco Points Balance</p>
          </div>
          <p className="text-6xl font-extrabold text-white leading-none mb-2">{student?.points ?? 0}</p>
          <p className="text-sm text-white/80">Earn points by bringing your own container!</p>
        </div>
      </div>

      {/* Logout */}
      <div className="mx-4 mt-4 mb-6">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-red-300 text-red-500 hover:bg-red-50 font-bold text-sm transition"
        >
          <IoLogOutOutline className="text-lg" />
          Logout
        </button>
      </div>
    </div>
  );
}

// ── Notification type config (student) ───────────────────────────────────────
const STUDENT_NOTIF_CONFIG = {
  order_placed:    { icon: <IoReceiptOutline />,  color: "bg-blue-100 text-blue-600" },
  order_status:    { icon: <IoReceiptOutline />,  color: "bg-yellow-100 text-yellow-600" },
  byoc_awarded:    { icon: <IoLeafOutline />,     color: "bg-[#d7ecc8] text-[#4a6741]" },
  reward_redeemed: { icon: <IoGiftOutline />,     color: "bg-purple-100 text-purple-600" },
};

function timeAgoShort(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function StudentNotificationBell() {
  const { notifications, unread, markAllRead, markOneRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          const opening = !open;
          setOpen(opening);
          if (opening && unread > 0) markAllRead();
        }}
        className="relative"
      >
        <IoNotificationsOutline className="text-2xl text-gray-500" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold px-0.5">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-bold text-sm text-gray-800">Notifications</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-[#4a6741] font-semibold hover:underline"
              >
                <IoCheckmarkDoneOutline className="text-base" />
                All read
              </button>
            )}
          </div>
          <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-400 text-sm">No notifications yet</li>
            ) : (
              notifications.map((n) => {
                const cfg = STUDENT_NOTIF_CONFIG[n.type] || { icon: <IoNotificationsOutline />, color: "bg-gray-100 text-gray-500" };
                return (
                  <li
                    key={n._id}
                    onClick={() => !n.read && markOneRead(n._id)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${!n.read ? "bg-[#f0f7ec]" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 leading-tight">{n.title}</p>
                      <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-2">{n.body}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <p className="text-[10px] text-gray-400">{timeAgoShort(n.createdAt)}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#4a6741]" />}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const { student, refreshStudent } = useStudentAuth();
  const [activeNav, setActiveNav] = useState("home");
  const [showProfile, setShowProfile] = useState(false);
  const [cart, setCart] = useState([]);
  const [menuView, setMenuView] = useState("list"); // "list" | "cart" | "placed"
  const [lastOrder, setLastOrder] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const firstName = student?.fullName?.split(" ")[0] ?? "Student";

  useEffect(() => {
    Promise.all([
      studentApi.get("/orders/mine").catch(() => ({ data: { orders: [] } })),
      studentApi.get("/redemptions/mine").catch(() => ({ data: { redemptions: [] } })),
      studentApi.get("/byoc/mine").catch(() => ({ data: { records: [] } })),
    ]).then(([ordersRes, redemptionsRes, byocRes]) => {
      const orderItems = (ordersRes.data.orders ?? []).map((o) => ({
        id: `order-${o._id}`,
        type: "order",
        title: itemSummary(o.items),
        time: timeAgo(o.createdAt),
        pts: `\u20b1${o.total}`,
        label: "",
        date: o.createdAt,
      }));
      const redeemItems = (redemptionsRes.data.redemptions ?? []).map((r) => ({
        id: `redeem-${r._id}`,
        type: "redeem",
        title: r.rewardName,
        time: timeAgo(r.createdAt),
        pts: `\u2212${r.pointsUsed}`,
        label: "PTS",
        date: r.createdAt,
      }));
      const byocItems = (byocRes.data.records ?? []).map((b) => ({
        id: `byoc-${b._id}`,
        type: "byoc",
        title: "BYOC - Eco Points",
        time: timeAgo(b.createdAt),
        pts: `+${b.ecoPoints}`,
        label: "ECO",
        date: b.createdAt,
      }));
      const merged = [...orderItems, ...redeemItems, ...byocItems]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setActivity(merged);
    }).finally(() => setActivityLoading(false));
  }, []);

  function handleNavChange(key) {
    setActiveNav(key);
    setShowProfile(false);
    // Reset inner menu view when re-entering menu tab
    if (key === "menu") setMenuView("list");
  }

  function handleOrderPlaced(order) {
    setLastOrder(order);
    setCart([]);
    setMenuView("placed");
  }

  function handleOrderDone() {
    setMenuView("list");
    setActiveNav("orders");
  }

  return (
    <div className="min-h-screen w-full h-screen flex flex-col bg-white overflow-hidden relative">

        {/* ── Top Header ── */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-3 bg-white z-10">
          <div className="flex items-center gap-2">
            <img src={logo} alt="SmartServe" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-base font-extrabold text-[#4a6741] leading-tight">SmartServe</p>
              <p className="text-xs text-gray-500">{student?.fullName ?? "Student"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StudentNotificationBell />
            <button
              onClick={() => setShowProfile((v) => !v)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                showProfile ? "bg-[#4a6741]" : "bg-gray-100"
              }`}
            >
              <IoPerson className={`text-lg ${showProfile ? "text-white" : "text-gray-500"}`} />
            </button>
          </div>
        </header>

        {/* ── Tab Content ── */}
        {showProfile ? (
          <ProfileView student={student} onClose={() => setShowProfile(false)} />
        ) : activeNav === "qr" ? (
          <MyQRView student={student} />
        ) : activeNav === "menu" ? (
          menuView === "cart" ? (
            <CartView
              cart={cart}
              setCart={setCart}
              onBack={() => setMenuView("list")}
              student={student}
              onOrderPlaced={handleOrderPlaced}
            />
          ) : menuView === "placed" ? (
            <OrderPlacedView order={lastOrder} onDone={handleOrderDone} />
          ) : (
            <MenuView
              cart={cart}
              setCart={setCart}
              onOpenCart={() => setMenuView("cart")}
            />
          )
        ) : activeNav === "orders" ? (
          <OrdersView />
        ) : activeNav === "rewards" ? (
          <RewardsView student={student} refreshStudent={refreshStudent} />
        ) : showProfile ? null : (
        <main className="flex-1 overflow-y-auto pb-20">

          {/* ── Hero Banner ── */}
          <div className="bg-[#4a6741] px-5 pt-5 pb-28 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" />
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-white/80 text-base">✦</span>
              <p className="text-sm text-white/80">Good to see you</p>
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">Hi, {firstName}</h1>
            <p className="text-sm text-white/70 mt-1">Ready for a tasty day?</p>
          </div>

          {/* ── Floating Card ── */}
          <div className="mx-4 -mt-20 bg-white rounded-3xl shadow-xl p-5 relative z-10">
            <div className="bg-[#7fb060] rounded-2xl px-5 py-5 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <IoLeafOutline className="text-white text-lg" />
                </div>
                <p className="text-white font-semibold text-base">Eco Points</p>
              </div>
              <p className="text-5xl font-extrabold text-white leading-none mb-1">
                {student?.points ?? 0}
              </p>
              <p className="text-sm text-white/80">Earn more by bringing your own container!</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleNavChange("qr")}
                className="flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3 rounded-2xl transition text-sm">
                <MdQrCode2 className="text-base" />
                Show QR
              </button>
              <button
                onClick={() => handleNavChange("rewards")}
                className="flex items-center justify-center gap-2 bg-white border-2 border-[#4a6741] text-[#4a6741] hover:bg-[#f0f7ec] font-semibold py-3 rounded-2xl transition text-sm">
                <IoGiftOutline className="text-base" />
                Rewards
              </button>
            </div>
          </div>

          {/* ── Explore ── */}
          <div className="px-4 mt-6">
            <p className="text-sm font-bold text-[#4a6741] mb-3">Explore</p>
            <div
              onClick={() => handleNavChange("orders")}
              className="cursor-pointer bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4 px-4 py-4"
            >
              <div className="w-12 h-12 bg-[#d7ecc8] rounded-2xl flex items-center justify-center flex-shrink-0">
                <IoReceiptOutline className="text-[#4a6741] text-xl" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 text-sm">Order History</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                  Review your past transactions and points
                </p>
              </div>
              <IoChevronForwardOutline className="text-gray-300 text-lg flex-shrink-0" />
            </div>
          </div>

          {/* ── Recent Activity ── */}
          <div className="px-4 mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#4a6741]">Recent Activity</p>
              <button
                onClick={() => handleNavChange("orders")}
                className="text-xs font-semibold text-[#4a6741] hover:underline"
              >View All</button>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
              {activityLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-4 border-[#4a6741] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activity.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No recent activity yet</div>
              ) : (
                activity.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-4 py-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      item.type === "redeem" ? "bg-[#4a6741]" :
                      item.type === "byoc" ? "bg-[#7fb060]" :
                      "bg-[#d7ecc8]"
                    }`}>
                      {item.type === "redeem"
                        ? <IoGiftOutline className="text-white text-lg" />
                        : item.type === "byoc"
                        ? <IoLeafOutline className="text-white text-lg" />
                        : <IoReceiptOutline className="text-[#4a6741] text-lg" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-extrabold text-[#4a6741]">{item.pts}</p>
                      {item.label && <p className="text-[10px] font-semibold text-[#4a6741]/70">{item.label}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </main>
        )}

        {/* ── Bottom Navigation ── */}
        <nav className="flex-shrink-0 flex items-center bg-white border-t border-gray-100 px-2 py-2 z-10">
          {NAV.map((item) => {
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavChange(item.key)}
                className="flex-1 flex flex-col items-center gap-1 py-1"
              >
                {isActive ? (
                  <span className="w-10 h-10 rounded-full bg-[#4a6741] flex items-center justify-center">
                    {item.activeIcon || item.icon}
                  </span>
                ) : (
                  <span className="w-10 h-10 flex items-center justify-center text-gray-400">
                    {item.icon}
                  </span>
                )}
                <span className={`text-[10px] font-medium ${isActive ? "text-[#4a6741]" : "text-gray-400"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

    </div>
  );
}
