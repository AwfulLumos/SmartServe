import { useState, useEffect, useCallback, useRef } from "react";
import {
  IoGiftOutline,
  IoStarOutline,
  IoLeafOutline,
  IoAddOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoCheckmarkCircle,
  IoCameraOutline,
  IoCalendarOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoAlertCircleOutline,
  IoSettingsOutline,
  IoSaveOutline,
  IoCheckmarkOutline,
  IoArrowForwardOutline,
} from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";

// ─── Shared helpers ───────────────────────────────────────────────────────────
const ICON_MAP = {
  gift: <IoGiftOutline />,
  star: <IoStarOutline />,
  leaf: <IoLeafOutline />,
};

const TYPE_LABEL = {
  free_item: "Free Item",
  discount: "Discount",
  eco_badge: "Eco Badge",
};

const TYPE_BADGE = {
  free_item: "bg-[#d7ecc8] text-[#4a6741]",
  discount: "bg-yellow-100 text-yellow-700",
  eco_badge: "bg-teal-100 text-teal-700",
};

const fmt = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const TABS = [
  { key: "redeem", label: "Redeem Rewards", icon: <IoGiftOutline /> },
  { key: "configure", label: "Configure Rewards", icon: <IoStarOutline /> },
  { key: "history", label: "Redemption History", icon: <IoCalendarOutline /> },
  { key: "byoc", label: "BYOC Records", icon: <IoLeafOutline /> },
];

// ─── Points Config Section ────────────────────────────────────────────────────
const CONFIG_FIELDS = [
  {
    key: "pointsPerPeso",
    label: "Points Per Peso Spent",
    hint: (v) => `Current: ${v} points per ₱1`,
    step: "0.01",
    min: "0",
  },
  {
    key: "ecoPointsPerByoc",
    label: "Eco Points Per BYOC",
    hint: () => "Eco points awarded when students bring their own containers",
    step: "1",
    min: "0",
  },
  {
    key: "minRedemptionPoints",
    label: "Minimum Redemption Points",
    hint: (v) => `Students need at least ${v} points to redeem a reward`,
    step: "1",
    min: "0",
  },
];

function PointsConfigSection() {
  const [form, setForm] = useState({ pointsPerPeso: "0.1", ecoPointsPerByoc: "5", minRedemptionPoints: "30" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/points-config")
      .then((res) => {
        const d = res.data;
        setForm({
          pointsPerPeso: String(d.pointsPerPeso),
          ecoPointsPerByoc: String(d.ecoPointsPerByoc),
          minRedemptionPoints: String(d.minRedemptionPoints),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      const payload = {
        pointsPerPeso: Number(form.pointsPerPeso),
        ecoPointsPerByoc: Number(form.ecoPointsPerByoc),
        minRedemptionPoints: Number(form.minRedemptionPoints),
      };
      const res = await api.put("/points-config", payload);
      const d = res.data;
      setForm({
        pointsPerPeso: String(d.pointsPerPeso),
        ecoPointsPerByoc: String(d.ecoPointsPerByoc),
        minRedemptionPoints: String(d.minRedemptionPoints),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-extrabold text-[#4a6741]">Points Configuration</h3>
          <p className="text-sm text-gray-400 mt-0.5">Control how students & employees earn points across the platform</p>
        </div>
        <IoSettingsOutline className="text-2xl text-gray-300" />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
          <IoRefreshOutline className="animate-spin" /> Loading configuration…
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CONFIG_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
              <input
                type="number"
                step={f.step}
                min={f.min}
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white"
              />
              <p className="text-xs text-gray-400 mt-1.5">{f.hint(form[f.key])}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <IoAlertCircleOutline className="text-base flex-shrink-0" />
          {error}
        </div>
      )}

      {!loading && (
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400">Changes apply to all new orders and BYOC logs immediately.</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-sm disabled:opacity-60
              ${saved
                ? "bg-[#d7ecc8] text-[#4a6741] border border-[#b5d99c]"
                : "bg-[#4a6741] hover:bg-[#3a5333] text-white"
              }`}
          >
            {saved ? <IoCheckmarkOutline className="text-base" /> : <IoSaveOutline className="text-base" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Configuration"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Configure ───────────────────────────────────────────────────────────
const emptyRewardForm = { name: "", description: "", type: "free_item", pointsCost: "", icon: "gift" };

function ConfigureTab() {
  const [rewards, setRewards] = useState([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
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
    } catch { /* empty */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRewards(); }, [fetchRewards]);

  const openAdd = () => {
    setEditTarget(null); setForm(emptyRewardForm); setFormErrors({}); setApiError(""); setModalOpen(true);
  };
  const openEdit = (r) => {
    setEditTarget(r);
    setForm({ name: r.name, description: r.description, type: r.type, pointsCost: String(r.pointsCost), icon: r.icon });
    setFormErrors({}); setApiError(""); setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); setForm(emptyRewardForm); setFormErrors({}); setApiError(""); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.type) e.type = "Required";
    if (!form.pointsCost || isNaN(Number(form.pointsCost)) || Number(form.pointsCost) < 1) e.pointsCost = "Must be ≥ 1";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault(); setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload = { name: form.name.trim(), description: form.description.trim(), type: form.type, pointsCost: Number(form.pointsCost), icon: form.icon };
      if (editTarget) await api.put(`/rewards/${editTarget._id}`, payload);
      else await api.post("/rewards", payload);
      closeModal(); fetchRewards();
    } catch (err) { setApiError(err.response?.data?.message || "Failed to save."); }
    finally { setSubmitting(false); }
  };

  const toggle = async (r) => {
    try { await api.patch(`/rewards/${r._id}/toggle`); fetchRewards(); } catch { /* */ }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/rewards/${deleteTarget._id}`); setDeleteTarget(null); fetchRewards(); }
    catch { setDeleteTarget(null); } finally { setDeleting(false); }
  };

  return (
    <div>
      {/* Points Configuration */}
      <PointsConfigSection />

      {/* Sub-header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">{total}</span> reward{total !== 1 ? "s" : ""} •{" "}
          <span className="font-semibold text-[#4a6741]">{active}</span> active
        </p>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
        >
          <IoAddOutline className="text-base" />
          Add New Reward
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400 text-sm gap-2"><IoRefreshOutline className="animate-spin text-lg" /> Loading…</div>
      ) : rewards.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-400 gap-2">
          <IoGiftOutline className="text-4xl" />
          <p className="text-sm">No rewards configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((r) => (
            <div key={r._id} className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col gap-3 ${!r.isActive ? "opacity-60" : ""}`}>
              {/* Icon + Name */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#d7ecc8] flex items-center justify-center text-[#4a6741] text-xl flex-shrink-0">
                  {ICON_MAP[r.icon] || <IoGiftOutline />}
                </div>
                <div>
                  <p className="font-bold text-gray-800 leading-snug">{r.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{r.description || "—"}</p>
                </div>
              </div>
              {/* Divider */}
              <div className="border-t border-gray-100" />
              {/* Badge + points */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${TYPE_BADGE[r.type]}`}>
                  {TYPE_LABEL[r.type]}
                </span>
                <span className="text-xl font-bold text-[#4a6741]">{r.pointsCost} pts</span>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggle(r)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition
                    ${r.isActive
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
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Free Drink"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white ${formErrors.name ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"}`} />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                  <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. Any regular-sized beverage"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white" />
                </div>
                {/* Type + Icon */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type <span className="text-red-500">*</span></label>
                    <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white">
                      <option value="free_item">Free Item</option>
                      <option value="discount">Discount</option>
                      <option value="eco_badge">Eco Badge</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Icon</label>
                    <select value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741]/20 focus:border-[#4a6741] transition bg-white">
                      <option value="gift">Gift</option>
                      <option value="star">Star</option>
                      <option value="leaf">Leaf</option>
                    </select>
                  </div>
                </div>
                {/* Points */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Points Cost <span className="text-red-500">*</span></label>
                  <input type="number" min="1" value={form.pointsCost} onChange={(e) => setForm((p) => ({ ...p, pointsCost: e.target.value }))}
                    placeholder="e.g. 50"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white ${formErrors.pointsCost ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"}`} />
                  {formErrors.pointsCost && <p className="text-xs text-red-500 mt-1">{formErrors.pointsCost}</p>}
                </div>
              </form>
            </div>
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
              <button type="submit" form="reward-form" disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
                <IoCheckmarkCircle className="text-base" />
                {submitting ? "Saving…" : editTarget ? "Save Changes" : "Add Reward"}
              </button>
              <button type="button" onClick={closeModal} className="px-5 border border-gray-200 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition hover:border-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm */}
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
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab: Redeem Rewards ──────────────────────────────────────────────────────
function RedeemTab() {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [student, setStudent] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  useEffect(() => {
    api.get("/rewards", { params: { activeOnly: "true" } })
      .then(({ data }) => setRewards(data.rewards))
      .catch(() => {});
    return () => stopScanner();
  }, []);

  const stopScanner = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  const startScanner = async () => {
    setScanError("");
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          stopScanner();
          await lookupStudent(decodedText.trim());
        },
        () => {}
      );
    } catch (err) {
      setScanning(false);
      setScanError("Camera access denied or not available. Please allow camera permissions.");
    }
  };

  const lookupStudent = async (token) => {
    setLoadingStudent(true); setScanError("");
    try {
      const { data } = await api.get(`/students/by-qr/${encodeURIComponent(token)}`);
      setStudent(data);
      setSelectedReward(null);
      setRedeemError("");
      setSuccess(null);
    } catch (err) {
      setScanError(err.response?.data?.message || "QR code not recognised.");
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleRedeem = async () => {
    if (!student || !selectedReward) return;
    setRedeeming(true); setRedeemError("");
    try {
      const { data } = await api.post("/redemptions", { studentId: student._id, rewardId: selectedReward._id });
      setSuccess({ reward: selectedReward.name, pointsLeft: data.studentPoints });
      setStudent((s) => ({ ...s, points: data.studentPoints }));
      setSelectedReward(null);
    } catch (err) {
      setRedeemError(err.response?.data?.message || "Redemption failed.");
    } finally {
      setRedeeming(false);
    }
  };

  const reset = () => { setStudent(null); setSelectedReward(null); setRedeemError(""); setSuccess(null); setScanError(""); };

  return (
    <div className="max-w-2xl">
      {!student ? (
        /* Step 1 — Scan */
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="font-bold text-[#4a6741] text-base mb-4">Step 1: Scan Student or Employee QR Code</p>

          {/* Scanner area */}
          <div
            id="qr-reader-wrapper"
            onClick={!scanning ? startScanner : undefined}
            className={`border-2 border-dashed rounded-2xl overflow-hidden transition
              ${scanning ? "border-[#4a6741]" : "border-gray-200 cursor-pointer hover:border-[#4a6741]/60"}`}
          >
            <div id="qr-reader" ref={scannerRef} className={scanning ? "block" : "hidden"} />
            {!scanning && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                {loadingStudent ? (
                  <IoRefreshOutline className="text-5xl animate-spin text-[#4a6741]" />
                ) : (
                  <>
                    <IoCameraOutline className="text-5xl text-gray-300" />
                    <p className="font-semibold text-gray-600">Click to Scan QR Code</p>
                    <p className="text-sm">Position Student or Employee QR code in front of camera</p>
                  </>
                )}
              </div>
            )}
          </div>

          {scanning && (
            <button onClick={stopScanner} className="mt-3 text-xs text-gray-500 hover:text-[#4a6741] underline">
              Cancel scanning
            </button>
          )}

          {scanError && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {scanError}
            </div>
          )}
        </div>
      ) : (
        /* Step 2 — Student found, pick reward */
        <div className="space-y-4">
          {/* Student card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#d7ecc8] flex items-center justify-center text-[#4a6741] font-bold text-lg">
              {student.fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{student.fullName}</p>
              <p className="text-xs text-gray-400 font-mono">{student.schoolId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Points</p>
              <p className="text-2xl font-bold text-[#4a6741]">{student.points}</p>
            </div>
            <button onClick={reset} className="ml-2 text-gray-400 hover:text-gray-600 transition">
              <IoCloseOutline className="text-xl" />
            </button>
          </div>

          {/* Success banner */}
          {success && (
            <div className="bg-[#d7ecc8] border border-[#4a6741]/20 rounded-2xl px-5 py-4 flex items-center gap-3">
              <IoCheckmarkCircle className="text-[#4a6741] text-2xl flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#4a6741]">Redeemed: {success.reward}</p>
                <p className="text-xs text-[#4a6741]/70">Points remaining: {success.pointsLeft}</p>
              </div>
            </div>
          )}

          {/* Step 2: Pick reward */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="font-bold text-[#4a6741] mb-3">Step 2: Select a Reward</p>
            {rewards.length === 0 ? (
              <p className="text-sm text-gray-400">No active rewards available.</p>
            ) : (
              <div className="space-y-2">
                {rewards.map((r) => {
                  const canAfford = student.points >= r.pointsCost;
                  const isSelected = selectedReward?._id === r._id;
                  return (
                    <button
                      key={r._id}
                      disabled={!canAfford}
                      onClick={() => setSelectedReward(isSelected ? null : r)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition
                        ${isSelected ? "border-[#4a6741] bg-[#d7ecc8]" : canAfford ? "border-gray-200 hover:border-[#4a6741]/40 hover:bg-gray-50" : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#d7ecc8] flex items-center justify-center text-[#4a6741] flex-shrink-0">
                        {ICON_MAP[r.icon]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.description}</p>
                      </div>
                      <span className={`text-sm font-bold ${canAfford ? "text-[#4a6741]" : "text-gray-400"}`}>
                        {r.pointsCost} pts
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {redeemError && (
              <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{redeemError}</div>
            )}

            {selectedReward && (
              <button
                onClick={handleRedeem}
                disabled={redeeming}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              >
                <IoCheckmarkCircle />
                {redeeming ? "Processing…" : `Confirm — Redeem "${selectedReward.name}"`}
              </button>
            )}
          </div>

          <button onClick={reset} className="text-sm text-gray-400 hover:text-[#4a6741] underline">
            ← Scan different student
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Redemption History ──────────────────────────────────────────────────
function HistoryTab() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/redemptions", { params: { search } });
      setRecords(data.redemptions);
    } catch { /* */ } finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchHistory, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchHistory]);

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-4 focus-within:border-[#4a6741] transition">
        <IoSearchOutline className="text-gray-400 flex-shrink-0" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name or ID..."
          className="text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none w-full"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_0.8fr_1fr] items-center px-5 py-3 bg-[#e8f5e2] text-sm font-semibold text-[#4a6741]">
          <span>Student & Employee</span>
          <span>School ID</span>
          <span>Reward</span>
          <span>Points Used</span>
          <span>Timestamp</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-12 text-gray-400 text-sm gap-2"><IoRefreshOutline className="animate-spin text-lg" /> Loading…</div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400 gap-2">
            <IoCalendarOutline className="text-4xl" />
            <p className="text-sm">{search ? "No records match." : "No redemption history yet."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {records.map((r) => (
              <li key={r._id} className="grid grid-cols-[1.5fr_1.2fr_1.2fr_0.8fr_1fr] items-center px-5 py-3.5 hover:bg-gray-50 transition">
                <span className="text-sm font-medium text-gray-800">{r.studentName}</span>
                <span className="text-sm text-gray-500 font-mono">{r.schoolId}</span>
                <span className="flex items-center gap-1.5 text-sm text-gray-700">
                  <IoGiftOutline className="text-[#4a6741]" />
                  {r.rewardName}
                </span>
                <span className="text-sm font-bold text-red-500">-{r.pointsUsed} pts</span>
                <span className="text-sm text-gray-500">{fmt(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Tab: BYOC Records ────────────────────────────────────────────────────────
function ByocTab() {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  // Scanner state
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [loadingStudent, setLoadingStudent] = useState(false);

  // Confirm modal state
  const [confirmStudent, setConfirmStudent] = useState(null); // student found by QR
  const [ecoPoints, setEcoPoints] = useState(5);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  // Post-confirm state
  const [awardedStudent, setAwardedStudent] = useState(null); // student after points added
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState(null);

  // Records list
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ ecoPointsToday: 0, containersSavedMonth: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchByoc = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/byoc", { params: { search } });
      setRecords(data.records);
      setStats(data.stats);
    } catch { /* */ } finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchByoc, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchByoc]);

  // Load eco points config + active rewards once
  useEffect(() => {
    api.get("/points-config").then(({ data }) => setEcoPoints(data.ecoPointsPerByoc ?? 5)).catch(() => {});
    api.get("/rewards", { params: { activeOnly: "true" } }).then(({ data }) => setRewards(data.rewards)).catch(() => {});
    return () => stopScanner();
  }, []);

  const stopScanner = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  const startScanner = async () => {
    setScanError("");
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-byoc-reader");
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          stopScanner();
          setLoadingStudent(true); setScanError("");
          try {
            const { data } = await api.get(`/students/by-qr/${encodeURIComponent(decodedText.trim())}`);
            setConfirmStudent(data);
          } catch (err) {
            setScanError(err.response?.data?.message || "QR code not recognised.");
          } finally {
            setLoadingStudent(false);
          }
        },
        () => {}
      );
    } catch {
      setScanning(false);
      setScanError("Camera access denied or not available.");
    }
  };

  const handleConfirm = async () => {
    if (!confirmStudent) return;
    setConfirming(true); setConfirmError("");
    try {
      const { data } = await api.post("/byoc", { studentId: confirmStudent._id });
      setAwardedStudent({ ...confirmStudent, points: data.studentPoints });
      setConfirmStudent(null);
      fetchByoc();
    } catch (err) {
      setConfirmError(err.response?.data?.message || "Failed to log BYOC.");
    } finally {
      setConfirming(false);
    }
  };

  const handleRedeem = async () => {
    if (!awardedStudent || !selectedReward) return;
    setRedeeming(true); setRedeemError("");
    try {
      const { data } = await api.post("/redemptions", { studentId: awardedStudent._id, rewardId: selectedReward._id });
      setRedeemSuccess({ reward: selectedReward.name, pointsLeft: data.studentPoints });
      setAwardedStudent((s) => ({ ...s, points: data.studentPoints }));
      setSelectedReward(null);
    } catch (err) {
      setRedeemError(err.response?.data?.message || "Redemption failed.");
    } finally {
      setRedeeming(false);
    }
  };

  const resetFlow = () => {
    setConfirmStudent(null); setConfirmError("");
    setAwardedStudent(null); setSelectedReward(null);
    setRedeemError(""); setRedeemSuccess(null); setScanError("");
  };

  const roleBadge = (role) =>
    role === "admin" ? "bg-[#d7ecc8] text-[#4a6741]" : "bg-gray-100 text-gray-600";

  return (
    <div>
      {/* ── Scan Section ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
        <p className="font-extrabold text-[#4a6741] text-base mb-4">Log BYOC — Scan Student & Employee QR</p>

        {!awardedStudent ? (
          <div
            id="qr-byoc-wrapper"
            onClick={!scanning && !confirmStudent && !loadingStudent ? startScanner : undefined}
            className={`border-2 border-dashed rounded-2xl overflow-hidden transition mb-3
              ${scanning || confirmStudent ? "border-[#4a6741]" : "border-gray-200 cursor-pointer hover:border-[#4a6741]/60"}`}
          >
            <div id="qr-byoc-reader" ref={scannerRef} className={scanning ? "block" : "hidden"} />
            {!scanning && !loadingStudent && !confirmStudent && (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
                <IoCameraOutline className="text-5xl text-gray-300" />
                <p className="font-semibold text-gray-600">Click to Scan Student & Employee QR</p>
                <p className="text-sm">Awards +{ecoPoints} eco points to the student & employee</p>
              </div>
            )}
            {loadingStudent && (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <IoRefreshOutline className="text-4xl text-[#4a6741] animate-spin" />
                <p className="text-sm text-gray-500">Looking up student…</p>
              </div>
            )}
          </div>
        ) : (
          /* Post-award success */
          <div className="bg-[#d7ecc8] border border-[#b5d99c] rounded-2xl px-5 py-4 flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-[#4a6741] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {awardedStudent.fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[#4a6741]">{awardedStudent.fullName}</p>
              <p className="text-xs text-[#4a6741]/70 font-mono">{awardedStudent.schoolId}</p>
              <p className="text-sm font-semibold text-[#4a6741] mt-0.5">+{ecoPoints} eco points credited ✓</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#4a6741]/60">Balance</p>
              <p className="text-2xl font-extrabold text-[#4a6741]">{awardedStudent.points}</p>
            </div>
          </div>
        )}

        {scanning && (
          <button onClick={stopScanner} className="text-xs text-gray-400 hover:text-[#4a6741] underline">
            Cancel scanning
          </button>
        )}
        {scanError && (
          <div className="mt-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{scanError}</div>
        )}

        {/* Optional rewards after award */}
        {awardedStudent && (
          <div className="mt-4">
            <p className="text-sm font-bold text-[#4a6741] mb-2">Redeem a Reward? <span className="text-gray-400 font-normal">(optional)</span></p>
            {redeemSuccess && (
              <div className="mb-3 bg-[#d7ecc8] border border-[#4a6741]/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <IoCheckmarkCircle className="text-[#4a6741] text-lg flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#4a6741]">Redeemed: {redeemSuccess.reward}</p>
                  <p className="text-xs text-[#4a6741]/70">Points remaining: {redeemSuccess.pointsLeft}</p>
                </div>
              </div>
            )}
            {rewards.length === 0 ? (
              <p className="text-sm text-gray-400">No active rewards available.</p>
            ) : (
              <div className="space-y-2">
                {rewards.map((r) => {
                  const canAfford = awardedStudent.points >= r.pointsCost;
                  const isSelected = selectedReward?._id === r._id;
                  return (
                    <button
                      key={r._id}
                      disabled={!canAfford}
                      onClick={() => setSelectedReward(isSelected ? null : r)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition
                        ${isSelected ? "border-[#4a6741] bg-[#d7ecc8]" : canAfford ? "border-gray-200 hover:border-[#4a6741]/40 hover:bg-gray-50" : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#d7ecc8] flex items-center justify-center text-[#4a6741] flex-shrink-0">
                        {ICON_MAP[r.icon]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.description}</p>
                      </div>
                      <span className={`text-sm font-bold ${canAfford ? "text-[#4a6741]" : "text-gray-400"}`}>{r.pointsCost} pts</span>
                    </button>
                  );
                })}
              </div>
            )}
            {redeemError && (
              <div className="mt-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{redeemError}</div>
            )}
            {selectedReward && (
              <button
                onClick={handleRedeem}
                disabled={redeeming}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              >
                <IoCheckmarkCircle />
                {redeeming ? "Processing…" : `Confirm — Redeem "${selectedReward.name}"`}
              </button>
            )}
            <button onClick={resetFlow} className="mt-3 text-sm text-gray-400 hover:text-[#4a6741] underline">
              Skip / Scan next student
            </button>
          </div>
        )}
      </div>

      {/* ── Confirm Modal ── */}
      {confirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#4a6741] px-6 py-4">
              <p className="text-white font-extrabold text-base">Confirm BYOC Points</p>
              <p className="text-white/70 text-xs mt-0.5">Award eco points for bringing own container</p>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-4 bg-[#f0f7ec] rounded-2xl px-4 py-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-[#4a6741] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {confirmStudent.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-gray-800">{confirmStudent.fullName}</p>
                  <p className="text-xs text-gray-400 font-mono">{confirmStudent.schoolId}</p>
                </div>
              </div>
              <div className="bg-[#d7ecc8] rounded-xl px-5 py-4 text-center mb-5">
                <p className="text-sm text-[#4a6741]/70 mb-1">Points to award</p>
                <p className="text-4xl font-extrabold text-[#4a6741]">+{ecoPoints}</p>
                <p className="text-xs text-[#4a6741]/60 mt-1">Eco Points</p>
              </div>
              {confirmError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{confirmError}</div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setConfirmStudent(null); setConfirmError(""); }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4a6741] hover:bg-[#3a5333] text-white font-bold text-sm transition disabled:opacity-60"
                >
                  {confirming ? (
                    <IoRefreshOutline className="animate-spin" />
                  ) : (
                    <>
                      <IoCheckmarkCircle />
                      Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#4a6741] rounded-2xl px-6 py-5">
          <p className="text-sm text-white/80 mb-1">Eco Points Issued Today</p>
          <p className="text-4xl font-bold text-white">{stats.ecoPointsToday}</p>
        </div>
        <div className="bg-[#d7ecc8] rounded-2xl px-6 py-5">
          <p className="text-sm text-[#4a6741] font-medium mb-1">Containers Saved (Month)</p>
          <p className="text-4xl font-bold text-[#4a6741]">{stats.containersSavedMonth}</p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-5 focus-within:border-[#4a6741] transition">
        <IoSearchOutline className="text-gray-400 flex-shrink-0" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name or ID..."
          className="text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none w-full"
        />
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr_1.2fr] items-center px-5 py-3 bg-[#e8f5e2] text-sm font-semibold text-[#4a6741]">
          <span>Student & Employee</span>
          <span>School ID</span>
          <span>Eco Points</span>
          <span>Confirmed By</span>
          <span>Timestamp</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-12 text-gray-400 text-sm gap-2"><IoRefreshOutline className="animate-spin text-lg" /> Loading…</div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-400 gap-2">
            <IoLeafOutline className="text-4xl" />
            <p className="text-sm">{search ? "No records match." : "No BYOC records yet."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {records.map((r) => (
              <li key={r._id} className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr_1.2fr] items-center px-5 py-3.5 hover:bg-gray-50 transition">
                <span className="text-sm font-medium text-gray-800">{r.studentName}</span>
                <span className="text-sm text-gray-500 font-mono">{r.schoolId}</span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-[#4a6741]">
                  <IoLeafOutline className="text-[#4a6741]" />
                  +{r.ecoPoints} pts
                </span>
                <span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge(r.confirmedByRole)}`}>
                    {r.confirmedByRole}
                  </span>
                </span>
                <span className="text-sm text-gray-500">{fmt(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Rewards() {
  const [activeTab, setActiveTab] = useState("redeem");

  return (
    <AdminLayout breadcrumb="Rewards">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[#4a6741]">Rewards Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage rewards, redemptions, and BYOC eco-points</p>
        </div>
        <button className="p-2 text-gray-400 hover:text-[#4a6741] transition" title="Settings">
          <IoSettingsOutline className="text-xl" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-gray-200 mb-6 mt-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition border-b-2 -mb-px
              ${activeTab === t.key
                ? "border-[#4a6741] text-[#4a6741]"
                : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
          >
            <span className="text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "redeem" && <RedeemTab />}
      {activeTab === "configure" && <ConfigureTab />}
      {activeTab === "history" && <HistoryTab />}
      {activeTab === "byoc" && <ByocTab />}
    </AdminLayout>
  );
}
