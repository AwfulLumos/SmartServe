import { useState, useEffect } from "react";
import {
  IoSettingsOutline,
  IoRefreshOutline,
  IoAlertCircleOutline,
  IoCheckmarkOutline,
  IoSaveOutline,
} from "react-icons/io5";
import api from "../../../utils/api";
import { CONFIG_FIELDS } from "./RewardsConstants";

export default function PointsConfigSection() {
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
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
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
          <p className="text-sm text-gray-400 mt-0.5">Control how students earn points across the platform</p>
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
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-sm disabled:opacity-60 ${
              saved
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
