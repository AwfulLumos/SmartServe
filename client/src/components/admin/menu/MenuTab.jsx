import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  IoAddOutline,
  IoCloseOutline,
  IoAlertCircleOutline,
  IoRefreshOutline,
  IoRestaurantOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoSaveOutline,
  IoSearchOutline,
  IoCloudUploadOutline,
} from "react-icons/io5";
import api from "../../../utils/api";
import { SkeletonTable } from "../../SkeletonLoader";
import CustomFilterSelect from "./CustomFilterSelect";
import MenuModal from "./MenuModal";
import MenuInput from "./MenuInput";

const MENU_CATEGORIES = ["Morning", "Lunch", "Snacks", "Beverages", "Others"];
const emptyMenuForm = { name: "", category: "", price: "", image: "" };

export default function MenuTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyMenuForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewImageItem, setViewImageItem] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/menu");
      setItems(data);
    } catch { /* */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || !categoryFilter || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      !statusFilter ||
      (statusFilter === "active" ? item.isActive : !item.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image file size should be 3MB or less");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        setForm((p) => ({ ...p, image: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const openAdd = () => {
    setEditTarget(null); setForm(emptyMenuForm); setErrors({}); setApiError(""); setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditTarget(item);
    setForm({ name: item.name, category: item.category, price: String(item.price), image: item.image || "" });
    setErrors({}); setApiError(""); setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.category) e.category = "Required";
    if (form.price === "" || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = "Valid price required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault(); setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload = { name: form.name.trim(), category: form.category, price: Number(form.price), image: form.image };
      if (editTarget) await api.put(`/menu/${editTarget._id}`, payload);
      else await api.post("/menu", payload);
      closeModal(); fetchItems();
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to save.");
    } finally { setSubmitting(false); }
  };

  const toggle = async (item) => {
    try { await api.patch(`/menu/${item._id}/toggle`); fetchItems(); } catch { /* */ }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/menu/${deleteTarget._id}`); setDeleteTarget(null); fetchItems(); }
    catch { setDeleteTarget(null); } finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">Menu Items</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <IoAddOutline className="text-base" />
          Add Menu Item
        </button>
      </div>

      {/* Search & Filters Controls Card Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px] relative">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu item by name or category…"
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:bg-white transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              title="Clear search"
            >
              <IoCloseOutline className="text-lg" />
            </button>
          )}
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <CustomFilterSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: "all", label: "All Categories" },
                ...MENU_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
            <CustomFilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>

          <button
            onClick={fetchItems}
            className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0"
            title="Refresh"
          >
            <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2.5fr_1.2fr_0.8fr_0.7fr_80px] items-center px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span>Status</span>
          <span className="text-center">Actions</span>
        </div>
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={6} columns={5} showHeader={false} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <IoRestaurantOutline className="text-4xl text-gray-300" />
            <p className="text-sm">{search || categoryFilter !== "all" || statusFilter !== "all" ? "No matching menu items found." : "No menu items yet."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filteredItems.map((item) => (
              <li key={item._id} className="grid grid-cols-[2.5fr_1.2fr_0.8fr_0.7fr_80px] items-center px-5 py-3.5 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    onClick={() => setViewImageItem(item)}
                    className="relative group cursor-pointer flex-shrink-0"
                    title="Click to view full picture"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-xl border border-gray-100 shadow-xs transition transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 transition transform group-hover:scale-105">
                        <IoRestaurantOutline className="text-lg" />
                      </div>
                    )}
                    {item.image && (
                      <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                        <IoSearchOutline />
                      </div>
                    )}
                  </div>
                  <span
                    onClick={() => setViewImageItem(item)}
                    className="text-sm font-semibold text-gray-800 truncate cursor-pointer hover:text-[#4a6741] transition"
                  >
                    {item.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 truncate">{item.category}</span>
                <span className="text-sm font-bold text-gray-800">₱{Number(item.price).toLocaleString()}</span>
                <button onClick={() => toggle(item)} className="flex items-center justify-start w-fit hover:opacity-80 transition" title="Click to toggle status">
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${item.isActive ? "bg-[#d7ecc8] text-[#4a6741]" : "bg-gray-100 text-gray-500"}`}>
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </button>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-[#4a6741] transition p-1" title="Edit">
                    <IoCreateOutline className="text-lg" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="text-gray-400 hover:text-red-500 transition p-1" title="Delete">
                    <IoTrashOutline className="text-lg" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        {!loading && filteredItems.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-700">{filteredItems.length}</span> menu item{filteredItems.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Admin Image Lightbox Modal */}
      {viewImageItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setViewImageItem(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewImageItem(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition shadow-md"
              title="Close image view"
            >
              <IoCloseOutline className="text-xl" />
            </button>

            <div className="w-full h-72 sm:h-80 bg-gray-100 relative overflow-hidden flex items-center justify-center">
              {viewImageItem.image ? (
                <img
                  src={viewImageItem.image}
                  alt={viewImageItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                  <IoRestaurantOutline className="text-6xl text-[#4a6741]" />
                  <span className="text-xs font-semibold">No image uploaded</span>
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 truncate">{viewImageItem.name}</h3>
                <span className="text-lg font-extrabold text-[#4a6741]">₱{Number(viewImageItem.price).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-[#d7ecc8] text-[#4a6741] px-3 py-1 rounded-full">
                  {viewImageItem.category}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${viewImageItem.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {viewImageItem.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <MenuModal onClose={closeModal}>
          <div className="bg-[#4a6741] px-6 py-5 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">{editTarget ? "Edit Menu Item" : "Add New Menu Item"}</h3>
            <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg text-white transition">
              <IoCloseOutline className="text-lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{apiError}</div>
            )}

            {/* Menu Image Upload section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Item Photo <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              {form.image ? (
                <div className="relative group w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, image: "" }))}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition"
                    title="Remove photo"
                  >
                    <IoTrashOutline className="text-sm" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 hover:border-[#4a6741] rounded-xl cursor-pointer bg-gray-50 hover:bg-[#e8f5e2]/20 transition p-4 text-center">
                  <IoCloudUploadOutline className="text-3xl text-gray-400 mb-1" />
                  <span className="text-xs font-semibold text-gray-600">Click to upload menu image</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP up to 3MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>

            <MenuInput label="Item Name" required placeholder="e.g., Chicken Sandwich" value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} error={errors.name} />

            {/* Category select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-white
                  ${errors.category ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"}`}
              >
                <option value="">Select category</option>
                {MENU_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>

            <MenuInput label="Price (₱)" required type="number" min="0" step="0.01" placeholder="0" value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} error={errors.price} />

            {/* Tip banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
              <span className="font-bold">Tip:</span> This item will be immediately available for students to purchase.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 text-sm"
            >
              <IoSaveOutline className="text-base" />
              {submitting ? "Saving…" : editTarget ? "Save Changes" : "Add Menu Item"}
            </button>
          </form>
        </MenuModal>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <MenuModal onClose={() => setDeleteTarget(null)}>
          <div className="p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <IoAlertCircleOutline className="text-red-500 text-2xl" />
            </div>
            <p className="font-bold text-gray-800">Delete Menu Item?</p>
            <p className="text-sm text-gray-500">
              "<span className="font-semibold text-gray-700">{deleteTarget.name}</span>" will be permanently removed.
            </p>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl transition hover:border-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </MenuModal>
      )}
    </div>
  );
}
