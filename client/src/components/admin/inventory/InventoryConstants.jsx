export const STATUS = {
  in_stock: {
    label: "In Stock",
    dot: "bg-[#4a6741]",
    badge: "bg-[#d7ecc8] text-[#4a6741]",
  },
  low_stock: {
    label: "Low Stock",
    dot: "bg-red-400",
    badge: "bg-red-100 text-red-500",
  },
  out_of_stock: {
    label: "Out of Stock",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-600",
  },
};

export const deriveStatus = (quantity, minThreshold) => {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= minThreshold) return "low_stock";
  return "in_stock";
};

export const CATEGORIES = ["Protein", "Vegetables", "Grains", "Dairy", "Beverages", "Condiments", "Snacks", "Others"];
export const UNITS = ["kg", "g", "pcs", "L", "mL", "box", "pack", "dozen"];

export const emptyForm = { name: "", category: "", quantity: "", unit: "kg", minThreshold: "", price: "" };

export const STATUS_FILTERS = [
  { key: "all", label: "All Items" },
  { key: "in_stock", label: "In Stock" },
  { key: "low_stock", label: "Low Stock" },
  { key: "out_of_stock", label: "Out of Stock" },
];
