import { IoGiftOutline, IoSettingsOutline } from "react-icons/io5";

export default function RewardsHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
          <IoGiftOutline className="text-3xl" />
          Rewards Management
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Configure reward items, set point rates, and scan QR codes to process redemptions
        </p>
      </div>
      <button className="p-2 text-gray-400 hover:text-[#4a6741] transition self-start sm:self-auto cursor-pointer" title="Settings">
        <IoSettingsOutline className="text-xl" />
      </button>
    </div>
  );
}
