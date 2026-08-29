export const CATEGORY_LABELS = {
  all: "All Categories",
  auth: "Auth",
  student: "Students",
  inventory: "Inventory",
  menu: "Menu",
  order: "Orders",
  reward: "Rewards",
  byoc: "BYOC",
  config: "Config",
  system: "System",
};

export const ACTOR_LABELS = {
  all: "All Actors",
  admin: "Admin",
  staff: "Staff",
  student: "Student",
  system: "System",
};

export const CATEGORY_COLORS = {
  auth: "bg-blue-100 text-blue-700",
  student: "bg-purple-100 text-purple-700",
  inventory: "bg-orange-100 text-orange-700",
  menu: "bg-yellow-100 text-yellow-800",
  order: "bg-cyan-100 text-cyan-700",
  reward: "bg-pink-100 text-pink-700",
  byoc: "bg-green-100 text-green-700",
  config: "bg-gray-100 text-gray-700",
  system: "bg-gray-100 text-gray-500",
};

export const ACTOR_COLORS = {
  admin: "bg-[#4a6741]/10 text-[#4a6741]",
  staff: "bg-indigo-100 text-indigo-700",
  student: "bg-amber-100 text-amber-700",
  system: "bg-gray-100 text-gray-500",
};

export const fmt = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
