import React, { useState } from "react";
import { useStudentAuth } from "../../../context/StudentAuthContext";
import studentApi from "../../../utils/studentApi";
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
  const { refreshStudent } = useStudentAuth();
  const [activeTab, setActiveTab] = useState("menu");

  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: student?.fullName ?? "",
    yearLevel: student?.yearLevel ?? "",
    course: student?.course ?? "",
    contactNumber: student?.contactNumber ?? "",
  });

  const [passForm, setPassForm] = useState({
    currentPassword: "",
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

  function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    studentApi
      .put("/student/profile", editForm)
      .then(() => {
        toast.success("Profile updated!");
        refreshStudent();
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to update profile"))
      .finally(() => setSavingProfile(false));
  }

  function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    setUploadingImage(true);
    studentApi
      .post("/student/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        toast.success("Avatar updated!");
        refreshStudent();
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to upload avatar"))
      .finally(() => setUploadingImage(false));
  }

  function handleChangePassword(e) {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setChangingPass(true);
    studentApi
      .put("/student/password", {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      })
      .then(() => {
        toast.success("Password changed successfully!");
        setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to change password"))
      .finally(() => setChangingPass(false));
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
    <div className="flex-1 overflow-y-auto pb-20 bg-gray-50 dark:bg-[#0f170a] font-sans">
      {activeTab === "menu" ? (
        <ProfileMenuList
          student={student}
          profileImageUrl={profileImageUrl}
          uploadingImage={uploadingImage}
          onAvatarUpload={handleAvatarUpload}
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
