import { useState, useRef, useEffect, useCallback } from "react";
import QRCode from "react-qr-code";
import {
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoSchoolOutline,
  IoCheckmarkCircle,
  IoDownloadOutline,
  IoPersonAddOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoEllipsisVertical,
  IoBriefcaseOutline,
  IoPeopleOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoIdCardOutline,
  IoCalendarOutline,
  IoLeafOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import { MdTag } from "react-icons/md";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

// ── Reusable field ────────────────────────────────────────────────────────────
const Field = ({ label, required, icon, error, type = "text", ...props }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
          {icon}
        </span>
        <input
          type={isPassword ? (showPwd ? "text" : "password") : type}
          {...props}
          className={`w-full pl-10 ${isPassword ? "pr-9" : "pr-4"} py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-white
            ${error
              ? "border-red-300 focus:ring-red-200 focus:border-red-400"
              : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
            }`}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            {showPwd ? <IoEyeOffOutline className="text-base" /> : <IoEyeOutline className="text-base" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

const initialForm = {
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

// ── QR download helper ────────────────────────────────────────────────────────
const downloadQR = (svgEl, filename) => {
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

export default function RegisterStudent() {
  const { user } = useAuth();
  // List state
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const limit = 10;

  // Modal / form state  (mode: null | "create" | "view" | "edit" | "delete")
  const [mode, setMode] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [created, setCreated] = useState(null);
  const qrRef = useRef(null);

  // Row action dropdown
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setListLoading(true);
    try {
      const { data } = await api.get("/students", {
        params: { search, page, limit },
      });
      setStudents(data.students);
      setTotal(data.total);
    } catch {
      // silently fail — show empty state
    } finally {
      setListLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(fetchStudents, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const totalPages = Math.ceil(total / limit);

  // ── Form helpers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = (isEdit = false) => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.schoolId.trim()) e.schoolId = "Required";
    if (!isEdit) {
      if (!form.password) e.password = "Required";
      else if (form.password.length < 6) e.password = "Min. 6 characters";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    } else if (form.password && form.password.length < 6) {
      e.password = "Min. 6 characters";
    }
    return e;
  };

  const closePanel = () => {
    setMode(null);
    setSelectedStudent(null);
    setForm(initialForm);
    setErrors({});
    setApiError("");
    setCreated(null);
  };

  // ── Open helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setCreated(null);
    setForm(initialForm);
    setErrors({});
    setApiError("");
    setMode("create");
  };

  const openView = (s) => {
    setSelectedStudent(s);
    setMode("view");
    setOpenMenuId(null);
  };

  const openEdit = (s) => {
    const [firstName, ...rest] = (s.fullName || "").split(" ");
    setSelectedStudent(s);
    setForm({
      firstName: firstName || "",
      lastName: rest.join(" ") || "",
      email: s.email || "",
      schoolId: s.schoolId || "",
      userType: s.userType || "student",
      gradeLevel: s.gradeLevel || "",
      section: s.section || "",
      jobTitle: s.jobTitle || "",
      department: s.department || "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
    setApiError("");
    setMode("edit");
    setOpenMenuId(null);
  };

  const openDelete = (s) => {
    setSelectedStudent(s);
    setMode("delete");
    setOpenMenuId(null);
  };

  // ── Submit: Create ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate(false);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post("/students", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        schoolId: form.schoolId.trim(),
        userType: form.userType,
        gradeLevel: form.userType === "student" ? form.gradeLevel.trim() : "",
        section: form.userType === "student" ? form.section.trim() : "",
        jobTitle: form.userType === "employee" ? form.jobTitle.trim() : "",
        department: form.userType === "employee" ? form.department.trim() : "",
        password: form.password,
      });
      setCreated(data);
      fetchStudents();
    } catch (err) {
      setApiError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit: Edit ──────────────────────────────────────────────────────────
  const handleEdit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate(true);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        schoolId: form.schoolId.trim(),
        userType: form.userType,
        gradeLevel: form.userType === "student" ? form.gradeLevel.trim() : "",
        section: form.userType === "student" ? form.section.trim() : "",
        jobTitle: form.userType === "employee" ? form.jobTitle.trim() : "",
        department: form.userType === "employee" ? form.department.trim() : "",
      };
      if (form.password) payload.password = form.password;
      await api.put(`/students/${selectedStudent._id}`, payload);
      fetchStudents();
      closePanel();
    } catch (err) {
      setApiError(err.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit: Delete ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/students/${selectedStudent._id}`);
      fetchStudents();
      closePanel();
    } catch (err) {
      setApiError(err.response?.data?.message || "Delete failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (active) =>
    active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500";

  return (
    <AdminLayout breadcrumb="Register Student">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#4a6741]">Students &amp; Employees</h1>
          <p className="text-sm text-gray-400">{total} user{total !== 1 ? "s" : ""} registered</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
        >
          <IoPersonAddOutline className="text-base" />
          Add User
        </button>
      </div>

      {/* ── Search + Refresh ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus-within:border-[#4a6741] transition">
          <IoSearchOutline className="text-gray-400 text-base flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, School ID or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none w-full"
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }}>
              <IoCloseOutline className="text-gray-400 hover:text-gray-600 text-lg" />
            </button>
          )}
        </div>
        <button
          onClick={fetchStudents}
          className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition"
          title="Refresh"
        >
          <IoRefreshOutline className="text-lg" />
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_1.4fr_1fr_0.7fr_0.7fr_0.6fr_0.5fr_40px] items-center px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <span>ID</span>
          <span>Name</span>
          <span>Email</span>
          <span>Grade / Dept</span>
          <span>Section / Title</span>
          <span>Type</span>
          <span>Status</span>
          <span />
        </div>

        {listLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
            <IoRefreshOutline className="animate-spin text-lg" /> Loading…
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <IoPersonAddOutline className="text-4xl" />
            <p className="text-sm">{search ? "No students match your search." : "No students registered yet."}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {students.map((s) => (
              <li
                key={s._id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr_0.7fr_0.7fr_0.5fr_0.5fr_40px] items-center px-5 py-3.5 hover:bg-gray-50 transition"
              >
                <span className="font-mono text-xs font-semibold text-[#4a6741]">{s.schoolId}</span>
                <span className="text-sm font-medium text-gray-800 truncate">{s.fullName}</span>
                <span className="text-xs text-gray-500 truncate">{s.email}</span>
                <span className="text-xs text-gray-500">
                  {s.userType === "employee" ? (s.department || "—") : (s.gradeLevel || "—")}
                </span>
                <span className="text-xs text-gray-500">
                  {s.userType === "employee" ? (s.jobTitle || "—") : (s.section || "—")}
                </span>
                <span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    s.userType === "employee" ? "bg-blue-100 text-blue-600" : "bg-[#d7ecc8] text-[#4a6741]"
                  }`}>
                    {s.userType === "employee" ? "Employee" : "Student"}
                  </span>
                </span>
                <span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(s.isActive)}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </span>
                <div className="relative" ref={openMenuId === s._id ? menuRef : null}>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === s._id ? null : s._id)}
                    className="text-gray-400 hover:text-gray-600 transition flex justify-center"
                  >
                    <IoEllipsisVertical />
                  </button>
                  {openMenuId === s._id && (
                    <div className="absolute right-0 top-7 w-36 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                      <button
                        onClick={() => openView(s)}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <IoEyeOutline className="text-[#4a6741]" /> View
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <IoPencilOutline className="text-blue-500" /> Edit
                      </button>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => openDelete(s)}
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50"
                        >
                          <IoTrashOutline /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:border-[#4a6741]/40 hover:text-[#4a6741] transition"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:border-[#4a6741]/40 hover:text-[#4a6741] transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Slide-in Panel ── */}
      {mode !== null && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closePanel} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">

            {/* ── VIEW panel ── */}
            {mode === "view" && selectedStudent && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <p className="font-bold text-[#4a6741] text-base">User Details</p>
                  <button onClick={closePanel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                    <IoCloseOutline className="text-xl" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                  {/* Avatar + name */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-[#d7ecc8] flex items-center justify-center text-2xl font-bold text-[#4a6741]">
                      {selectedStudent.fullName?.[0]?.toUpperCase()}
                    </div>
                    <p className="font-bold text-gray-800 text-lg">{selectedStudent.fullName}</p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      selectedStudent.userType === "employee" ? "bg-blue-100 text-blue-600" : "bg-[#d7ecc8] text-[#4a6741]"
                    }`}>
                      {selectedStudent.userType === "employee" ? "Employee" : "Student"}
                    </span>
                  </div>

                  {/* Info rows */}
                  <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100 text-sm">
                    {[
                      [<IoIdCardOutline className="text-[#4a6741]" />, selectedStudent.userType === "employee" ? "Employee ID" : "School ID", selectedStudent.schoolId],
                      [<IoMailOutline className="text-[#4a6741]" />, "Email", selectedStudent.email],
                      selectedStudent.userType === "employee"
                        ? [<IoBriefcaseOutline className="text-[#4a6741]" />, "Job Title", selectedStudent.jobTitle || "—"]
                        : [<IoCalendarOutline className="text-[#4a6741]" />, "Grade Level", selectedStudent.gradeLevel || "—"],
                      selectedStudent.userType === "employee"
                        ? [<IoPeopleOutline className="text-[#4a6741]" />, "Department", selectedStudent.department || "—"]
                        : [<IoPeopleOutline className="text-[#4a6741]" />, "Section", selectedStudent.section || "—"],
                      [<IoLeafOutline className="text-[#4a6741]" />, "Eco Points", selectedStudent.points ?? 0],
                      [<IoEllipsisVertical className="text-[#4a6741]" />, "Status", selectedStudent.isActive ? "Active" : "Inactive"],
                    ].map(([icon, label, value], i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-base">{icon}</span>
                        <span className="text-gray-400 w-32 flex-shrink-0">{label}</span>
                        <span className="font-medium text-gray-700">{String(value)}</span>
                      </div>
                    ))}
                  </div>

                  {/* QR Code */}
                  {selectedStudent.qrToken && (
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-xs font-semibold text-[#4a6741] uppercase tracking-wide">QR Code</p>
                      <div ref={qrRef} className="p-4 border-2 border-[#4a6741]/20 rounded-2xl bg-white shadow-sm">
                        <QRCode value={selectedStudent.qrToken} size={160} fgColor="#4a6741" bgColor="#ffffff" level="M" />
                      </div>
                      <button
                        onClick={() => downloadQR(qrRef.current?.querySelector("svg"), `${selectedStudent.schoolId}-QR.png`)}
                        className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
                      >
                        <IoDownloadOutline /> Download QR
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => openEdit(selectedStudent)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold py-2.5 rounded-xl transition"
                  >
                    <IoPencilOutline /> Edit
                  </button>
                  <button onClick={closePanel} className="px-4 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition">
                    Close
                  </button>
                </div>
              </>
            )}

            {/* ── EDIT panel ── */}
            {mode === "edit" && selectedStudent && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <p className="font-bold text-[#4a6741] text-base">Edit User</p>
                    <p className="text-xs text-gray-400 mt-0.5">{selectedStudent.fullName}</p>
                  </div>
                  <button onClick={closePanel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                    <IoCloseOutline className="text-xl" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <form id="edit-form" onSubmit={handleEdit} className="px-6 py-5 space-y-5">
                    {apiError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                        {apiError}
                      </div>
                    )}

                    {/* User Type Toggle */}
                    <div>
                      <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-3">User Type</p>
                      <div className="flex gap-2">
                        {[["student", "Student", <IoSchoolOutline />], ["employee", "Employee", <IoBriefcaseOutline />]].map(([val, label, icon]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, userType: val, gradeLevel: "", section: "", jobTitle: "", department: "" }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                              form.userType === val
                                ? "border-[#4a6741] bg-[#d7ecc8] text-[#4a6741]"
                                : "border-gray-200 text-gray-500 hover:border-[#4a6741]/40"
                            }`}
                          >
                            {icon} {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-3">Personal Information</p>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="First Name" required name="firstName" value={form.firstName} onChange={handleChange} placeholder="Juan" icon={<IoPersonOutline />} error={errors.firstName} />
                          <Field label="Last Name" required name="lastName" value={form.lastName} onChange={handleChange} placeholder="Dela Cruz" icon={<IoPersonOutline />} error={errors.lastName} />
                        </div>
                        <Field label="Email" required type="email" name="email" value={form.email} onChange={handleChange} placeholder={form.userType === "employee" ? "employee@company.com" : "student@school.edu"} icon={<IoMailOutline />} error={errors.email} />
                      </div>
                    </div>

                    {form.userType === "student" ? (
                      <div>
                        <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-3">Academic Information</p>
                        <div className="space-y-3">
                          <Field
                            label="School ID" required name="schoolId" value={form.schoolId}
                            onChange={(e) => handleChange({ target: { name: "schoolId", value: e.target.value.toUpperCase() } })}
                            placeholder="STU-2024-XXX" icon={<MdTag />} error={errors.schoolId}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Grade" name="gradeLevel" value={form.gradeLevel} onChange={handleChange} placeholder="e.g. Grade 7" icon={<IoSchoolOutline />} error={errors.gradeLevel} />
                            <Field label="Section (Optional)" name="section" value={form.section} onChange={handleChange} placeholder="A" icon={<IoPeopleOutline />} error={errors.section} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-3">Employment Information</p>
                        <div className="space-y-3">
                          <Field
                            label="Employee ID" required name="schoolId" value={form.schoolId}
                            onChange={(e) => handleChange({ target: { name: "schoolId", value: e.target.value.toUpperCase() } })}
                            placeholder="EMP-2024-XXX" icon={<MdTag />} error={errors.schoolId}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="e.g. Teacher" icon={<IoBriefcaseOutline />} error={errors.jobTitle} />
                            <Field label="Department" name="department" value={form.department} onChange={handleChange} placeholder="e.g. Science" icon={<IoPeopleOutline />} error={errors.department} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-1">Change Password</p>
                      <p className="text-xs text-gray-400 mb-3">Leave blank to keep the existing password.</p>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="New Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 chars" icon={<IoLockClosedOutline />} error={errors.password} />
                        <Field label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat" icon={<IoLockClosedOutline />} error={errors.confirmPassword} />
                      </div>
                    </div>
                  </form>
                </div>
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button
                    type="submit"
                    form="edit-form"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
                  >
                    <IoPencilOutline />
                    {submitting ? "Saving…" : "Save Changes"}
                  </button>
                  <button type="button" onClick={closePanel} className="px-4 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition">
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* ── DELETE panel ── */}
            {mode === "delete" && selectedStudent && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <p className="font-bold text-red-500 text-base">Delete User</p>
                  <button onClick={closePanel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                    <IoCloseOutline className="text-xl" />
                  </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-5">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-2xl font-bold text-red-500">
                    {selectedStudent.fullName?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800 text-lg">{selectedStudent.fullName}</p>
                    <p className="text-xs font-mono text-gray-400">{selectedStudent.schoolId}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2 w-full text-sm text-red-600">
                    <IoAlertCircleOutline className="text-lg flex-shrink-0 mt-0.5" />
                    <span>This will permanently delete the user and all associated data. <strong>This action cannot be undone.</strong></span>
                  </div>
                  {apiError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 w-full">
                      {apiError}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
                  >
                    <IoTrashOutline />
                    {submitting ? "Deleting…" : "Delete User"}
                  </button>
                  <button onClick={closePanel} className="px-4 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition">
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* ── CREATE panel ── */}
            {mode === "create" && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <p className="font-bold text-[#4a6741] text-base">
                      {created
                        ? (created.userType === "employee" ? "Employee Registered" : "Student Registered")
                        : "Register New User"}
                    </p>
                    {!created && <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>}
                  </div>
                  <button onClick={closePanel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                    <IoCloseOutline className="text-xl" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {created ? (
                    <div className="px-6 py-6 flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-[#e8f5e2] rounded-full flex items-center justify-center">
                        <IoCheckmarkCircle className="text-[#4a6741] text-2xl" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-800">{created.fullName}</p>
                        <p className="text-xs text-gray-400 font-mono">{created.schoolId}</p>
                      </div>
                      <div className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm space-y-2 border border-gray-100">
                        {(created.userType === "employee"
                          ? [["Email", created.email], ["Job Title", created.jobTitle || "—"], ["Department", created.department || "—"]]
                          : [["Email", created.email], ["Grade", created.gradeLevel || "—"], ["Section", created.section || "—"]]
                        ).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-gray-400">{k}</span>
                            <span className="font-medium text-gray-700">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-center gap-3 w-full">
                        <p className="text-xs font-semibold text-[#4a6741]">QR Code</p>
                        <div ref={qrRef} className="p-4 border-2 border-[#4a6741]/20 rounded-2xl bg-white shadow-sm">
                          <QRCode value={created.qrToken} size={160} fgColor="#4a6741" bgColor="#ffffff" level="M" />
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono break-all text-center">{created.qrToken}</p>
                        <button
                          onClick={() => downloadQR(qrRef.current?.querySelector("svg"), `${created.schoolId}-QR.png`)}
                          className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
                        >
                          <IoDownloadOutline />
                          Download QR
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form id="register-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                      {apiError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                          {apiError}
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-3">User Type</p>
                        <div className="flex gap-2">
                          {[["student", "Student", <IoSchoolOutline />], ["employee", "Employee", <IoBriefcaseOutline />]].map(([val, label, icon]) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, userType: val, gradeLevel: "", section: "", jobTitle: "", department: "" }))}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
                                form.userType === val
                                  ? "border-[#4a6741] bg-[#d7ecc8] text-[#4a6741]"
                                  : "border-gray-200 text-gray-500 hover:border-[#4a6741]/40"
                              }`}
                            >
                              {icon} {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-3">Personal Information</p>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="First Name" required name="firstName" value={form.firstName} onChange={handleChange} placeholder="Juan" icon={<IoPersonOutline />} error={errors.firstName} />
                            <Field label="Last Name" required name="lastName" value={form.lastName} onChange={handleChange} placeholder="Dela Cruz" icon={<IoPersonOutline />} error={errors.lastName} />
                          </div>
                          <Field label="Email" required type="email" name="email" value={form.email} onChange={handleChange} placeholder={form.userType === "employee" ? "employee@company.com" : "student@school.edu"} icon={<IoMailOutline />} error={errors.email} />
                        </div>
                      </div>

                      {form.userType === "student" ? (
                        <div>
                          <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-3">Academic Information</p>
                          <div className="space-y-3">
                            <Field
                              label="School ID" required name="schoolId" value={form.schoolId}
                              onChange={(e) => handleChange({ target: { name: "schoolId", value: e.target.value.toUpperCase() } })}
                              placeholder="STU-2024-XXX" icon={<MdTag />} error={errors.schoolId}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="Grade" name="gradeLevel" value={form.gradeLevel} onChange={handleChange} placeholder="e.g. Grade 7" icon={<IoSchoolOutline />} error={errors.gradeLevel} />
                              <Field label="Section (Optional)" name="section" value={form.section} onChange={handleChange} placeholder="A" icon={<IoPeopleOutline />} error={errors.section} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-3">Employment Information</p>
                          <div className="space-y-3">
                            <Field
                              label="Employee ID" required name="schoolId" value={form.schoolId}
                              onChange={(e) => handleChange({ target: { name: "schoolId", value: e.target.value.toUpperCase() } })}
                              placeholder="EMP-2024-XXX" icon={<MdTag />} error={errors.schoolId}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="e.g. Teacher" icon={<IoBriefcaseOutline />} error={errors.jobTitle} />
                              <Field label="Department" name="department" value={form.department} onChange={handleChange} placeholder="e.g. Science" icon={<IoPeopleOutline />} error={errors.department} />
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-1">Security</p>
                        <p className="text-xs text-gray-400 mb-3">Temporary password — user can change after login.</p>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Password" required type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 chars" icon={<IoLockClosedOutline />} error={errors.password} />
                          <Field label="Confirm Password" required type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat" icon={<IoLockClosedOutline />} error={errors.confirmPassword} />
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                  {created ? (
                    <>
                      <button
                        onClick={() => { setCreated(null); setForm(initialForm); setErrors({}); setApiError(""); }}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold py-2.5 rounded-xl transition"
                      >
                        <IoPersonAddOutline />
                        Add Another
                      </button>
                      <button
                        onClick={closePanel}
                        className="flex-1 border border-gray-200 hover:border-[#4a6741]/40 text-gray-600 hover:text-[#4a6741] text-sm font-medium py-2.5 rounded-xl transition"
                      >
                        Done
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="submit"
                        form="register-form"
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
                      >
                        <IoPersonAddOutline />
                        {submitting ? "Registering…" : form.userType === "employee" ? "Register Employee" : "Register Student"}
                      </button>
                      <button
                        type="button"
                        onClick={closePanel}
                        className="px-4 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

          </div>
        </>
      )}
    </AdminLayout>
  );
}
