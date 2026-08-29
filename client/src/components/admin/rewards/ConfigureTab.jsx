import { useState, useEffect, useCallback } from "react";
import {
  IoGiftOutline,
  IoAddOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoCheckmarkCircle,
  IoRefreshOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import api from "../../../utils/api";
import { SkeletonCardGrid } from "../../SkeletonLoader";
import PointsConfigSection from "./PointsConfigSection";
import {
  ICON_MAP,
  TYPE_LABEL,
  TYPE_BADGE,
  emptyRewardForm,
  CustomFilterSelect,
} from "./RewardsConstants";

export default function ConfigureTab() {
  const [rewards, setRewards] = useState([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyRewardForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/rewards");
      setRewards(data.rewards);
      setTotal(data.total);
      setActive(data.active);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyRewardForm);
    setFormErrors({});
    setApiError("");
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditTarget(r);
    setForm({ name: r.name, description: r.description, type: r.type, pointsCost: String(r.pointsCost), icon: r.icon });
    setFormErrors({});
    setApiError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setForm(emptyRewardForm);
    setFormErrors({});
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.type) e.type = "Required";
    if (!form.pointsCost || isNaN(Number(form.pointsCost)) || Number(form.pointsCost) < 1) e.pointsCost = "Must be ≥ 1";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
        pointsCost: Number(form.pointsCost),
        icon: form.icon,
      };
      if (editTarget) await api.put(`/rewards/${editTarget._id}`, payload);
      else await api.post("/rewards", payload);
      closeModal();
      fetchRewards();
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = async (r) => {
    try {
      await api.patch(`/rewards/${r._id}/toggle`);
      fetchRewards();
    } catch {
      /* empty */
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/rewards/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchRewards();
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const filteredRewards = rewards.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (statusFilter === "active" && !r.isActive) return false;
    if (statusFilter === "inactive" && r.isActive) return false;
    return true;
  });

  return (
    <div>
      <PointsConfigSection />

      {/* Controls Card: Filters & Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-700">{filteredRewards.length}</span> of{" "}
          <span className="font-semibold text-gray-700">{total}</span> reward{total !== 1 ? "s" : ""} •{" "}
          <span className="font-semibold text-[#4a6741]">{active}</span> active
        </p>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <CustomFilterSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "all", label: "All Types" },
              { value: "free_item", label: "Free Item" },
              { value: "discount", label: "Discount" },
              { value: "eco_badge", label: "Eco Badge" },
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
          <button
            onClick={fetchRewards}
            className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition"
            title="Refresh"
          >
            <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <IoAddOutline className="text-base" />
            Add Reward
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : filteredRewards.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-400 gap-2">
          <IoGiftOutline className="text-4xl" />
          <p className="text-sm">{typeFilter !== "all" || statusFilter !== "all" ? "No rewards match the selected filters." : "No rewards configured yet."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRewards.map((r) => (
            <div key={r._id} className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col gap-3 ${!r.isActive ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#d7ecc8] flex items-center justify-center text-[#4a6741] text-xl flex-shrink-0">
                  {ICON_MAP[r.icon] || <IoGiftOutline />}
                </div>
                <div>
                  <p className="font-bold text-gray-800 leading-snug">{r.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{r.description || "—"}</p>
                </div>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${TYPE_BADGE[r.type]}`}>
                  {TYPE_LABEL[r.type]}
                </span>
                <span className="text-xl font-bold text-[#4a6741]">{r.pointsCost} pts</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggle(r)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition ${
                    r.isActive
                      ? "border-gray-200 text-gray-600 hover:border-[#4a6741]/40 hover:text-[#4a6741]"
                      : "bg-[#d7ecc8] border-[#4a6741]/20 text-[#4a6741]"
                  }`}
                >
                  {r.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => openEdit(r)} className="p-2 text-gray-400 hover:text-[#4a6741] transition border border-gray-200 rounded-xl">
                  <IoCreateOutline className="text-base" />
                </button>
                <button onClick={() => setDeleteTarget(r)} className="p-2 text-gray-400 hover:text-red-500 transition border border-gray-200 rounded-xl">
                  <IoTrashOutline className="text-base" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeModal} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <p className="font-bold text-[#4a6741]">{editTarget ? "Edit Reward" : "Add New Reward"}</p>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition">
                <IoCloseOutline className="text-xl" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {apiError && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{apiError}</div>}
              <form id="reward-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name <span className="text-red-500">*</span></label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Free Drink"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white ${
                      formErrors.name ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
                    }`}
                  />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. Any regular-sized beverage"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type <span className="text-red-500">*</span></label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white"
                    >
                      <option value="free_item">Free Item</option>
                      <option value="discount">Discount</option>
                      <option value="eco_badge">Eco Badge</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Icon</label>
                    <select
                      value={form.icon}
                      onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white"
                    >
                      <option value="gift">Gift</option>
                      <option value="star">Star</option>
                      <option value="leaf">Leaf</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Points Cost <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={form.pointsCost}
                    onChange={(e) => setForm((p) => ({ ...p, pointsCost: e.target.value }))}
                    placeholder="e.g. 50"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white ${
                      formErrors.pointsCost ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
                    }`}
                  />
                  {formErrors.pointsCost && <p className="text-xs text-red-500 mt-1">{formErrors.pointsCost}</p>}
                </div>
              </form>
            </div>
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                type="submit"
                form="reward-form"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
              >
                <IoCheckmarkCircle className="text-base" />
                {submitting ? "Saving…" : editTarget ? "Save Changes" : "Add Reward"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="px-5 border border-gray-200 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition hover:border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <IoAlertCircleOutline className="text-red-500 text-2xl" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Delete Reward?</p>
                  <p className="text-sm text-gray-500 mt-1">
                    "<span className="font-semibold text-gray-700">{deleteTarget.name}</span>" will be permanently removed.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-xl transition hover:border-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
