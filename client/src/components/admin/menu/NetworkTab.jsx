import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../utils/api";
import {
  IoShieldCheckmarkOutline,
  IoHardwareChipOutline,
  IoGitNetworkOutline,
  IoWifiOutline,
  IoPulseOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoRefreshOutline,
  IoDesktopOutline,
  IoLaptopOutline,
  IoPhonePortraitOutline,
  IoWarningOutline,
  IoPlayOutline,
  IoInformationCircleOutline,
  IoCloseOutline,
  IoHelpCircleOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import { MdRouter, MdSecurity, MdLan } from "react-icons/md";
import NetworkGuideModal from "./NetworkGuideModal";

export default function NetworkTab() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialSubTab = searchParams.get("subTab") || location.state?.subTab || "topology";
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab); // topology | dhcp | acl | simulator | logs | sessions
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  // DHCP state
  const [dhcpStations, setDhcpStations] = useState([]);
  const [loadingDhcp, setLoadingDhcp] = useState(false);
  const [dhcpModalOpen, setDhcpModalOpen] = useState(false);
  const [dhcpForm, setDhcpForm] = useState({
    deviceName: "",
    deviceType: "admin_pc",
    macAddress: "",
    ipAddress: "",
    vlanId: 10,
    vlanName: "VLAN 10 - Admin & Management Network",
    notes: "",
  });
  const [pingResult, setPingResult] = useState(null);
  const [pingingId, setPingingId] = useState(null);

  // ACL state
  const [aclRules, setAclRules] = useState([]);
  const [loadingAcl, setLoadingAcl] = useState(false);
  const [aclModalOpen, setAclModalOpen] = useState(false);
  const [aclForm, setAclForm] = useState({
    ruleName: "",
    action: "DENY",
    priority: 50,
    sourceCidr: "172.16.0.0/20",
    routePattern: "/api/inventory/*",
    httpMethod: "ALL",
    description: "",
  });

  // Simulator state
  const [simIp, setSimIp] = useState("172.16.4.15");
  const [simRoute, setSimRoute] = useState("/api/inventory");
  const [simMethod, setSimMethod] = useState("GET");
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Logs state
  const [networkLogs, setNetworkLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState("all"); // "all" | "violations" | "config"

  // Sessions & IP Tracker state
  const [sessionsData, setSessionsData] = useState({ stats: {}, sessions: [] });
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");
  const [copiedIp, setCopiedIp] = useState(null);

  // Mode updating
  const [updatingMode, setUpdatingMode] = useState(false);

  // Fetch Overview
  const fetchOverview = useCallback(async () => {
    try {
      const res = await api.get("/network/overview");
      setOverview(res.data);
    } catch {
      toast.error("Failed to load network overview");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch DHCP
  const fetchDhcp = useCallback(async () => {
    setLoadingDhcp(true);
    try {
      const res = await api.get("/network/dhcp");
      setDhcpStations(res.data);
    } catch {
      toast.error("Failed to fetch DHCP stations");
    } finally {
      setLoadingDhcp(false);
    }
  }, []);

  // Fetch ACL
  const fetchAcl = useCallback(async () => {
    setLoadingAcl(true);
    try {
      const res = await api.get("/network/acl");
      setAclRules(res.data);
    } catch {
      toast.error("Failed to fetch ACL rules");
    } finally {
      setLoadingAcl(false);
    }
  }, []);

  // Fetch Logs
  const fetchLogs = useCallback(async (filterType = logFilter) => {
    setLoadingLogs(true);
    try {
      const res = await api.get(`/network/logs?limit=50&type=${filterType}`);
      setNetworkLogs(res.data.logs || []);
    } catch {
      toast.error("Failed to fetch network logs");
    } finally {
      setLoadingLogs(false);
    }
  }, [logFilter]);

  // Fetch Sessions
  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await api.get("/network/sessions");
      setSessionsData(res.data || { stats: {}, sessions: [] });
    } catch {
      toast.error("Failed to fetch connected user sessions");
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (activeSubTab === "dhcp") fetchDhcp();
    if (activeSubTab === "acl") fetchAcl();
    if (activeSubTab === "logs") fetchLogs(logFilter);
    if (activeSubTab === "sessions") fetchSessions();
  }, [activeSubTab, logFilter, fetchDhcp, fetchAcl, fetchLogs, fetchSessions]);

  // Mode change handler
  const handleModeChange = async (newMode) => {
    setUpdatingMode(true);
    try {
      const res = await api.put("/network/config", { mode: newMode });
      setOverview((prev) => ({
        ...prev,
        config: res.data,
      }));
      toast.success(`Network policy switched to ${newMode.toUpperCase()} mode!`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update network mode");
    } finally {
      setUpdatingMode(false);
    }
  };

  // Ping handler
  const handlePing = async (station) => {
    setPingingId(station._id);
    setPingResult(null);
    try {
      const res = await api.post(`/network/dhcp/${station._id}/ping`);
      setPingResult(res.data);
      toast.success(`ICMP Reply from ${res.data.ipAddress}: time=${res.data.roundTripTimeMs}ms TTL=${res.data.ttl}`);
      fetchDhcp();
    } catch {
      toast.error("Ping timeout / unreachable");
    } finally {
      setPingingId(null);
    }
  };

  // Create DHCP station
  const handleCreateDhcp = async (e) => {
    e.preventDefault();
    try {
      await api.post("/network/dhcp", dhcpForm);
      toast.success("DHCP Static Reservation created!");
      setDhcpModalOpen(false);
      setDhcpForm({
        deviceName: "",
        deviceType: "admin_pc",
        macAddress: "",
        ipAddress: "",
        vlanId: 10,
        vlanName: "VLAN 10 - Admin & Management Network",
        notes: "",
      });
      fetchDhcp();
      fetchOverview();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to register station");
    }
  };

  // Delete DHCP station
  const handleDeleteDhcp = async (id) => {
    if (!window.confirm("Remove this DHCP static reservation?")) return;
    try {
      await api.delete(`/network/dhcp/${id}`);
      toast.success("DHCP reservation removed");
      fetchDhcp();
      fetchOverview();
    } catch {
      toast.error("Failed to delete reservation");
    }
  };

  // Create ACL Rule
  const handleCreateAcl = async (e) => {
    e.preventDefault();
    try {
      await api.post("/network/acl", aclForm);
      toast.success("Network ACL rule created!");
      setAclModalOpen(false);
      setAclForm({
        ruleName: "",
        action: "DENY",
        priority: 50,
        sourceCidr: "172.16.0.0/20",
        routePattern: "/api/inventory/*",
        httpMethod: "ALL",
        description: "",
      });
      fetchAcl();
      fetchOverview();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create rule");
    }
  };

  // Toggle ACL Rule
  const handleToggleAcl = async (id) => {
    try {
      const res = await api.patch(`/network/acl/${id}/toggle`);
      toast.success(res.data.message);
      fetchAcl();
      fetchOverview();
    } catch {
      toast.error("Failed to toggle rule");
    }
  };

  // Delete ACL Rule
  const handleDeleteAcl = async (id) => {
    if (!window.confirm("Delete this ACL rule?")) return;
    try {
      await api.delete(`/network/acl/${id}`);
      toast.success("ACL rule deleted");
      fetchAcl();
      fetchOverview();
    } catch {
      toast.error("Failed to delete ACL rule");
    }
  };

  // Run Packet Simulation
  const handleRunSimulation = async (e) => {
    if (e) e.preventDefault();
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await api.post("/network/simulate", {
        ipAddress: simIp,
        path: simRoute,
        method: simMethod,
      });
      setSimResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Simulation error");
    } finally {
      setSimulating(false);
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "admin_pc":
        return <IoDesktopOutline className="text-purple-500 text-lg" title="Admin Desktop PC" />;
      case "admin_laptop":
        return <IoLaptopOutline className="text-blue-500 text-lg" title="Admin Laptop" />;
      case "student_phone":
        return <IoPhonePortraitOutline className="text-emerald-500 text-lg" title="Student Smartphone" />;
      default:
        return <IoDesktopOutline className="text-gray-500 text-lg" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <IoRefreshOutline className="animate-spin text-4xl text-[#4a6741] mb-3" />
        <p className="text-sm font-semibold text-gray-600">Initializing Network Subsystem & ACL Engine...</p>
      </div>
    );
  }

  const currentMode = overview?.config?.mode || "audit_only";
  // Strictly filter to 2-tier subnets (VLAN 10 Admin & VLAN 20 Student)
  const subnets = (overview?.config?.subnets || []).filter(
    (s) => s.vlanId === 10 || s.vlanId === 20
  );

  return (
    <div className="space-y-6">
      {/* ── Top Status Cards & Mode Selector ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Operating Mode */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Security Mode</span>
            <MdSecurity className={`text-xl ${currentMode === "enforce" ? "text-emerald-600" : currentMode === "audit_only" ? "text-amber-600" : "text-gray-400"}`} />
          </div>
          <div className="my-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${currentMode === "enforce"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : currentMode === "audit_only"
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300"
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              {currentMode === "enforce" ? "Enforce (Strict)" : currentMode === "audit_only" ? "Audit-Only (Safe)" : "Disabled"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
            <select
              value={currentMode}
              disabled={updatingMode}
              onChange={(e) => handleModeChange(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
            >
              <option value="audit_only">Audit-Only (Logs violations without drop)</option>
              <option value="enforce">Enforce (Actively drops packets)</option>
              <option value="disabled">Disabled (Bypass ACL engine)</option>
            </select>
          </div>
        </div>

        {/* Card 2: DHCP Stations */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">DHCP Stations</span>
            <MdRouter className="text-xl text-blue-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-gray-800">
              {overview?.stats?.onlineStations || 0} / {overview?.stats?.totalStations || 0}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Online reserved devices</p>
          </div>
          <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 pt-2 border-t border-gray-100">
            <IoCheckmarkCircleOutline /> MAC-to-IP Binding Active
          </div>
        </div>

        {/* Card 3: ACL Rules */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">ACL Rules</span>
            <IoShieldCheckmarkOutline className="text-xl text-[#4a6741]" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-[#4a6741]">
              {overview?.stats?.activeAclRules || 0}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Active packet filtering policies</p>
          </div>
          <div className="text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-100 flex items-center justify-between">
            <span>Default Policy:</span>
            <span className="font-bold text-gray-700">{overview?.config?.defaultAction || "ALLOW"}</span>
          </div>
        </div>

        {/* Card 4: Dropped Packets */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Blocked Incidents</span>
            <IoWarningOutline className="text-xl text-red-500" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-red-600">
              {overview?.stats?.totalDroppedPackets || 0}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Unauthorized cross-subnet packets</p>
          </div>
          <div className="text-[11px] text-red-500 font-semibold pt-2 border-t border-gray-100 flex items-center gap-1">
            <IoPulseOutline /> Real-time Audit Log Active
          </div>
        </div>
      </div>

      {/* ── Sub-navigation Pills ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveSubTab("topology")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === "topology"
            ? "bg-[#4a6741] text-white shadow-sm"
            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
        >
          <IoGitNetworkOutline className="text-base" />
          Topology & VLANs
        </button>

        <button
          onClick={() => setActiveSubTab("dhcp")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === "dhcp"
            ? "bg-[#4a6741] text-white shadow-sm"
            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
        >
          <MdRouter className="text-base" />
          DHCP Reservations & Stations
        </button>

        <button
          onClick={() => setActiveSubTab("acl")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === "acl"
            ? "bg-[#4a6741] text-white shadow-sm"
            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
        >
          <IoShieldCheckmarkOutline className="text-base" />
          ACL Rules
        </button>

        <button
          onClick={() => setActiveSubTab("simulator")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === "simulator"
            ? "bg-[#4a6741] text-white shadow-sm"
            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
        >
          <IoPlayOutline className="text-base" />
          Packet Tester / Simulator
        </button>

        <button
          onClick={() => setActiveSubTab("logs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === "logs"
            ? "bg-[#4a6741] text-white shadow-sm"
            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
        >
          <IoPulseOutline className="text-base" />
          ACL Block Logs
        </button>

        <button
          onClick={() => setActiveSubTab("sessions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === "sessions"
            ? "bg-[#4a6741] text-white shadow-sm"
            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
        >
          <IoPeopleOutline className="text-base" />
          Connected Users & IP Tracker
        </button>

        <div className="ml-auto">
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#4a6741]/10 text-[#4a6741] hover:bg-[#4a6741]/20 border border-[#4a6741]/30 transition cursor-pointer shadow-sm"
            title="Open Network & Security Guide"
          >
            <IoHelpCircleOutline className="text-base" />
            <span>Guide</span>
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: TOPOLOGY & VLANS                                                 */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "topology" && (
        <div className="space-y-6">
          {/* Visual Campus Network Topology Card */}
          <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white rounded-3xl p-6 shadow-xl border border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-800 mb-6 gap-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <MdLan className="text-emerald-400 text-2xl" />
                  Cafeteria Campus Network Topology
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Hierarchical Layer 2 / Layer 3 segmentation with IEEE 802.1Q VLAN trunking
                </p>
              </div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-full font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Trunk Link Active
              </div>
            </div>

            {/* Topology Diagram Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {subnets.map((subnet) => {
                const isVlan10 = subnet.vlanId === 10;

                return (
                  <div
                    key={subnet.vlanId}
                    className={`rounded-2xl p-5 border transition-all hover:scale-[1.01] ${isVlan10
                      ? "bg-purple-950/40 border-purple-500/40"
                      : "bg-emerald-950/40 border-emerald-500/40"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${isVlan10
                          ? "bg-purple-500 text-white"
                          : "bg-emerald-500 text-white"
                          }`}
                      >
                        VLAN {subnet.vlanId}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-300">{subnet.cidr}</span>
                    </div>

                    <h4 className="font-bold text-base text-white">{subnet.name}</h4>
                    <p className="text-xs text-gray-300 mt-1 mb-4 leading-relaxed">{subnet.purpose}</p>

                    <div className="space-y-2 text-[11px] font-mono text-gray-300 pt-3 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gateway:</span>
                        <span className="text-white font-semibold">{subnet.gateway}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Allocation:</span>
                        <span className="text-white font-semibold">{subnet.dhcpRange}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Architecture Explanation */}
            <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <IoInformationCircleOutline className="text-emerald-400 text-base" />
                <span>Router Firewall ACLs isolate Student Mobile Wi-Fi (VLAN 20) from directly accessing Admin Management PCs & Laptops (VLAN 10).</span>
              </div>
              <span className="font-mono text-gray-400">MTU: 1500 | 802.1Q Tagging</span>
            </div>
          </div>

          {/* Subnet Details Table */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
              <IoGitNetworkOutline className="text-[#4a6741]" />
              Campus Subnet Allocations & DHCP Architecture
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase font-bold text-[10px]">
                    <th className="pb-3">VLAN ID</th>
                    <th className="pb-3">Segment Name</th>
                    <th className="pb-3">Subnet (CIDR)</th>
                    <th className="pb-3">Default Gateway</th>
                    <th className="pb-3">DHCP Pool / Type</th>
                    <th className="pb-3">Firewall ACL Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  <tr className="hover:bg-gray-50/60">
                    <td className="py-3 font-bold text-purple-600">VLAN 10</td>
                    <td className="py-3 font-semibold">Admin Laptops & Workstation PCs</td>
                    <td className="py-3 font-mono font-bold">192.168.1.0/24</td>
                    <td className="py-3 font-mono">192.168.1.1</td>
                    <td className="py-3">Static Assignment (.50 - .100)</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">UNRESTRICTED</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/60">
                    <td className="py-3 font-bold text-emerald-600">VLAN 20</td>
                    <td className="py-3 font-semibold">Student Personal Smartphones (Wi-Fi)</td>
                    <td className="py-3 font-mono font-bold">172.16.0.0/20</td>
                    <td className="py-3 font-mono">172.16.0.1</td>
                    <td className="py-3">Dynamic Pool (2-Hour Short Lease Turnover)</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-semibold text-[10px]">RESTRICTED TO PORTAL</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: DHCP RESERVATIONS & STATIONS                                     */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "dhcp" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <MdRouter className="text-xl text-[#4a6741]" />
                Static DHCP Reservations & Hardware Stations
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Ensure administrator desktop PCs and management laptops maintain permanent, tamper-resistant IP addresses bound to physical hardware MACs.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchDhcp}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold"
                title="Refresh Table"
              >
                <IoRefreshOutline className={`text-base ${loadingDhcp ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setDhcpModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3d5535] shadow-sm transition"
              >
                <IoAddOutline className="text-base" />
                Register New Station
              </button>
            </div>
          </div>

          {/* Ping Live Feedback Banner */}
          {pingResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-3">
                <IoCheckmarkCircleOutline className="text-2xl text-emerald-600" />
                <div>
                  <div className="font-bold">ICMP Ping Reply Received from {pingResult.deviceName}</div>
                  <div className="font-mono text-emerald-700 mt-0.5">
                    IP: {pingResult.ipAddress} | MAC: {pingResult.macAddress} | RTT: {pingResult.roundTripTimeMs}ms | Loss: {pingResult.packetLossPercent}% | TTL: {pingResult.ttl}
                  </div>
                </div>
              </div>
              <button onClick={() => setPingResult(null)} className="text-emerald-700 hover:text-emerald-900">
                <IoCloseOutline className="text-lg" />
              </button>
            </div>
          )}

          {/* DHCP Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Station / Hardware</th>
                    <th className="py-3 px-4">Device Type</th>
                    <th className="py-3 px-4">MAC Address</th>
                    <th className="py-3 px-4">Static IP</th>
                    <th className="py-3 px-4">VLAN</th>
                    <th className="py-3 px-4">Lease Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {dhcpStations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-400">
                        No stations registered in DHCP table.
                      </td>
                    </tr>
                  ) : (
                    dhcpStations.map((station) => (
                      <tr key={station._id} className="hover:bg-gray-50/60 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-800">{station.deviceName}</div>
                          <div className="text-[11px] text-gray-400">{station.notes || "Standard station"}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 capitalize font-medium text-gray-600">
                            {getDeviceIcon(station.deviceType)}
                            {station.deviceType.replace("_", " ")}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-gray-600">
                          {station.macAddress}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-blue-600">
                          {station.ipAddress}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${station.vlanId === 10
                              ? "bg-purple-100 text-purple-700"
                              : station.vlanId === 20
                                ? "bg-blue-100 text-blue-700"
                                : station.vlanId === 30
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                          >
                            VLAN {station.vlanId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Online
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePing(station)}
                              disabled={pingingId === station._id}
                              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-[11px] transition flex items-center gap-1"
                              title="Send ICMP Ping packet"
                            >
                              <IoPulseOutline className={pingingId === station._id ? "animate-pulse" : ""} />
                              {pingingId === station._id ? "Pinging..." : "Ping"}
                            </button>
                            <button
                              onClick={() => handleDeleteDhcp(station._id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                              title="Delete reservation"
                            >
                              <IoTrashOutline className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: ACL RULES                                                        */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "acl" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <IoShieldCheckmarkOutline className="text-xl text-[#4a6741]" />
                Access Control List (ACL) Packet Policies
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Evaluated from lowest priority number (highest precedence) to highest. First rule match wins.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAcl}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold"
                title="Refresh Rules"
              >
                <IoRefreshOutline className={`text-base ${loadingAcl ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setAclModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3d5535] shadow-sm transition"
              >
                <IoAddOutline className="text-base" />
                Add ACL Rule
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Rule Name</th>
                    <th className="py-3 px-4">Source Subnet (CIDR)</th>
                    <th className="py-3 px-4">Route Pattern</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Hits</th>
                    <th className="py-3 px-4 text-right">Enabled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {aclRules.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-gray-400">
                        No ACL rules configured.
                      </td>
                    </tr>
                  ) : (
                    aclRules.map((rule) => (
                      <tr key={rule._id} className="hover:bg-gray-50/60 transition">
                        <td className="py-3 px-4 font-mono font-bold text-gray-500">
                          #{rule.priority}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${rule.action === "ALLOW"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                              }`}
                          >
                            {rule.action}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-800">{rule.ruleName}</div>
                          <div className="text-[11px] text-gray-400">{rule.description}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          {rule.sourceCidr}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-gray-700">
                          {rule.routePattern}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-gray-500">
                          {rule.httpMethod}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-600">
                          {rule.hitCount || 0}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleAcl(rule._id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${rule.isEnabled
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                            >
                              {rule.isEnabled ? "Active" : "Disabled"}
                            </button>
                            <button
                              onClick={() => handleDeleteAcl(rule._id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                            >
                              <IoTrashOutline className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: PACKET TESTER & SIMULATOR                                        */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "simulator" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-800 text-base mb-1 flex items-center gap-2">
              <IoPlayOutline className="text-[#4a6741] text-xl" />
              Interactive ACL Packet Tester
            </h4>
            <p className="text-xs text-gray-500 mb-6">
              Simulate an incoming packet from any IP address to test whether your ACL policies permit or drop the request.
            </p>

            {/* Quick Presets */}
            <div className="mb-6">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Quick Scenario Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSimIp("172.16.4.15");
                    setSimRoute("/api/inventory");
                    setSimMethod("GET");
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition"
                >
                  🔴 Student Phone accessing Staff Inventory
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSimIp("172.16.4.15");
                    setSimRoute("/api/student/auth/login");
                    setSimMethod("POST");
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition"
                >
                  🟢 Student Phone accessing Student Portal
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSimIp("172.16.4.15");
                    setSimRoute("/api/points-config");
                    setSimMethod("GET");
                  }}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition"
                >
                  🔴 Student Phone tampering Points Config
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSimIp("192.168.1.50");
                    setSimRoute("/api/audit-logs");
                    setSimMethod("GET");
                  }}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition"
                >
                  🟢 Admin Workstation PC querying Audit Logs
                </button>
              </div>
            </div>

            {/* Simulation Form */}
            <form onSubmit={handleRunSimulation} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Source IP Address</label>
                <input
                  type="text"
                  value={simIp}
                  onChange={(e) => setSimIp(e.target.value)}
                  placeholder="e.g. 172.16.4.15"
                  className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Target Route Path</label>
                <input
                  type="text"
                  value={simRoute}
                  onChange={(e) => setSimRoute(e.target.value)}
                  placeholder="e.g. /api/inventory"
                  className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">HTTP Method</label>
                <select
                  value={simMethod}
                  onChange={(e) => setSimMethod(e.target.value)}
                  className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={simulating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4a6741] text-white rounded-xl text-xs font-bold hover:bg-[#3d5535] shadow-sm transition"
                >
                  <IoPlayOutline className="text-base" />
                  {simulating ? "Evaluating Packet..." : "Simulate Packet Flow"}
                </button>
              </div>
            </form>
          </div>

          {/* Simulation Results Banner */}
          {simResult && (
            <div className="space-y-4">
              <div
                className={`rounded-2xl p-5 border shadow-sm ${simResult.verdict === "ALLOW"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-red-50 border-red-300 text-red-950"
                  }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {simResult.verdict === "ALLOW" ? (
                        <IoCheckmarkCircleOutline className="text-2xl text-emerald-600" />
                      ) : (
                        <IoCloseCircleOutline className="text-2xl text-red-600" />
                      )}
                      <span className="text-lg font-black tracking-wide">
                        PACKET VERDICT: {simResult.verdict === "ALLOW" ? "PERMITTED (ALLOW)" : "DROPPED (DENY)"}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 font-mono">
                      {simResult.method} {simResult.path} from IP {simResult.clientIp}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Enforced Action</span>
                    <span className="text-sm font-black font-mono">{simResult.enforcedResult}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-current/20 text-xs flex items-center gap-2">
                  <span className="font-bold">Triggered Rule:</span>
                  <span className="font-mono px-2 py-0.5 rounded bg-white/70 font-semibold">{simResult.matchedRule}</span>
                </div>
              </div>

              {/* Evaluation Step-by-Step Trace */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">
                  Rule Evaluation Trace (Ordered by Priority)
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 text-[10px]">
                        <th className="pb-2">Priority</th>
                        <th className="pb-2">Rule Name</th>
                        <th className="pb-2">Subnet Match</th>
                        <th className="pb-2">Route Match</th>
                        <th className="pb-2">Method Match</th>
                        <th className="pb-2 text-right">Step Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {simResult.steps.map((step, idx) => (
                        <tr
                          key={idx}
                          className={`${step.verdict !== "CONTINUE"
                            ? step.verdict === "ALLOW"
                              ? "bg-emerald-50 font-bold text-emerald-900"
                              : "bg-red-50 font-bold text-red-900"
                            : "text-gray-500"
                            }`}
                        >
                          <td className="py-2">#{step.priority}</td>
                          <td className="py-2">{step.ruleName}</td>
                          <td className="py-2">{step.matchedIp ? "✅ YES" : "❌ NO"}</td>
                          <td className="py-2">{step.matchedRoute ? "✅ YES" : "❌ NO"}</td>
                          <td className="py-2">{step.matchedMethod ? "✅ YES" : "❌ NO"}</td>
                          <td className="py-2 text-right">
                            {step.verdict === "CONTINUE" ? (
                              <span className="text-gray-400">Skip to next</span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] uppercase ${step.verdict === "ALLOW" ? "bg-emerald-200 text-emerald-900" : "bg-red-200 text-red-900"
                                  }`}
                              >
                                {step.verdict} (TERMINATE)
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 5: ACL BLOCK LOGS & INCIDENT AUDIT                                  */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "logs" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <IoPulseOutline className="text-xl text-red-500" />
                Network Audit & ACL Packet Drop Logs
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Every unauthorized cross-subnet request and firewall policy change is stamped with source IP and timestamps.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Category Filter Pills */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs">
                <button
                  onClick={() => {
                    setLogFilter("all");
                    fetchLogs("all");
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition ${logFilter === "all"
                    ? "bg-white text-gray-800 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                  All Logs
                </button>
                <button
                  onClick={() => {
                    setLogFilter("violations");
                    fetchLogs("violations");
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition ${logFilter === "violations"
                    ? "bg-red-500 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                  Packet Drops Only
                </button>
                <button
                  onClick={() => {
                    setLogFilter("config");
                    fetchLogs("config");
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition ${logFilter === "config"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                    }`}
                >
                  Config & Policy
                </button>
              </div>

              <button
                onClick={() => fetchLogs(logFilter)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                <IoRefreshOutline className={`text-base ${loadingLogs ? "animate-spin" : ""}`} />
                Refresh Logs
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Source IP / Actor</th>
                    <th className="py-3 px-4">Event Category</th>
                    <th className="py-3 px-4">Target / Scope</th>
                    <th className="py-3 px-4">Enforced Rule</th>
                    <th className="py-3 px-4">Log Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {networkLogs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-400">
                        No network log incidents found for this filter.
                      </td>
                    </tr>
                  ) : (
                    networkLogs.map((log) => {
                      const isViolation = log.action === "ACL_NETWORK_PACKET_DROPPED";
                      const isConfig = log.action === "NETWORK_CONFIG_UPDATED";
                      const isAclRule = log.action?.startsWith("ACL_RULE_");
                      const isDhcp = log.action === "DHCP_RESERVATION_CREATED";

                      let badge = (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-bold rounded text-[10px]">
                          {log.action}
                        </span>
                      );
                      if (isViolation) {
                        badge = (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 font-black rounded text-[10px]">
                            DROPPED
                          </span>
                        );
                      } else if (isConfig) {
                        badge = (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded text-[10px]">
                            POLICY CONFIG
                          </span>
                        );
                      } else if (isAclRule) {
                        badge = (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold rounded text-[10px]">
                            ACL RULE
                          </span>
                        );
                      } else if (isDhcp) {
                        badge = (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded text-[10px]">
                            DHCP BIND
                          </span>
                        );
                      }

                      // Source IP:
                      const sourceIp =
                        log.meta?.clientIp ||
                        (isViolation
                          ? "172.16.4.15"
                          : `192.168.1.50 (${log.actorName || "Admin"})`);

                      // Target / Scope:
                      let targetScope = log.description;
                      if (isViolation) {
                        targetScope = `${log.meta?.method || ""} ${log.meta?.path || ""}`.trim();
                      } else if (isConfig) {
                        targetScope = "Global Firewall Security Policy";
                      } else if (isAclRule) {
                        targetScope = log.meta?.ruleName || "Firewall Rule Settings";
                      } else if (isDhcp) {
                        targetScope = `${log.meta?.mac || ""} -> ${log.meta?.ip || ""}`;
                      }

                      // Enforced Rule:
                      let enforcedRule = "—";
                      if (isViolation) {
                        enforcedRule = log.meta?.matchedRule || "Default-Deny";
                      } else if (isConfig) {
                        enforcedRule = `Policy: ${log.meta?.mode?.toUpperCase() || "AUDIT"}`;
                      } else if (isAclRule) {
                        enforcedRule = "Admin Management Console";
                      } else if (isDhcp) {
                        enforcedRule = "Static Hardware Binding";
                      }

                      return (
                        <tr
                          key={log._id}
                          className={
                            isViolation
                              ? "hover:bg-red-50/30 transition"
                              : "hover:bg-gray-50/60 transition"
                          }
                        >
                          <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                            {new Date(log.createdAt).toLocaleString("en-US")}
                          </td>
                          <td
                            className={`py-3 px-4 font-mono font-bold ${isViolation ? "text-red-600" : "text-gray-800"
                              }`}
                          >
                            {sourceIp}
                          </td>
                          <td className="py-3 px-4">{badge}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-gray-800">
                            {targetScope}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                            {enforcedRule}
                          </td>
                          <td
                            className="py-3 px-4 text-gray-600 text-[11px] max-w-xs truncate"
                            title={log.description}
                          >
                            {log.description}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* TAB 6: CONNECTED USERS & IP TRACKER                                     */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "sessions" && (
        <div className="space-y-6">
          {/* Top Session Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Students on Wi-Fi</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {sessionsData.stats?.studentsOnWifi || 0}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 font-mono">VLAN 20 (172.16.0.0/20)</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
                <IoPhonePortraitOutline />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Admins on LAN</span>
                <div className="text-2xl font-black text-purple-600 mt-1">
                  {sessionsData.stats?.adminsOnLan || 0}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 font-mono">VLAN 10 (192.168.1.0/24)</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">
                <IoDesktopOutline />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Primary Campus Zone</span>
                <div className="text-base font-black text-gray-800 mt-1 truncate max-w-[200px]">
                  {sessionsData.stats?.topRegions?.[0]?.name || "Cafeteria Wi-Fi"}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {sessionsData.stats?.totalSessions || 0} total active sessions recorded
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#4a6741]/10 text-[#4a6741] flex items-center justify-center text-2xl">
                <IoLocationOutline />
              </div>
            </div>
          </div>

          {/* Sessions Control & Search Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <IoPeopleOutline className="text-xl text-[#4a6741]" />
                Live Campus User Sessions & IP Tracker
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Tracks connected students and administrators, their physical campus network zone, IP address, and device type.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                placeholder="Search user, ID, IP, or region..."
                className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
              />
              <button
                onClick={fetchSessions}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 flex-shrink-0"
                title="Refresh sessions"
              >
                <IoRefreshOutline className={`text-base ${loadingSessions ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px]">
                    <th className="py-3.5 px-4">User / Student</th>
                    <th className="py-3.5 px-4">Account Type</th>
                    <th className="py-3.5 px-4">Assigned IP Address</th>
                    <th className="py-3.5 px-4">Region</th>
                    <th className="py-3.5 px-4">Device Form Factor</th>
                    <th className="py-3.5 px-4">Last Activity</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {sessionsData.sessions
                    .filter((s) => {
                      if (!sessionSearch) return true;
                      const q = sessionSearch.toLowerCase();
                      return (
                        s.name?.toLowerCase().includes(q) ||
                        s.userId?.toLowerCase().includes(q) ||
                        s.ipAddress?.includes(q) ||
                        s.region?.toLowerCase().includes(q)
                      );
                    })
                    .map((session) => {
                      const isStudent = session.userType !== "admin";
                      const isVlan20 = session.vlanId === 20;

                      return (
                        <tr key={session._id} className="hover:bg-gray-50/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#d7ecc8] text-[#4a6741] flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden">
                                {session.avatar ? (
                                  <img src={session.avatar} alt={session.name} className="w-full h-full object-cover" />
                                ) : (
                                  session.name?.[0]?.toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">{session.name}</div>
                                <div className="text-[10px] text-gray-400 font-mono">{session.userId}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${isStudent
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-purple-100 text-purple-800"
                                }`}
                            >
                              {session.roleLabel}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono font-bold text-xs ${isVlan20 ? "text-emerald-700" : "text-purple-700"
                                  }`}
                              >
                                {session.ipAddress}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(session.ipAddress);
                                  setCopiedIp(session.ipAddress);
                                  setTimeout(() => setCopiedIp(null), 2000);
                                  toast.success(`Copied IP ${session.ipAddress}`);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                                title="Copy IP"
                              >
                                {copiedIp === session.ipAddress ? (
                                  <IoCheckmarkOutline className="text-emerald-600 text-sm" />
                                ) : (
                                  <IoCopyOutline className="text-xs" />
                                )}
                              </button>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${isVlan20
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-purple-50 text-purple-700 border border-purple-200"
                                  }`}
                              >
                                VLAN {session.vlanId}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <IoLocationOutline className="text-red-500 text-sm flex-shrink-0" />
                              <div className="font-semibold text-gray-800 text-xs leading-tight">
                                Philippines
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              {session.deviceType.toLowerCase().includes("smartphone") ||
                                session.deviceType.toLowerCase().includes("mobile") ? (
                                <IoPhonePortraitOutline className="text-sm text-emerald-600" />
                              ) : (
                                <IoDesktopOutline className="text-sm text-purple-600" />
                              )}
                              <span>{session.deviceType}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                            {session.lastActive ? new Date(session.lastActive).toLocaleString("en-US") : "Just now"}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setSimIp(session.ipAddress);
                                setActiveSubTab("simulator");
                                toast.success(`Loaded IP ${session.ipAddress} into Packet Simulator`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-[#4a6741] hover:text-white rounded-lg text-[10px] font-bold text-gray-700 transition"
                              title="Test this user IP in firewall packet tester"
                            >
                              <IoPlayOutline className="text-xs" />
                              Simulate
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Register DHCP Station ─────────────────────────────────────── */}
      {dhcpModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 relative z-10">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                  <MdRouter className="text-[#4a6741] text-xl" />
                  New DHCP Static Reservation
                </h3>
                <button onClick={() => setDhcpModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <IoCloseOutline className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleCreateDhcp} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-600 mb-1">Station / Device Name</label>
                  <input
                    type="text"
                    value={dhcpForm.deviceName}
                    onChange={(e) => setDhcpForm({ ...dhcpForm, deviceName: e.target.value })}
                    placeholder="e.g. Admin Management PC - Office"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Hardware MAC Address</label>
                    <input
                      type="text"
                      value={dhcpForm.macAddress}
                      onChange={(e) => setDhcpForm({ ...dhcpForm, macAddress: e.target.value })}
                      placeholder="e.g. 00:1A:2B:3C:4D:5E"
                      className="w-full font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 uppercase focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Reserved Static IP</label>
                    <input
                      type="text"
                      value={dhcpForm.ipAddress}
                      onChange={(e) => setDhcpForm({ ...dhcpForm, ipAddress: e.target.value })}
                      placeholder="e.g. 192.168.1.60"
                      className="w-full font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Device Type</label>
                    <select
                      value={dhcpForm.deviceType}
                      onChange={(e) => setDhcpForm({ ...dhcpForm, deviceType: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                    >
                      <option value="admin_pc">Admin Desktop PC</option>
                      <option value="admin_laptop">Admin Laptop</option>
                      <option value="student_phone">Student Smartphone</option>
                      <option value="other">Other Station</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Assigned VLAN</label>
                    <select
                      value={dhcpForm.vlanId}
                      onChange={(e) => {
                        const vId = Number(e.target.value);
                        const name =
                          vId === 10
                            ? "VLAN 10 - Admin & Management Network"
                            : "VLAN 20 - Student Mobile Wi-Fi Network";
                        setDhcpForm({ ...dhcpForm, vlanId: vId, vlanName: name });
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                    >
                      <option value="10">VLAN 10 (Admin & Management)</option>
                      <option value="20">VLAN 20 (Student Mobile Wi-Fi)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">Notes / Location</label>
                  <input
                    type="text"
                    value={dhcpForm.notes}
                    onChange={(e) => setDhcpForm({ ...dhcpForm, notes: e.target.value })}
                    placeholder="e.g. Office desktop PC assigned to cafeteria manager"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setDhcpModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#4a6741] text-white rounded-xl font-bold hover:bg-[#3d5535] transition"
                  >
                    Bind MAC & Reserve IP
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ── MODAL: Add ACL Rule ──────────────────────────────────────────────── */}
      {aclModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 relative z-10">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                  <IoShieldCheckmarkOutline className="text-[#4a6741] text-xl" />
                  Create Network ACL Rule
                </h3>
                <button onClick={() => setAclModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <IoCloseOutline className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleCreateAcl} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-600 mb-1">Rule Name</label>
                  <input
                    type="text"
                    value={aclForm.ruleName}
                    onChange={(e) => setAclForm({ ...aclForm, ruleName: e.target.value })}
                    placeholder="e.g. Block-Student-From-PointsConfig"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Action</label>
                    <select
                      value={aclForm.action}
                      onChange={(e) => setAclForm({ ...aclForm, action: e.target.value })}
                      className="w-full font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                    >
                      <option value="DENY">DENY (Drop Packet)</option>
                      <option value="ALLOW">ALLOW (Permit Packet)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Priority Number</label>
                    <input
                      type="number"
                      value={aclForm.priority}
                      onChange={(e) => setAclForm({ ...aclForm, priority: Number(e.target.value) })}
                      placeholder="e.g. 50"
                      className="w-full font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">Source Subnet (CIDR)</label>
                  <input
                    type="text"
                    value={aclForm.sourceCidr}
                    onChange={(e) => setAclForm({ ...aclForm, sourceCidr: e.target.value })}
                    placeholder="e.g. 172.16.0.0/20 or *"
                    className="w-full font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Target Route Pattern</label>
                    <input
                      type="text"
                      value={aclForm.routePattern}
                      onChange={(e) => setAclForm({ ...aclForm, routePattern: e.target.value })}
                      placeholder="e.g. /api/inventory/*"
                      className="w-full font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">HTTP Method</label>
                    <select
                      value={aclForm.httpMethod}
                      onChange={(e) => setAclForm({ ...aclForm, httpMethod: e.target.value })}
                      className="w-full font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                    >
                      <option value="ALL">ALL Methods</option>
                      <option value="GET">GET Only</option>
                      <option value="POST">POST Only</option>
                      <option value="PUT">PUT Only</option>
                      <option value="DELETE">DELETE Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">Rule Description</label>
                  <input
                    type="text"
                    value={aclForm.description}
                    onChange={(e) => setAclForm({ ...aclForm, description: e.target.value })}
                    placeholder="e.g. Prevents unauthorized student devices from accessing staff inventory"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setAclModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#4a6741] text-white rounded-xl font-bold hover:bg-[#3d5535] transition"
                  >
                    Save & Apply Policy
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ── MODAL: Network Architecture & Security In-App Guide ──────────────── */}
      <NetworkGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div >
  );
}
