import React, { useState, useEffect } from "react";
import studentApi from "../../../utils/studentApi";
import { IoLeafOutline, IoTrophyOutline, IoRibbonOutline, IoMedalOutline } from "react-icons/io5";

import RewardsCatalogTab from "./RewardsCatalogTab";
import BYOCEcoProgramTab from "./BYOCEcoProgramTab";
import { RedeemConfirmSheet, RewardSuccessSheet } from "./RedeemModals";

export function calculateEcoLevel(byocCount = 0) {
  if (byocCount >= 30) {
    return {
      level: 4,
      name: "Planet Guardian",
      icon: <IoTrophyOutline className="text-[#4a6741]" />,
      min: 30,
      max: 30,
      nextTier: "Max Level Reached!",
      remaining: 0,
      progress: 100,
    };
  } else if (byocCount >= 15) {
    const progress = Math.min(100, Math.round(((byocCount - 15) / (30 - 15)) * 100));
    return {
      level: 3,
      name: "Zero-Waste Hero",
      icon: <IoRibbonOutline className="text-[#4a6741]" />,
      min: 15,
      max: 30,
      nextTier: "Planet Guardian",
      remaining: 30 - byocCount,
      progress,
    };
  } else if (byocCount >= 5) {
    const progress = Math.min(100, Math.round(((byocCount - 5) / (15 - 5)) * 100));
    return {
      level: 2,
      name: "Eco Champion",
      icon: <IoMedalOutline className="text-[#4a6741]" />,
      min: 5,
      max: 15,
      nextTier: "Zero-Waste Hero",
      remaining: 15 - byocCount,
      progress,
    };
  } else {
    const progress = Math.min(100, Math.round((byocCount / 5) * 100));
    return {
      level: 1,
      name: "Eco Starter",
      icon: <IoLeafOutline className="text-[#4a6741]" />,
      min: 0,
      max: 5,
      nextTier: "Eco Champion",
      remaining: 5 - byocCount,
      progress,
    };
  }
}

export default function RewardsView({ student, refreshStudent }) {
  const [tab, setTab] = useState("catalog");
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmReward, setConfirmReward] = useState(null);
  const [successReward, setSuccessReward] = useState(null);
  const [newPoints, setNewPoints] = useState(0);

  useEffect(() => {
    studentApi
      .get("/rewards/active")
      .then((res) => {
        const fetchedRewards = Array.isArray(res.data?.rewards)
          ? res.data.rewards
          : Array.isArray(res.data)
            ? res.data
            : [];
        setRewards(fetchedRewards);
      })
      .catch(() => setRewards([]))
      .finally(() => setLoading(false));
  }, []);

  function handleRedeemSuccess(data) {
    setNewPoints(
      data?.studentPoints ?? Math.max(0, (student?.points ?? 0) - (confirmReward?.pointsCost ?? 0))
    );
    setSuccessReward(confirmReward);
    setConfirmReward(null);
    refreshStudent();
  }

  const byocCount = student?.byocCount ?? 0;
  const ecoInfo = calculateEcoLevel(byocCount);
  const co2Saved = (byocCount * 0.15).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-gray-50 font-sans">
      {/* Eco Points & Level Card */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-[#7fb060] to-[#4a6741] rounded-3xl px-5 py-5 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              <IoLeafOutline className="text-white text-xl" />
            </div>
            <div>
              <p className="text-xs text-white/80 font-medium">Your Eco Points</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span>{ecoInfo.icon}</span> {ecoInfo.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <p className="text-5xl font-extrabold leading-none">{student?.points ?? 0}</p>
          <span className="text-sm font-semibold text-white/80">pts</span>
        </div>

        {/* Level Progress Bar */}
        <div className="bg-black/20 rounded-2xl p-3.5 backdrop-blur-sm">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-bold flex items-center gap-1">
              <span>{ecoInfo.icon}</span> Level {ecoInfo.level}: {ecoInfo.name}
            </span>
            <span className="text-white/90 text-[11px] font-semibold">
              {ecoInfo.level < 4 ? `${byocCount}/${ecoInfo.max} BYOC` : "Max Tier"}
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${ecoInfo.progress}%` }}
            />
          </div>
          <p className="text-[11px] text-white/80 mt-1.5 text-right font-medium">
            {ecoInfo.level < 4
              ? `${ecoInfo.remaining} more BYOC use${ecoInfo.remaining !== 1 ? "s" : ""} until ${ecoInfo.nextTier}`
              : "Congratulations! You have reached the top Eco Tier!"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-2">
        {[
          { key: "catalog", label: "Rewards Catalog" },
          { key: "byoc", label: "BYOC Eco Program" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-3 rounded-2xl text-sm font-bold transition ${tab === t.key
                ? "bg-[#4a6741] text-white shadow-sm"
                : "bg-white text-[#4a6741] border border-gray-200"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Views ── */}
      {tab === "catalog" && (
        <RewardsCatalogTab
          loading={loading}
          rewards={rewards}
          student={student}
          onSelectReward={setConfirmReward}
        />
      )}

      {tab === "byoc" && (
        <BYOCEcoProgramTab ecoInfo={ecoInfo} byocCount={byocCount} co2Saved={co2Saved} />
      )}

      {/* ── Confirm sheet ── */}
      {confirmReward && (
        <RedeemConfirmSheet
          reward={confirmReward}
          student={student}
          onClose={() => setConfirmReward(null)}
          onSuccess={handleRedeemSuccess}
        />
      )}

      {/* ── Success sheet ── */}
      {successReward && (
        <RewardSuccessSheet
          reward={successReward}
          newPoints={newPoints}
          onClose={() => setSuccessReward(null)}
        />
      )}
    </div>
  );
}
