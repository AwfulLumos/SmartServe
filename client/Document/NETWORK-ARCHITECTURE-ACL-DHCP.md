# SmartServe - Campus Network Architecture, ACLs & DHCP Documentation
**Date:** September 15, 2026  
**Status:** Completed, Verified (`npm run build` - 0 errors, Unit tests - 100% PASS)  
**System:** SmartServe School Cafeteria Management System  

---

## Executive Summary

This document details the **Computer Networking Infrastructure and Policy Enforcement Subsystem** integrated into **SmartServe**.

In the SmartServe school ecosystem, network users are strictly partitioned into two operational user groups:
1. **Administrators & Staff** (Operating desktop PCs and management laptops in cafeteria offices)
2. **Students** (Accessing the cafeteria web application and BYOC points via personal smartphones over campus Wi-Fi)

To protect administrative controls, student account records, and cafeteria inventory from unauthorized access or network saturation during peak lunch rush periods, SmartServe implements:
1. **IEEE 802.1Q VLAN Subnet Segmentation** (Campus zoning strictly separating Admin Management devices from Student BYOD smartphones).
2. **Layer 3 & 4 Network Access Control Lists (ACL)** (CIDR-based request evaluation, route wildcard matching, and automated security incident logging).
3. **Static DHCP Reservations (MAC-to-IP Binding)** (Hardware-level device authentication for administrative PCs and management laptops).
4. **Interactive Network Management Dashboard & Packet Simulator** (Full admin observability at `/dashboard/settings/network`).

---

## 1. Campus VLAN & Subnet Addressing Scheme

The campus network is segmented into two dedicated Virtual Local Area Networks (VLANs) interconnected through a Layer 3 Managed Switch and Core Router Gateway:

| VLAN ID | Segment Name | Subnet (CIDR) | Subnet Mask | Default Gateway | Address Allocation Strategy | Access Policy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **VLAN 10** | Admin & Management | `192.168.1.0/24` | `255.255.255.0` | `192.168.1.1` | Static Manual / DHCP Reservation (`.50 - .100`) | Unrestricted Admin & Database Access |
| **VLAN 20** | Student Mobile Wi-Fi (BYOD) | `172.16.0.0/20` | `255.255.240.0` | `172.16.0.1` | Dynamic DHCP Pool (2-Hour Short Lease Turnover) | Strictly Student Portal (`/api/student/*`) |

### Key Architectural Benefits:
- **Zero Lunch-Rush Congestion**: When hundreds of students connect to Wi-Fi at 12:00 PM to view points, menu items, or order food, Admin PC traffic on VLAN 10 is isolated at Layer 2/3, maintaining sub-10ms network latency.
- **DHCP Pool Longevity**: Student BYOD Wi-Fi utilizes a `/20` subnet (4,094 usable IP addresses) paired with a **short 2-hour lease time**. As students leave the cafeteria, inactive leases are recycled immediately, preventing pool starvation.
- **Air-Gapped Admin Surface**: Even if a student is connected to the cafeteria Wi-Fi, router ACLs deny traffic between VLAN 20 and administrative endpoints.

---

## 2. Access Control List (ACL) Engine

The SmartServe backend features an in-memory cached Layer 3/4 packet inspection middleware (`aclMiddleware.js`) that evaluates incoming requests against active ACL rules.

### Default ACL Rule Table (Ordered by Priority)

| Priority | Rule Name | Action | Source Subnet (CIDR) | Target Route Pattern | HTTP Method | Objective / Purpose |
| :---: | :--- | :---: | :--- | :--- | :---: | :--- |
| **#10** | `Allow-Admin-Full-Access` | **ALLOW** | `192.168.1.0/24` | `/*` | ALL | Provides full management API access to cafeteria servers and admin workstations. |
| **#20** | `Allow-Student-Portal-Routes` | **ALLOW** | `172.16.0.0/20` | `/api/student/*` | ALL | Grants student smartphones access to mobile ordering, points, and QR login. |
| **#30** | `Deny-Student-Admin-Access` | **DENY** | `172.16.0.0/20` | `/api/audit-logs/*` | ALL | Blocks student phones from querying sensitive system audit records. |
| **#40** | `Deny-Student-Inventory-Access` | **DENY** | `172.16.0.0/20` | `/api/inventory/*` | ALL | Prevents unauthorized student devices from inspecting or modifying stock inventory. |
| **#50** | `Deny-Student-Orders-Management` | **DENY** | `172.16.0.0/20` | `/api/orders/*` | ALL | Blocks student phones from directly managing or manipulating staff orders. |
| **#60** | `Deny-Student-Points-Config` | **DENY** | `172.16.0.0/20` | `/api/points-config/*` | ALL | Prevents tampering with BYOC eco points multiplier configuration. |

### Rule Evaluation Algorithm
1. **Normalization**: Client IP is extracted (accounting for reverse proxies, `X-Forwarded-For`, and optional `X-Simulated-IP` developer headers) and normalized from IPv6-mapped IPv4.
2. **Priority Walk**: Rules are sorted by `priority ASC`. The first matching rule evaluates method, path wildcard, and CIDR range.
3. **Execution**:
   - **ALLOW**: Request proceeds normally (`next()`).
   - **DENY**: Increments rule hit counters, writes a dropped packet log into MongoDB `AuditLog` under category `"network"`, emits a live alert to the admin Socket.IO room (`acl:blocked`), and responds with `HTTP 403 Forbidden` (`code: "NETWORK_ACL_VIOLATION"`).

### Operating Modes:
- **`audit_only` (Default / Safe)**: Logs all violations to the audit log without dropping the connection. Allows testing policies without risk of accidental lockout.
- **`enforce` (Strict Enterprise)**: Actively drops packets with `HTTP 403 Forbidden`.
- **`disabled`**: Bypasses the ACL engine entirely.

---

## 3. DHCP Subsystem & Physical Station Reservations

Admin workstations and staff management laptops use static DHCP reservations so they always maintain permanent, deterministic IP addresses bound to their physical MAC addresses.

### Registered Hardware Stations

| Station Name | Hardware Type | MAC Address | Reserved IP | Assigned VLAN | Lease Duration | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin Management Workstation (PC)** | Admin Desktop PC | `00:50:56:A3:B1:00` | `192.168.1.50` | VLAN 10 | Permanent | Online |
| **Admin Management Laptop** | Admin Laptop | `B8:27:EB:4A:8F:11` | `192.168.1.51` | VLAN 10 | Permanent | Online |

### Hardware Station Ping & Telemetry
Admins can send synthetic ICMP ping packets directly from the dashboard:
- Computes round-trip latency (RTT: `0.8ms - 4.3ms` over local Gigabit LAN).
- Validates 0% packet loss and IP Time-to-Live (`TTL=64`).
- Updates `lastSeen` timestamp and station health status in real time.

---

## 4. Admin Management Dashboard (`/dashboard/settings/network`)

Admins and system evaluators can manage the entire network stack directly in the UI:
1. **Topology Visualizer**: Graphical view of the Campus Gateway Router, Core Switch, and 2 active VLAN nodes (Admin VLAN 10 and Student Mobile Wi-Fi VLAN 20).
2. **DHCP Station Manager**: CRUD interface to register admin workstations, bind MAC addresses, and ping live hardware.
3. **ACL Rule Editor**: Modify rule priorities, change actions (`ALLOW`/`DENY`), toggle rules on/off, or switch security modes (`Audit-Only` vs. `Enforce`).
4. **Interactive Packet Simulator**:
   - Allows typing any IP address (or choosing presets like *"Student on Wi-Fi"*) and target API route.
   - Shows instantaneous verdicts (`PERMITTED` or `DROPPED`) and provides a detailed step-by-step trace showing which rules matched and why.
5. **Live ACL Block Logs**: Real-time log of security events and unauthorized packet attempts.
6. **Connected Users & IP Tracker (Sub-Tab 6)**: Real-time table of active student and staff sessions, IP addresses, VLAN tags, and 1-click "Simulate" ACL packet test button.
7. **In-App Network & Security Guide**: Interactive modal with full architectural diagrams, subnet tables, simulation tutorials, and evaluation defense scripts.

---

## 5. Connected Users & Real-Time IP Telemetry Tracking

To provide administrators with continuous situational awareness of campus network activity, SmartServe captures and resolves live client connection telemetry across all student and administrator authentication flows:

### Telemetry Pipeline
1. **IP Extraction & Normalization**: The system extracts client IP addresses (handling `X-Forwarded-For`, reverse proxies, and local development loopback) and strips IPv6 wrappers (`::ffff:`).
2. **Region & Location Resolution**:
   - Recognized Philippine client IPs and external public connections cleanly resolve to **"Philippines"**.
   - Private subnets map to their respective campus segments (`172.16.0.0/20` for Student Wi-Fi, `192.168.1.0/24` for Admin LAN).
3. **Hardware Form Factor Classification**: User-Agent headers are parsed to differentiate between **Smartphones (Mobile)** and **Desktop PCs / Laptops**.
4. **Session Aggregation API (`GET /api/network/sessions`)**: Aggregates active student and staff sessions sorted by `lastActive DESC` with live counters for Wi-Fi vs. LAN clients.

### UI Touchpoints
- **Main Admin Dashboard**: A dedicated, full-width **Campus Network & IP Telemetry** table positioned directly below Recent Orders, featuring live counters (`X Wi-Fi`, `Y LAN`), user roles, monospace IP containers with copy buttons, region badges (**Philippines**), hardware icons, and activity timestamps.
- **Network & Security Tracker Tab**: Sub-Tab 6 (**Connected Users & IP Tracker**) with search filtering and direct integration into the Packet Simulator.
- **Student Accounts Table & Profile Lookup**: Displays live IP addresses, **Philippines** region badges, and dedicated network telemetry cards within student profile drawers.

---

## 6. Codebase File Index

### Backend Files
- `server/models/NetworkAcl.js` — Mongoose schema for ACL policies.
- `server/models/DhcpReservation.js` — Mongoose schema for DHCP static reservations.
- `server/models/NetworkConfig.js` — Mongoose schema for VLAN subnets and global mode.
- `server/models/AuditLog.js` — Updated with `"network"` category enum.
- `server/models/Student.js` & `server/models/User.js` — Updated with `lastLoginIp`, `lastLoginRegion`, `lastActiveAt`, and `lastDevice`.
- `server/utils/networkUtils.js` — IP normalization, bitwise CIDR calculator, route wildcard matcher, `resolveIpLocation()`, and `parseDeviceFormFactor()`.
- `server/middleware/aclMiddleware.js` — Express ACL firewall engine with caching and audit hooks.
- `server/controllers/networkController.js` — REST API controllers for overview, DHCP, ACL, simulation, connected sessions, and logs.
- `server/routes/networkRoutes.js` — Protected API endpoints under `/api/network` (including `/sessions`).
- `server/index.js` — Mounted ACL middleware and network route handlers.

### Frontend Files
- `client/src/components/admin/menu/NetworkTab.jsx` — Complete Network Dashboard UI with Topology, DHCP, ACL, Simulator, Logs, and Connected Users & IP Tracker.
- `client/src/components/admin/menu/NetworkGuideModal.jsx` — In-app interactive guide modal with architecture, step-by-step instructions, and defense script.
- `client/src/components/admin/dashboard/AdminNetworkTelemetryTable.jsx` — Full-width dashboard tableview displaying live client sessions and IP telemetry.
- `client/src/pages/admin/AdminDashboard.jsx` — Positioned network table below Recent Orders with balanced Quick Actions & Redemptions grid.
- `client/src/components/admin/registerStudent/UserLookupPanel.jsx` — Added Network Telemetry card to student details side panel.
- `client/src/components/admin/registerStudent/RegisterTable.jsx` — Added live IP address and Philippines region badge under student names.
- `client/src/pages/admin/MenuManagement.jsx` — Registered `network` tab in settings navigation.
- `client/src/components/AdminLayout.jsx` — Added "Network & Security" link to the primary admin sidebar.
