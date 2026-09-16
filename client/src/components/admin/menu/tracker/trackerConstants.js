export const ACCOUNT_TYPE_OPTIONS = [
  { value: "all", label: "All Account Types" },
  { value: "student", label: "Student" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
];

export const DEVICE_OPTIONS = [
  { value: "all", label: "All Devices" },
  { value: "mobile", label: "Smartphone / Mobile" },
  { value: "desktop", label: "Desktop / Laptop" },
  { value: "tablet", label: "Tablet Device" },
];

export const ACTIVITY_OPTIONS = [
  { value: "all", label: "All Activity" },
  { value: "recent", label: "Active Recently" },
  { value: "inactive", label: "Inactive / Idle" },
];

export const FAILED_ACCOUNT_OPTIONS = [
  { value: "all", label: "All Account Types" },
  { value: "student", label: "Student Accounts" },
  { value: "staff", label: "Staff Accounts" },
  { value: "admin", label: "Admin Accounts" },
  { value: "staff_admin", label: "Staff & Admins" },
  { value: "unknown", label: "Unregistered / Unknown" },
];

export const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (apiBase.startsWith("http")) {
    return `${apiBase.replace(/\/api\/?$/, "")}${url}`;
  }
  return url;
};

export const formatTimeAgo = (rawDate) => {
  if (!rawDate) return { relative: "No time recorded", full: "No recorded time", isRecent: false };
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return { relative: "Unknown", full: String(rawDate), isRecent: false };

  const now = Date.now();
  const diffMs = now - d.getTime();
  const full = d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  if (diffMs < 60000 && diffMs > -10000) {
    return { relative: "Just now", full, isRecent: true };
  }
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return { relative: `${diffMin}m ago`, full, isRecent: diffMin <= 15 };
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return { relative: `${diffHours}h ago`, full, isRecent: false };
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return { relative: `${diffDays}d ago`, full, isRecent: false };

  const shortDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return { relative: shortDate, full, isRecent: false };
};
