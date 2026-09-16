import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import {
  IoDownloadOutline,
  IoLeafOutline,
  IoScanOutline,
  IoSparklesOutline,
} from "react-icons/io5";
import toast from "react-hot-toast";
import { calculateEcoLevel } from "../rewards/RewardsView";

const getInitials = (name = "") => {
  if (!name) return "ST";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function MyQRView({ student, profileImageUrl }) {
  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef(null);

  const displayId = student?.schoolId ?? student?.studentNo ?? "—";
  const byocCount = student?.byocCount ?? 0;
  const ecoInfo = calculateEcoLevel ? calculateEcoLevel(byocCount) : { name: "Eco Member", icon: "🌱" };

  const qrData =
    student?.qrToken ||
    JSON.stringify({
      studentId: student?._id,
      schoolId: displayId,
      fullName: student?.fullName,
    });

  const handleDownloadQR = () => {
    try {
      setDownloading(true);
      const svgElement = qrRef.current?.querySelector("svg");
      if (!svgElement) {
        toast.error("QR Code container not found");
        setDownloading(false);
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const padding = 40;
        const size = 300;
        canvas.width = size + padding * 2;
        canvas.height = size + padding * 2 + 80;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "#4a6741";
        ctx.textAlign = "center";
        ctx.fillText("SmartServe Student Canteen Pass", canvas.width / 2, 35);

        ctx.drawImage(img, padding, 50, size, size);

        ctx.font = "14px sans-serif";
        ctx.fillStyle = "#666666";
        ctx.fillText(student?.fullName || "Student", canvas.width / 2, size + 75);
        ctx.fillText(`ID: ${displayId}`, canvas.width / 2, size + 95);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `SmartServe_Pass_${displayId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        URL.revokeObjectURL(url);
        toast.success("Canteen Pass downloaded to gallery!");
        setDownloading(false);
      };

      img.onerror = () => {
        toast.error("Failed to generate image for download");
        setDownloading(false);
      };

      img.src = url;
    } catch {
      toast.error("Download failed. Try taking a screenshot instead.");
      setDownloading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto px-4 py-3 sm:py-6 bg-gray-50 dark:bg-[#0f170a] font-sans text-center pb-28">
      {/* ── Digital Student Canteen Pass Card ── */}
      <div className="bg-white dark:bg-[#1a2416] rounded-3xl shadow-xl border border-gray-200/80 dark:border-[#2b3924] w-full max-w-sm overflow-hidden flex flex-col items-center my-auto transition-all">
        {/* Pass Top Banner */}
        <div className="w-full bg-gradient-to-r from-[#3d5933] via-[#4a6741] to-[#2d4227] px-4 py-3 sm:px-5 sm:py-3.5 text-white flex items-center justify-between">
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">University Cafeteria Pass</p>
            <p className="text-xs sm:text-sm font-extrabold tracking-tight">SmartServe Digital ID</p>
          </div>
          <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-white/20 px-2 sm:px-2.5 py-0.5 rounded-full border border-white/20">
            <IoScanOutline className="text-xs" /> Counter Pass
          </span>
        </div>

        <div className="p-4 sm:p-5 w-full flex flex-col items-center">
          {/* Student Avatar + ID Badge */}
          <div className="flex items-center gap-2.5 w-full bg-[#f8fbf6] dark:bg-[#202b1b] rounded-2xl p-2.5 sm:p-3 mb-3 border border-[#4a6741]/15 dark:border-[#2b3924]">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-xl sm:rounded-2xl object-cover flex-shrink-0 border border-[#4a6741]/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl sm:rounded-2xl bg-[#4a6741] text-white flex items-center justify-center font-extrabold text-sm shadow-xs flex-shrink-0">
                {getInitials(student?.fullName)}
              </div>
            )}
            <div className="text-left flex-1 min-w-0">
              <p className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                {student?.fullName ?? "Student"}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-xs font-bold text-[#4a6741] dark:text-[#8ebd7e]">
                  {displayId}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-400">·</span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                  <IoLeafOutline className="text-xs" /> {student?.points ?? 0} pts
                </span>
              </div>
            </div>
          </div>

          {/* High-Contrast Pure White QR Container */}
          <div
            ref={qrRef}
            className="p-3 sm:p-4 bg-white rounded-3xl border-2 border-dashed border-[#4a6741]/30 shadow-inner mb-3 flex flex-col items-center justify-center relative"
          >
            {/* Alignment Crosshairs */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#4a6741]" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#4a6741]" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#4a6741]" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#4a6741]" />

            {student?._id || student?.schoolId ? (
              <QRCode
                value={qrData}
                size={160}
                fgColor="#24301f"
                bgColor="#ffffff"
                level="M"
              />
            ) : (
              <div className="w-[160px] h-[160px] bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                No Student Record Found
              </div>
            )}
          </div>

          {/* Scanning Tip */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3.5 bg-gray-50 dark:bg-[#202b1b]/60 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-[#2b3924]">
            <IoSparklesOutline className="text-amber-500 text-xs flex-shrink-0" />
            <span className="text-[10.5px]">Hold screen under the counter barcode scanner</span>
          </div>

          {/* Download / Save Button */}
          <button
            onClick={handleDownloadQR}
            disabled={downloading}
            className="w-full py-3 min-h-[44px] rounded-2xl bg-[#4a6741] hover:bg-[#3a5333] active:scale-95 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <IoDownloadOutline className="text-base" />
            <span>{downloading ? "Saving Pass..." : "Save Pass to Photos"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
