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
} from "react-icons/io5";
import { MdRouter, MdSecurity, MdLan } from "react-icons/md";

export default function NetworkGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col border border-gray-100 relative z-10">
        {/* Modal Header */}
        <div className="bg-[#4a6741] text-white px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-2xl">
              <IoHelpCircleOutline />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Network Architecture & Security Guide</h3>
              <p className="text-xs text-white/80">
                How campus VLANs, DHCP hardware reservations, and ACL policies protect SmartServe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition text-white cursor-pointer"
          >
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-600">
          {/* Section 1: The 2-Tier Campus Network Hierarchy */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
              1. The 2-Tier Campus Network Architecture
            </h4>
            <p className="text-gray-500 mb-3 leading-relaxed">
              In SmartServe, the system is designed strictly around two user groups: <strong>Administrators</strong> (operating from office PCs or laptops) and <strong>Students</strong> (accessing their portal via smartphones). The network is physically segmented into two Virtual LANs:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-1.5 text-purple-700 font-bold">
                  <IoLaptopOutline className="text-lg" />
                  <span className="text-sm">VLAN 10 — Admin & Management Network</span>
                </div>
                <div className="font-mono text-xs text-purple-900 font-black mb-1.5">192.168.1.0/24</div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Administrator PCs and management laptops. Has unrestricted access to all endpoints, student management, menu configurations, and security audit logs.
                </p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                <div className="flex items-center gap-2 mb-1.5 text-emerald-700 font-bold">
                  <IoPhonePortraitOutline className="text-lg" />
                  <span className="text-sm">VLAN 20 — Student Mobile Wi-Fi Network</span>
                </div>
                <div className="font-mono text-xs text-emerald-900 font-black mb-1.5">172.16.0.0/20</div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Student personal smartphones on cafeteria Wi-Fi. Restricted strictly to <code>/api/student/*</code>. Dynamic 2-hour DHCP leases ensure IP addresses recycle as students leave.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Global Security Modes */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
              2. Security Operating Modes
            </h4>
            <p className="text-gray-500 mb-3 leading-relaxed">
              You can switch the global policy mode using the dropdown in the top-left card:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-3 border border-amber-200">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase flex-shrink-0 mt-0.5">
                  Audit-Only (Safe)
                </span>
                <span className="text-gray-700 leading-relaxed">
                  <strong>Recommended for testing & demos</strong>. Unauthorized packets are logged to the audit log and tagged with warning headers, but are permitted through so staff or testers are never locked out accidentally.
                </span>
              </div>

              <div className="flex items-start gap-3 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase flex-shrink-0 mt-0.5">
                  Enforce (Strict)
                </span>
                <span className="text-gray-700 leading-relaxed">
                  <strong>Strict production mode</strong>. Any request violating an ACL rule is dropped with <code>HTTP 403 Forbidden (NETWORK_ACL_VIOLATION)</code>.
                </span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: DHCP Reservations & Hardware MAC Binding */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
              3. DHCP Reservations & Hardware MAC Binding
            </h4>
            <p className="text-gray-500 mb-2 leading-relaxed">
              Why bind MAC addresses to static IP addresses?
            </p>
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-start gap-2.5">
                <MdRouter className="text-blue-600 text-lg flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Deterministic Admin Addressing:</strong> Administrator desktop PCs and management laptops have permanent IP reservations bound to physical MAC addresses to prevent unauthorized rogue devices from claiming administrative IP space.
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-start gap-2.5">
                <IoPulseOutline className="text-emerald-600 text-lg flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Live ICMP Ping Test:</strong> Click the blue <strong>"Ping"</strong> button in any station row to test connectivity. The system measures real-time latency (RTT in ms), packet loss (0%), and Time-To-Live (TTL 64).
                </span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 4: Access Control Lists (ACL) Policy Engine */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
              4. Access Control Lists (ACL) Rules
            </h4>
            <p className="text-gray-500 mb-2 leading-relaxed">
              How rules are evaluated by the backend firewall:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="font-bold text-gray-800 block mb-1">Priority Hierarchy</span>
                <p className="text-[11px] text-gray-600">
                  Rules evaluate in order from <strong>lowest priority number to highest</strong> (#10 before #20, before #30). The <strong>first rule that matches</strong> determines whether the packet is permitted (ALLOW) or dropped (DENY).
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="font-bold text-gray-800 block mb-1">Toggling Rules</span>
                <p className="text-[11px] text-gray-600">
                  Click the <strong>"Active / Disabled"</strong> button next to any rule to turn it off temporarily without deleting it. The cache refreshes instantly.
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 5: Testing with the Packet Simulator */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
              5. Using the Interactive Packet Tester / Simulator
            </h4>
            <p className="text-gray-500 mb-3 leading-relaxed">
              The simulator allows you to test whether an IP address and endpoint will be permitted or blocked without needing physical devices:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <li>Navigate to the <strong>"Packet Tester / Simulator"</strong> tab.</li>
              <li>Click any of the <strong>Quick Scenario Presets</strong> (e.g. <em>"🔴 Student Phone accessing Staff Inventory"</em>).</li>
              <li>Click <strong>"Simulate Packet Flow"</strong>.</li>
              <li>Observe the <strong>Verdict Banner</strong> (PERMITTED vs DROPPED) and the <strong>Rule Evaluation Trace</strong> explaining each step.</li>
            </ol>
          </div>

          <hr className="border-gray-100" />

          {/* Section 6: Connected Users & Live IP Tracker */}
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#4a6741] rounded-full inline-block"></span>
              6. Connected Users & IP Tracker
            </h4>
            <p className="text-gray-500 mb-3 leading-relaxed">
              Provides real-time visibility over all student smartphones and administrator workstations connecting to SmartServe:
            </p>
            <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-gray-700">
              <p>• <strong>Live KPIs:</strong> Shows real-time counts of students active on Wi-Fi (VLAN 20) and admins on LAN (VLAN 10).</p>
              <p>• <strong>Region:</strong> Cleanly identifies geographical region as <strong>Philippines</strong>.</p>
              <p>• <strong>Instant ACL Testing:</strong> Click the <strong>"Simulate"</strong> button on any user row to pre-fill their real IP into the Packet Tester to verify firewall permissions.</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <span className="text-gray-400 text-[11px]">SmartServe • Network Architecture Manual</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#4a6741] text-white rounded-xl font-bold hover:bg-[#3d5535] transition text-xs cursor-pointer shadow-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
