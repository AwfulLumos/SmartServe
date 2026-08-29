export const resolveStudentImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (apiBase.startsWith("http")) {
    return `${apiBase.replace(/\/api\/?$/, "")}${url}`;
  }
  return url;
};

export const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  schoolId: "",
  userType: "student",
  gradeLevel: "",
  section: "",
  jobTitle: "",
  department: "",
  password: "",
  confirmPassword: "",
};

export const studentGradeOptions = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
export const studentSectionOptions = ["A", "B", "C", "D", "E", "F", "G", "H"];
export const employeeJobTitleOptions = ["Teacher", "Assistant Teacher", "Staff", "Coordinator", "Supervisor", "Admin Staff"];
export const employeeDepartmentOptions = ["Academic", "Administration", "Finance", "HR", "ICT", "Library", "Maintenance", "Security", "Canteen"];

export const downloadQR = (svgEl, filename) => {
  if (!svgEl) return;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const canvas = document.createElement("canvas");
  const size = 300;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));
};

export const statusBadge = (active) =>
  active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500";
