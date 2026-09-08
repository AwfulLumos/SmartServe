import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout, { triggerAdminLogout } from "../../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";

import AccountHeader from "../../components/admin/account/AccountHeader";
import AccountHeroCard from "../../components/admin/account/AccountHeroCard";
import AccountInfoCard from "../../components/admin/account/AccountInfoCard";
import AccountEditForm from "../../components/admin/account/AccountEditForm";
import AccountPasswordForm from "../../components/admin/account/AccountPasswordForm";
import AccountActivityCard from "../../components/admin/account/AccountActivityCard";
import AccountQuickActionsCard from "../../components/admin/account/AccountQuickActionsCard";
import AccountFooterActions from "../../components/admin/account/AccountFooterActions";

export default function Account() {
  const navigate = useNavigate();
  const { user, updateProfile, uploadProfileImage, deleteMyAccount, changePassword } = useAuth();

  const [form, setForm] = useState({ fullName: "", username: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Change-password form state
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    setForm({
      fullName: user?.fullName || "",
      username: user?.username || "",
      email: user?.email || "",
    });
  }, [user?.fullName, user?.username, user?.email]);

  const initials = useMemo(() => {
    if (!user?.fullName) return "A";
    return user.fullName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.fullName]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile({
      fullName: form.fullName,
      username: form.username,
      email: form.email,
    });
    setSaving(false);

    if (result.success) {
      toast.success("Account information updated");
    } else {
      toast.error(result.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setChangingPw(true);
    const result = await changePassword(pwForm.oldPassword, pwForm.newPassword, pwForm.confirmPassword);
    setChangingPw(false);
    if (result.success) {
      toast.success(result.message || "Password changed. Please log in again.");
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(result.message);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    setUploading(true);
    const result = await uploadProfileImage(file);
    setUploading(false);
    e.target.value = "";

    if (result.success) {
      toast.success("Profile picture updated");
    } else {
      toast.error(result.message);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete your account permanently? This cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    const result = await deleteMyAccount();
    setDeleting(false);

    if (result.success) {
      toast.success(result.message || "Account deleted");
      navigate("/login", { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <AdminLayout breadcrumb="Account">
      <div className="max-w-[1100px] space-y-5">
        <AccountHeader onNavigateBack={() => navigate("/dashboard")} />

        <AccountHeroCard
          user={user}
          initials={initials}
          uploading={uploading}
          onImageChange={handleImageChange}
        />

        <AccountInfoCard user={user} />

        <AccountEditForm
          form={form}
          setForm={setForm}
          saving={saving}
          onSave={handleSave}
        />

        <AccountPasswordForm
          pwForm={pwForm}
          setPwForm={setPwForm}
          changingPw={changingPw}
          onChangePassword={handleChangePassword}
        />

        <AccountActivityCard user={user} />

        <AccountQuickActionsCard onNavigate={navigate} />

        <AccountFooterActions
          deleting={deleting}
          onDeleteAccount={handleDelete}
          onLogout={triggerAdminLogout}
        />
      </div>
    </AdminLayout>
  );
}
