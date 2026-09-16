import { useParams, Navigate } from "react-router-dom";
import { MdPeopleOutline as IconStaff, MdMenuBook as IconMenu, MdHistoryEdu as IconAudit } from "react-icons/md";
import { IoGlobeOutline as IconTracker } from "react-icons/io5";
import AdminLayout from "../../components/AdminLayout";
import StaffTab from "../../components/admin/menu/StaffTab";
import MenuTab from "../../components/admin/menu/MenuTab";
import AuditLogTab from "../../components/admin/menu/AuditLogTab";
import UsersIpTrackerTab from "../../components/admin/menu/UsersIpTrackerTab";

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
  tracker: {
    label: "Users & IP Tracker",
    title: "Users & IP Tracker",
    icon: <IconTracker className="text-3xl" />,
    description: "Real-time visibility, telemetry, and IP address tracking for all registered students, staff, and administrators",
    breadcrumb: "Users & IP Tracker",
  },
};

export default function MenuManagement() {
  const { section } = useParams();

  // Backward compatibility redirect for old network module route
  if (section === "network") {
    return <Navigate to="/dashboard/settings/tracker" replace />;
  }

  const activeTab = section || "staff";

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
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {currentTab.description}
          </p>
        </div>
      </div>

      {activeTab === "staff" && <StaffTab />}
      {activeTab === "menu" && <MenuTab />}
      {activeTab === "audit" && <AuditLogTab />}
      {activeTab === "tracker" && <UsersIpTrackerTab />}
    </AdminLayout>
  );
}

