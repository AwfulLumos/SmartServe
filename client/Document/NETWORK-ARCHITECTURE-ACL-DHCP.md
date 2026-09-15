# SmartServe - Campus Network Architecture, ACLs & DHCP Documentation
**Date:** September 15, 2026  
**Status:** Completed, Verified (`npm run build` - 0 errors, Unit tests - 100% PASS)  
**System:** SmartServe School Cafeteria Management System  

---

> ### Implementation Scope & Educational Modeling Disclaimer
> **Notice for Evaluators & Capstone Panelists:**  
> SmartServe is a full-stack software application built on a Node.js/Express backend, MongoDB database, and React frontend. This project models enterprise networking concepts—including 802.1Q-style VLAN subnet segmentation, Layer 3/4 Access Control Lists (ACLs), and DHCP MAC-to-IP reservation tracking—**at the application layer for educational and demonstrative purposes**.  
> The system does **not** configure or manage physical networking hardware (such as physical managed switches, hardware routers, or bare-metal DHCP daemons). All packet inspection, CIDR subnet matching, and traffic filtering are executed in application logic via custom Express middleware and MongoDB schemas.

---

## Executive Summary

This document details the **Network Architecture, Application-Level Policy Enforcement, and Telemetry Subsystem** integrated into **SmartServe**.

In the SmartServe school ecosystem, network users are logically partitioned into two operational user groups:
1. **Administrators & Staff** (Operating desktop PCs and management laptops in cafeteria offices)
2. **Students** (Accessing the cafeteria web application and BYOC points via personal smartphones over campus Wi-Fi)

To model how administrative controls, student account records, and cafeteria inventory would be protected from unauthorized access or network saturation in a segmented campus environment, SmartServe implements:
1. **VLAN-style subnet segmentation (modeled in application logic)** (Logical zoning separating Admin Management endpoints from Student BYOD smartphones).
2. **Application-Layer Access Control Lists (ACL)** (Bitwise CIDR-based request evaluation, route wildcard matching, and automated security incident logging).
3. **Simulated DHCP reservation system** (Application-level MAC-to-IP binding and device station records for administrative PCs and management laptops).
4. **Interactive Network Management Dashboard & Packet Simulator** (Full admin observability and rule-tracing UI at `/dashboard/settings/network`).

---

## 1. Campus VLAN & Subnet Addressing Scheme

The campus network architecture is modeled after a two-tier segmentation scheme, represented as a conceptual network topology in the SmartServe dashboard:

| VLAN ID | Segment Name | Subnet (CIDR) | Subnet Mask | Default Gateway | Address Allocation Strategy | Access Policy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **VLAN 10** | Admin & Management | `192.168.1.0/24` | `255.255.255.0` | `192.168.1.1` | Application-level static reservation (`.50 - .100`) | Unrestricted Admin & Management Access |
| **VLAN 20** | Student Mobile Wi-Fi (BYOD) | `172.16.0.0/20` | `255.255.240.0` | `172.16.0.1` | Simulated Dynamic DHCP Pool (modeled 2-Hour lease turnover) | Strictly Student Portal (`/api/student/*`) |

### Architectural Design Objectives:
- **Traffic Isolation Design**: In an enterprise campus deployment with 802.1Q switches, separating student Wi-Fi traffic from administrative office traffic isolates broadcast domains and prevents lunch-rush congestion from impacting business operations. SmartServe models this division at the software level, enforcing that requests originating from student IP ranges cannot access management endpoints.
- **DHCP Subnet Capacity Planning**: The student BYOD Wi-Fi network is designed with a `/20` subnet (4,094 usable IP addresses) paired with a conceptual short 2-hour lease duration. In an actual campus cafeteria, high turnover during lunch periods requires short lease recycling to prevent pool exhaustion; SmartServe reflects this design in its network configuration schema.
- **Application-Enforced Subnet Isolation**: Even if a student device on the Wi-Fi network attempts to query administrative API endpoints, SmartServe's ACL middleware evaluates the source IP CIDR and blocks the request before it reaches business logic or database layers.

---

## 2. Access Control List (ACL) Engine

The SmartServe backend features an in-memory cached request inspection middleware (`aclMiddleware.js`) that evaluates incoming HTTP requests against active ACL rules defined in MongoDB.

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
1. **IP Normalization & Extraction**: The client IP address is extracted from `req.ip` or the `X-Forwarded-For` header (with support for developer override via `X-Simulated-IP`) and normalized by stripping IPv6 prefixes (`::ffff:`).
2. **Priority Walk**: Active rules are sorted by `priority ASC` (lowest number evaluated first). The engine evaluates:
   - **HTTP Method Match**: Checks if the request method matches the rule method (`ALL`, `GET`, `POST`, etc.).
   - **Route Wildcard Match**: Evaluates request path against the rule route pattern using wildcard matching (e.g., `/api/student/*`).
   - **Bitwise CIDR Subnet Match**: Converts the IPv4 string to a 32-bit unsigned integer and performs a bitwise AND operation against the subnet mask.
3. **Execution**:
   - **ALLOW**: The request proceeds to the next Express handler (`next()`).
   - **DENY**: Increments rule hit counters, records an incident in MongoDB `AuditLog` under category `"network"`, emits a real-time Socket.IO alert (`network:acl_blocked`) to connected admin clients, and terminates the request with `HTTP 403 Forbidden` (`code: "NETWORK_ACL_VIOLATION"`).

### Operating Modes:
- **`audit_only` (Default / Safe)**: Evaluates rules and logs violations to the audit trail with an `X-ACL-Warning` header, but permits the request through. This allows testing new rules without accidental administrative lockouts.
- **`enforce` (Active Enforcement)**: Actively drops matching forbidden requests with `HTTP 403 Forbidden`.
- **`disabled`**: Bypasses the ACL evaluation engine entirely for debugging.

---

## 3. Simulated DHCP Reservation System & Device Station Management

To model hardware-level device authentication, SmartServe maintains an application-level DHCP reservation database (`DhcpReservation` collection) that binds authorized hardware MAC addresses to dedicated IP addresses.

> **Implementation Note:** This is an application-level device registry and status tracker. SmartServe does not run a bare-metal DHCP server daemon (such as ISC-DHCP or dnsmasq) that listens on UDP port 67/68.

### Registered Hardware Stations

| Station Name | Hardware Type | MAC Address | Reserved IP | Assigned VLAN | Lease Duration | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin Management Workstation (PC)** | Admin Desktop PC | `00:50:56:A3:B1:00` | `192.168.1.50` | VLAN 10 | Static Reservation | Online |
| **Admin Management Laptop** | Admin Laptop | `B8:27:EB:4A:8F:11` | `192.168.1.51` | VLAN 10 | Static Reservation | Online |

### Simulated Station Ping & Telemetry
Administrators can test station availability from the dashboard using the built-in station ping feature (`POST /api/network/dhcp/:id/ping`):
- **Simulated RTT Calculation**: Generates simulated local LAN latency telemetry (randomized between `0.8ms - 4.3ms` for demonstration).
- **Simulated Packet Metrics**: Returns simulated `0%` packet loss and a standard mock `TTL=64`.
- **Heartbeat Update**: Updates the station's `lastSeen` timestamp and `status` in MongoDB, demonstrating how network management consoles track device uptime.

---

## 4. Admin Management Dashboard (`/dashboard/settings/network`)

Administrators and evaluators can observe and configure the network subsystem directly in the web UI:
1. **Conceptual Topology Visualizer**: Visual representation of the campus gateway router, core switch, and active VLAN segments (Admin VLAN 10 and Student Wi-Fi VLAN 20).
2. **DHCP Station Manager**: CRUD interface to register admin devices, track MAC-to-IP bindings, and trigger station ping simulations.
3. **ACL Rule Editor**: Modify rule priorities, configure `ALLOW`/`DENY` actions, toggle rules on/off, or switch global security modes (`Audit-Only` vs. `Enforce`).
4. **Interactive Packet Simulator**:
   - Allows entering an arbitrary source IP address (or choosing quick presets such as *"Student on Wi-Fi"*) and target API path.
   - Executes the exact bitwise CIDR matching logic as the live middleware and renders a step-by-step evaluation trace showing which rules matched and why.
5. **Live ACL Block Logs**: Real-time table of dropped requests and policy violations stored in MongoDB.
6. **Connected Users & IP Tracker (Sub-Tab 6)**: Real-time table of active student and staff sessions, showing live IP addresses, mapped VLAN tags, and a 1-click "Simulate" packet testing button.
7. **In-App Network & Security Guide**: Interactive modal providing architectural documentation, subnet tables, simulation instructions, and capstone presentation notes.

---

## 5. Connected Users & Real-Time IP Telemetry Tracking

SmartServe captures real client connection telemetry during user authentication and session activity:

### Telemetry Pipeline
1. **IP Extraction & Normalization**: Extracts the client IP from `req.ip` or `X-Forwarded-For`, strips IPv6 notation, and normalizes loopback addresses.
2. **Subnet Zone Resolution**:
   - Private subnets map to campus zones (`172.16.0.0/20` maps to VLAN 20 Student Wi-Fi; `192.168.1.0/24` maps to VLAN 10 Admin LAN).
   - Public external IP addresses resolve to **"Philippines"** based on geographic classification.
3. **Device Classification**: Parses the HTTP `User-Agent` header to categorize clients into **Smartphones (Mobile)** or **Desktop PCs / Laptops**.
4. **Active Session Heartbeat & Throttled Telemetry Stamping**:
   - Implemented in `server/middleware/auth.js` (for administrators/staff) and `server/middleware/studentAuth.js` (for students).
   - On incoming authenticated requests, client IP, region, device form factor, and `lastActiveAt` timestamps are refreshed (throttled to once every 30 seconds to maintain database efficiency).
5. **Session Aggregation API (`GET /api/network/sessions`)**:
   - Aggregates active student and staff accounts sorted by `lastActive DESC` with live counters for Wi-Fi vs. LAN clients.
   - Normalizes profile avatars (`avatar`, `profileImage`, `profileImageUrl`) across collections.
   - Employs a robust fallback chain: `lastActiveAt || lastLoginAt || updatedAt || createdAt`.

### UI Touchpoints
- **Main Admin Dashboard**: A full-width **Campus Network & IP Telemetry** table (`AdminNetworkTelemetryTable.jsx`) positioned below Recent Orders, featuring live client counters (`X Wi-Fi`, `Y LAN`), user profile avatars with 2-letter fallback, role badges, monospace IP containers, location badges (**Philippines**), 1-click **"Simulate"** shortcuts, copyable IP tooltips, and dynamic **Last Activity** formatting (`Just now` with pulsing green indicator, `Xm ago`, `Xh ago`, `Xd ago`).
- **Network & Security Tracker Tab**: Sub-Tab 6 (**Connected Users & IP Tracker**) with search filtering and direct integration into the Packet Simulator.
- **In-App Network Architecture & Security Guide**: Accessible directly from the prominent **"Open Security Guide"** button in the page header of `MenuManagement.jsx` and the dashboard telemetry table, providing tab-by-tab manuals and cafeteria threat model documentation.
- **Student Accounts & Profile Lookup**: Displays client IP addresses, location badges, and network telemetry cards within student profile drawers.

---

## 6. Codebase File Index

### Backend Files
- `server/models/NetworkAcl.js` — Mongoose schema for ACL policies.
- `server/models/DhcpReservation.js` — Mongoose schema for simulated DHCP static reservations and device records.
- `server/models/NetworkConfig.js` — Mongoose schema for VLAN subnet configurations and global security modes.
- `server/models/AuditLog.js` — System audit log schema with `"network"` category enum.
- `server/models/Student.js` & `server/models/User.js` — Schemas tracking `lastLoginIp`, `lastLoginRegion`, `lastActiveAt`, and `lastDevice`.
- `server/utils/networkUtils.js` — Bitwise CIDR matching, IP normalization, route wildcard matching, and `resolveIpLocation()`.
- `server/middleware/auth.js` & `server/middleware/studentAuth.js` — Authenticated middlewares with throttled (30s) session telemetry and `lastActiveAt` heartbeat updates.
- `server/middleware/aclMiddleware.js` — Express ACL middleware performing application-layer packet inspection, in-memory caching, and audit logging.
- `server/controllers/networkController.js` — REST API controllers for network overview, DHCP reservations, ACL rules, packet simulation, and session telemetry.
- `server/routes/networkRoutes.js` — Protected API endpoints under `/api/network`.
- `server/index.js` — Registers ACL middleware and mounts network route handlers.

### Frontend Files
- `client/src/pages/admin/MenuManagement.jsx` — Registers the `network` tab in admin navigation and features the prominent **"Open Security Guide"** button on the right side of the page header.
- `client/src/components/admin/menu/NetworkTab.jsx` — Network Dashboard UI with Topology, DHCP Manager, ACL Editor, Simulator, Logs, and Connected Users & IP Tracker.
- `client/src/components/admin/menu/NetworkGuideModal.jsx` — In-app interactive guide modal with purpose, architecture, and step-by-step instructions for all features.
- `client/src/components/admin/dashboard/AdminNetworkTelemetryTable.jsx` — Full-width dashboard tableview displaying live client sessions, profile avatars, and dynamic relative IP telemetry.
- `client/src/pages/admin/AdminDashboard.jsx` — Positions network telemetry table on the primary admin dashboard.
- `client/src/components/admin/registerStudent/UserLookupPanel.jsx` — Network telemetry display within student details panel.
- `client/src/components/admin/registerStudent/RegisterTable.jsx` — IP address and region display under student account rows.
- `client/src/components/AdminLayout.jsx` — Network & Security navigation item in the admin sidebar.

