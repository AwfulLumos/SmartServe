import { useState, useEffect, useRef } from "react";
import {
  IoCloseOutline,
  IoCheckmarkCircle,
  IoCameraOutline,
  IoRefreshOutline,
  IoCloudUploadOutline,
} from "react-icons/io5";
import api from "../../../utils/api";
import { ICON_MAP } from "./RewardsConstants";

export default function RedeemTab() {
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
      .catch(() => { });
    return () => stopScanner();
  }, []);

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
      const scanner = new Html5Qrcode("qr-reader");
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          stopScanner();
          await lookupStudent(decodedText.trim());
        },
        () => { }
      );
    } catch {
      setScanning(false);
      setScanError("Camera access denied or not available. Please allow camera permissions.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError("");
    setLoadingStudent(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-reader-file-temp");
      const decodedText = await html5QrCode.scanFile(file, false);
      await lookupStudent(decodedText.trim());
    } catch {
      setScanError("Could not read QR code from the uploaded image. Please ensure the QR code image is clear.");
    } finally {
      setLoadingStudent(false);
      e.target.value = "";
    }
  };

  const lookupStudent = async (token) => {
    setLoadingStudent(true);
    setScanError("");
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
    setRedeeming(true);
    setRedeemError("");
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

  const reset = () => {
    setStudent(null);
    setSelectedReward(null);
    setRedeemError("");
    setSuccess(null);
    setScanError("");
  };

  return (
    <div className="max-w-2xl">
      {!student ? (
        /* Step 1 — Scan */
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="font-bold text-[#4a6741] text-base mb-4">Step 1: Scan Student QR Code</p>

          <div
            id="qr-reader-wrapper"
            onClick={!scanning ? startScanner : undefined}
            className={`border-2 border-dashed rounded-2xl overflow-hidden transition ${
              scanning ? "border-[#4a6741]" : "border-gray-200 cursor-pointer hover:border-[#4a6741]/60"
            }`}
          >
            <div id="qr-reader" ref={scannerRef} className={scanning ? "block" : "hidden"} />
            <div id="qr-reader-file-temp" className="hidden" />
            {!scanning && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                {loadingStudent ? (
                  <IoRefreshOutline className="text-5xl animate-spin text-[#4a6741]" />
                ) : (
                  <>
                    <IoCameraOutline className="text-5xl text-gray-300" />
                    <p className="font-semibold text-gray-600">Scan or Upload Student QR Code</p>
                    <p className="text-sm text-gray-400 mb-1">Use camera or select an image file</p>

                    <div className="flex flex-wrap items-center justify-center gap-3 mt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={startScanner}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3a5333] transition shadow-sm"
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

          {success && (
            <div className="bg-[#d7ecc8] border border-[#4a6741]/20 rounded-2xl px-5 py-4 flex items-center gap-3">
              <IoCheckmarkCircle className="text-[#4a6741] text-2xl flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#4a6741]">Redeemed: {success.reward}</p>
                <p className="text-xs text-[#4a6741]/70">Points remaining: {success.pointsLeft}</p>
              </div>
            </div>
          )}

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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition ${
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
