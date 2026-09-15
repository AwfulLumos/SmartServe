import { useState } from "react";
import { createPortal } from "react-dom";
import {
  IoHelpCircleOutline,
  IoCloseOutline,
  IoShieldCheckmarkOutline,
  IoGitNetworkOutline,
  IoPlayOutline,
  IoPulseOutline,
  IoDesktopOutline,
  IoPhonePortraitOutline,
  IoLaptopOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoAlertCircleOutline,
  IoBookOutline,
  IoCheckmarkDoneOutline,
} from "react-icons/io5";
import { MdRouter, MdSecurity } from "react-icons/md";

export default function NetworkGuideModal({ isOpen, onClose }) {
  const [guideTab, setGuideTab] = useState("purpose"); // purpose | tabs

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-100 relative z-10">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#22351e] via-[#354d2e] to-[#4a6741] text-white px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
              <IoHelpCircleOutline />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Network Architecture & Security Guide
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  Comprehensive Manual
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Purpose, threat model, system architecture, and tab-by-tab operational workflows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition text-white cursor-pointer"
            title="Close Guide"
          >
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        {/* Navigation Category Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 border-b border-gray-100 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setGuideTab("purpose")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${guideTab === "purpose"
                ? "bg-[#4a6741] text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
          >
            <IoShieldCheckmarkOutline className="text-sm" />
            1. Purpose & Architecture
          </button>

          <button
            onClick={() => setGuideTab("tabs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${guideTab === "tabs"
                ? "bg-[#4a6741] text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
          >
            <IoBookOutline className="text-sm" />
            2. How-To Guide (All Tabs)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-gray-600 space-y-6">
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: PURPOSE & ARCHITECTURE                                      */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {guideTab === "purpose" && (
            <div className="space-y-5">
              {/* Notice Banner */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-emerald-800">
                  <IoShieldCheckmarkOutline className="text-lg" />
                  What is the Purpose of Network Architecture & Security in SmartServe?
                </div>
                <p className="text-xs text-emerald-800/90 leading-relaxed">
                  In a computerized school cafeteria, the network handles sensitive inventory records, financial meal orders, and administrator settings at the same time hundreds of students connect on personal smartphones. SmartServe implements an application-layer network management subsystem to model how enterprise network segmentation, access control lists (ACLs), and device tracking protect cafeteria operations.
                </p>
              </div>

              {/* The Threat Model & Problem */}
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
                  The Problem: Unsegmented Campus Cafeteria Networks
                </h4>
                <p className="text-gray-500 leading-relaxed mb-3">
                  Without network segmentation and policy enforcement:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-red-50 rounded-2xl p-3.5 border border-red-100">
                    <div className="font-bold text-red-800 text-xs mb-1">Unauthorized Endpoint Probing</div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Students on cafeteria Wi-Fi could discover internal API routes (such as stock inventory or staff orders) and attempt tampering.
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-100">
                    <div className="font-bold text-amber-800 text-xs mb-1">DHCP Pool Exhaustion</div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Hundreds of student smartphones connecting during a lunch rush could saturate small IP pools, blocking staff devices.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-3.5 border border-purple-100">
                    <div className="font-bold text-purple-800 text-xs mb-1">Lack of Device Accountability</div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Administrators have no visibility into which physical devices (smartphones vs PCs) are making requests or from which zone.
                    </p>
                  </div>
                </div>
              </div>

              {/* The 2-Tier Subnet Hierarchy */}
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
                  The 2-Tier Logical Network Architecture
                </h4>
                <p className="text-gray-500 leading-relaxed mb-3">
                  SmartServe partitions network traffic into two operational zones, modeled in software logic:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* VLAN 10 */}
                  <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-purple-800 font-bold">
                        <IoLaptopOutline className="text-lg" />
                        <span>VLAN 10 — Admin LAN</span>
                      </div>
                      <span className="font-mono text-xs font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                        192.168.1.0/24
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed mb-2">
                      <strong>Devices:</strong> Administrator desktop PCs and management laptops in the cafeteria office.
                    </p>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      <strong>Access Policy:</strong> Unrestricted API access (<code>/*</code>). All student accounts, inventory management, menu configuration, and audit logs are accessible.
                    </p>
                  </div>

                  {/* VLAN 20 */}
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <IoPhonePortraitOutline className="text-lg" />
                        <span>VLAN 20 — Student Wi-Fi</span>
                      </div>
                      <span className="font-mono text-xs font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        172.16.0.0/20
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed mb-2">
                      <strong>Devices:</strong> Student personal smartphones (BYOD) connecting over campus cafeteria Wi-Fi.
                    </p>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      <strong>Access Policy:</strong> Restricted strictly to student endpoints (<code>/api/student/*</code>). Requests attempting to access staff/admin routes are blocked.
                    </p>
                  </div>
                </div>
              </div>

              {/* Real-World Demonstration Scenarios */}
              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
                  Real-World Cafeteria Scenarios
                </h4>
                <div className="space-y-2.5">
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Scenario A: Student Mobile Meal Ordering (Legitimate Flow)
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      A student connects their personal phone to cafeteria Wi-Fi (assigned IP <code className="bg-emerald-100/70 px-1 py-0.5 rounded font-mono text-[10px]">172.16.2.45</code> in VLAN 20). When they open the menu or place a meal order via <code className="bg-emerald-100/70 px-1 py-0.5 rounded font-mono text-[10px]">/api/student/orders</code>, Rule #20 (Allow-Student-Portal-Routes) matches and grants access with zero friction.
                    </p>
                  </div>

                  <div className="bg-red-50/60 border border-red-100 rounded-2xl p-3.5">
                    <div className="flex items-center gap-2 text-red-800 font-bold text-xs mb-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Scenario B: Malicious Endpoint Probing (Unauthorized Cross-Zone Access)
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      A user attempts to send requests to <code className="bg-red-100/70 px-1 py-0.5 rounded font-mono text-[10px]">/api/inventory</code> or <code className="bg-red-100/70 px-1 py-0.5 rounded font-mono text-[10px]">/api/admin/users</code> from that same Wi-Fi IP (<code className="bg-red-100/70 px-1 py-0.5 rounded font-mono text-[10px]">172.16.2.45</code>). Rule #40 (Deny-Student-Inventory-Access) intercepts the request, blocks it with <code className="bg-red-100/70 px-1 py-0.5 rounded font-mono text-[10px]">HTTP 403 Forbidden</code> (in Enforce mode), and logs an incident in Tab 5.
                    </p>
                  </div>

                  <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-3.5">
                    <div className="flex items-center gap-2 text-purple-800 font-bold text-xs mb-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Scenario C: Cafeteria Manager Administration (Privileged Management Flow)
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      The cafeteria supervisor logs into their office desktop PC (reserved IP <code className="bg-purple-100/70 px-1 py-0.5 rounded font-mono text-[10px]">192.168.1.50</code> in VLAN 10). Because Rule #10 (Allow-Admin-LAN-Full-Access) matches their subnet, they have unrestricted access to inventory adjustments, sales reports, and student management.
                    </p>
                  </div>
                </div>
              </div>

              {/* Implementation Scope Disclaimer */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 text-gray-600 text-[11px] leading-relaxed">
                <strong>Educational Implementation Scope:</strong> SmartServe executes all subnet routing, packet inspection, CIDR mask matching, and session tracking at the <strong>application layer</strong> (Express middleware + MongoDB). It does not configure physical managed switch hardware or run a bare-metal DHCP daemon.
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: TAB-BY-TAB HOW-TO GUIDE                                    */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {guideTab === "tabs" && (
            <div className="space-y-6">
              {/* Security Mode Selector */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                <div className="flex items-center gap-2 font-bold text-gray-800 text-sm mb-2">
                  <MdSecurity className="text-emerald-700 text-lg" />
                  Global Security Operating Modes
                </div>
                <p className="text-gray-500 mb-3 text-[11px]">
                  Located at the top-left summary card of the Network page. Controls how the Express ACL firewall evaluates incoming requests:
                </p>
                <div className="space-y-2">
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                    <span className="font-bold text-amber-900 text-xs block mb-0.5">
                      1. Audit-Only (Safe) — Default Mode
                    </span>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Evaluates ACL rules and logs violations to MongoDB with an <code>X-ACL-Warning</code> header, but permits the packet through. Use this mode for testing and demonstrations without risk of accidental administrative lockout.
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                    <span className="font-bold text-emerald-900 text-xs block mb-0.5">
                      2. Enforce (Strict) — Production Mode
                    </span>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Actively blocks matching unauthorized requests with <code>HTTP 403 Forbidden (NETWORK_ACL_VIOLATION)</code>.
                    </p>
                  </div>
                  <div className="bg-gray-100 rounded-xl p-3 border border-gray-200">
                    <span className="font-bold text-gray-800 text-xs block mb-0.5">
                      3. Disabled — Maintenance Mode
                    </span>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Completely bypasses the ACL evaluation engine for offline benchmarking or debugging.
                    </p>
                  </div>
                </div>
              </div>

              {/* Firewall Evaluation Pipeline */}
              <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-gray-800 text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#4a6741]"></span>
                  ACL Rule Evaluation Pipeline (First Match Wins)
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-gray-700">
                  <span className="bg-white px-2 py-1 rounded border border-gray-200 font-bold text-[#4a6741]">1. Client Request</span>
                  <span className="text-gray-400">➔</span>
                  <span className="bg-white px-2 py-1 rounded border border-gray-200 font-bold text-blue-700">2. Extract IP</span>
                  <span className="text-gray-400">➔</span>
                  <span className="bg-white px-2 py-1 rounded border border-gray-200 font-bold text-purple-700">3. Bitwise CIDR Match</span>
                  <span className="text-gray-400">➔</span>
                  <span className="bg-white px-2 py-1 rounded border border-gray-200 font-bold text-amber-700">4. Route Wildcard Match</span>
                  <span className="text-gray-400">➔</span>
                  <span className="bg-white px-2 py-1 rounded border border-gray-200 font-bold text-teal-700">5. Method Match</span>
                  <span className="text-gray-400">➔</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded border border-emerald-300 font-bold">Verdict: ALLOW / DENY</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Rules evaluate by ascending priority number (#10 before #20 before #40). The <strong>first rule where all criteria match determines the outcome</strong>. If no rule matches, the system applies the configured <em>Default Action</em> (default: ALLOW).
                </p>
              </div>

              {/* Sub-Tabs 1 to 6 */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
                  Detailed Instructions for Each Network Tab
                </h4>

                {/* Tab 1 */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-xs">
                    <IoGitNetworkOutline className="text-base text-[#4a6741]" />
                    Tab 1: Campus Network Topology & VLANs
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    <strong>What it does:</strong> Renders a visual network map displaying the Core Gateway Router, Managed Switch, and the 2 active VLAN segments.
                  </p>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    <strong>How to use:</strong> Use this tab to visualize the subnet addressing scheme (CIDR, default gateways, subnet masks) and review the purpose of each campus network zone.
                  </p>
                </div>

                {/* Tab 2 */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-xs">
                    <MdRouter className="text-base text-blue-600" />
                    Tab 2: DHCP Reservations & Hardware Station Manager
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    <strong>What it does:</strong> Manages application-level records binding physical MAC addresses to reserved administrative IP addresses.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-[11px] text-gray-600">
                    <p>• <strong>To ping a station:</strong> Click the blue <strong>"Ping"</strong> button on any row. The server executes a simulated ping check, updating the station's heartbeat and returning simulated latency telemetry (0.8ms - 4.3ms RTT and TTL 64).</p>
                    <p>• <strong>To register a new device:</strong> Click <strong>"+ Register New Station"</strong>, enter the device name, MAC address (e.g. <code>00:1A:2B:3C:4D:5E</code>), reserved IP (e.g. <code>192.168.1.52</code>), and select the hardware type.</p>
                  </div>
                </div>

                {/* Tab 3 */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-xs">
                    <IoShieldCheckmarkOutline className="text-base text-emerald-600" />
                    Tab 3: Access Control Lists (ACL) Policy Editor
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    <strong>What it does:</strong> Configures the firewall rules evaluated by the backend Express middleware.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-[11px] text-gray-600">
                    <p>• <strong>Priority Hierarchy:</strong> Rules evaluate from lowest priority number to highest (#10 before #20, before #30). <strong>First match wins</strong>.</p>
                    <p>• <strong>Toggle Rule:</strong> Click <strong>"Active / Disabled"</strong> to immediately toggle a policy without deleting it.</p>
                    <p>• <strong>Add Custom Rule:</strong> Click <strong>"+ Add ACL Rule"</strong>, set Action (ALLOW/DENY), Priority, Source CIDR (e.g. <code>172.16.0.0/20</code>), and Route Pattern (e.g. <code>/api/inventory/*</code>).</p>
                  </div>
                </div>

                {/* Tab 4 */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-xs">
                    <IoPlayOutline className="text-base text-purple-600" />
                    Tab 4: Interactive Packet Tester & Simulator
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    <strong>What it does:</strong> Executes the exact bitwise CIDR and wildcard matching algorithm as the live middleware against arbitrary test inputs.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-[11px] text-gray-600">
                    <p>• <strong>Quick Presets:</strong> Click preset buttons (e.g. <em>"🔴 Student Phone accessing Staff Inventory"</em>) to auto-fill the source IP and target path.</p>
                    <p>• <strong>Simulate:</strong> Click <strong>"Simulate Packet Flow"</strong> to view the PERMITTED vs DROPPED verdict banner and review the step-by-step rule evaluation audit trace.</p>
                  </div>
                </div>

                {/* Tab 5 */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-xs">
                    <IoPulseOutline className="text-base text-red-500" />
                    Tab 5: Live ACL Block Logs & Incident Audit
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    <strong>What it does:</strong> Provides full forensic traceability over unauthorized cross-subnet requests.
                  </p>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Each entry records the exact timestamp, source IP, probed route, HTTP method, and the specific ACL rule that caught and blocked the request.
                  </p>
                </div>

                {/* Tab 6 */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-gray-800 text-xs">
                    <IoPeopleOutline className="text-base text-[#4a6741]" />
                    Tab 6: Connected Users & Real-Time IP Tracker
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    <strong>What it does:</strong> Captures and aggregates live client sessions communicating with the SmartServe backend.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-[11px] text-gray-600">
                    <p>• <strong>Telemetry Columns:</strong> User profile photo, account role, assigned IP, mapped VLAN tag, region (Philippines), and device form factor.</p>
                    <p>• <strong>1-Click Simulate:</strong> Click <strong>"Simulate"</strong> on any user row to immediately transfer their real IP into the Packet Tester to test their access against protected routes.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <span className="text-gray-400 text-[11px]">
            SmartServe System • Network Architecture & Security Guide
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4a6741] text-white rounded-xl font-bold hover:bg-[#3d5535] transition text-xs cursor-pointer shadow-sm"
          >
            <IoCheckmarkDoneOutline className="text-sm" />
            Got It
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

