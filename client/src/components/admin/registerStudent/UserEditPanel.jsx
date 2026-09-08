import {
  IoCloseOutline,
  IoSchoolOutline,
  IoBriefcaseOutline,
  IoPersonOutline,
  IoMailOutline,
  IoPeopleOutline,
  IoLockClosedOutline,
  IoPencilOutline,
} from "react-icons/io5";
import { MdTag } from "react-icons/md";
import { Field, SelectField } from "./RegisterFormFields";
import {
  studentGradeOptions,
  studentSectionOptions,
  employeeJobTitleOptions,
  employeeDepartmentOptions,
} from "./RegisterConstants";

export default function UserEditPanel({
  selectedStudent,
  form,
  setForm,
  errors,
  apiError,
  submitting,
  onChange,
  onEditSubmit,
  onClose,
}) {
  if (!selectedStudent) return null;

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p className="font-bold text-[#4a6741] text-base">Edit User</p>
          <p className="text-xs text-gray-400 mt-0.5">{selectedStudent.fullName}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer">
          <IoCloseOutline className="text-xl" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <form id="edit-form" onSubmit={onEditSubmit} className="px-6 py-5 space-y-5">
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
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition cursor-pointer ${form.userType === val
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
                <Field label="First Name" required name="firstName" value={form.firstName} onChange={onChange} placeholder="Juan" icon={<IoPersonOutline />} error={errors.firstName} />
                <Field label="Last Name" required name="lastName" value={form.lastName} onChange={onChange} placeholder="Dela Cruz" icon={<IoPersonOutline />} error={errors.lastName} />
              </div>
              <Field label="Email" required type="email" name="email" value={form.email} onChange={onChange} placeholder={form.userType === "employee" ? "employee@company.com" : "student@school.edu"} icon={<IoMailOutline />} error={errors.email} />
            </div>
          </div>

          {/* Conditional Academic vs Employment fields */}
          {form.userType === "student" ? (
            <div>
              <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-3">Academic Information</p>
              <div className="space-y-3">
                <Field
                  label="School ID" required name="schoolId" value={form.schoolId}
                  onChange={(e) => onChange({ target: { name: "schoolId", value: e.target.value.toUpperCase() } })}
                  placeholder="STU-2024-XXX" icon={<MdTag />} error={errors.schoolId}
                />
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Grade" name="gradeLevel" value={form.gradeLevel} onChange={onChange} icon={<IoSchoolOutline />} error={errors.gradeLevel}>
                    <option value="">Select grade</option>
                    {studentGradeOptions.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                  </SelectField>
                  <SelectField label="Section (Optional)" name="section" value={form.section} onChange={onChange} icon={<IoPeopleOutline />} error={errors.section}>
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
                  onChange={(e) => onChange({ target: { name: "schoolId", value: e.target.value.toUpperCase() } })}
                  placeholder="EMP-2024-XXX" icon={<MdTag />} error={errors.schoolId}
                />
                <div className="grid grid-cols-2 gap-3">
                  <SelectField label="Job Title" name="jobTitle" value={form.jobTitle} onChange={onChange} icon={<IoBriefcaseOutline />} error={errors.jobTitle}>
                    <option value="">Select job title</option>
                    {employeeJobTitleOptions.map((jobTitle) => <option key={jobTitle} value={jobTitle}>{jobTitle}</option>)}
                  </SelectField>
                  <SelectField label="Department" name="department" value={form.department} onChange={onChange} icon={<IoPeopleOutline />} error={errors.department}>
                    <option value="">Select department</option>
                    {employeeDepartmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
                  </SelectField>
                </div>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold text-[#4a6741] uppercase tracking-wide mb-1">Change Password</p>
            <p className="text-xs text-[#4a6741]/80 mb-3 font-normal">Leave blank to keep the existing password.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="New Password" type="password" name="password" value={form.password} onChange={onChange} placeholder="Min. 6 chars" icon={<IoLockClosedOutline />} error={errors.password} />
              <Field label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} placeholder="Repeat" icon={<IoLockClosedOutline />} error={errors.confirmPassword} />
            </div>
          </div>
        </form>
      </div>
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
        <button
          type="submit"
          form="edit-form"
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 bg-[#4a6741] hover:bg-[#3a5333] text-white text-sm font-semibold py-2.5 rounded-xl transition disabled:opacity-60 cursor-pointer"
        >
          <IoPencilOutline />
          {submitting ? "Saving…" : "Save Changes"}
        </button>
        <button type="button" onClick={onClose} className="px-4 border border-gray-200 hover:border-gray-300 text-gray-500 text-sm font-medium py-2.5 rounded-xl transition cursor-pointer">
          Cancel
        </button>
      </div>
    </>
  );
}
