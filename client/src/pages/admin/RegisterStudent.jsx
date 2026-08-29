import { useState, useEffect, useRef, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { initialForm } from "../../components/admin/registerStudent/RegisterConstants";
import RegisterHeader from "../../components/admin/registerStudent/RegisterHeader";
import RegisterFilterBar from "../../components/admin/registerStudent/RegisterFilterBar";
import RegisterTable from "../../components/admin/registerStudent/RegisterTable";
import UserLookupPanel from "../../components/admin/registerStudent/UserLookupPanel";
import UserEditPanel from "../../components/admin/registerStudent/UserEditPanel";
import UserDeletePanel from "../../components/admin/registerStudent/UserDeletePanel";
import UserRestorePanel from "../../components/admin/registerStudent/UserRestorePanel";
import UserCreatePanel from "../../components/admin/registerStudent/UserCreatePanel";

export default function RegisterStudent() {
  const { user } = useAuth();

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const limit = 10;

  const [viewDeleted, setViewDeleted] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [gradeLevelFilter, setGradeLevelFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [mode, setMode] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [created, setCreated] = useState(null);

  const qrRef = useRef(null);

  const [viewTab, setViewTab] = useState("overview");
  const [userOrders, setUserOrders] = useState([]);
  const [userByoc, setUserByoc] = useState([]);
  const [userRedemptions, setUserRedemptions] = useState([]);
  const [loadingUserData, setLoadingUserData] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchStudents = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await api.get("/students", {
        params: {
          page,
          limit,
          search: search || undefined,
          isDeleted: viewDeleted ? "true" : "false",
          userType: userTypeFilter || undefined,
          isActive: statusFilter !== "" ? statusFilter : undefined,
          gradeLevel: userTypeFilter === "student" && gradeLevelFilter ? gradeLevelFilter : undefined,
          department: userTypeFilter === "employee" && departmentFilter ? departmentFilter : undefined,
        },
      });
      setStudents(res.data?.students || []);
      setTotal(res.data?.total || 0);

      if (!viewDeleted) {
        const delRes = await api.get("/students", { params: { isDeleted: "true", limit: 1 } });
        setDeletedCount(delRes.data?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  }, [page, limit, search, viewDeleted, userTypeFilter, statusFilter, gradeLevelFilter, departmentFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    setPage(1);
  }, [search, viewDeleted, userTypeFilter, statusFilter, gradeLevelFilter, departmentFilter]);

  const fetchUserData = async (student) => {
    if (!student) return;
    setLoadingUserData(true);
    try {
      const search = student.schoolId;
      const [ordRes, byocRes, redRes] = await Promise.all([
        api.get("/orders", { params: { search } }),
        api.get("/byoc", { params: { search } }),
        api.get("/redemptions", { params: { search } }),
      ]);
      setUserOrders(ordRes.data?.orders || []);
      setUserByoc(byocRes.data?.records || []);
      setUserRedemptions(redRes.data?.redemptions || []);
    } catch (err) {
      console.error("Error fetching user lookup details:", err);
    } finally {
      setLoadingUserData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  const validate = (isEdit = false) => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";

    if (form.userType === "student") {
      if (!form.schoolId.trim()) e.schoolId = "School ID is required";
    } else {
      if (!form.schoolId.trim()) e.schoolId = "Employee ID is required";
    }

    if (!isEdit) {
      if (!form.password) e.password = "Password is required";
      else if (form.password.length < 6) e.password = "Min. 6 characters";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    } else {
      if (form.password) {
        if (form.password.length < 6) e.password = "Min. 6 characters";
        if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const closePanel = () => {
    setMode(null);
    setSelectedStudent(null);
    setForm(initialForm);
    setErrors({});
    setApiError("");
    setCreated(null);
  };

  const openCreate = () => {
    setMode("create");
    setSelectedStudent(null);
    setForm(initialForm);
    setErrors({});
    setApiError("");
    setCreated(null);
  };

  const openView = (s) => {
    setSelectedStudent(s);
    setMode("view");
    setViewTab("overview");
    setOpenMenuId(null);
    fetchUserData(s);
  };

  const openEdit = (s) => {
    setSelectedStudent(s);
    setForm({
      firstName: s.firstName || s.fullName?.split(" ")[0] || "",
      lastName: s.lastName || s.fullName?.split(" ").slice(1).join(" ") || "",
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
    setApiError("");
    setMode("delete");
    setOpenMenuId(null);
  };

  const openRestore = (s) => {
    setSelectedStudent(s);
    setApiError("");
    setMode("restore");
    setOpenMenuId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(false)) return;
    setSubmitting(true);
    setApiError("");
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        schoolId: form.schoolId.trim(),
        userType: form.userType,
        password: form.password,
      };

      if (form.userType === "student") {
        if (form.gradeLevel) payload.gradeLevel = form.gradeLevel;
        if (form.section) payload.section = form.section;
      } else {
        if (form.jobTitle) payload.jobTitle = form.jobTitle;
        if (form.department) payload.department = form.department;
      }

      const res = await api.post("/students", payload);
      setCreated(res.data.student || res.data);
      fetchStudents();
    } catch (err) {
      setApiError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validate(true)) return;
    setSubmitting(true);
    setApiError("");
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        schoolId: form.schoolId.trim(),
        userType: form.userType,
      };

      if (form.userType === "student") {
        payload.gradeLevel = form.gradeLevel || "";
        payload.section = form.section || "";
        payload.jobTitle = "";
        payload.department = "";
      } else {
        payload.jobTitle = form.jobTitle || "";
        payload.department = form.department || "";
        payload.gradeLevel = "";
        payload.section = "";
      }

      if (form.password) payload.password = form.password;

      const res = await api.put(`/students/${selectedStudent._id}`, payload);
      const updatedStudent = res.data.student || res.data;
      setStudents((prev) => prev.map((s) => (s && s._id === selectedStudent._id ? updatedStudent : s)));
      fetchStudents();
      closePanel();
    } catch (err) {
      setApiError(err.response?.data?.message || "Update failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    setApiError("");
    try {
      await api.delete(`/students/${selectedStudent._id}`);
      fetchStudents();
      closePanel();
    } catch (err) {
      setApiError(err.response?.data?.message || "Delete failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestore = async () => {
    setSubmitting(true);
    setApiError("");
    try {
      await api.put(`/students/${selectedStudent._id}/restore`);
      fetchStudents();
      closePanel();
    } catch (err) {
      setApiError(err.response?.data?.message || "Restore failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetFilters = () => {
    setUserTypeFilter("");
    setStatusFilter("");
    setGradeLevelFilter("");
    setDepartmentFilter("");
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AdminLayout>
      <RegisterHeader
        viewDeleted={viewDeleted}
        onToggleViewDeleted={setViewDeleted}
        deletedCount={deletedCount}
        onOpenCreate={openCreate}
      />

      <RegisterFilterBar
        search={search}
        onSearchChange={setSearch}
        userTypeFilter={userTypeFilter}
        onUserTypeFilterChange={setUserTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        gradeLevelFilter={gradeLevelFilter}
        onGradeLevelFilterChange={setGradeLevelFilter}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        onResetFilters={resetFilters}
        onRefresh={fetchStudents}
        listLoading={listLoading}
      />

      <RegisterTable
        students={students}
        listLoading={listLoading}
        search={search}
        viewDeleted={viewDeleted}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        openMenuId={openMenuId}
        menuRef={menuRef}
        onToggleMenu={(id) => setOpenMenuId(openMenuId === id ? null : id)}
        onOpenView={openView}
        onOpenEdit={openEdit}
        onOpenDelete={openDelete}
        onOpenRestore={openRestore}
        currentUserRole={user?.role}
      />

      {/* Slide-in side panel modal */}
      {mode !== null && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closePanel} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden">
            {mode === "view" && (
              <UserLookupPanel
                selectedStudent={selectedStudent}
                viewTab={viewTab}
                onSetViewTab={setViewTab}
                userOrders={userOrders}
                userByoc={userByoc}
                userRedemptions={userRedemptions}
                loadingUserData={loadingUserData}
                qrRef={qrRef}
                onOpenEdit={openEdit}
                onClose={closePanel}
              />
            )}

            {mode === "edit" && (
              <UserEditPanel
                selectedStudent={selectedStudent}
                form={form}
                setForm={setForm}
                errors={errors}
                apiError={apiError}
                submitting={submitting}
                onChange={handleChange}
                onEditSubmit={handleEdit}
                onClose={closePanel}
              />
            )}

            {mode === "delete" && (
              <UserDeletePanel
                selectedStudent={selectedStudent}
                submitting={submitting}
                apiError={apiError}
                onDeleteSubmit={handleDelete}
                onClose={closePanel}
              />
            )}

            {mode === "restore" && (
              <UserRestorePanel
                selectedStudent={selectedStudent}
                submitting={submitting}
                apiError={apiError}
                onRestoreSubmit={handleRestore}
                onClose={closePanel}
              />
            )}

            {mode === "create" && (
              <UserCreatePanel
                created={created}
                form={form}
                setForm={setForm}
                errors={errors}
                apiError={apiError}
                submitting={submitting}
                qrRef={qrRef}
                onChange={handleChange}
                onRegisterSubmit={handleSubmit}
                onResetCreate={() => {
                  setCreated(null);
                  setForm(initialForm);
                  setErrors({});
                  setApiError("");
                }}
                onClose={closePanel}
              />
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
