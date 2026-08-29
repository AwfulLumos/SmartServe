export const fmtDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export const fmtTime = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

export const resolveProfileImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (apiBase.startsWith("http")) {
    return `${apiBase.replace(/\/api\/?$/, "")}${url}`;
  }
  return url;
};
