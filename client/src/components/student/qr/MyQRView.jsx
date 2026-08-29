import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { IoDownloadOutline } from "react-icons/io5";
import toast from "react-hot-toast";

export default function MyQRView({ student }) {
  const [downloading, setDownloading] = useState(false);
  const qrRef = useRef(null);

  const displayId = student?.schoolId ?? student?.studentNo ?? "—";

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
        ctx.fillText("SmartServe Student QR", canvas.width / 2, 35);

        ctx.drawImage(img, padding, 50, size, size);

        ctx.font = "14px sans-serif";
        ctx.fillStyle = "#666666";
        ctx.fillText(student?.fullName || "Student", canvas.width / 2, size + 75);
        ctx.fillText(`ID: ${displayId}`, canvas.width / 2, size + 95);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `SmartServe_QR_${displayId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        URL.revokeObjectURL(url);
        toast.success("QR Code downloaded!");
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
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-[#0f170a] font-sans text-center overflow-y-auto">
      <div className="bg-white dark:bg-[#1a2416] rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-[#2b3924] w-full max-w-xs flex flex-col items-center">
        <h3 className="text-xl font-extrabold text-[#4a6741] dark:text-[#8ebd7e] mb-1">My Canteen QR</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Scan at counter to claim orders or BYOC points</p>

        <div ref={qrRef} className="p-4 bg-white rounded-2xl border-2 border-[#4a6741]/20 shadow-inner mb-6 flex justify-center">
          {student?._id || student?.schoolId ? (
            <QRCode value={qrData} size={180} fgColor="#4a6741" bgColor="#ffffff" />
          ) : (
            <div className="w-[180px] h-[180px] bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
              No Student Data
            </div>
          )}
        </div>

        <div className="w-full bg-gray-50 dark:bg-[#24301f] rounded-2xl p-3 mb-5 border border-gray-100 dark:border-[#2b3924]">
          <p className="font-extrabold text-gray-800 dark:text-gray-100 text-sm">{student?.fullName ?? "Student"}</p>
          <p className="text-xs text-[#4a6741] dark:text-[#8ebd7e] font-semibold mt-0.5">ID: {displayId}</p>
        </div>

        <button
          onClick={handleDownloadQR}
          disabled={downloading}
          className="w-full py-3.5 rounded-2xl bg-[#4a6741] hover:bg-[#3a5333] disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition"
        >
          <IoDownloadOutline className="text-base" />
          <span>{downloading ? "Generating PNG..." : "Download QR Code"}</span>
        </button>
      </div>
    </div>
  );
}
