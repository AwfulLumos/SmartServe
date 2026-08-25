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
  IoChevronDownOutline,
  IoFilterOutline,
  IoFunnelOutline,
  IoCheckmarkOutline,
  IoReceiptOutline,
  IoGiftOutline,
  IoInformationCircleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { MdTag } from "react-icons/md";

import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";
import { SkeletonTable, SkeletonList } from "../../components/SkeletonLoader";
import { useAuth } from "../../context/AuthContext";

// Helper function to resolve profile image URL to absolute path if needed
const resolveStudentImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (apiBase.startsWith("http")) {
    return `${apiBase.replace(/\/api\/?$/, "")}${url}`;
  }
  return url;
};

// Custom Filter Select component matching Feedbacks.jsx and portal design standard
function CustomFilterSelect({ value, onChange, options, icon: Icon, placeholder = "Select...", className = "" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`bg-gray-50 hover:bg-white border text-gray-700 text-xs font-semibold rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-sm transition outline-none ${value ? "border-[#4a6741] text-[#4a6741] bg-[#d7ecc8]/25" : "border-gray-200"
          }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {Icon && <Icon className="text-gray-400 text-sm flex-shrink-0" />}
          <span>{selectedOpt?.label || placeholder}</span>
        </span>
        <IoChevronDownOutline
          className={`text-gray-400 text-xs transition-transform duration-200 ${open ? "rotate-180 text-[#4a6741]" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition ${isSelected
                  ? "bg-[#e8f5e2] text-[#4a6741] font-bold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <span>{opt.label}</span>
                {isSelected && <IoCheckmarkOutline className="text-sm text-[#4a6741]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────
// Reusable field component
// Purpose: create a shared input box with icon, label, and error message.
// Runs when the page needs an input field in the form.
// Props:
// - label: the text shown above the input.
// - required: shows a red star if the field is required.
// - icon: small icon shown inside the input.
// - error: shows validation text below the field.
// - type: the HTML input type, like "text" or "password".
// - ...props: any other input properties like name, value, onChange.
// ─────────────────────────────
const Field = ({ label, required, icon, error, type = "text", ...props }) => {
  // showPwd stores whether the password field should be visible.
  // This is only used when the input type is "password".
  const [showPwd, setShowPwd] = useState(false);
  // isPassword is true when the field type is password.
  // It controls whether we show the eye toggle and hide the input text.
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
          // Show/hide password button
          // Purpose: let the user toggle between hidden and visible password text.
          // Runs only when this field is a password input.
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

const SelectField = ({ label, required, icon, error, children, ...props }) => {
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
        <select
          {...props}
          className={`w-full appearance-none no-custom-arrow pl-10 pr-9 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition bg-white
            ${error
              ? "border-red-300 focus:ring-red-200 focus:border-red-400"
              : "border-gray-200 focus:ring-[#4a6741]/20 focus:border-[#4a6741]"
            }`}
        >
          {children}
        </select>
        <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// Default empty form values used when opening the create panel or resetting the form.
// If this is missing, form state can become inconsistent between create/edit modes.
// ─────────────────────────────
// Initial form state
// Purpose: define the default blank values for the registration form.
// When the form opens, this object fills in the fields.
// If we did not use this, the form would start with undefined values.
// ─────────────────────────────
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

const studentGradeOptions = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const studentSectionOptions = ["A", "B", "C", "D", "E", "F", "G", "H"];
const employeeJobTitleOptions = ["Teacher", "Assistant Teacher", "Staff", "Coordinator", "Supervisor", "Admin Staff"];
const employeeDepartmentOptions = ["Academic", "Administration", "Finance", "HR", "ICT", "Library", "Maintenance", "Security", "Canteen"];

// Helper that converts the rendered QR code SVG into a downloadable PNG file.
// Without this, the QR code could be shown but users would not be able to save it as an image.
const downloadQR = (svgEl, filename) => {
  if (!svgEl) return;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  // Create a blank canvas to draw the SVG image onto.
  const canvas = document.createElement("canvas");
  const size = 300;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    // When the image loads, fill the canvas with white and draw the SVG image.
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
  // ─────────────────────────────
  // Component setup
  // Purpose: main React function component for the Register Student page.
  // When React renders this page, this function runs and sets up state, effects, and event handlers.
  // ─────────────────────────────
  const { user } = useAuth();

  // ─────────────────────────────
  // List state
  // Purpose: store the student/employee list and pagination values.
  // - students: array of users shown in the table.
  // - total: total number of users found by the backend.
  // - page: current page number for pagination.
  // - search: current search text typed by the admin.
  // - listLoading: true while the list is loading.
  // - limit: number of users per page.
  // ─────────────────────────────
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const limit = 10;

  const [viewDeleted, setViewDeleted] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  // Filter states
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [gradeLevelFilter, setGradeLevelFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const filterRef = useRef(null);

  // ─────────────────────────────
  // Modal / form state
  // Purpose: track which panel is open and the current form values.
  // - mode: controls whether create, view, edit, delete, or restore panel is shown.
  // - selectedStudent: the user object being viewed/edited/deleted/restored.
  // - form: the object containing all form field values.
  // - errors: validation messages for each form field.
  // - submitting: true while a create/edit/delete/restore request is in progress.
  // - apiError: backend error message shown to the admin.
  // - created: stores the newly created user after successful registration.
  // - qrRef: reference to the QR code element so it can be downloaded.
  // ─────────────────────────────
  const [mode, setMode] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [created, setCreated] = useState(null);
  const qrRef = useRef(null);

  // User Lookup activity states
  const [viewTab, setViewTab] = useState("overview");
  const [userOrders, setUserOrders] = useState([]);
  const [userByoc, setUserByoc] = useState([]);
  const [userRedemptions, setUserRedemptions] = useState([]);
  const [loadingUserData, setLoadingUserData] = useState(false);

  // ─────────────────────────────
  // Dropdown state and click outside handler
  // Purpose: close the action menu when the user clicks outside it.
  // useEffect runs once when the component mounts, and cleanup runs when it unmounts.
  // ─────────────────────────────
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterPopover(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─────────────────────────────
  // Fetch students from the backend
  // Purpose: get the current list of users from the server.
  // async/await is used so the code waits for the API call before updating state.
  // useCallback keeps the function stable so it only changes when search or page changes.
  // ─────────────────────────────
  const fetchStudents = useCallback(async () => {
    setListLoading(true);
    try {
      const { data } = await api.get("/students", {
        params: {
          search,
          page,
          limit,
          userType: userTypeFilter,
          isActive: statusFilter,
          isDeleted: viewDeleted ? "true" : "false",
          gradeLevel: gradeLevelFilter,
          department: departmentFilter,
        },
      });
      setStudents(data.students);
      setTotal(data.total);

      // Fetch soft-deleted accounts count for badge display
      api.get("/students", { params: { isDeleted: "true", limit: 1 } })
        .then((res) => setDeletedCount(res.data.total || 0))
        .catch(() => { });
    } catch {
      // If the API request fails, the list stays empty and the UI shows an empty state.
    } finally {
      setListLoading(false);
    }
  }, [search, page, userTypeFilter, statusFilter, viewDeleted, gradeLevelFilter, departmentFilter]);

  // ─────────────────────────────
  // Debounced search effect
  // Purpose: delay the API request slightly after typing, so the browser does not call the server on every keystroke.
  // This improves performance and avoids too many backend requests.
  // ─────────────────────────────
  useEffect(() => {
    const t = setTimeout(fetchStudents, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const totalPages = Math.ceil(total / limit);

  // ─────────────────────────────
  // Form helpers
  // Purpose: update the form state and validate user input before saving.
  // ─────────────────────────────
  // handleChange runs when any input field changes.
  // It uses destructuring to get name and value from the event target.
  // It uses the spread operator {...p} to keep the previous form values,
  // and update only the field that changed.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // validate checks the form before sending it to the server.
  // It returns an object with error messages for fields that are wrong.
  // If isEdit is true, password fields are optional unless the admin enters a new password.
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

  // closePanel resets the form and modal state.
  // It is used when the admin closes any panel or after a successful action.
  const closePanel = () => {
    setMode(null);
    setSelectedStudent(null);
    setForm(initialForm);
    setErrors({});
    setApiError("");
    setCreated(null);
  };

  // ─────────────────────────────
  // Open helpers
  // Purpose: switch the UI to create/view/edit/delete mode.
  // Each function sets the mode, and optionally loads a user into the form.
  // ─────────────────────────────
  const openCreate = () => {
    setCreated(null);
    setForm(initialForm);
    setErrors({});
    setApiError("");
    setMode("create");
  };

  const openView = async (s) => {
    setSelectedStudent(s);
    setMode("view");
    setViewTab("overview");
    setOpenMenuId(null);
    setLoadingUserData(true);
    try {
      const [ordersRes, byocRes, redemptionsRes] = await Promise.allSettled([
        api.get("/orders", { params: { search: s.schoolId } }),
        api.get("/byoc", { params: { search: s.schoolId } }),
        api.get("/redemptions", { params: { search: s.schoolId } }),
      ]);
      setUserOrders(ordersRes.status === "fulfilled" ? ordersRes.value?.data?.orders || [] : []);
      setUserByoc(byocRes.status === "fulfilled" ? byocRes.value?.data?.records || [] : []);
      setUserRedemptions(redemptionsRes.status === "fulfilled" ? redemptionsRes.value?.data?.redemptions || [] : []);
    } catch {
      // ignore
    } finally {
      setLoadingUserData(false);
    }
  };

  const openEdit = (s) => {
    // Split the full name into first name and the rest of the name.
    // This uses array destructuring: firstName gets the first word,
    // and rest becomes an array of the remaining words.
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

  const openRestore = (s) => {
    setSelectedStudent(s);
    setMode("restore");
    setOpenMenuId(null);
  };

  // ─────────────────────────────
  // Submit: Create
  // Purpose: send the new student/employee details to the backend API.
  // The async keyword means the function runs asynchronously and can wait for the server.
  // e.preventDefault() stops the browser from reloading the page when the form is submitted.
  // If there are validation errors, the function returns early and does not call the server.
  // ─────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate(false);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const schoolId = form.schoolId.trim().toUpperCase();
      const email = form.email.trim().toLowerCase();
      const { data: existingUser } = await api.get("/students/exists", {
        params: { schoolId, email },
      });

      if (existingUser.exists) {
        const duplicateErrors = {};
        if (existingUser.conflict?.schoolId) duplicateErrors.schoolId = "Already exists";
        if (existingUser.conflict?.email) duplicateErrors.email = "Already exists";
        setErrors(duplicateErrors);
        setApiError("A user with that ID or email already exists.");
        return;
      }

      const { data } = await api.post("/students", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email,
        schoolId,
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

  // ─────────────────────────────
  // Submit: Edit
  // Purpose: update an existing user and refresh the table.
  // The payload object is built from form fields, and password is only included when set.
  // This uses async/await so the code waits for the server response before continuing.
  // ─────────────────────────────
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

  // ─────────────────────────────
  // Submit: Delete (Soft Delete)
  // Purpose: soft-delete the selected user in the backend.
  // The code waits for api.delete() before refreshing the list.
  // ─────────────────────────────
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

  // ─────────────────────────────
  // Submit: Restore Account
  // Purpose: restore a soft-deleted user in the backend.
  // ─────────────────────────────
  const handleRestore = async () => {
    setSubmitting(true);
    try {
      await api.put(`/students/${selectedStudent._id}/restore`);
      fetchStudents();
      closePanel();
    } catch (err) {
      setApiError(err.response?.data?.message || "Restore failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // statusBadge returns a Tailwind CSS class string based on whether the user is active.
  // This is used to show a green badge for active users and a red badge for inactive users.
  const statusBadge = (active) =>
    active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500";

  // Render the admin page layout, including the user list, search controls, pagination,
  // and slide-in panel for create/view/edit/delete actions.
  // If this is removed, the component would not output any UI.
  return (
    <AdminLayout breadcrumb="Register User">
      {/* ─────────────────────────────
          Page header
          Purpose: show the page title, summary count, and Add User button.
          Runs every render so the header updates when total changes.
      ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
            <IoPeopleOutline className="text-3xl" />
            {viewDeleted ? "Deleted Accounts" : "User Management"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage registered student and staff accounts, view activity, and issue credentials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1 border border-gray-200">
            <button
              onClick={() => { setViewDeleted(false); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${!viewDeleted
                ? "bg-white text-[#4a6741] shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Active Accounts
            </button>
            <button
              onClick={() => { setViewDeleted(true); setPage(1); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${viewDeleted
                ? "bg-white text-red-600 shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <span>Deleted Accounts</span>
              {deletedCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${viewDeleted ? "bg-red-100 text-red-700 font-bold" : "bg-gray-200 text-gray-600"}`}>
                  {deletedCount}
                </span>
              )}
            </button>
          </div>
          {!viewDeleted && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <IoPersonAddOutline className="text-base" />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────
          Search, filter, and refresh controls
          Purpose: let the admin search and filter users and manually refresh the list.
          The input updates the search state and triggers fetchStudents with debounce.
      ───────────────────────────── */}
      {/* ─────────────────────────────
          Search, filter, and refresh controls card container
          Purpose: let the admin search and filter users and manually refresh the list.
      ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 min-w-[240px] relative">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            placeholder="Search by name, School ID or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4a6741] focus:bg-white transition"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              title="Clear search"
            >
              <IoCloseOutline className="text-lg" />
            </button>
          )}
        </div>

        {/* Action Controls (Inline Filters & Refresh) */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* User Type Filter */}
            <CustomFilterSelect
              value={userTypeFilter}
              onChange={(val) => {
                setUserTypeFilter(val);
                setGradeLevelFilter("");
                setDepartmentFilter("");
                setPage(1);
              }}
              options={[
                { value: "", label: "All Types" },
                { value: "student", label: "Student" },
                { value: "employee", label: "Employee" },
              ]}
            />

            {/* Status Filter */}
            <CustomFilterSelect
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Statuses" },
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
            />

            {/* Grade Level (Conditional) */}
            {userTypeFilter === "student" && (
              <CustomFilterSelect
                value={gradeLevelFilter}
                onChange={(val) => {
                  setGradeLevelFilter(val);
                  setPage(1);
                }}
                options={[
                  { value: "", label: "All Grades" },
                  ...studentGradeOptions.map((g) => ({ value: g, label: g })),
                ]}
              />
            )}

            {/* Department (Conditional) */}
            {userTypeFilter === "employee" && (
              <CustomFilterSelect
                value={departmentFilter}
                onChange={(val) => {
                  setDepartmentFilter(val);
                  setPage(1);
                }}
                options={[
                  { value: "", label: "All Departments" },
                  ...employeeDepartmentOptions.map((d) => ({ value: d, label: d })),
                ]}
              />
            )}

            {(userTypeFilter || statusFilter || gradeLevelFilter || departmentFilter) && (
              <button
                onClick={() => {
                  setUserTypeFilter("");
                  setStatusFilter("");
                  setGradeLevelFilter("");
                  setDepartmentFilter("");
                  setPage(1);
                }}
                className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 transition"
                title="Clear all filters"
              >
                Reset
              </button>
            )}
          </div>

          <button
            onClick={fetchStudents}
            className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-[#4a6741] hover:border-[#4a6741]/40 transition ml-auto md:ml-0"
            title="Refresh"
          >
            <IoRefreshOutline className={`text-base ${listLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────
          User table
          Purpose: show the list of users, or loading/empty states if there are none.
          Uses conditional rendering based on listLoading and students.length.
      ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="hidden md:grid grid-cols-[1fr_1.4fr_1fr_0.7fr_0.7fr_0.6fr_0.5fr_80px] items-center px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide rounded-t-2xl">
          <span>ID</span>
          <span>Name</span>
          <span>Email</span>
          <span>Grade / Dept</span>
          <span>Section / Title</span>
          <span>Type</span>
          <span>Status</span>
          <span className="text-center">Actions</span>
        </div>

        {/* If listLoading is true, show a loading spinner. Else if no students are found, show an empty message. Else show the student list. */}
        {listLoading ? (
          <div className="p-4">
            <SkeletonTable rows={6} columns={5} showHeader={false} />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <IoPersonAddOutline className="text-4xl" />
            <p className="text-sm">
              {search
                ? "No users match your search."
                : viewDeleted
                  ? "No soft-deleted accounts found."
                  : "No users registered yet."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {/* Render each student/employee row from the students array.
                The map() function loops over the list and returns one <li> per item.
                key={s._id} helps React identify which rows have changed.
            */}
            {students.map((s, idx) => {
              const isLastRow = idx >= students.length - 2 && students.length > 2;
              return (
                <li
                  key={s._id}
                  onClick={() => openView(s)}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr_0.7fr_0.7fr_0.6fr_0.5fr_80px] items-center px-5 py-3.5 hover:bg-gray-50 transition cursor-pointer"
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
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.userType === "employee" ? "bg-blue-100 text-blue-600" : "bg-[#d7ecc8] text-[#4a6741]"
                      }`}>
                      {s.userType === "employee" ? "Employee" : "Student"}
                    </span>
                  </span>
                  <span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.isDeleted ? "bg-red-100 text-red-600" : statusBadge(s.isActive)}`}>
                      {s.isDeleted ? "Deleted" : s.isActive ? "Active" : "Inactive"}
                    </span>
                  </span>
                  <div className="relative flex justify-center" ref={openMenuId === s._id ? menuRef : null}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === s._id ? null : s._id); }}
                      className="text-gray-400 hover:text-gray-600 transition flex justify-center p-1 rounded-md hover:bg-gray-100"
                    >
                      <IoEllipsisVertical />
                    </button>
                    {openMenuId === s._id && (
                      <div className={`absolute right-0 ${isLastRow ? "bottom-8" : "top-8"} w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); openView(s); }}
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <IoSearchOutline className="text-[#4a6741]" /> User Lookup
                        </button>
                        {s.isDeleted ? (
                          user?.role === "admin" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openRestore(s); }}
                              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 font-semibold"
                            >
                              <IoRefreshOutline className="text-base" /> Restore
                            </button>
                          )
                        ) : (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <IoPencilOutline className="text-blue-500" /> Edit
                            </button>
                            {user?.role === "admin" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); openDelete(s); }}
                                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50"
                              >
                                <IoTrashOutline /> Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
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

      {/* ─────────────────────────────
          Slide-in panel block
          Purpose: show a side panel when the admin opens view/edit/delete/create.
          The panel appears only when mode is not null.
      ───────────────────────────── */}
      {mode !== null && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closePanel} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden">

            {/* ─────────────────────────────
                View / User Lookup panel
                Purpose: show complete user lookup details & activity logs.
            ───────────────────────────── */}
            {mode === "view" && selectedStudent && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f9fbf8]">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const profileUrl = resolveStudentImageUrl(selectedStudent.profileImage || selectedStudent.profileImageUrl);
                      return (
                        <div className="w-10 h-10 rounded-full bg-[#d7ecc8] flex items-center justify-center text-lg font-bold text-[#4a6741] overflow-hidden shadow-sm border border-[#4a6741]/20 flex-shrink-0">
                          {profileUrl ? (
                            <img
                              src={profileUrl}
                              alt={selectedStudent.fullName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget.nextElementSibling;
                                if (fallback) fallback.style.display = "block";
                              }}
                            />
                          ) : null}
                          <span className={profileUrl ? "hidden" : "block"}>
                            {selectedStudent.fullName?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      );
                    })()}
                    <div>
                      <h2 className="font-bold text-gray-800 text-base leading-tight">{selectedStudent.fullName}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-[#4a6741] font-semibold">{selectedStudent.schoolId}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${selectedStudent.userType === "employee" ? "bg-blue-100 text-blue-600" : "bg-[#d7ecc8] text-[#4a6741]"}`}>
                          {selectedStudent.userType === "employee" ? "Employee" : "Student"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={closePanel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/60 text-gray-400 hover:text-gray-600 transition">
                    <IoCloseOutline className="text-xl" />
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-100 bg-white px-4 gap-1 overflow-x-auto">
                  {[
                    { id: "overview", label: "Overview", icon: <IoInformationCircleOutline className="text-base" /> },
                    { id: "orders", label: `Orders (${userOrders.length})`, icon: <IoReceiptOutline className="text-base" /> },
                    { id: "byoc", label: `BYOC (${userByoc.length})`, icon: <IoLeafOutline className="text-base" /> },
                    { id: "redemptions", label: `Redemptions (${userRedemptions.length})`, icon: <IoGiftOutline className="text-base" /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setViewTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${viewTab === tab.id
                        ? "border-[#4a6741] text-[#4a6741]"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {loadingUserData ? (
                    <div className="p-4">
                      <SkeletonList count={4} />
                    </div>
                  ) : (
                    <>
                      {/* TAB 1: OVERVIEW */}
                      {viewTab === "overview" && (
                        <div className="space-y-5">
                          {/* Quick Eco Metrics */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#f0f7ec] p-3.5 rounded-xl border border-[#d7ecc8] flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#4a6741] text-white flex items-center justify-center text-lg flex-shrink-0">
                                <IoLeafOutline />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-[#4a6741] uppercase tracking-wider">Eco Points</p>
                                <p className="text-lg font-bold text-gray-800">{selectedStudent.points ?? 0} <span className="text-xs font-normal text-gray-500">pts</span></p>
                              </div>
                            </div>

                            <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg flex-shrink-0">
                                <IoBriefcaseOutline />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">BYOC Count</p>
                                <p className="text-lg font-bold text-gray-800">{selectedStudent.byocCount ?? 0} <span className="text-xs font-normal text-gray-500">times</span></p>
                              </div>
                            </div>
                          </div>

                          {/* Info Table */}
                          <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100 text-xs">
                            {[
                              [<IoIdCardOutline className="text-[#4a6741]" />, selectedStudent.userType === "employee" ? "Employee ID" : "School ID", selectedStudent.schoolId],
                              [<IoMailOutline className="text-[#4a6741]" />, "Email Address", selectedStudent.email],
                              selectedStudent.userType === "employee"
                                ? [<IoBriefcaseOutline className="text-[#4a6741]" />, "Job Title", selectedStudent.jobTitle || "—"]
                                : [<IoCalendarOutline className="text-[#4a6741]" />, "Grade Level", selectedStudent.gradeLevel || "—"],
                              selectedStudent.userType === "employee"
                                ? [<IoPeopleOutline className="text-[#4a6741]" />, "Department", selectedStudent.department || "—"]
                                : [<IoPeopleOutline className="text-[#4a6741]" />, "Section", selectedStudent.section || "—"],
                              [<IoEllipsisVertical className="text-[#4a6741]" />, "Account Status", selectedStudent.isDeleted ? "Soft-Deleted" : selectedStudent.isActive ? "Active" : "Inactive"],
                            ].map(([icon, label, value], i) => (
                              <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <span className="text-base flex-shrink-0">{icon}</span>
                                <span className="text-gray-400 w-32 flex-shrink-0">{label}</span>
                                <span className="font-semibold text-gray-700 truncate">{String(value)}</span>
                              </div>
                            ))}
                          </div>

                          {/* QR Code Section */}
                          {selectedStudent.qrToken && (
                            <div className="flex flex-col items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide">Personal QR Code</p>
                              <div ref={qrRef} className="p-4 border-2 border-[#4a6741]/20 rounded-2xl bg-white shadow-sm">
                                <QRCode value={selectedStudent.qrToken} size={150} fgColor="#4a6741" bgColor="#ffffff" level="M" />
                              </div>
                              <button
                                onClick={() => downloadQR(qrRef.current?.querySelector("svg"), `${selectedStudent.schoolId}-QR.png`)}
                                className="flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm"
                              >
                                <IoDownloadOutline /> Download QR Code
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 2: ORDERS */}
                      {viewTab === "orders" && (
                        <div className="space-y-3">
                          {userOrders.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                              <IoReceiptOutline className="text-3xl" />
                              <p>No canteen orders found for this user.</p>
                            </div>
                          ) : (
                            userOrders.map((ord) => (
                              <div key={ord._id} className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-mono font-bold text-[#4a6741]">{ord.orderNumber}</span>
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${ord.status === "completed" ? "bg-green-100 text-green-700" :
                                    ord.status === "cancelled" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                                    }`}>
                                    {ord.status}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                  {ord.items?.map((item, i) => (
                                    <div key={i} className="flex justify-between">
                                      <span>{item.quantity}x {item.name}</span>
                                      <span className="font-mono">₱{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200/60 text-xs font-bold text-gray-800">
                                  <span className="text-[10px] font-normal text-gray-400">
                                    {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span>Total: ₱{Number(ord.total).toFixed(2)}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* TAB 3: BYOC */}
                      {viewTab === "byoc" && (
                        <div className="space-y-3">
                          {userByoc.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                              <IoLeafOutline className="text-3xl" />
                              <p>No BYOC container logs found for this user.</p>
                            </div>
                          ) : (
                            userByoc.map((b) => (
                              <div key={b._id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-semibold text-gray-800">+{b.ecoPoints} Eco Points Earned 🌿</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">Approved by: {b.confirmedByName || "Staff"}</p>
                                </div>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(b.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* TAB 4: REDEMPTIONS */}
                      {viewTab === "redemptions" && (
                        <div className="space-y-3">
                          {userRedemptions.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                              <IoGiftOutline className="text-3xl" />
                              <p>No reward redemptions found for this user.</p>
                            </div>
                          ) : (
                            userRedemptions.map((r) => (
                              <div key={r._id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-semibold text-gray-800">🎁 {r.rewardName}</p>
                                  <p className="text-[10px] text-purple-600 font-medium mt-0.5">Used {r.pointsUsed} points</p>
                                </div>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(r.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50">
                  <button
                    onClick={() => openEdit(selectedStudent)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold py-2.5 rounded-xl transition"
                  >
                    <IoPencilOutline /> Edit Account
                  </button>
                  <button onClick={closePanel} className="px-4 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition">
                    Close
                  </button>
                </div>
              </>
            )}

            {/* ─────────────────────────────
                Edit panel
                Purpose: show the edit form for the selected user.
                This renders only when mode is "edit" and selectedStudent exists.
            ───────────────────────────── */}
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

                    {/* User Type Toggle
                        Purpose: show buttons for selecting Student or Employee.
                        .map() loops over the array and creates one button per option.
                        The callback receives [val, label, icon] for each button.
                    */}
                    <div>
                      <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-3">User Type</p>
                      <div className="flex gap-2">
                        {[["student", "Student", <IoSchoolOutline />], ["employee", "Employee", <IoBriefcaseOutline />]].map(([val, label, icon]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, userType: val, gradeLevel: "", section: "", jobTitle: "", department: "" }))}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${form.userType === val
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

                    {/* If userType is student, show school-related fields. Else show employee fields. */}
                    {form.userType === "student" ? (
                      <div>
                        <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-3">Academic Information</p>
                        <div className="space-y-3">
                          {/* Convert school/employee ID to uppercase as the user types.
                              This ensures IDs are stored in a consistent format.
                          */}
                          {/* Convert school/employee ID to uppercase as the user types.
                              This ensures IDs are stored in a consistent format.
                          */}
                          <Field
                            label="School ID" required name="schoolId" value={form.schoolId}
                            onChange={(e) => handleChange({ target: { name: "schoolId", value: e.target.value.toUpperCase() } })}
                            placeholder="STU-2024-XXX" icon={<MdTag />} error={errors.schoolId}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <SelectField label="Grade" name="gradeLevel" value={form.gradeLevel} onChange={handleChange} icon={<IoSchoolOutline />} error={errors.gradeLevel}>
                              <option value="">Select grade</option>
                              {studentGradeOptions.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                            </SelectField>
                            <SelectField label="Section (Optional)" name="section" value={form.section} onChange={handleChange} icon={<IoPeopleOutline />} error={errors.section}>
                              <option value="">Select section</option>
                              {studentSectionOptions.map((section) => <option key={section} value={section}>{`Section ${section}`}</option>)}
                            </SelectField>
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
                            <SelectField label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} icon={<IoBriefcaseOutline />} error={errors.jobTitle}>
                              <option value="">Select job title</option>
                              {employeeJobTitleOptions.map((jobTitle) => <option key={jobTitle} value={jobTitle}>{jobTitle}</option>)}
                            </SelectField>
                            <SelectField label="Department" name="department" value={form.department} onChange={handleChange} icon={<IoPeopleOutline />} error={errors.department}>
                              <option value="">Select department</option>
                              {employeeDepartmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
                            </SelectField>
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

            {/* ─────────────────────────────
                Delete panel (Soft Delete)
                Purpose: confirm soft-deletion for the selected user.
                This renders only when mode is "delete" and selectedStudent exists.
            ───────────────────────────── */}
            {mode === "delete" && selectedStudent && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <p className="font-bold text-red-600 text-base">Delete User</p>
                  <button onClick={closePanel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                    <IoCloseOutline className="text-xl" />
                  </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-5">
                  {(() => {
                    const profileUrl = resolveStudentImageUrl(selectedStudent.profileImage || selectedStudent.profileImageUrl);
                    return (
                      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-2xl font-bold text-red-500 overflow-hidden shadow-md border-2 border-red-100 flex-shrink-0">
                        {profileUrl ? (
                          <img
                            src={profileUrl}
                            alt={selectedStudent.fullName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.style.display = "block";
                            }}
                          />
                        ) : null}
                        <span className={profileUrl ? "hidden" : "block"}>
                          {selectedStudent.fullName?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    );
                  })()}
                  <div className="text-center">
                    <p className="font-bold text-gray-800 text-lg">{selectedStudent.fullName}</p>
                    <p className="text-xs font-mono text-gray-400">{selectedStudent.schoolId}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2 w-full text-sm text-amber-800">
                    <IoAlertCircleOutline className="text-lg flex-shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      This user account will be soft-deleted. The user will be hidden from active lists and unable to log in, but no data will be erased from MongoDB. You can restore this account anytime from the <strong>Deleted Accounts</strong> tab.
                    </span>
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
                    {submitting ? "Deleting…" : "Soft Delete Account"}
                  </button>
                  <button onClick={closePanel} className="px-4 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition">
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* ─────────────────────────────
                Restore panel
                Purpose: confirm restoring a soft-deleted user account.
                This renders only when mode is "restore" and selectedStudent exists.
            ───────────────────────────── */}
            {mode === "restore" && selectedStudent && (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <p className="font-bold text-emerald-600 text-base">Restore User Account</p>
                  <button onClick={closePanel} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                    <IoCloseOutline className="text-xl" />
                  </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-600">
                    <IoRefreshOutline className="text-3xl" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800 text-lg">{selectedStudent.fullName}</p>
                    <p className="text-xs font-mono text-gray-400">{selectedStudent.schoolId}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-2 w-full text-sm text-emerald-800">
                    <IoCheckmarkCircle className="text-lg flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>
                      Restoring this account will set its status to active, allowing the user to sign in and appear in active user lists again.
                    </span>
                  </div>
                  {apiError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 w-full">
                      {apiError}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={handleRestore}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60"
                  >
                    <IoRefreshOutline className="text-base" />
                    {submitting ? "Restoring…" : "Restore Account"}
                  </button>
                  <button onClick={closePanel} className="px-4 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition">
                    Cancel
                  </button>
                </div>
              </>
            )}

            {/* ─────────────────────────────
                Create panel
                Purpose: show the registration form for a new user.
                This renders only when mode is "create".
            ───────────────────────────── */}
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
                  {/* If created has a value, show the success screen instead of the registration form. */}
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
                        {/* User Type Toggle
                            Purpose: choose whether the new user is a student or employee.
                            The .map() call creates one button for each option.
                            The callback receives [val, label, icon] for each button.
                        */}
                        <div className="flex gap-2">
                          {[["student", "Student", <IoSchoolOutline />], ["employee", "Employee", <IoBriefcaseOutline />]].map(([val, label, icon]) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, userType: val, gradeLevel: "", section: "", jobTitle: "", department: "" }))}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${form.userType === val
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
                              <SelectField label="Grade" name="gradeLevel" value={form.gradeLevel} onChange={handleChange} icon={<IoSchoolOutline />} error={errors.gradeLevel}>
                                <option value="">Select grade</option>
                                {studentGradeOptions.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                              </SelectField>
                              <SelectField label="Section (Optional)" name="section" value={form.section} onChange={handleChange} icon={<IoPeopleOutline />} error={errors.section}>
                                <option value="">Select section</option>
                                {studentSectionOptions.map((section) => <option key={section} value={section}>{`Section ${section}`}</option>)}
                              </SelectField>
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
                              <SelectField label="Job Title" name="jobTitle" value={form.jobTitle} onChange={handleChange} icon={<IoBriefcaseOutline />} error={errors.jobTitle}>
                                <option value="">Select job title</option>
                                {employeeJobTitleOptions.map((jobTitle) => <option key={jobTitle} value={jobTitle}>{jobTitle}</option>)}
                              </SelectField>
                              <SelectField label="Department" name="department" value={form.department} onChange={handleChange} icon={<IoPeopleOutline />} error={errors.department}>
                                <option value="">Select department</option>
                                {employeeDepartmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
                              </SelectField>
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
