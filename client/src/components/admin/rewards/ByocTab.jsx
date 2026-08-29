import { useState, useEffect, useCallback, useRef } from "react";
import {
  IoLeafOutline,
  IoCameraOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoCheckmarkCircle,
  IoCloudUploadOutline,
} from "react-icons/io5";
import api from "../../../utils/api";
import { SkeletonTable } from "../../SkeletonLoader";
import { fmt, roleBadge, ICON_MAP, CustomFilterSelect } from "./RewardsConstants";

export default function ByocTab() {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [loadingStudent, setLoadingStudent] = useState(false);

  const [confirmStudent, setConfirmStudent] = useState(null);
  const [ecoPoints, setEcoPoints] = useState(5);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const [awardedStudent, setAwardedStudent] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState(null);

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ ecoPointsToday: 0, containersSavedMonth: 0 });
  const [search, setSearch] = useState("");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [confirmedByFilter, setConfirmedByFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchByoc = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/byoc", { params: { search } });
      setRecords(data.records);
      setStats(data.stats);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchByoc, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchByoc]);

  useEffect(() => {
    api.get("/points-config").then(({ data }) => setEcoPoints(data.ecoPointsPerByoc ?? 5)).catch(() => { });
    api.get("/rewards", { params: { activeOnly: "true" } }).then(({ data }) => setRewards(data.rewards)).catch(() => { });
    return () => stopScanner();
  }, []);

  const filteredRecords = records.filter((r) => {
    if (timeframeFilter !== "all") {
      const recordDate = new Date(r.createdAt);
      const now = new Date();
      if (timeframeFilter === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (recordDate < today) return false;
      } else if (timeframeFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (recordDate < weekAgo) return false;
      } else if (timeframeFilter === "month") {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        if (recordDate < monthAgo) return false;
      }
    }
    if (confirmedByFilter !== "all") {
      if ((r.confirmedByRole || "").toLowerCase() !== confirmedByFilter) return false;
    }
    return true;
  });

  const stopScanner = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => { });
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
          setLoadingStudent(true);
          setScanError("");
          try {
            const { data } = await api.get(`/students/by-qr/${encodeURIComponent(decodedText.trim())}`);
            setConfirmStudent(data);
          } catch (err) {
            setScanError(err.response?.data?.message || "QR code not recognised.");
          } finally {
            setLoadingStudent(false);
          }
        },
        () => { }
      );
    } catch {
      setScanning(false);
      setScanError("Camera access denied or not available.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError("");
    setLoadingStudent(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-byoc-file-temp");
      const decodedText = await html5QrCode.scanFile(file, false);
      try {
        const { data } = await api.get(`/students/by-qr/${encodeURIComponent(decodedText.trim())}`);
        setConfirmStudent(data);
      } catch (err) {
        setScanError(err.response?.data?.message || "QR code not recognised.");
      }
    } catch {
      setScanError("Could not read QR code from the uploaded image. Please ensure the QR code image is clear.");
    } finally {
      setLoadingStudent(false);
      e.target.value = "";
    }
  };

  const handleConfirm = async () => {
    if (!confirmStudent) return;
    setConfirming(true);
    setConfirmError("");
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
    setRedeeming(true);
    setRedeemError("");
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
    setConfirmStudent(null);
    setConfirmError("");
    setAwardedStudent(null);
    setSelectedReward(null);
    setRedeemError("");
    setRedeemSuccess(null);
    setScanError("");
  };

  return (
    <div>
      {/* Scan Section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
        <p className="font-extrabold text-[#4a6741] text-base mb-4">Log BYOC — Scan Student QR</p>

        {!awardedStudent ? (
          <div
            id="qr-byoc-wrapper"
            onClick={!scanning && !confirmStudent && !loadingStudent ? startScanner : undefined}
            className={`border-2 border-dashed rounded-2xl overflow-hidden transition mb-3 ${
              scanning || confirmStudent ? "border-[#4a6741]" : "border-gray-200 cursor-pointer hover:border-[#4a6741]/60"
            }`}
          >
            <div id="qr-byoc-reader" ref={scannerRef} className={scanning ? "block" : "hidden"} />
            <div id="qr-byoc-file-temp" className="hidden" />
            {!scanning && !loadingStudent && !confirmStudent && (
              <div className="flex flex-col items-[#center] justify-center py-12 gap-3 text-gray-400 items-center">
                <IoCameraOutline className="text-5xl text-gray-300" />
                <p className="font-semibold text-gray-600">Scan or Upload Student QR Code</p>
                <p className="text-xs text-gray-400 mb-1">Awards +{ecoPoints} eco points to the student</p>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={startScanner}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3a5333] transition shadow-sm cursor-pointer"
                  >
                    <IoCameraOutline className="text-base" />
                    Use Camera Scanner
                  </button>

                  <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition cursor-pointer shadow-sm">
                    <IoCloudUploadOutline className="text-base text-[#4a6741]" />
                    Upload QR Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
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
          <button onClick={stopScanner} className="text-xs text-gray-400 hover:text-[#4a6741] underline cursor-pointer">
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? "border-[#4a6741] bg-[#d7ecc8]"
                          : canAfford
                          ? "border-gray-200 hover:border-[#4a6741]/40 hover:bg-gray-50"
                          : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                      }`}
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
                className="mt-3 w-full flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 cursor-pointer"
              >
                <IoCheckmarkCircle />
                {redeeming ? "Processing…" : `Confirm — Redeem "${selectedReward.name}"`}
              </button>
            )}
            <button onClick={resetFlow} className="mt-3 text-sm text-gray-400 hover:text-[#4a6741] underline cursor-pointer">
              Skip / Scan next student
            </button>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
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
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4a6741] hover:bg-[#3a5333] text-white font-bold text-sm transition disabled:opacity-60 cursor-pointer"
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

      {/* Stats */}
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

      {/* Search & Controls Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or ID..."
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:bg-white transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
              title="Clear search"
            >
              <IoCloseOutline className="text-lg" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <CustomFilterSelect
            value={timeframeFilter}
            onChange={setTimeframeFilter}
            options={[
              { value: "all", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
            ]}
          />
          <CustomFilterSelect
            value={confirmedByFilter}
            onChange={setConfirmedByFilter}
            options={[
              { value: "all", label: "All Roles" },
              { value: "admin", label: "Admin" },
              { value: "staff", label: "Staff" },
            ]}
          />

          <button
            onClick={fetchByoc}
            className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0 cursor-pointer"
            title="Refresh"
          >
            <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr_1.2fr] items-center px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
          <span>Student</span>
          <span>School ID</span>
          <span>Eco Points</span>
          <span>Confirmed By</span>
          <span>Timestamp</span>
        </div>

        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={6} columns={5} showHeader={false} />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <IoLeafOutline className="text-4xl text-gray-300" />
            <p className="text-sm">{search || timeframeFilter !== "all" || confirmedByFilter !== "all" ? "No records match." : "No BYOC records yet."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filteredRecords.map((r) => (
              <li key={r._id} className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr_1.2fr] items-center px-5 py-3.5 hover:bg-gray-50 transition">
                <span className="text-sm font-medium text-gray-800 truncate">{r.studentName}</span>
                <span className="font-mono text-xs font-semibold text-[#4a6741]">{r.schoolId}</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#4a6741]">
                  <IoLeafOutline className="text-[#4a6741]" />
                  +{r.ecoPoints} pts
                </span>
                <span>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleBadge(r.confirmedByRole)}`}>
                    {r.confirmedByRole}
                  </span>
                </span>
                <span className="text-xs text-gray-400 font-mono">{fmt(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}

        {!loading && filteredRecords.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-700">{filteredRecords.length}</span> record{filteredRecords.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
