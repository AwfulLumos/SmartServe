import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  IoStar,
  IoStarOutline,
  IoNotificationsOutline,
  IoPersonCircleOutline,
  IoLeafOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline,
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
  IoCameraOutline,
  IoLockClosedOutline,
  IoSettingsOutline,
  IoHelpCircleOutline,
  IoMoonOutline,
  IoSendOutline,
  IoTrophyOutline,
  IoRibbonOutline,
  IoMedalOutline,
  IoShieldCheckmarkOutline,
  IoDownloadOutline,
  IoChatbubbleEllipsesOutline,
  IoFlashOutline,
  IoSparklesOutline,
  IoRepeatOutline,
  IoBookmarkOutline,
  IoBookmark,
  IoTimerOutline,
} from "react-icons/io5";
import { MdQrCode2 } from "react-icons/md";
import { useNotifications } from "../../context/NotificationContext";
import logo from "../../assets/logo/logo.png";
import toast from "react-hot-toast";
import SkeletonLoader, { SkeletonCardGrid, SkeletonList, SkeletonBanner } from "../../components/SkeletonLoader";

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

function resolveStudentImageUrl(profileImage) {
  if (!profileImage) return "";
  if (/^https?:\/\//i.test(profileImage)) return profileImage;

  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (/^https?:\/\//i.test(apiBase)) {
    const host = apiBase.replace(/\/?api\/?$/, "");
    return `${host}${profileImage.startsWith("/") ? "" : "/"}${profileImage}`;
  }

  return profileImage;
}

function getEcoLevel(byocCount = 0) {
  if (byocCount >= 30) {
    return { level: 4, name: "Planet Guardian", icon: <IoTrophyOutline className="text-[#4a6741]" />, min: 30, max: 30, nextTier: "Max Level Reached!", remaining: 0, progress: 100 };
  } else if (byocCount >= 15) {
    const progress = Math.min(100, Math.round(((byocCount - 15) / (30 - 15)) * 100));
    return { level: 3, name: "Zero-Waste Hero", icon: <IoRibbonOutline className="text-[#4a6741]" />, min: 15, max: 30, nextTier: "Planet Guardian", remaining: 30 - byocCount, progress };
  } else if (byocCount >= 5) {
    const progress = Math.min(100, Math.round(((byocCount - 5) / (15 - 5)) * 100));
    return { level: 2, name: "Eco Champion", icon: <IoMedalOutline className="text-[#4a6741]" />, min: 5, max: 15, nextTier: "Zero-Waste Hero", remaining: 15 - byocCount, progress };
  } else {
    const progress = Math.min(100, Math.round((byocCount / 5) * 100));
    return { level: 1, name: "Eco Starter", icon: <IoLeafOutline className="text-[#4a6741]" />, min: 0, max: 5, nextTier: "Eco Champion", remaining: 5 - byocCount, progress };
  }
}

const CATEGORIES = ["All", "Morning", "Lunch", "Snacks", "Beverages", "Others"];

const NAV = [
  { key: "home", label: "Home", icon: <IoHomeOutline className="text-xl" />, activeIcon: <IoHome className="text-xl text-white" /> },
  { key: "menu", label: "Menu", icon: <IoRestaurantOutline className="text-xl" />, activeIcon: <IoRestaurant className="text-xl text-white" /> },
  { key: "orders", label: "Orders", icon: <IoReceiptOutline className="text-xl" />, activeIcon: <IoReceipt className="text-xl text-white" /> },
  { key: "qr", label: "My QR", icon: <MdQrCode2 className="text-xl" />, activeIcon: <MdQrCode2 className="text-xl text-white" /> },
  { key: "rewards", label: "Rewards", icon: <IoGiftOutline className="text-xl" />, activeIcon: <IoGift className="text-xl text-white" /> },
];

// ── My QR View ────────────────────────────────────────────────────────────────
function MyQRView({ student }) {
  const isEmployee = student?.userType === "employee";
  const subInfo = isEmployee
    ? [student?.jobTitle, student?.department].filter(Boolean).join(" · ")
    : [student?.gradeLevel, student?.section].filter(Boolean).join(" - Section ");

  const handleDownloadQR = () => {
    if (!student?.qrToken) {
      toast.error("No QR token available to download");
      return;
    }

    const svgElement = document.getElementById("student-qr-code");
    if (!svgElement) {
      toast.error("QR Code element not found");
      return;
    }

    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const padding = 24;
        canvas.width = img.width + padding * 2;
        canvas.height = img.height + padding * 2;

        ctx.fillStyle = "#d7ecc8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, padding, padding);
        URL.revokeObjectURL(url);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        const studentName = student?.fullName ? student.fullName.replace(/[^a-zA-Z0-9]/g, "_") : "Student";
        const studentId = student?.schoolId ? `_${student.schoolId}` : "";
        downloadLink.href = pngUrl;
        downloadLink.download = `${studentName}${studentId}_QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success("QR Code downloaded successfully!");
      };

      img.src = url;
    } catch (err) {
      console.error("Failed to download QR Code:", err);
      toast.error("Could not download QR code");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="px-6 pt-6 pb-5 text-center">
        <h2 className="text-2xl font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">{student?.fullName ?? "—"}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{student?.schoolId ?? "—"}</p>
        {subInfo && <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">{subInfo}</p>}
      </div>

      <div className="mx-5 bg-white dark:bg-[#1a2416] border border-transparent dark:border-[#2b3924] rounded-3xl shadow-lg p-5">
        <div className="bg-[#d7ecc8] dark:bg-[#2e4028] rounded-2xl flex items-center justify-center p-6">
          {student?.qrToken ? (
            <QRCode id="student-qr-code" value={student.qrToken} size={220} fgColor="#4a6741" bgColor="#d7ecc8" level="M" />
          ) : (
            <div className="w-[220px] h-[220px] flex items-center justify-center text-[#4a6741]/40 dark:text-[#8ebd7e]/40">
              <MdQrCode2 className="text-8xl" />
            </div>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-400 font-mono tracking-wider mt-4">
          {student?.qrToken ?? "No QR token"}
        </p>

        <button
          onClick={handleDownloadQR}
          disabled={!student?.qrToken}
          className="w-full mt-4 py-3 px-4 bg-[#4a6741] hover:bg-[#3a5333] active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-sm transition"
        >
          <IoDownloadOutline className="text-lg" />
          <span>Download QR Code</span>
        </button>
      </div>

      <div className="mx-5 mt-4 bg-[#d7ecc8] dark:bg-[#2e4028] rounded-2xl px-5 py-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <IoSunnyOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-base" />
          <p className="text-sm font-semibold text-[#4a6741] dark:text-[#8ebd7e]">Auto-Brightness Active</p>
        </div>
        <p className="text-xs text-center text-[#4a6741]/80 dark:text-[#8ebd7e]/90 leading-relaxed">
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
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    studentApi.get("/menu/active")
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const dynamicCategories = ["All", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];

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
        <div>
          <h2 className="text-2xl font-extrabold text-[#4a6741]">Menu</h2>
          <p className="text-xs text-gray-400 mt-0.5">Explore & order your canteen favorites</p>
        </div>
        <button
          onClick={onOpenCart}
          className="relative w-10 h-10 bg-[#4a6741] hover:bg-[#3a5333] rounded-full flex items-center justify-center shadow transition"
        >
          <IoCartOutline className="text-white text-xl" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Enhanced Search Input */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#24301f] border border-gray-200 dark:border-[#2b3924] focus-within:border-[#4a6741] dark:focus-within:border-[#8ebd7e] focus-within:bg-white dark:focus-within:bg-[#1a2416] rounded-2xl px-4 py-2.5 transition">
          <IoSearchOutline className="text-gray-400 dark:text-gray-400 text-lg flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 font-sans"
            placeholder="Search meals, drinks, snacks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <IoCloseOutline className="text-lg" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 px-4 mb-3 overflow-x-auto scrollbar-hide py-1">
        {dynamicCategories.map((cat) => {
          const count = cat === "All" ? items.length : items.filter((i) => i.category === cat).length;
          const isSelected = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition ${isSelected
                ? "bg-[#4a6741] text-white border-[#4a6741] shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Item Count Header */}
      {!loading && items.length > 0 && (
        <div className="px-5 mb-2 flex items-center justify-between text-xs text-gray-400">
          <span>
            {search ? `Search results for "${search}"` : category !== "All" ? `Category: ${category}` : "All Menu Items"}
          </span>
          <span className="font-semibold text-[#4a6741]">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Items list */}
      {loading ? (
        <div className="px-4">
          <SkeletonCardGrid count={6} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mx-4 my-6 bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-400">
            <IoSearchOutline className="text-2xl" />
          </div>
          <p className="font-bold text-gray-800 text-base mb-1">No items found</p>
          <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">
            {search ? `We couldn't find any menu items matching "${search}".` : `No items currently available in ${category}.`}
          </p>
          {(search || category !== "All") && (
            <button
              onClick={() => { setSearch(""); setCategory("All"); }}
              className="px-4 py-2 bg-[#d7ecc8] text-[#4a6741] font-bold text-xs rounded-xl hover:bg-[#c3e2b0] transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {filtered.map((item) => {
            const inCart = cart.find((c) => c.menuItemId === item._id);
            return (
              <div key={item._id} className="bg-white dark:bg-[#1a2416] rounded-2xl border border-gray-100 dark:border-[#2b3924] shadow-sm p-3.5 flex items-center gap-3.5 hover:border-[#4a6741]/30 transition">
                <div
                  onClick={() => setPreviewItem(item)}
                  className="relative group cursor-pointer flex-shrink-0"
                  title="Click to view full picture"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl border border-gray-100 dark:border-[#2b3924] shadow-xs transition transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#d7ecc8]/30 dark:bg-[#2e4028] border border-gray-100 dark:border-[#2b3924] flex items-center justify-center text-[#4a6741] dark:text-[#8ebd7e] transition transform group-hover:scale-105">
                      <IoRestaurantOutline className="text-2xl" />
                    </div>
                  )}
                  {item.image && (
                    <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <IoSearchOutline className="text-base" />
                    </div>
                  )}
                </div>
                <div
                  onClick={() => setPreviewItem(item)}
                  className="flex-1 min-w-0 pr-1 cursor-pointer"
                >
                  <p className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate hover:text-[#4a6741] dark:hover:text-[#8ebd7e] transition">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] bg-gray-100 dark:bg-[#24301f] text-gray-500 dark:text-gray-400 px-2.5 py-0.5 rounded-full font-medium">
                      {item.category}
                    </span>
                    <span className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">₱{item.price}</span>
                  </div>
                  {inCart && (
                    <p className="text-[11px] text-[#7fb060] font-semibold mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7fb060]" /> {inCart.quantity}× in cart
                    </p>
                  )}
                </div>
                <button
                  onClick={() => addToCart(item)}
                  className="w-9 h-9 bg-[#4a6741] hover:bg-[#3a5333] active:scale-95 rounded-full flex items-center justify-center flex-shrink-0 transition shadow-sm"
                  title="Add to cart"
                >
                  <IoAddOutline className="text-white text-lg" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Full-Screen Image Lightbox Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white dark:bg-[#1a2416] rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200 border border-transparent dark:border-[#2b3924]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition shadow-md"
              title="Close picture view"
            >
              <IoCloseOutline className="text-xl" />
            </button>

            {/* Large Image View */}
            <div className="w-full h-72 sm:h-80 bg-gray-100 dark:bg-[#24301f] relative overflow-hidden flex items-center justify-center">
              {previewItem.image ? (
                <img
                  src={previewItem.image}
                  alt={previewItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                  <IoRestaurantOutline className="text-6xl text-[#4a6741] dark:text-[#8ebd7e]" />
                  <span className="text-xs font-semibold">No image uploaded</span>
                </div>
              )}
            </div>

            {/* Details & Actions */}
            <div className="p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white truncate">{previewItem.name}</h3>
                <span className="text-lg font-extrabold text-[#4a6741] dark:text-[#8ebd7e] flex-shrink-0">₱{previewItem.price}</span>
              </div>

              <div className="flex items-center gap-2 mb-5">
                <span className="text-xs font-semibold bg-[#d7ecc8] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] px-3 py-1 rounded-full">
                  {previewItem.category}
                </span>
              </div>

              <button
                onClick={() => {
                  addToCart(previewItem);
                  setPreviewItem(null);
                  toast.success(`Added ${previewItem.name} to cart!`);
                }}
                className="w-full py-3.5 bg-[#4a6741] hover:bg-[#3a5333] active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
              >
                <IoAddOutline className="text-xl" />
                <span>Add to Cart — ₱{previewItem.price}</span>
              </button>
            </div>
          </div>
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

// ── Live Order ETA Calculation Helper ──
function getLiveOrderEtaInfo(status) {
  if (status === "pending") {
    return {
      step: 1,
      progress: 33,
      etaText: "~8–10 mins",
      statusTitle: "Order Received",
      statusMessage: "Canteen staff has received your order & is queueing preparation.",
      badgeBg: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300",
    };
  }
  if (status === "preparing") {
    return {
      step: 2,
      progress: 66,
      etaText: "~3–5 mins",
      statusTitle: "Cooking in Kitchen",
      statusMessage: "Your meal is freshly being prepared by the canteen kitchen staff!",
      badgeBg: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300",
    };
  }
  if (status === "ready") {
    return {
      step: 3,
      progress: 100,
      etaText: "READY NOW!",
      statusTitle: "Ready for Pickup!",
      statusMessage: "Head to the canteen counter & show your QR code to claim your food!",
      badgeBg: "bg-[#d7ecc8] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] border-[#4a6741]",
    };
  }
  return {
    step: 3,
    progress: 100,
    etaText: "Completed",
    statusTitle: "Order Completed",
    statusMessage: "Thank you! Enjoy your meal.",
    badgeBg: "bg-gray-100 text-gray-700 border-gray-200",
  };
}

// ── Live Order Progress Tracker Component ──
function LiveOrderProgressTracker({ order, onTrackClick }) {
  const etaInfo = getLiveOrderEtaInfo(order.status);
  const itemsText = itemSummary(order.items);

  return (
    <div
      onClick={onTrackClick}
      className="bg-white dark:bg-[#1a2416] rounded-3xl border-2 border-[#4a6741]/40 dark:border-[#8ebd7e]/40 shadow-md p-5 relative overflow-hidden transition hover:border-[#4a6741] cursor-pointer"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4a6741] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4a6741]"></span>
          </span>
          <p className="font-extrabold text-gray-900 dark:text-white text-base font-mono">{order.orderNumber}</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-xs bg-[#d7ecc8] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e]">
          <IoTimeOutline className="text-sm animate-pulse" />
          <span>{etaInfo.etaText}</span>
        </div>
      </div>

      <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3 truncate">
        {itemsText} • <span className="font-bold text-[#4a6741] dark:text-[#8ebd7e]">₱{order.total}</span>
      </p>

      {/* Stepper Progress Box */}
      <div className="bg-gray-50 dark:bg-[#24301f] rounded-2xl p-3.5 border border-gray-100 dark:border-[#2b3924] mb-3">
        <div className="flex justify-between items-center text-xs font-extrabold text-gray-700 dark:text-gray-200 mb-2">
          <span className="flex items-center gap-1">
            {order.status === "ready" ? (
              <IoCheckmarkCircleOutline className="text-lg text-[#4a6741] animate-bounce" />
            ) : order.status === "preparing" ? (
              <IoFlameOutline className="text-lg text-blue-500 animate-pulse" />
            ) : (
              <IoTimeOutline className="text-lg text-amber-500 animate-spin" />
            )}
            {etaInfo.statusTitle}
          </span>
          <span className="text-[#4a6741] dark:text-[#8ebd7e] font-mono">{etaInfo.progress}%</span>
        </div>

        {/* Progress Bar Track */}
        <div className="relative w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-blue-500 to-[#4a6741] rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${etaInfo.progress}%` }}
          />
        </div>

        {/* Stepper Icons */}
        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-gray-400">
          <div className={`flex flex-col items-center gap-1 ${etaInfo.step >= 1 ? "text-[#4a6741] dark:text-[#8ebd7e]" : ""}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${etaInfo.step >= 1 ? "bg-[#d7ecc8] text-[#4a6741]" : "bg-gray-200 text-gray-400"}`}>
              <IoTimeOutline />
            </div>
            <span>Received</span>
          </div>

          <div className={`flex flex-col items-center gap-1 ${etaInfo.step >= 2 ? "text-blue-600 dark:text-blue-400" : ""}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${etaInfo.step >= 2 ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400"}`}>
              <IoFlameOutline />
            </div>
            <span>Cooking</span>
          </div>

          <div className={`flex flex-col items-center gap-1 ${etaInfo.step >= 3 ? "text-[#4a6741] dark:text-[#8ebd7e]" : ""}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${etaInfo.step >= 3 ? "bg-[#d7ecc8] text-[#4a6741] animate-pulse" : "bg-gray-200 text-gray-400"}`}>
              <IoCheckmarkDoneCircleOutline />
            </div>
            <span>Pickup Ready</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 dark:text-gray-400 italic text-center">
        {etaInfo.statusMessage}
      </p>
    </div>
  );
}

// ── Quick Re-Order / Order My Usual Card Component ──
function MyUsualCard({ usualOrder, onReOrder, onClearUsual }) {
  if (!usualOrder || !usualOrder.items || usualOrder.items.length === 0) return null;

  const itemsPreview = usualOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");

  return (
    <div className="bg-gradient-to-r from-[#f0f7ec] via-white to-[#e8f5e2] dark:from-[#1c2a18] dark:via-[#1a2416] dark:to-[#24341f] rounded-3xl border border-[#4a6741]/30 dark:border-[#8ebd7e]/30 p-5 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#4a6741] text-white flex items-center justify-center shadow-xs">
            <IoBookmarkOutline className="text-base" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#4a6741] dark:text-[#8ebd7e] uppercase tracking-wider">My Usual Order</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-400">1-Click Quick Re-Order</p>
          </div>
        </div>
        {onClearUsual && (
          <button
            onClick={onClearUsual}
            className="text-[10px] text-gray-400 hover:text-red-500 font-medium transition"
            title="Clear saved usual order"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-white/80 dark:bg-[#24301f]/80 backdrop-blur-xs rounded-2xl p-3 border border-gray-100 dark:border-[#2b3924] mb-3">
        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">{itemsPreview}</p>
        <p className="text-xs font-extrabold text-[#4a6741] dark:text-[#8ebd7e] mt-0.5">
          Total: ₱{usualOrder.total}
        </p>
      </div>

      <button
        onClick={() => onReOrder(usualOrder.items)}
        className="w-full py-3 bg-[#4a6741] hover:bg-[#3a5333] active:scale-[0.98] text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition"
      >
        <span>Order My Usual (1-Click)</span>
      </button>
    </div>
  );
}

// ── Orders View ───
const ORDER_STATUS_CFG = {
  pending: { label: "Pending", icon: <IoTimeOutline />, badge: "bg-amber-100 text-amber-700", border: "border-amber-300", isActive: true },
  preparing: { label: "Being Prepared", icon: <IoFlameOutline />, badge: "bg-blue-100 text-blue-700", border: "border-blue-300", isActive: true },
  ready: { label: "Ready for Pickup", icon: <IoCheckmarkCircleOutline />, badge: "bg-[#d7ecc8] text-[#4a6741]", border: "border-[#4a6741]", isActive: true },
  completed: { label: "Completed", icon: <IoCheckmarkDoneCircleOutline />, badge: "bg-[#d7ecc8] text-[#4a6741]", border: "border-gray-200", isActive: false },
  cancelled: { label: "Cancelled", icon: <IoAlertCircleOutline />, badge: "bg-red-100 text-red-600", border: "border-gray-200", isActive: false },
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

function PastOrderDetail({ order, onClose, onReOrder, onSetUsual }) {
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
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
              <span className="text-sm">{cfg.icon}</span>
              {cfg.label}
            </span>
            {onSetUsual && (
              <button
                onClick={() => onSetUsual(order)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#4a6741] bg-[#f0f7ec] px-3 py-1.5 rounded-full hover:bg-[#d7ecc8] transition"
              >
                <IoBookmarkOutline className="text-sm" />
                <span>Set as My Usual</span>
              </button>
            )}
          </div>
          {/* Items */}
          <div className="flex flex-col gap-2 mb-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm text-gray-700">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-semibold text-gray-800">₱{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center mb-5">
            <span className="font-extrabold text-[#4a6741] text-sm">Total</span>
            <span className="font-extrabold text-[#4a6741] text-lg">₱{order.total}</span>
          </div>

          {onReOrder && (
            <button
              onClick={() => {
                onClose();
                onReOrder(order.items);
              }}
              className="w-full py-3.5 bg-[#4a6741] hover:bg-[#3a5333] active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-sm transition"
            >
              <IoRepeatOutline className="text-lg" />
              <span>Re-Order These Items</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OrdersView({ onReOrder, onSetUsual, usualOrder }) {
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
  const pastOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  const filtered =
    filter === "active" ? activeOrders :
      filter === "completed" ? pastOrders : orders;

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
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`py-3 rounded-2xl text-sm font-bold transition ${filter === t.key
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
        <div className="px-5">
          <SkeletonList count={4} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No orders found</div>
      ) : (
        <div className="px-5 flex flex-col gap-5">

          {/* ── Current Orders ── */}
          {(filter === "all" || filter === "active") && activeOrders.length > 0 && (
            <div>
              <p className="text-base font-extrabold text-[#4a6741] mb-3">Active Order Live Tracker</p>
              <div className="flex flex-col gap-3">
                {activeOrders.map((order) => (
                  <LiveOrderProgressTracker key={order._id} order={order} />
                ))}
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
                    <div
                      key={order._id}
                      onClick={() => setDetailOrder(order)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setDetailOrder(order);
                        }
                      }}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 text-left w-full hover:border-[#4a6741]/30 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-gray-900 text-base">{order.orderNumber}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatOrderDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {onReOrder && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onReOrder(order.items);
                              }}
                              className="px-3 py-1.5 bg-[#f0f7ec] hover:bg-[#d7ecc8] text-[#4a6741] font-bold text-xs rounded-xl flex items-center gap-1 transition"
                              title="Re-order these items"
                            >
                              <IoRepeatOutline className="text-sm" />
                              <span>Re-Order</span>
                            </button>
                          )}
                          <IoChevronForwardOutline className="text-gray-300 text-lg flex-shrink-0 ml-1" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                          <span className="text-sm">{cfg.icon}</span>
                          {cfg.label}
                        </span>
                        <span className="font-extrabold text-[#4a6741] text-base">₱{order.total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Detail bottom sheet */}
      {detailOrder && (
        <PastOrderDetail
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onReOrder={onReOrder}
          onSetUsual={onSetUsual}
        />
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
  const ecoInfo = getEcoLevel(byocCount);
  const co2Saved = (byocCount * 0.15).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-gray-50">
      {/* Eco Points & Level Card */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-[#7fb060] to-[#4a6741] rounded-3xl px-5 py-5 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              <IoLeafOutline className="text-white text-xl" />
            </div>
            <div>
              <p className="text-xs text-white/80 font-medium">Your Eco Points</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>{ecoInfo.icon}</span> {ecoInfo.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <p className="text-5xl font-extrabold leading-none">{student?.points ?? 0}</p>
          <span className="text-sm font-semibold text-white/80">pts</span>
        </div>

        {/* Level Progress Bar */}
        <div className="bg-black/20 rounded-2xl p-3.5 backdrop-blur-sm">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-bold flex items-center gap-1">
              <span>{ecoInfo.icon}</span> Level {ecoInfo.level}: {ecoInfo.name}
            </span>
            <span className="text-white/90 text-[11px] font-semibold">
              {ecoInfo.level < 4 ? `${byocCount}/${ecoInfo.max} BYOC` : "Max Tier"}
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${ecoInfo.progress}%` }}
            />
          </div>
          <p className="text-[11px] text-white/80 mt-1.5 text-right font-medium">
            {ecoInfo.level < 4
              ? `${ecoInfo.remaining} more BYOC use${ecoInfo.remaining !== 1 ? "s" : ""} until ${ecoInfo.nextTier}`
              : "Congratulations! You have reached the top Eco Tier!"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-2">
        {[
          { key: "catalog", label: "Rewards Catalog" },
          { key: "byoc", label: "BYOC Eco Program" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-3 rounded-2xl text-sm font-bold transition ${tab === t.key
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
            <SkeletonCardGrid count={3} />
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
                    className={`bg-white rounded-2xl border-2 px-4 py-4 flex items-center gap-4 text-left w-full transition ${canAfford ? "border-[#4a6741]/30 hover:border-[#4a6741]" : "border-gray-200 opacity-60"
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

          {/* Eco Level & Impact Metrics */}
          <div className="bg-white dark:bg-[#1a2416] rounded-3xl border border-gray-100 dark:border-[#2b3924] shadow-sm px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">Your Eco Milestone</p>
              <span className="text-xs font-extrabold bg-[#d7ecc8] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] px-3 py-1 rounded-full flex items-center gap-1">
                <span>{ecoInfo.icon}</span> {ecoInfo.name}
              </span>
            </div>

            {/* Level Stepper Bar */}
            <div className="bg-gray-50 dark:bg-[#24301f] rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                <span>Progress to {ecoInfo.nextTier || "Max Tier"}</span>
                <span className="text-[#4a6741] dark:text-[#8ebd7e]">{ecoInfo.progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[#4a6741] dark:bg-[#8ebd7e] rounded-full transition-all duration-500"
                  style={{ width: `${ecoInfo.progress}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {ecoInfo.level < 4
                  ? `Bring your container ${ecoInfo.remaining} more time${ecoInfo.remaining !== 1 ? "s" : ""} to unlock ${ecoInfo.nextTier} status!`
                  : "You've reached the highest Eco Tier status!"}
              </p>
            </div>

            {/* Impact Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-[#d7ecc8]/70 dark:bg-[#2e4028]/80 border border-[#4a6741]/20 dark:border-[#8ebd7e]/30 rounded-2xl px-4 py-3.5">
                <p className="text-xs font-semibold text-[#4a6741]/80 dark:text-[#8ebd7e]/90 mb-1">Plastics Prevented</p>
                <p className="text-2xl font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">{byocCount} <span className="text-xs font-semibold">containers</span></p>
              </div>
              <div className="bg-[#d7ecc8]/70 dark:bg-[#2e4028]/80 border border-[#4a6741]/20 dark:border-[#8ebd7e]/30 rounded-2xl px-4 py-3.5">
                <p className="text-xs font-semibold text-[#4a6741]/80 dark:text-[#8ebd7e]/90 mb-1">CO₂ Reduction</p>
                <p className="text-2xl font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">{co2Saved} <span className="text-xs font-semibold">kg CO₂</span></p>
              </div>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 italic">
              {byocCount > 0
                ? `Awesome job! You have kept ${byocCount} single-use container${byocCount !== 1 ? "s" : ""} out of campus landfills.`
                : "Start your eco journey — bring a reusable container next time you visit!"}
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

// ── Student Login Loading Screen ────────────────────────────────────────────
function StudentLoginLoadingScreen({ progress, statusText, onSkip }) {
  const remainingSec = Math.max(0, ((3000 - (progress / 100) * 3000) / 1000)).toFixed(1);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2e16] via-[#2a4023] to-[#4a6741] text-white p-6 select-none">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7fb060]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d7ecc8]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-xs w-full text-center">
        {/* Brand Logo */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center p-2 shadow-2xl overflow-hidden">
            <img src={logo} alt="SmartServe" className="w-full h-full object-cover rounded-full drop-shadow-md" />
          </div>
        </div>

        {/* Brand Titles */}
        <h2 className="text-2xl font-black tracking-wide text-white drop-shadow">
          SmartServe
        </h2>
        <p className="text-[11px] uppercase tracking-widest text-[#d7ecc8] font-bold mt-0.5 mb-6">
          Student Portal
        </p>

        {/* Status Text */}
        <div className="h-7 mb-4 flex items-center justify-center">
          <p className="text-sm font-medium text-white/90 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#d7ecc8] animate-ping" />
            {statusText}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/35 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-inner mb-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-[#7fb060] via-[#a3cf5a] to-[#d7ecc8] transition-all duration-75 ease-out shadow-lg shadow-[#7fb060]/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Percentage & Time */}
        <div className="w-full flex justify-between items-center text-xs font-semibold text-white/70 px-1 mb-6">
          <span>Loading your profile...</span>
          <span className="text-[#d7ecc8] font-mono text-sm font-bold">{Math.round(progress)}%</span>
          <span className="font-mono text-[#d7ecc8]">{remainingSec}s</span>
        </div>

        {/* Skip button */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white/80 hover:text-white transition"
          >
            Skip loading ›
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-[11px] text-white/50 tracking-wider">
        SmartServe Canteen System • Student Session
      </div>
    </div>
  );
}

// ── Student Logout Screen ────────────────────────────────────────────────────
function StudentLogoutScreen({ countdown, progress, student }) {
  const initials = student?.fullName
    ? student.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "S";

  const profileImageUrl = resolveStudentImageUrl(student?.profileImage || "");
  const strokeDashoffset = 2 * Math.PI * 46 * (1 - progress / 100);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#141b13] via-[#1e2e1a] to-[#152314] text-white p-6 select-none">
      {/* Background Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-red-900/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[#4a6741]/25 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-xs w-full text-center">
        {/* Avatar with countdown ring */}
        <div className="relative mb-5 flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="transparent" />
            <circle
              cx="56" cy="56" r="46"
              stroke="#ef4444" strokeWidth="6" fill="transparent"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-75 ease-linear"
            />
          </svg>
          <div className="absolute w-20 h-20 rounded-full bg-[#4a6741] border-2 border-white/40 shadow-2xl overflow-hidden flex items-center justify-center text-white font-bold text-xl">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt={student?.fullName || "Student"} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>

        {/* Countdown badge */}
        <div className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-extrabold text-sm mb-3 shadow-inner">
          Logging out in {countdown}s
        </div>

        {/* Farewell text */}
        <h2 className="text-2xl font-black text-white tracking-wide">Logging Out...</h2>
        <p className="text-sm text-gray-200 mt-1 mb-1 font-medium">
          Goodbye, <span className="font-bold text-[#d7ecc8]">{student?.fullName || "Student"}</span>!
        </p>
        <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-6">
          Safely ending your student session and clearing local data...
        </p>

        {/* Progress bar */}
        <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/15 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-[#d7ecc8] transition-all duration-75 ease-out shadow-md shadow-red-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1.5 font-medium">
          <IoLogOutOutline className="text-red-400 text-sm animate-pulse" />
          Redirecting to student login screen...
        </p>
      </div>
    </div>
  );
}

// ── Student Custom Dropdown Component ──
function StudentCustomDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full bg-gray-50 dark:bg-[#24301f] hover:bg-white dark:hover:bg-[#1a2416] border border-gray-200 dark:border-[#2b3924] focus:border-[#4a6741] dark:focus:border-[#8ebd7e] text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl px-3 py-2 flex items-center justify-between shadow-xs transition outline-none"
      >
        <span className="truncate">{selectedOpt?.label}</span>
        <IoChevronDownOutline
          className={`text-gray-400 dark:text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180 text-[#4a6741] dark:text-[#8ebd7e]" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#1a2416] rounded-2xl shadow-xl border border-gray-100 dark:border-[#2b3924] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${isSelected
                  ? "bg-[#e8f5e2] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] font-bold"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24301f]"
                  }`}
              >
                <span>{opt.label}</span>
                {isSelected && <IoCheckmarkDoneOutline className="text-sm text-[#4a6741] dark:text-[#8ebd7e]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Terms of Service Sheet ──
function TermsOfServiceSheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f0f7ec]">
          <div className="flex items-center gap-2">
            <IoShieldCheckmarkOutline className="text-[#4a6741] text-xl" />
            <h3 className="text-base font-extrabold text-[#4a6741]">Terms of Service</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/60 transition">
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-gray-700 text-xs leading-relaxed space-y-4 font-sans">
          <p className="text-gray-400 text-[11px]">Last Updated: August 23, 2026</p>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">1. Acceptance of Terms</h4>
            <p>By creating an account or using SmartServe, you confirm that you are an enrolled student or authorized campus employee and agree to comply with canteen regulations and these terms.</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">2. User Accounts & QR Code Security</h4>
            <p>Your unique QR code identifies your account at the canteen counter. Sharing your QR code or using unauthorized credentials to claim rewards or meals is strictly prohibited.</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">3. Canteen Ordering & Pick-up</h4>
            <p>Orders placed via SmartServe represent a binding request for food preparation. Students must collect their orders promptly once status updates to "Ready for Pickup".</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">4. BYOC & Eco Points Program</h4>
            <p>Students participating in the Bring Your Own Container program must present clean, food-safe reusable containers. Eco Points earned can be redeemed for rewards and cannot be exchanged for cash.</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">5. Code of Conduct & Support Feedback</h4>
            <p>When submitting feedback or communicating with canteen staff, users must maintain respectful language. Canteen management reserves the right to moderate inappropriate content.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#4a6741] text-white font-bold text-xs rounded-2xl hover:bg-[#3a5333] transition"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Privacy Policy Sheet ──
function PrivacyPolicySheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f0f7ec]">
          <div className="flex items-center gap-2">
            <IoLockClosedOutline className="text-[#4a6741] text-xl" />
            <h3 className="text-base font-extrabold text-[#4a6741]">Privacy Policy</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/60 transition">
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-gray-700 text-xs leading-relaxed space-y-4 font-sans">
          <p className="text-gray-400 text-[11px]">Last Updated: August 23, 2026</p>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">1. Information We Collect</h4>
            <p>We collect essential data to fulfill canteen orders and eco rewards: Full Name, School ID, Email Address, Grade/Section or Department, profile photos, order history, and BYOC scan logs.</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">2. How We Use Your Data</h4>
            <p>Your information is strictly used to prepare food orders, validate identity via QR scans, calculate Eco Points, respond to support inquiries, and optimize canteen operations.</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">3. Data Security & Storage</h4>
            <p>Passwords are encrypted using bcrypt hashing. Access is limited strictly to authorized canteen administrators. We never sell or share data with third-party advertisers.</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm">4. Your Data Rights & Deletion</h4>
            <p>You can view and update your profile details at any time, self-delete your submitted feedback history, or request account deactivation from campus canteen management.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#4a6741] text-white font-bold text-xs rounded-2xl hover:bg-[#3a5333] transition"
          >
            Close Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Profile View ──
function ProfileView({ student, onClose, onLogout }) {
  const { changePassword, updateProfile, updateProfilePhoto } = useStudentAuth();
  const [settingsTab, setSettingsTab] = useState("menu");
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Existing states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [accountForm, setAccountForm] = useState({
    fullName: "",
    email: "",
    gradeLevel: "",
    section: "",
    jobTitle: "",
    department: "",
  });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  // New settings states
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem("smartserve_student_notif_prefs");
      return stored ? JSON.parse(stored) : { orderUpdates: true, ecoPoints: true, newRewards: true };
    } catch {
      return { orderUpdates: true, ecoPoints: true, newRewards: true };
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("smartserve_theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("smartserve_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("smartserve_theme", "light");
    }
  }, [darkMode]);

  const [ecoReminder, setEcoReminder] = useState(() => {
    try {
      const stored = localStorage.getItem("smartserve_student_eco_reminder");
      return stored ? JSON.parse(stored) : { enabled: false, time: "07:30" };
    } catch {
      return { enabled: false, time: "07:30" };
    }
  });

  const [supportMessage, setSupportMessage] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("General");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [sendingSupport, setSendingSupport] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [deletingFeedbackId, setDeletingFeedbackId] = useState(null);

  const fetchMyFeedbacks = useCallback(async () => {
    setLoadingFeedbacks(true);
    try {
      const { data } = await studentApi.get("/feedback/student/my");
      setMyFeedbacks(data.feedbacks || []);
    } catch {
      // ignore
    } finally {
      setLoadingFeedbacks(false);
    }
  }, []);

  const handleDeleteMyFeedback = async (id) => {
    setDeletingFeedbackId(id);
    try {
      await studentApi.delete(`/feedback/student/${id}`);
      toast.success("Feedback deleted successfully.");
      fetchMyFeedbacks();
    } catch {
      toast.error("Failed to delete feedback.");
    } finally {
      setDeletingFeedbackId(null);
    }
  };

  useEffect(() => {
    fetchMyFeedbacks();
  }, [settingsTab, fetchMyFeedbacks]);

  useEffect(() => {
    setAccountForm({
      fullName: student?.fullName ?? "",
      email: student?.email ?? "",
      gradeLevel: student?.gradeLevel ?? "",
      section: student?.section ?? "",
      jobTitle: student?.jobTitle ?? "",
      department: student?.department ?? "",
    });
  }, [student]);

  const isEmployee = student?.userType === "employee";
  const idLabel = isEmployee ? "Employee ID" : "School ID";
  const subInfoLabel = isEmployee ? "Job Title / Dept" : "Grade & Section";
  const subInfoValue = isEmployee
    ? [student?.jobTitle, student?.department].filter(Boolean).join(" · ") || "—"
    : [student?.gradeLevel && `Grade ${student.gradeLevel}`, student?.section && `Section ${student.section}`].filter(Boolean).join(" - ") || "—";
  const profileImageUrl = resolveStudentImageUrl(student?.profileImage);
  const memberSince = student?.createdAt
    ? new Date(student.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  const INFO_ROWS = [
    { icon: <IoIdCardOutline className="text-[#4a6741] text-lg" />, label: idLabel, value: student?.schoolId ?? "—" },
    { icon: <IoSchoolOutline className="text-[#4a6741] text-lg" />, label: subInfoLabel, value: subInfoValue },
    { icon: <IoMailOutline className="text-[#4a6741] text-lg" />, label: "Email", value: student?.email ?? "—" },
    { icon: <IoCalendarOutline className="text-[#4a6741] text-lg" />, label: "Member Since", value: memberSince },
  ];

  // Handlers
  const handleAccountSave = async (e) => {
    e.preventDefault();
    setAccountMessage("");

    if (!accountForm.fullName.trim()) {
      setAccountMessage("Full name is required");
      return;
    }
    if (!accountForm.email.trim()) {
      setAccountMessage("Email is required");
      return;
    }

    const payload = {
      fullName: accountForm.fullName.trim(),
      email: accountForm.email.trim(),
    };

    if (isEmployee) {
      payload.jobTitle = accountForm.jobTitle.trim();
      payload.department = accountForm.department.trim();
    } else {
      payload.gradeLevel = accountForm.gradeLevel.trim();
      payload.section = accountForm.section.trim();
    }

    setSavingAccount(true);
    const result = await updateProfile(payload);
    setSavingAccount(false);

    if (!result.success) {
      setAccountMessage(result.message);
      return;
    }

    setAccountMessage("Account information updated successfully");
    setIsEditingAccount(false);
  };

  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAccountMessage("");
    setPhotoUploading(true);
    const result = await updateProfilePhoto(file);
    setPhotoUploading(false);
    e.target.value = "";

    setAccountMessage(result.success ? "Profile photo updated" : result.message);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordMessage("");

    const errors = {};
    if (!passwordForm.oldPassword) errors.oldPassword = "Current password is required";
    if (!passwordForm.newPassword) errors.newPassword = "New password is required";
    else if (passwordForm.newPassword.length < 6) errors.newPassword = "Min. 6 characters";
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = "Passwords don't match";

    if (Object.keys(errors).length) {
      setPasswordErrors(errors);
      return;
    }

    setChangingPassword(true);
    const result = await changePassword(passwordForm.oldPassword, passwordForm.newPassword, passwordForm.confirmPassword);
    setChangingPassword(false);

    if (result.success) {
      setPasswordMessage(result.message);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setShowChangePassword(false);
        setSettingsTab("menu");
      }, 1500);
    } else {
      setPasswordMessage(result.message);
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode((prev) => !prev);
  };

  const handleNotifToggle = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem("smartserve_student_notif_prefs", JSON.stringify(updated));
  };

  const handleEcoToggle = (val) => {
    const updated = { ...ecoReminder, enabled: val };
    setEcoReminder(updated);
    localStorage.setItem("smartserve_student_eco_reminder", JSON.stringify(updated));
    if (val && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const handleEcoTimeChange = (timeVal) => {
    const updated = { ...ecoReminder, time: timeVal };
    setEcoReminder(updated);
    localStorage.setItem("smartserve_student_eco_reminder", JSON.stringify(updated));
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSendingSupport(true);
    try {
      await studentApi.post("/feedback/student", {
        category: feedbackCategory,
        rating: feedbackRating,
        message: supportMessage.trim(),
      });
      setSupportMessage("");
      setFeedbackRating(5);
      toast.success("Feedback submitted! Thank you.");
      fetchMyFeedbacks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSendingSupport(false);
    }
  };

  // Render Helpers
  const renderHeader = (title) => (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 font-sans">
      <button
        onClick={() => {
          if (isEditingAccount) setIsEditingAccount(false);
          else if (showChangePassword) setShowChangePassword(false);
          else setSettingsTab("menu");
        }}
        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
      >
        <IoArrowBackOutline className="text-xl" />
      </button>
      <p className="text-base font-extrabold text-[#4a6741]">{title}</p>
    </div>
  );

  if (settingsTab === "menu") {
    const MENU_ITEMS = [
      { key: "account", label: "Account Settings", desc: "Edit Profile, Change Password", icon: <IoPersonCircleOutline className="text-xl" /> },
      { key: "preferences", label: "Preferences", desc: "Notifications, Dark Mode", icon: <IoSettingsOutline className="text-xl" /> },
      { key: "eco", label: "Eco Program", desc: "Daily Reminders", icon: <IoLeafOutline className="text-xl" /> },
      { key: "feedback", label: "Feedback & Replies", desc: "Send Feedback, Admin Responses", icon: <IoChatbubbleEllipsesOutline className="text-xl" /> },
      { key: "support", label: "Support & Help", desc: "FAQs, Terms, About", icon: <IoHelpCircleOutline className="text-xl" /> },
    ];

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0f170a] font-sans">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2b3924] bg-white dark:bg-[#1a2416]">
          <p className="text-base font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">Settings</p>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#24301f] text-gray-400">
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-10">

          {/* Hero Card */}
          <div className="mx-4 mt-4 bg-[#4a6741] rounded-3xl px-6 py-6 flex flex-col items-center">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <IoPerson className="text-white/80 text-4xl" />
                )}
              </div>
              <label className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-white text-[#4a6741] shadow flex items-center justify-center cursor-pointer hover:bg-gray-100 transition">
                <IoCameraOutline className="text-base" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelected}
                  disabled={photoUploading}
                />
              </label>
            </div>
            <p className="text-white font-extrabold text-xl">{student?.fullName ?? "—"}</p>
            <p className="text-white/70 text-xs font-mono mt-0.5">{student?.schoolId ?? "—"}</p>
            {photoUploading && <p className="text-white/80 text-xs mt-1">Uploading photo...</p>}
          </div>

          {/* Points Summary Card */}
          <div className="mx-4 mt-3 bg-white dark:bg-[#1a2416] border border-transparent dark:border-[#2b3924] rounded-3xl shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#f0f7ec] dark:bg-[#2e4028] flex items-center justify-center">
                <IoLeafOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-lg" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-400 font-semibold leading-none">Eco Points</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mt-1">Balance</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">{student?.points ?? 0}</p>
            </div>
          </div>

          {/* Menu list */}
          <div className="mx-4 mt-3 bg-white dark:bg-[#1a2416] border border-transparent dark:border-[#2b3924] rounded-3xl shadow-sm divide-y divide-gray-100 dark:divide-[#2b3924] overflow-hidden font-sans">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setSettingsTab(item.key)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-[#24301f] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0f7ec] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">{item.label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.key === "feedback" && myFeedbacks.length > 0 && (
                    <span className="text-[11px] font-bold bg-[#e8f5e2] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] px-2 py-0.5 rounded-full">
                      {myFeedbacks.length}
                    </span>
                  )}
                  <IoChevronForwardOutline className="text-gray-400 dark:text-gray-400 text-lg" />
                </div>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="mx-4 mt-5">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-200 text-red-500 hover:bg-red-50 font-bold text-sm transition"
            >
              <IoLogOutOutline className="text-lg" />
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (settingsTab === "account") {
    if (showChangePassword) {
      return (
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50 overflow-y-auto pb-10 font-sans">
          {renderHeader("Change Password")}
          <div className="mx-4 mt-4 bg-white rounded-3xl shadow-sm p-5">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, oldPassword: e.target.value }))}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition
                    ${passwordErrors.oldPassword ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"}`}
                  placeholder="Enter current password"
                />
                {passwordErrors.oldPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.oldPassword}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition
                    ${passwordErrors.newPassword ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"}`}
                  placeholder="Min. 6 characters"
                />
                {passwordErrors.newPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition
                    ${passwordErrors.confirmPassword ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"}`}
                  placeholder="Repeat new password"
                />
                {passwordErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>}
              </div>
              {passwordMessage && (
                <p className={`text-sm font-semibold ${passwordMessage.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
                  {passwordMessage}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm transition"
                  disabled={changingPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 px-4 py-2.5 bg-[#4a6741] text-white hover:bg-[#3a5333] rounded-xl font-semibold text-sm transition disabled:opacity-60"
                >
                  {changingPassword ? "Saving..." : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50 overflow-y-auto pb-10 font-sans">
        {renderHeader("Account Settings")}

        {/* Profile details */}
        <div className="mx-4 mt-4 bg-white rounded-3xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-extrabold text-[#4a6741]">Profile Details</p>
            {!isEditingAccount && (
              <button
                onClick={() => {
                  setIsEditingAccount(true);
                  setAccountMessage("");
                }}
                className="text-xs font-bold text-[#4a6741] hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingAccount ? (
            <form onSubmit={handleAccountSave} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">{idLabel}</label>
                <input
                  type="text"
                  value={student?.schoolId ?? ""}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={accountForm.fullName}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  disabled={savingAccount}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={savingAccount}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {isEmployee ? (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={accountForm.jobTitle}
                      onChange={(e) => setAccountForm((prev) => ({ ...prev, jobTitle: e.target.value }))}
                      disabled={savingAccount}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Department</label>
                    <input
                      type="text"
                      value={accountForm.department}
                      onChange={(e) => setAccountForm((prev) => ({ ...prev, department: e.target.value }))}
                      disabled={savingAccount}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Grade Level</label>
                    <input
                      type="text"
                      value={accountForm.gradeLevel}
                      onChange={(e) => setAccountForm((prev) => ({ ...prev, gradeLevel: e.target.value }))}
                      disabled={savingAccount}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Section</label>
                    <input
                      type="text"
                      value={accountForm.section}
                      onChange={(e) => setAccountForm((prev) => ({ ...prev, section: e.target.value }))}
                      disabled={savingAccount}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </>
              )}

              {accountMessage && (
                <p className={`text-sm font-semibold mt-2 ${accountMessage.toLowerCase().includes("success") || accountMessage.toLowerCase().includes("updated") ? "text-green-600" : "text-red-500"}`}>
                  {accountMessage}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingAccount(false);
                    setAccountMessage("");
                    setAccountForm({
                      fullName: student?.fullName ?? "",
                      email: student?.email ?? "",
                      gradeLevel: student?.gradeLevel ?? "",
                      section: student?.section ?? "",
                      jobTitle: student?.jobTitle ?? "",
                      department: student?.department ?? "",
                    });
                  }}
                  disabled={savingAccount}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAccount}
                  className="flex-1 px-4 py-2.5 bg-[#4a6741] text-white hover:bg-[#3a5333] rounded-xl font-semibold text-sm transition disabled:opacity-60"
                >
                  {savingAccount ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3 font-sans">
              {INFO_ROWS.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {row.icon}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none mb-0.5">{row.label}</p>
                    <p className="text-xs font-semibold text-gray-800">{row.value}</p>
                  </div>
                </div>
              ))}
              {accountMessage && (
                <p className={`text-sm font-semibold mt-2 ${accountMessage.toLowerCase().includes("success") || accountMessage.toLowerCase().includes("updated") ? "text-green-600" : "text-red-500"}`}>
                  {accountMessage}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Change Password Trigger Button */}
        {!isEditingAccount && (
          <div className="mx-4 mt-3">
            <button
              onClick={() => setShowChangePassword(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-white rounded-3xl shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm transition"
            >
              <IoLockClosedOutline className="text-base text-[#4a6741]" />
              Change Password
            </button>
          </div>
        )}
      </div>
    );
  }

  if (settingsTab === "preferences") {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50 overflow-y-auto pb-10 font-sans">
        {renderHeader("Preferences")}

        {/* Dark Mode toggle */}
        <div className="mx-4 mt-4 bg-white rounded-3xl shadow-sm p-5 font-sans">
          <div className="flex items-center justify-between font-sans">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#f0f7ec] text-[#4a6741] flex items-center justify-center">
                {darkMode ? <IoMoonOutline className="text-xl" /> : <IoSunnyOutline className="text-xl" />}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 leading-tight">Dark Mode</p>
                <p className="text-xs text-gray-400 mt-0.5">Toggle dark theme for night usage</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={handleDarkModeToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a6741]"></div>
            </label>
          </div>
        </div>

        {/* Notifications toggles */}
        <div className="mx-4 mt-3 bg-white rounded-3xl shadow-sm p-5 font-sans">
          <p className="text-sm font-extrabold text-[#4a6741] mb-4">Notifications</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800 leading-tight">Order Updates</p>
                <p className="text-xs text-gray-400 mt-0.5">Notify when status changes (e.g. Ready)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.orderUpdates}
                  onChange={() => handleNotifToggle("orderUpdates")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a6741]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-800 leading-tight">Eco Points</p>
                <p className="text-xs text-gray-400 mt-0.5">Alerts when new Eco Points are awarded</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.ecoPoints}
                  onChange={() => handleNotifToggle("ecoPoints")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a6741]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-800 leading-tight">Rewards Catalog</p>
                <p className="text-xs text-gray-400 mt-0.5">Notifications about new items available</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs.newRewards}
                  onChange={() => handleNotifToggle("newRewards")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a6741]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (settingsTab === "eco") {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0f170a] overflow-y-auto pb-10 font-sans">
        {renderHeader("Eco Program")}

        {/* Eco Reminder Setup */}
        <div className="mx-4 mt-4 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 font-sans border border-transparent dark:border-[#2b3924]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#f0f7ec] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] flex items-center justify-center">
                <IoLeafOutline className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">Daily BYOC Reminder</p>
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">Get reminded to pack your container</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={ecoReminder.enabled}
                onChange={(e) => handleEcoToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a6741]"></div>
            </label>
          </div>

          {ecoReminder.enabled && (
            <div className="pt-3 border-t border-gray-100 dark:border-[#2b3924] flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-300 flex items-center gap-1.5">
                <IoTimeOutline className="text-[#4a6741] dark:text-[#8ebd7e] text-base" /> Reminder Time
              </span>
              <input
                type="time"
                value={ecoReminder.time}
                onChange={(e) => handleEcoTimeChange(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-[#24301f] border border-gray-200 dark:border-[#2b3924] text-gray-800 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
              />
            </div>
          )}
        </div>

        {/* Environmental info card */}
        <div className="mx-4 mt-3 bg-[#e4efe0] dark:bg-[#1c2e17] rounded-3xl p-5 border border-[#c3dfb8] dark:border-[#2f4927] font-sans">
          <h4 className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e] mb-1.5 flex items-center gap-1.5">
            <IoLeafOutline className="text-base" /> Did you know?
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-200 leading-relaxed">
            By bringing your own container (BYOC), you save up to <strong className="text-gray-800 dark:text-white font-extrabold">1.5 lbs of plastic waste</strong> weekly and help reduce single-use container footprints on campus. Every BYOC logs <strong className="text-gray-800 dark:text-white font-extrabold">5 Eco Points</strong> which can be used to redeem canteen discounts and rewards!
          </p>
        </div>
      </div>
    );
  }

  if (settingsTab === "feedback") {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0f170a] overflow-y-auto pb-10 font-sans">
        {renderHeader("Feedback & Replies")}

        {/* Feedback Form */}
        <div className="mx-4 mt-4 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 font-sans border border-transparent dark:border-[#2b3924]">
          <p className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e] mb-3">Send Feedback</p>
          <form onSubmit={handleSupportSubmit} className="space-y-3 font-sans">
            {/* Category & Star Rating Selection */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Category</label>
                <StudentCustomDropdown
                  value={feedbackCategory}
                  onChange={setFeedbackCategory}
                  options={[
                    { value: "General", label: "General" },
                    { value: "Food Quality", label: "Food Quality" },
                    { value: "Canteen Service", label: "Canteen Service" },
                    { value: "App Issue", label: "App Issue" },
                    { value: "Suggestion", label: "Suggestion" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Rating</label>
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#24301f] border border-gray-200 dark:border-[#2b3924] rounded-xl px-3 py-1.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-0.5 hover:scale-110 transition focus:outline-none"
                    >
                      {star <= feedbackRating ? (
                        <IoStar className="text-lg text-amber-400" />
                      ) : (
                        <IoStarOutline className="text-lg text-gray-300 dark:text-gray-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <textarea
              rows={3}
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="Tell us how we can improve SmartServe or report a canteen issue..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-[#2b3924] bg-white dark:bg-[#24301f] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 dark:focus:ring-[#8ebd7e]/30 focus:border-[#4a6741] dark:focus:border-[#8ebd7e] resize-none"
            />
            <button
              type="submit"
              disabled={sendingSupport || !supportMessage.trim()}
              className="w-full py-3 bg-[#4a6741] text-white rounded-2xl font-bold text-sm transition hover:bg-[#3a5333] disabled:opacity-50"
            >
              {sendingSupport ? "Sending..." : "Submit Feedback"}
            </button>
          </form>
        </div>

        {/* My Feedback History & Admin Replies */}
        <div className="mx-4 mt-3 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 font-sans border border-transparent dark:border-[#2b3924]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">My Submitted Feedbacks</p>
            {myFeedbacks.length > 0 && (
              <span className="text-xs font-semibold bg-[#e8f5e2] dark:bg-[#2e4028] text-[#4a6741] dark:text-[#8ebd7e] px-2.5 py-0.5 rounded-full">
                {myFeedbacks.length}
              </span>
            )}
          </div>

          {loadingFeedbacks ? (
            <div className="p-2">
              <SkeletonList count={2} />
            </div>
          ) : myFeedbacks.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-400 text-center py-4">
              You haven't submitted any feedback yet. Use the form above to share your thoughts!
            </p>
          ) : (
            <div className="space-y-3">
              {myFeedbacks.map((item) => {
                const statusBadge =
                  item.status === "resolved"
                    ? "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/60"
                    : item.status === "reviewed"
                      ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60"
                      : "bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/60";

                return (
                  <div key={item._id} className="border border-gray-100 dark:border-[#2b3924] rounded-2xl p-4 bg-gray-50/50 dark:bg-[#24301f] space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700 dark:text-gray-200">{item.category}</span>
                        <div className="flex items-center text-amber-400 text-xs">
                          <IoStar />
                          <span className="font-bold text-gray-700 dark:text-gray-200 ml-1">{item.rating}.0</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${statusBadge}`}>
                          {item.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMyFeedback(item._id)}
                          disabled={deletingFeedbackId === item._id}
                          className="p-1 text-gray-400 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition disabled:opacity-50"
                          title="Delete feedback"
                        >
                          <IoTrashOutline className="text-sm" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                      "{item.message}"
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-400">{timeAgoShort(item.createdAt)} ago</p>

                    {/* Admin Response Box */}
                    {item.adminResponse ? (
                      <div className="mt-2 bg-[#f0f7ec] dark:bg-[#1a2b16] border border-[#4a6741]/20 dark:border-[#8ebd7e]/30 rounded-xl p-3.5 text-xs text-gray-800 dark:text-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-[#4a6741] dark:text-[#8ebd7e] flex items-center gap-1.5 text-[11px]">
                            <IoSendOutline className="rotate-180" /> Response from {item.respondedBy || "Admin"}
                          </span>
                          {item.respondedAt && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-400">{timeAgoShort(item.respondedAt)} ago</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-medium mt-1">
                          {item.adminResponse}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-1 text-[11px] text-gray-400 dark:text-gray-400 italic flex items-center gap-1">
                        <IoTimeOutline className="text-xs text-amber-500" /> Pending response from canteen management
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (settingsTab === "support") {
    const FAQS = [
      { q: "How do I earn Eco Points?", a: "Bring your own container (BYOC) when ordering at the canteen. Canteen staff will scan your QR code and award you 5 Eco Points!" },
      { q: "How do I redeem rewards?", a: "Go to the 'Rewards' tab, select a reward, and click 'Redeem'. You can show your redeemed coupon code to the canteen staff." },
      { q: "Can I cancel an order?", a: "Orders can be cancelled as long as they are still 'Pending'. Once the kitchen starts 'Preparing' your order, it cannot be cancelled." },
    ];

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0f170a] overflow-y-auto pb-10 font-sans">
        {renderHeader("Support & Help")}

        {/* FAQs */}
        <div className="mx-4 mt-4 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 font-sans border border-transparent dark:border-[#2b3924]">
          <p className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e] mb-3">Frequently Asked Questions</p>
          <div className="space-y-3 font-sans">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={faq.q} className="border-b border-gray-100 dark:border-[#2b3924] last:border-b-0 pb-3 last:pb-0">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left py-1"
                  >
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{faq.q}</span>
                    <IoChevronForwardOutline className={`text-sm text-[#4a6741] dark:text-[#8ebd7e] transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </button>
                  {isOpen && (
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-2 leading-relaxed bg-gray-50 dark:bg-[#24301f] p-3 rounded-xl">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* About App */}
        <div className="mx-4 mt-3 bg-white dark:bg-[#1a2416] rounded-3xl shadow-sm p-5 text-center font-sans border border-transparent dark:border-[#2b3924]">
          <img src={logo} alt="SmartServe" className="w-12 h-12 mx-auto object-contain mb-2 font-sans" />
          <p className="text-sm font-extrabold text-[#4a6741] dark:text-[#8ebd7e]">SmartServe</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-400 font-mono mt-0.5">Version 2.0.4 (Build 2026.08)</p>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-3 leading-relaxed">
            SmartServe is a smart-canteen ordering system promoting zero waste and high efficiency inside school campuses.
          </p>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2b3924] flex justify-center gap-4 text-xs font-bold text-[#4a6741] dark:text-[#8ebd7e] font-sans">
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="hover:underline font-sans text-[#4a6741] dark:text-[#8ebd7e] font-bold outline-none"
            >
              Terms of Service
            </button>
            <span className="text-gray-300 dark:text-gray-600 font-sans">•</span>
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="hover:underline font-sans text-[#4a6741] font-bold outline-none"
            >
              Privacy Policy
            </button>
          </div>
        </div>

        {/* Modal Sheets */}
        {showTerms && <TermsOfServiceSheet onClose={() => setShowTerms(false)} />}
        {showPrivacy && <PrivacyPolicySheet onClose={() => setShowPrivacy(false)} />}
      </div>
    );
  }

  return null;
}

// ── Notification type config (student) ───────────────────────────────────────
const STUDENT_NOTIF_CONFIG = {
  order_placed: { icon: <IoReceiptOutline />, color: "bg-blue-100 text-blue-600" },
  order_status: { icon: <IoReceiptOutline />, color: "bg-yellow-100 text-yellow-600" },
  byoc_awarded: { icon: <IoLeafOutline />, color: "bg-[#d7ecc8] text-[#4a6741]" },
  reward_redeemed: { icon: <IoGiftOutline />, color: "bg-purple-100 text-purple-600" },
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
  const { student, logout, refreshStudent } = useStudentAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");

  // ── Login loading screen state ─────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Connecting to SmartServe server...");

  // ── Logout screen state ────────────────────────────────────────────────────
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutProgress, setLogoutProgress] = useState(0);
  const [logoutCountdown, setLogoutCountdown] = useState(3);

  // Trigger 3-second login loading screen ONLY when just logged in
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem("smartserve_student_just_logged_in");
    if (justLoggedIn === "true") {
      setIsLoading(true);
      setLoadingProgress(0);
      const startTime = Date.now();
      const duration = 3000;
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / duration) * 100);
        setLoadingProgress(progress);
        if (progress < 35) setLoadingStatus("Connecting to SmartServe server...");
        else if (progress < 70) setLoadingStatus("Loading your profile & menu...");
        else if (progress < 100) setLoadingStatus("Almost ready...");
        if (elapsed >= duration) {
          clearInterval(timer);
          setIsLoading(false);
          sessionStorage.removeItem("smartserve_student_just_logged_in");
        }
      }, 30);
      return () => clearInterval(timer);
    } else {
      setIsLoading(false);
    }
  }, []);

  // 3-second animated logout handler
  const handleLogout = () => {
    setIsLoggingOut(true);
    setLogoutProgress(0);
    setLogoutCountdown(3);
    const startTime = Date.now();
    const duration = 3000;
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      const remainingSeconds = Math.max(1, Math.ceil((duration - elapsed) / 1000));
      setLogoutProgress(progress);
      setLogoutCountdown(remainingSeconds);
      if (elapsed >= duration) {
        clearInterval(timer);
        logout();
        navigate("/student/login", { replace: true });
      }
    }, 30);
  };
  const [showProfile, setShowProfile] = useState(false);
  const [cart, setCart] = useState([]);
  const [menuView, setMenuView] = useState("list"); // "list" | "cart" | "placed"
  const [lastOrder, setLastOrder] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const firstName = student?.fullName?.split(" ")[0] ?? "Student";
  const profileImageUrl = resolveStudentImageUrl(student?.profileImage);
  const [activeOrders, setActiveOrders] = useState([]);
  const [usualOrder, setUsualOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("smartserve_my_usual");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleReOrder = useCallback((itemsToOrder) => {
    if (!itemsToOrder || itemsToOrder.length === 0) return;
    setCart((prevCart) => {
      let updatedCart = [...prevCart];
      itemsToOrder.forEach((item) => {
        const menuItemId = item.menuItemId || item._id;
        const existing = updatedCart.find((c) => c.menuItemId === menuItemId);
        if (existing) {
          updatedCart = updatedCart.map((c) =>
            c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + item.quantity } : c
          );
        } else {
          updatedCart.push({
            menuItemId,
            name: item.name,
            category: item.category || "Meal",
            price: item.price,
            quantity: item.quantity,
          });
        }
      });
      return updatedCart;
    });

    toast.success("Added items to your cart!");
    setMenuView("cart");
    setActiveNav("menu");
    setShowProfile(false);
  }, []);

  const handleSetUsual = useCallback((order) => {
    const usualData = {
      items: order.items,
      total: order.total,
      orderNumber: order.orderNumber,
    };
    localStorage.setItem("smartserve_my_usual", JSON.stringify(usualData));
    setUsualOrder(usualData);
    toast.success("Saved order as 'My Usual'!");
  }, []);

  const handleClearUsual = useCallback(() => {
    localStorage.removeItem("smartserve_my_usual");
    setUsualOrder(null);
    toast.success("Cleared saved usual order.");
  }, []);

  useEffect(() => {
    refreshStudent();
    Promise.all([
      studentApi.get("/orders/mine").catch(() => ({ data: { orders: [] } })),
      studentApi.get("/redemptions/mine").catch(() => ({ data: { redemptions: [] } })),
      studentApi.get("/byoc/mine").catch(() => ({ data: { records: [] } })),
    ]).then(([ordersRes, redemptionsRes, byocRes]) => {
      const rawOrders = ordersRes.data.orders ?? [];
      const active = rawOrders.filter((o) => ["pending", "preparing", "ready"].includes(o.status));
      setActiveOrders(active);

      // Auto-fallback usual order if none manually set
      if (!localStorage.getItem("smartserve_my_usual")) {
        const completed = rawOrders.filter((o) => o.status === "completed");
        if (completed.length > 0) {
          setUsualOrder({
            items: completed[0].items,
            total: completed[0].total,
            orderNumber: completed[0].orderNumber,
          });
        }
      }

      const orderItems = rawOrders.map((o) => ({
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
  }, [refreshStudent]);

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
    setActiveOrders((prev) => [order, ...prev]);
  }

  function handleOrderDone() {
    setMenuView("list");
    setActiveNav("orders");
  }

  return (
    <div className="min-h-screen w-full h-screen flex flex-col bg-white dark:bg-[#0f170a] overflow-hidden relative">

      {/* ── Top Header ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-3 bg-white dark:bg-[#1a2416] border-b border-transparent dark:border-[#2b3924] relative z-20">
        <div className="flex items-center gap-2">
          <img src={logo} alt="SmartServe" className="w-8 h-8 object-contain" />
          <div>
            <p className="text-base font-extrabold text-[#4a6741] dark:text-[#8ebd7e] leading-tight">SmartServe</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{student?.fullName ?? "Student"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StudentNotificationBell />
          <button
            onClick={() => setShowProfile((v) => !v)}
            className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden transition ${showProfile ? "bg-[#4a6741]" : "bg-gray-100 dark:bg-[#2e4028]"
              }`}
          >
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Account" className="w-full h-full object-cover" />
            ) : (
              <IoPerson className={`text-lg ${showProfile ? "text-white" : "text-gray-500 dark:text-gray-200"}`} />
            )}
          </button>
        </div>
      </header>

      {/* ── Login Loading Screen Overlay ── */}
      {isLoading && !isLoggingOut && (
        <StudentLoginLoadingScreen
          progress={loadingProgress}
          statusText={loadingStatus}
          onSkip={() => {
            setIsLoading(false);
            sessionStorage.removeItem("smartserve_student_just_logged_in");
          }}
        />
      )}

      {/* ── Logout Screen Overlay ── */}
      {isLoggingOut && (
        <StudentLogoutScreen
          countdown={logoutCountdown}
          progress={logoutProgress}
          student={student}
        />
      )}

      {/* ── Tab Content ── */}
      <div
        key={showProfile ? "profile" : activeNav === "menu" ? `menu-${menuView}` : activeNav}
        className="flex-1 flex flex-col overflow-hidden animate-student-page-fade-in"
      >
        {showProfile ? (
          <ProfileView student={student} onClose={() => setShowProfile(false)} onLogout={handleLogout} />
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
          <OrdersView
            onReOrder={handleReOrder}
            onSetUsual={handleSetUsual}
            usualOrder={usualOrder}
          />
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
            <div className="mx-4 -mt-20 bg-white dark:bg-[#1a2416] rounded-3xl shadow-xl p-5 relative z-10 border border-transparent dark:border-[#2b3924]">
              {(() => {
                const byocCount = student?.byocCount ?? 0;
                const ecoInfo = getEcoLevel(byocCount);
                return (
                  <div className="bg-gradient-to-br from-[#7fb060] to-[#4a6741] rounded-2xl px-5 py-5 mb-4 text-white shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                          <IoLeafOutline className="text-white text-lg" />
                        </div>
                        <p className="text-white font-semibold text-base">Eco Points</p>
                      </div>
                      <span className="text-xs font-extrabold bg-white/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span>{ecoInfo.icon}</span> {ecoInfo.name}
                      </span>
                    </div>

                    <p className="text-5xl font-extrabold text-white leading-none mb-1">
                      {student?.points ?? 0}
                    </p>
                    <div className="mt-3 bg-black/20 rounded-xl p-2.5">
                      <div className="flex justify-between items-center text-xs mb-1 font-medium">
                        <span>Level {ecoInfo.level} Progress</span>
                        <span>{ecoInfo.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-500"
                          style={{ width: `${ecoInfo.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleNavChange("qr")}
                  className="flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3 rounded-2xl transition text-sm">
                  <MdQrCode2 className="text-base" />
                  Show QR
                </button>
                <button
                  onClick={() => handleNavChange("rewards")}
                  className="flex items-center justify-center gap-2 bg-white dark:bg-[#24301f] border-2 border-[#4a6741] dark:border-[#8ebd7e] text-[#4a6741] dark:text-[#8ebd7e] hover:bg-[#f0f7ec] dark:hover:bg-[#2e4028] font-semibold py-3 rounded-2xl transition text-sm">
                  <IoGiftOutline className="text-base" />
                  Rewards
                </button>
              </div>
            </div>

            {/* ── Active Live Order Tracker Banner ── */}
            {activeOrders.length > 0 && (
              <div className="px-4 mt-5">
                <p className="text-xs font-extrabold text-[#4a6741] dark:text-[#8ebd7e] uppercase tracking-wider mb-2">Live Order Status</p>
                <LiveOrderProgressTracker
                  order={activeOrders[0]}
                  onTrackClick={() => handleNavChange("orders")}
                />
              </div>
            )}

            {/* ── 1-Click Order My Usual Widget ── */}
            {usualOrder && (
              <div className="px-4 mt-4">
                <MyUsualCard
                  usualOrder={usualOrder}
                  onReOrder={handleReOrder}
                  onClearUsual={handleClearUsual}
                />
              </div>
            )}

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
                  <div className="p-2">
                    <SkeletonList count={3} />
                  </div>
                ) : activity.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No recent activity yet</div>
                ) : (
                  activity.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-4 py-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.type === "redeem" ? "bg-[#4a6741]" :
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
      </div>

      {/* ── Bottom Navigation ── */}
      <nav className="flex-shrink-0 flex items-center bg-white dark:bg-[#1a2416] border-t border-gray-100 dark:border-[#2b3924] px-2 py-2 relative z-10">
        {NAV.map((item) => {
          const isActive = activeNav === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleNavChange(item.key)}
              className="flex-1 flex flex-col items-center gap-1 py-1"
            >
              {isActive ? (
                <span className="w-10 h-10 rounded-full bg-[#4a6741] dark:bg-[#8ebd7e] text-white dark:text-[#1a2416] flex items-center justify-center">
                  {item.activeIcon || item.icon}
                </span>
              ) : (
                <span className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-400">
                  {item.icon}
                </span>
              )}
              <span className={`text-[10px] font-medium ${isActive ? "text-[#4a6741] dark:text-[#8ebd7e]" : "text-gray-400 dark:text-gray-400"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
