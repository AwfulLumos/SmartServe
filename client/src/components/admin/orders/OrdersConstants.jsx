import {
  IoTimeOutline,
  IoFlameOutline,
  IoCheckmarkCircleOutline,
  IoCheckmarkDoneCircleOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";

export const STATUS_CFG = {
  pending: {
    label: "Pending",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
    icon: <IoTimeOutline />,
    ring: "ring-amber-400",
    btn: "border-2 border-amber-400 text-amber-600 hover:bg-amber-50",
    btnActive: "bg-amber-400 text-white border-2 border-amber-400",
  },
  preparing: {
    label: "Preparing",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    dot: "bg-blue-400",
    icon: <IoFlameOutline />,
    ring: "ring-blue-400",
    btn: "border-2 border-blue-400 text-blue-600 hover:bg-blue-50",
    btnActive: "bg-blue-400 text-white border-2 border-blue-400",
  },
  ready: {
    label: "Ready",
    badge: "bg-[#d7ecc8] text-[#4a6741] border border-[#b5d99c]",
    dot: "bg-[#4a6741]",
    icon: <IoCheckmarkCircleOutline />,
    ring: "ring-[#4a6741]",
    btn: "border-2 border-[#4a6741] text-[#4a6741] hover:bg-[#f0f7ec]",
    btnActive: "bg-[#4a6741] text-white border-2 border-[#4a6741]",
  },
  completed: {
    label: "Completed",
    badge: "bg-gray-100 text-gray-500 border border-gray-200",
    dot: "bg-gray-400",
    icon: <IoCheckmarkDoneCircleOutline />,
    ring: "ring-gray-400",
    btn: "border-2 border-gray-300 text-gray-500 hover:bg-gray-50",
    btnActive: "bg-gray-400 text-white border-2 border-gray-400",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-red-100 text-red-600 border border-red-200",
    dot: "bg-red-400",
    icon: <IoAlertCircleOutline />,
    ring: "ring-red-400",
    btn: "border-2 border-red-300 text-red-500 hover:bg-red-50",
    btnActive: "bg-red-400 text-white border-2 border-red-400",
  },
};

export const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export const STATUS_SEQUENCE = ["pending", "preparing", "ready", "completed"];

export function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}
