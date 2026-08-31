import React, { useState } from "react";
import { useStudentAuth } from "../../../context/StudentAuthContext";
import toast from "react-hot-toast";

import ProfileMenuList from "./ProfileMenuList";
import AccountSettingsTab from "./AccountSettingsTab";
import PreferencesTab from "./PreferencesTab";
import EcoProgramTab from "./EcoProgramTab";
import FeedbackTab from "./FeedbackTab";
import SupportHelpTab from "./SupportHelpTab";

function resolveStudentImageUrl(profileImage) {
  if (!profileImage) return "";
  if (/^https?:\/\//i.test(profileImage)) return profileImage;

  const apiBase = import.meta.env.VITE_API_URL || "/api";
  if (/^https?:\/\//i.test(apiBase)) {
    const host = apiBase.replace(/\/?api\/?$/, "");
    return `${host}${profileImage.startsWith("/") ? "" : "/"}${profileImage}`;
  }

  return profileImage;
}

export default function ProfileView({ student, onClose, onLogout }) {
  const { updateProfile, updateProfilePhoto, changePassword, refreshStudent } = useStudentAuth();
  const [activeTab, setActiveTab] = useState("menu");
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: student?.fullName ?? "",
    email: student?.email ?? "",
    gradeLevel: student?.gradeLevel ?? "",
    section: student?.section ?? "",
    jobTitle: student?.jobTitle ?? "",
    department: student?.department ?? "",
  });

  const [passForm, setPassForm] = useState({
    currentPassword: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPass, setChangingPass] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("smartserve_dark_mode") === "true";
    } catch {
      return false;
    }
  });

  const [byocReminder, setByocReminder] = useState(() => {
    try {
      return localStorage.getItem("smartserve_byoc_reminder") || "08:00";
    } catch {
      return "08:00";
    }
  });

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    const result = await updateProfile(editForm);
    setSavingProfile(false);

    if (result.success) {
      toast.success("Profile updated!");
      refreshStudent();
    } else {
      toast.error(result.message || "Failed to update profile");
    }
  }

  async function handlePhotoSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size limit exceeded. Maximum image size is 2MB.");
      return;
    }

    setUploadingImage(true);
    const result = await updateProfilePhoto(file);
    setUploadingImage(false);
    if (e.target) e.target.value = "";

    if (result.success) {
      toast.success("Profile picture updated!");
      refreshStudent();
    } else {
      toast.error(result.message || "Failed to upload photo");
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    const currentPw = passForm.currentPassword || passForm.oldPassword;
    if (!currentPw) {
      toast.error("Current password is required.");
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setChangingPass(true);
    const result = await changePassword(
      currentPw,
      passForm.newPassword,
      passForm.confirmPassword
    );
    setChangingPass(false);

    if (result.success) {
      toast.success(result.message || "Password changed successfully!");
      setPassForm({ currentPassword: "", oldPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(result.message || "Failed to change password");
    }
  }

  function handleDarkModeToggle() {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    localStorage.setItem("smartserve_dark_mode", String(nextVal));
    if (nextVal) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(nextVal ? "Dark mode enabled" : "Light mode enabled");
  }

  function handleByocTimeChange(timeStr) {
    setByocReminder(timeStr);
    localStorage.setItem("smartserve_byoc_reminder", timeStr);
    toast.success(`BYOC daily reminder set for ${timeStr}`);
  }

  const profileImageUrl = resolveStudentImageUrl(student?.profileImage);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto pb-20 bg-gray-50 dark:bg-[#0f170a] font-sans">
      {activeTab === "menu" ? (
        <ProfileMenuList
          student={student}
          profileImageUrl={profileImageUrl}
          photoUploading={uploadingImage}
          handlePhotoSelected={handlePhotoSelected}
          onSelectTab={setActiveTab}
          onClose={onClose}
          onLogout={onLogout}
        />
      ) : activeTab === "account" ? (
        <AccountSettingsTab
          student={student}
          editForm={editForm}
          setEditForm={setEditForm}
          savingProfile={savingProfile}
          handleSaveProfile={handleSaveProfile}
          passForm={passForm}
          setPassForm={setPassForm}
          changingPass={changingPass}
          handleChangePassword={handleChangePassword}
          onBack={() => setActiveTab("menu")}
        />
      ) : activeTab === "preferences" ? (
        <PreferencesTab
          darkMode={darkMode}
          onDarkModeToggle={handleDarkModeToggle}
          onBack={() => setActiveTab("menu")}
        />
      ) : activeTab === "eco" ? (
        <EcoProgramTab
          student={student}
          byocReminder={byocReminder}
          onByocTimeChange={handleByocTimeChange}
          onBack={() => setActiveTab("menu")}
        />
      ) : activeTab === "feedback" ? (
        <FeedbackTab onBack={() => setActiveTab("menu")} />
      ) : activeTab === "support" ? (
        <SupportHelpTab onBack={() => setActiveTab("menu")} />
      ) : null}
    </div>
  );
}

