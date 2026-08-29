import { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import RewardsHeader from "../../components/admin/rewards/RewardsHeader";
import RewardsTabs from "../../components/admin/rewards/RewardsTabs";
import RedeemTab from "../../components/admin/rewards/RedeemTab";
import ConfigureTab from "../../components/admin/rewards/ConfigureTab";
import HistoryTab from "../../components/admin/rewards/HistoryTab";
import ByocTab from "../../components/admin/rewards/ByocTab";

export default function Rewards() {
  const [activeTab, setActiveTab] = useState("redeem");

  return (
    <AdminLayout breadcrumb="Rewards">
      <RewardsHeader />
      <RewardsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "redeem" && <RedeemTab />}
      {activeTab === "configure" && <ConfigureTab />}
      {activeTab === "history" && <HistoryTab />}
      {activeTab === "byoc" && <ByocTab />}
    </AdminLayout>
  );
}
