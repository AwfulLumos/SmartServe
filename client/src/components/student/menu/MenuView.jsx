import { useState, useEffect } from "react";
import studentApi from "../../../utils/studentApi";
import { SkeletonCardGrid } from "../../SkeletonLoader";
import {
  IoSearchOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoCloseOutline,
  IoRestaurantOutline,
} from "react-icons/io5";

const CATEGORIES = ["All", "Morning", "Lunch", "Snacks", "Beverages", "Others"];

export default function MenuView({ cart, setCart, onOpenCart }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [detailItem, setDetailItem] = useState(null);

  useEffect(() => {
    studentApi
      .get("/menu/active")
      .then((res) => {
        const fetchedItems = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
        setItems(fetchedItems);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const safeItems = Array.isArray(items) ? items : [];

  const filtered = safeItems.filter((i) => {
    const matchCat = category === "All" || i.category === category;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartTotalCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  function getCartQty(itemId) {
    return cart.find((i) => i.menuItemId === itemId)?.quantity ?? 0;
  }

  function addItem(item) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { menuItemId: item._id, name: item.name, category: item.category, price: item.price, quantity: 1 },
      ];
    });
  }

  function removeItem(itemId) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter((i) => i.menuItemId !== itemId);
      }
      return prev.map((i) =>
        i.menuItemId === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-[#0f170a] font-sans relative">
      {/* Search & Categories Header */}
      <div className="px-4 pt-4 pb-2 bg-gray-50 dark:bg-[#0f170a] flex-shrink-0">
        <div className="relative mb-3">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search food, drinks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#1a2416] rounded-2xl pl-10 pr-4 py-3 text-sm border border-gray-200 dark:border-[#2b3924] focus:border-[#4a6741] dark:focus:border-[#8ebd7e] outline-none shadow-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${category === cat
                  ? "bg-[#4a6741] dark:bg-[#8ebd7e] text-white dark:text-[#1a2416] shadow-sm"
                  : "bg-white dark:bg-[#1a2416] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#2b3924]"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {loading ? (
          <SkeletonCardGrid count={6} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-400 text-sm">No items found</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => {
              const qty = getCartQty(item._id);
              const itemImage = item.image || item.imageUrl;
              return (
                <div
                  key={item._id}
                  onClick={() => setDetailItem(item)}
                  className="bg-white dark:bg-[#1a2416] rounded-2xl border border-gray-100 dark:border-[#2b3924] shadow-sm p-3 flex flex-col justify-between cursor-pointer hover:border-[#4a6741]/30 dark:hover:border-[#8ebd7e]/30 transition"
                >
                  <div>
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-24 object-cover rounded-xl mb-2"
                      />
                    ) : (
                      <div className="w-full h-24 bg-[#d7ecc8]/50 dark:bg-[#24301f] rounded-xl mb-2 flex items-center justify-center text-gray-400">
                        <IoRestaurantOutline className="text-3xl text-[#4a6741]/50 dark:text-[#8ebd7e]/50" />
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-[#4a6741] dark:text-[#8ebd7e] uppercase tracking-wider">
                      {item.category}
                    </span>
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-snug line-clamp-1 mt-0.5">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 dark:border-[#2b3924]">
                    <span className="font-extrabold text-[#4a6741] dark:text-[#8ebd7e] text-base">₱{item.price}</span>

                    {qty === 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(item);
                        }}
                        className="w-8 h-8 rounded-xl bg-[#4a6741] dark:bg-[#8ebd7e] text-white dark:text-[#1a2416] flex items-center justify-center hover:bg-[#3a5333] dark:hover:bg-[#a3d194] transition"
                      >
                        <IoAddOutline className="text-lg" />
                      </button>
                    ) : (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 bg-[#f0f7ec] dark:bg-[#24301f] rounded-xl px-1.5 py-1"
                      >
                        <button
                          onClick={() => removeItem(item._id)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-[#1a2416] text-[#4a6741] dark:text-[#8ebd7e] flex items-center justify-center shadow-xs text-xs"
                        >
                          <IoRemoveOutline />
                        </button>
                        <span className="text-xs font-bold text-[#4a6741] dark:text-[#8ebd7e] min-w-[12px] text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => addItem(item)}
                          className="w-6 h-6 rounded-lg bg-[#4a6741] dark:bg-[#8ebd7e] text-white dark:text-[#1a2416] flex items-center justify-center shadow-xs text-xs"
                        >
                          <IoAddOutline />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating View Cart Bar */}
      {cartTotalCount > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <button
            onClick={onOpenCart}
            className="w-full bg-[#4a6741] dark:bg-[#8ebd7e] hover:bg-[#3a5333] text-white dark:text-[#1a2416] font-extrabold py-3.5 px-5 rounded-2xl flex items-center justify-between shadow-xl transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center text-xs">
                {cartTotalCount}
              </div>
              <span className="text-sm">View Cart</span>
            </div>
            <span className="text-base font-mono">
              ₱{cart.reduce((acc, i) => acc + i.price * i.quantity, 0)}
            </span>
          </button>
        </div>
      )}

      {/* Item Detail Modal Sheet */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a2416] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-[#2b3924]">
            <div className="relative">
              {(detailItem.image || detailItem.imageUrl) ? (
                <img
                  src={detailItem.image || detailItem.imageUrl}
                  alt={detailItem.name}
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="w-full h-56 bg-[#d7ecc8]/50 dark:bg-[#24301f] flex items-center justify-center">
                  <IoRestaurantOutline className="text-6xl text-[#4a6741]/40 dark:text-[#8ebd7e]/40" />
                </div>
              )}
              <button
                onClick={() => setDetailItem(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition"
              >
                <IoCloseOutline className="text-2xl" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold text-[#4a6741] dark:text-[#8ebd7e] uppercase tracking-wider bg-[#f0f7ec] dark:bg-[#24301f] px-2.5 py-1 rounded-full">
                  {detailItem.category}
                </span>
                <span className="text-2xl font-black text-[#4a6741] dark:text-[#8ebd7e]">
                  ₱{Number(detailItem.price).toFixed(2)}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">{detailItem.name}</h3>

              {detailItem.description ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{detailItem.description}</p>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-2 italic">Freshly prepared in our canteen kitchen.</p>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#2b3924] flex items-center justify-between gap-3">
                {getCartQty(detailItem._id) > 0 && (
                  <span className="text-xs font-bold bg-[#f0f7ec] dark:bg-[#24301f] text-[#4a6741] dark:text-[#8ebd7e] px-3 py-1.5 rounded-xl">
                    {getCartQty(detailItem._id)} in cart
                  </span>
                )}

                <button
                  onClick={() => {
                    addItem(detailItem);
                    setDetailItem(null);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-[#4a6741] dark:bg-[#8ebd7e] hover:bg-[#3a5333] dark:hover:bg-[#a3d194] text-white dark:text-[#1a2416] font-extrabold text-sm shadow-lg shadow-[#4a6741]/20 transition flex items-center justify-center gap-2"
                >
                  <IoAddOutline className="text-lg" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
