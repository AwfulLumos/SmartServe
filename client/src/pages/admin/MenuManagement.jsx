import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { MdPeopleOutline as IconStaff, MdMenuBook as IconMenu, MdHistoryEdu as IconAudit } from "react-icons/md";
import { IoGitNetworkOutline as IconNetwork, IoHelpCircleOutline } from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import StaffTab from "../../components/admin/menu/StaffTab";
import MenuTab from "../../components/admin/menu/MenuTab";
import AuditLogTab from "../../components/admin/menu/AuditLogTab";
import NetworkTab from "../../components/admin/menu/NetworkTab";
import NetworkGuideModal from "../../components/admin/menu/NetworkGuideModal";

const TAB_META = {
  staff: {
    label: "User Accounts",
    title: "Staff Accounts",
    icon: <IconStaff className="text-3xl" />,
    description: "Manage canteen staff and administrator accounts, roles, and pending approvals",
    breadcrumb: "Staff Accounts",
  },
  menu: {
    label: "Menu Management",
    title: "Menu Management",
    icon: <IconMenu className="text-3xl" />,
    description: "Configure food menu items, prices, category classifications, and item availability",
    breadcrumb: "Menu Management",
  },
  audit: {
    label: "Audit Log",
    title: "Audit Log",
    icon: <IconAudit className="text-3xl" />,
    description: "Track administrative actions, system events, and security logs in real time",
    breadcrumb: "Audit Log",
  },
  network: {
    label: "Network & Security",
    title: "Network Architecture & Security",
    icon: <IconNetwork className="text-3xl" />,
    description: "Manage campus VLANs, DHCP static hardware reservations, and Access Control List (ACL) policies",
    breadcrumb: "Network & Security",
  },
};

export default function MenuManagement() {
  const { section } = useParams();
  const activeTab = section || "staff";
  const [showGuide, setShowGuide] = useState(false);

  if (!TAB_META[activeTab]) {
    return <Navigate to="/dashboard/settings/staff" replace />;
  }

  const currentTab = TAB_META[activeTab];

  return (
    <AdminLayout breadcrumb={currentTab.breadcrumb}>
      {/* Header: Displays dynamic page title, icon, and description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#4a6741] flex items-center gap-2">
              {currentTab.icon}
              {currentTab.title}
            </h1>
            {activeTab === "network" && (
              <button
                onClick={() => setShowGuide(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#4a6741]/10 text-[#4a6741] hover:bg-[#4a6741] hover:text-white border border-[#4a6741]/30 transition shadow-xs cursor-pointer"
                title="Open Guide"
              >
                <IoHelpCircleOutline className="text-sm" />
                <span>Guide</span>
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {currentTab.description}
          </p>
        </div>

        {activeTab === "network" && (
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#4a6741] text-white hover:bg-[#3d5535] shadow-md shadow-[#4a6741]/20 hover:shadow-lg transition cursor-pointer self-start sm:self-center"
            title="Open Network Architecture & Security Guide"
          >
            <IoHelpCircleOutline className="text-lg" />
            <span>Open Security Guide</span>
          </button>
        )}
      </div>

      {activeTab === "staff" && <StaffTab />}
      {activeTab === "menu" && <MenuTab />}
      {activeTab === "audit" && <AuditLogTab />}
      {activeTab === "network" && <NetworkTab />}

      {/* Guide Modal accessible directly from header */}
      <NetworkGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </AdminLayout>
  );
}
