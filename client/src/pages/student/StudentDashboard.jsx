import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentAuth } from "../../context/StudentAuthContext";
import studentApi from "../../utils/studentApi";
import logo from "../../assets/logo/logo.png";
import toast from "react-hot-toast";

import {
  IoHomeOutline,
  IoHome,
  IoRestaurantOutline,
  IoRestaurant,
  IoReceiptOutline,
  IoReceipt,
  IoGiftOutline,
  IoGift,
  IoPerson,
  IoCartOutline,
} from "react-icons/io5";
import { MdQrCode2 } from "react-icons/md";

// Child Views & Helper Components organized into feature directories
import MyQRView from "../../components/student/qr/MyQRView";
import MenuView from "../../components/student/menu/MenuView";
import CartView from "../../components/student/menu/CartView";
import OrdersView from "../../components/student/orders/OrdersView";
import RewardsView from "../../components/student/rewards/RewardsView";
import ProfileView from "../../components/student/profile/ProfileView";
import OrderPlacedView from "../../components/student/menu/OrderPlacedView";
import StudentHomeTab from "../../components/student/home/StudentHomeTab";
import StudentNotificationBell from "../../components/student/home/StudentNotificationBell";
import { StudentLoginLoadingScreen, StudentLogoutScreen } from "../../components/student/home/StudentSessionScreens";

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

const NAV = [
  { key: "home", label: "Home", icon: <IoHomeOutline className="text-xl" />, activeIcon: <IoHome className="text-xl text-white" /> },
  { key: "menu", label: "Menu", icon: <IoRestaurantOutline className="text-xl" />, activeIcon: <IoRestaurant className="text-xl text-white" /> },
  { key: "orders", label: "Orders", icon: <IoReceiptOutline className="text-xl" />, activeIcon: <IoReceipt className="text-xl text-white" /> },
  { key: "qr", label: "My QR", icon: <MdQrCode2 className="text-xl" />, activeIcon: <MdQrCode2 className="text-xl text-white" /> },
  { key: "rewards", label: "Rewards", icon: <IoGiftOutline className="text-xl" />, activeIcon: <IoGift className="text-xl text-white" /> },
];

export default function StudentDashboard() {
  const { student, logout, refreshStudent } = useStudentAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");

  // Login loading screen state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Connecting to SmartServe server...");

  // Logout screen state
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutProgress, setLogoutProgress] = useState(0);
  const [logoutCountdown, setLogoutCountdown] = useState(3);

  // Restore theme on mount
  useEffect(() => {
    const isDark =
      localStorage.getItem("smartserve_dark_mode") === "true" ||
      localStorage.getItem("smartserve_theme") === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

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
  const [activeOrders, setActiveOrders] = useState([]);

  const firstName = student?.fullName?.split(" ")[0] ?? "Student";
  const profileImageUrl = resolveStudentImageUrl(student?.profileImage);

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
      const rawOrders = Array.isArray(ordersRes.data?.orders)
        ? ordersRes.data.orders
        : Array.isArray(ordersRes.data)
          ? ordersRes.data
          : [];
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
    <div className="min-h-screen w-full h-screen flex flex-col bg-white dark:bg-[#0f170a] overflow-hidden relative font-sans">
      {/* ── Top Header ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-3 bg-white dark:bg-[#1a2416] border-b border-transparent dark:border-[#2b3924] relative z-20">
        <div className="flex items-center gap-2">
          <img src={logo} alt="SmartServe" className="w-8 h-8 object-contain" />
          <div>
            <p className="text-base font-extrabold text-[#4a6741] dark:text-[#8ebd7e] leading-tight">SmartServe</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{student?.fullName ?? "Student"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Top Header Cart Button */}
          <button
            onClick={() => {
              setActiveNav("menu");
              setMenuView("cart");
              setShowProfile(false);
            }}
            className="relative p-2 rounded-xl bg-gray-50 dark:bg-[#24301f] text-[#4a6741] dark:text-[#8ebd7e] hover:bg-[#f0f7ec] dark:hover:bg-[#2e4028] border border-gray-100 dark:border-[#2b3924] transition flex items-center justify-center"
            title="View Cart"
          >
            <IoCartOutline className="text-xl" />
            {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#4a6741] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs border-2 border-white dark:border-[#1a2416]">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
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
          profileImageUrl={profileImageUrl}
        />
      )}

      {/* ── Tab Content ── */}
      <div
        key={showProfile ? "profile" : activeNav === "menu" ? `menu-${menuView}` : activeNav}
        className="flex-1 flex flex-col min-h-0 overflow-hidden animate-student-page-fade-in"
      >
        {showProfile ? (
          <ProfileView student={student} onClose={() => setShowProfile(false)} onLogout={handleLogout} />
        ) : activeNav === "qr" ? (
          <MyQRView student={student} profileImageUrl={profileImageUrl} />
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
            <MenuView cart={cart} setCart={setCart} onOpenCart={() => setMenuView("cart")} />
          )
        ) : activeNav === "orders" ? (
          <OrdersView onReOrder={handleReOrder} onSetUsual={handleSetUsual} usualOrder={usualOrder} />
        ) : activeNav === "rewards" ? (
          <RewardsView student={student} refreshStudent={refreshStudent} />
        ) : (
          <StudentHomeTab
            student={student}
            firstName={firstName}
            handleNavChange={handleNavChange}
            activeOrders={activeOrders}
            usualOrder={usualOrder}
            handleReOrder={handleReOrder}
            handleClearUsual={handleClearUsual}
            activity={activity}
            activityLoading={activityLoading}
          />
        )}
      </div>

      {/* ── Floating Bottom Navigation Dock ── */}
      <div className="flex-shrink-0 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 relative z-30 font-sans pointer-events-none">
        <nav className="pointer-events-auto max-w-md mx-auto flex items-center bg-white/95 dark:bg-[#1a2416]/95 backdrop-blur-xl border border-gray-200/80 dark:border-[#2b3924] rounded-3xl shadow-xl px-2 py-1.5 justify-around">
          {NAV.map((item) => {
            const isActive = activeNav === item.key;
            const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <button
                key={item.key}
                onClick={() => handleNavChange(item.key)}
                className="flex-1 flex flex-col items-center gap-1 py-1 relative group active:scale-90 transition-transform cursor-pointer"
              >
                <div className="relative">
                  {isActive ? (
                    <span className="w-10 h-10 rounded-2xl bg-[#4a6741] dark:bg-[#8ebd7e] text-white dark:text-[#1a2416] flex items-center justify-center shadow-md shadow-[#4a6741]/25 transition-all">
                      {item.activeIcon || item.icon}
                    </span>
                  ) : (
                    <span className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
                      {item.icon}
                    </span>
                  )}

                  {/* Cart badge on Menu tab */}
                  {item.key === "menu" && totalCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse border-2 border-white dark:border-[#1a2416]">
                      {totalCartCount > 9 ? "9+" : totalCartCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold transition-colors ${isActive ? "text-[#4a6741] dark:text-[#8ebd7e]" : "text-gray-400 dark:text-gray-400"
                    }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
