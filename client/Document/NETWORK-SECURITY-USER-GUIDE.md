# SmartServe - Network & Security Management Guide
**Document:** Admin & Evaluator User Manual  
**Path:** `/dashboard/settings/network`  
**System Version:** SmartServe  
**Target Audience:** Cafeteria Administrators, Sysadmins, Teachers & Evaluators  

---

> ### Architectural Note for Evaluators
> SmartServe models campus network architecture (VLAN segmentation, DHCP reservations, and ACL policies) at the **application layer**. Packet inspection, CIDR evaluations, and route filtering are executed directly in Node.js/Express middleware and visualized through an interactive React dashboard. The system does not configure physical network switches or run a bare-metal DHCP daemon.

---

## Table of Contents
1. [Overview & Access](#1-overview--access)
2. [Global Security Modes (Enforce vs. Audit-Only)](#2-global-security-modes)
3. [Tab 1: Campus Network Topology & VLANs](#3-tab-1-campus-network-topology--vlans)
4. [Tab 2: Simulated DHCP Reservations & Station Manager](#4-tab-2-simulated-dhcp-reservations--station-manager)
5. [Tab 3: Access Control Lists (ACL) Policy Editor](#5-tab-3-access-control-lists-acl-policy-editor)
6. [Tab 4: Interactive Packet Tester & Simulator](#6-tab-4-interactive-packet-tester--simulator)
7. [Tab 5: Live ACL Block Logs & Incident Audit](#7-tab-5-live-acl-block-logs--incident-audit)
8. [Tab 6: Connected Users & IP Tracker](#8-tab-6-connected-users--ip-tracker)
9. [Admin Dashboard Campus Network Tableview](#9-admin-dashboard-campus-network-tableview)
10. [Step-by-Step Presentation / Demonstration Script](#10-step-by-step-presentation--demonstration-script)

---

## 1. Overview & Access

The **Network & Security** dashboard provides cafeteria administrators and evaluators with centralized visibility and policy enforcement over devices communicating with the SmartServe application.

### How to Navigate to the Page:
1. Log into SmartServe with an **Admin Account** at `/login`.
2. On the left sidebar navigation, click on **"Network & Security"** (network fork icon).
3. Alternatively, navigate directly in your browser to:  
   `http://localhost:5173/dashboard/settings/network`

---

## 2. Global Security Modes

Located in the top-left summary card, this dropdown controls how the application firewall engine evaluates incoming HTTP requests:

```
┌─────────────────────────────────────────┐
│ SECURITY MODE                           │
│ [ Audit-Only (Safe)                  ▼] │
│ • 2 Online Stations   • 6 ACL Rules     │
│ • 0 Blocked Packets (Real-time Active)  │
└─────────────────────────────────────────┘
```

| Mode | Behavior | Recommended Use Case |
| :--- | :--- | :--- |
| **Audit-Only (Safe)** *(Default)* | Requests that violate ACL rules are **permitted through**, but an `X-ACL-Warning` header is attached and an incident log is recorded in MongoDB. | **Testing & Evaluation**: Allows testing ACL rule logic without locking out staff during active cafeteria service. |
| **Enforce (Active)** | Requests that violate ACL rules are **actively blocked** with `HTTP 403 Forbidden` (`code: "NETWORK_ACL_VIOLATION"`). | **Production Enforcement**: Active application-layer traffic restriction. Requests from student IP ranges cannot access management endpoints. |
| **Disabled** | Completely bypasses the ACL evaluation engine. | Troubleshooting, benchmarking, or local development. |

> **Localhost Development Handling**: In local testing, requests from `127.0.0.1` and `localhost` are treated as Admin Management traffic by default (unless an `X-Simulated-IP` header is explicitly provided), preventing accidental lockouts while developing.

---

## 3. Tab 1: Campus Network Topology & VLANs

This tab presents a visual architectural map of how campus network zones are logically partitioned in the SmartServe system model:

### The 2-Tier Logical Network Model:
1. **VLAN 10 — Admin & Management Network (`192.168.1.0/24`)**:
   * **Target Devices**: Administrator desktop PCs, management laptops, central SmartServe server.
   * **Access Rights**: Unrestricted read/write access to all API endpoints, orders, inventory, student accounts, and system configurations.
2. **VLAN 20 — Student Mobile Wi-Fi Network (`172.16.0.0/20`)**:
   * **Target Devices**: Student personal smartphones connecting over campus Wi-Fi.
   * **Access Rights**: Restricted to `/api/student/*` endpoints. Requests attempting to probe staff or management endpoints are intercepted and logged or blocked based on the active security mode.

---

## 4. Tab 2: Simulated DHCP Reservations & Station Manager

SmartServe maintains an application-level registry of authorized administrative devices in MongoDB (`DhcpReservation` collection), modeling how static DHCP reservations and MAC-to-IP bindings function in enterprise network administration.

> **Technical Note:** This tab manages database records representing physical devices. It does not replace a bare-metal DHCP server daemon; rather, it provides administrators with a centralized inventory and device status tracking interface.

### Features in this Tab:
* **Hardware MAC-to-IP Binding**: Admin PCs and laptops are registered with their physical MAC addresses and assigned static management IPs (`192.168.1.50`, `192.168.1.51`).
* **Station Ping & Availability Check**:
  1. Locate a registered device row (e.g., *Admin Management Workstation (PC)*).
  2. Click the blue **"Ping"** button.
  3. The backend executes a simulated ping check (`POST /api/network/dhcp/:id/ping`), updating the station's `lastSeen` timestamp in MongoDB and returning simulated telemetry:
     ```text
     Ping Reply Received from Admin Management Workstation (PC)
     IP: 192.168.1.50 | MAC: 00:50:56:A3:B1:00 | Simulated RTT: ~2.1ms | Loss: 0% | TTL: 64
     ```
     *(Note: Latency values between 0.8ms – 4.3ms and TTL=64 are simulated response telemetry for UI demonstration, not raw ICMP socket probes).*
* **Registering a New Station**:
  1. Click **"+ Register New Station"**.
  2. Enter the device name (e.g., *"Admin Portable Laptop"*).
  3. Enter the device MAC address (e.g., `00:1A:2B:3C:4D:5E`).
  4. Enter the reserved IP address (e.g., `192.168.1.52`).
  5. Select Device Type (**Admin Desktop PC** or **Admin Laptop**).
  6. Click **"Bind MAC & Reserve IP"**.

---

## 5. Tab 3: Access Control Lists (ACL) Policy Editor

The ACL Policy Editor manages the rule set loaded by SmartServe's `aclMiddleware.js`. Rules are stored in MongoDB and cached in memory for sub-millisecond route evaluation.

### How Rules are Evaluated:
* Rules are sorted and evaluated in ascending priority order (`priority ASC`: `#10` → `#20` → `#30`...).
* **First Match Wins**: The first rule matching the client IP (via bitwise CIDR calculation), HTTP method, and route pattern determines the outcome (`ALLOW` or `DENY`).
* If no custom rule matches, the system applies the global default action (`ALLOW`).

### Managing Rules:
* **Active / Inactive Toggle**: Click the status toggle button on any rule to enable or disable it immediately without deletion. The in-memory cache is automatically invalidated.
* **Adding a Custom Rule**:
  1. Click **"+ Add ACL Rule"**.
  2. Choose the **Action** (`DENY` or `ALLOW`).
  3. Set the **Priority** (e.g., `25` to evaluate between rule `#20` and `#30`).
  4. Enter the **Source Subnet CIDR** (e.g., `172.16.0.0/20` for Student Wi-Fi, or `*` for any IP).
  5. Enter the **Target Route Pattern** (e.g., `/api/inventory/*`).
  6. Select the HTTP Method (`ALL`, `GET`, `POST`, `PUT`, `DELETE`).
  7. Click **"Save & Apply Policy"**.

---

## 6. Tab 4: Interactive Packet Tester & Simulator

The Packet Simulator allows administrators and capstone evaluators to test how any theoretical network packet will be evaluated by the ACL rule engine without needing physical devices or separate subnets.

### How to Run a Simulation:
1. Navigate to the **"Packet Tester / Simulator"** tab.
2. Select a **Quick Scenario Preset**:
   * 🔴 **Student Phone accessing Staff Inventory**: Pre-fills IP `172.16.4.15` and route `/api/inventory`.
   * 🟢 **Student Phone accessing Student Portal**: Pre-fills IP `172.16.4.15` and route `/api/student/auth/login`.
   * 🟢 **Admin Workstation PC querying Audit Logs**: Pre-fills IP `192.168.1.50` and route `/api/audit-logs`.
3. Or manually enter any IPv4 address, HTTP method, and API path.
4. Click **"Simulate Packet Flow"**.

### Interpreting the Results:
* **Verdict Banner**:
  * 🟢 **PERMITTED (ALLOW)**: The request satisfies an ALLOW rule (or default policy) and would reach the route controller.
  * 🔴 **DROPPED (DENY)**: The request matches a DENY rule and would be rejected with HTTP 403 in Enforce mode (or logged with a warning in Audit-Only mode).
* **Step-by-Step Evaluation Trace**: Displays every rule evaluated in order of priority, indicating whether the source CIDR, HTTP method, and route pattern matched, and highlighting the exact rule that made the final decision.

---

## 7. Tab 5: Live ACL Block Logs & Incident Audit

Whenever an unauthorized cross-subnet request is detected, SmartServe creates an audit log entry in MongoDB under category `"network"` and emits a real-time event to the admin Socket.IO room:

* **Timestamp**: Exact date and time of the incident.
* **Source IP**: The client IP address that made the request.
* **Target Route & Method**: The API endpoint and HTTP method probed (e.g., `GET /api/inventory`).
* **Enforced Rule**: The specific ACL rule that triggered the block (e.g., `Deny-Student-Inventory-Access`).
* **Description**: Detailed audit statement recording the security action.

---

## 8. Tab 6: Connected Users & IP Tracker

This tab provides real-time visibility into active client sessions communicating with the SmartServe backend:

### Key Features:
* **Campus Zone Summary Pills**:
  - **Students on Wi-Fi (VLAN 20)**: Live count of active student sessions originating from the `172.16.0.0/20` subnet.
  - **Admins on LAN (VLAN 10)**: Count of active administrator sessions on the `192.168.1.0/24` subnet.
  - **Primary Region**: Regional aggregation badge (strictly standardizing public/Philippine connections as **"Philippines"**).
* **Session Filtering**: Search active sessions by user name, student ID, IP address, or device type.
* **Session Table Columns**:
  - **User / Student**: Name, school ID, and circular user profile image with an automatic 2-letter uppercase initials fallback.
  - **Account Type**: Distinguishes *Student (BYOD)* (emerald badge) from *System Administrator* or *Cafeteria Staff* (purple badge).
  - **Assigned IP Address**: Monospace IP container with copy button, copy toast confirmation, and mapped VLAN tag (`VLAN 10` or `VLAN 20`).
  - **Region**: Location pin with standardized **Philippines** geographic indicator.
  - **Device Form Factor**: Hardware category parsed from HTTP User-Agent (*Smartphone (Mobile)* with phone icon vs. *Desktop PC / Laptop* with desktop icon).
  - **Last Activity**: Dynamic, real-time relative formatting:
    - *$< 45\text{s}$*: **`Just now`** with a green pulsing indicator ($\bullet$).
    - *$< 60\text{m}$*: **`Xm ago`** (e.g. `4m ago`).
    - *$< 24\text{h}$*: **`Xh ago`** (e.g. `2h ago`).
    - *$< 7\text{d}$*: **`Xd ago`** (e.g. `3d ago`).
    - *Older*: Short date (`Sep 14`).
    - *Hover tooltip*: Reveals the exact full date and time (`Sep 15, 2026, 12:15:30 PM`).
    - *Unrecorded*: Displays `No activity` gracefully instead of false claims.
  - **"Simulate" Shortcut**: 1-click action button that immediately transfers the user's real assigned IP into Tab 4 (Packet Simulator) to audit their route permissions against sensitive endpoints.

---

## 9. Admin Dashboard Campus Network Tableview

On the primary Admin Dashboard (`/dashboard`), the **Campus Network & IP Telemetry** component (`AdminNetworkTelemetryTable.jsx`) is integrated directly beneath the **Recent Orders** table:

* **Synchronized Design**: Styled to match the exact aesthetics of Tab 6 (`w-full text-left text-xs`, `bg-gray-50/80` headers, padded table rows, circular profile avatars with initials fallback, device form factor icons, and location tags).
* **Active Session Heartbeat**: Integrates with the backend 30-second throttled heartbeat in `auth.js` and `studentAuth.js`, ensuring active admins and students maintain up-to-date `lastActive` timestamps and current IP classifications.
* **Header Actions & Status**:
  - Live counters for `X Wi-Fi (VLAN 20)` and `Y LAN (VLAN 10)`.
  - **"Guide" Button**: One-click trigger launching the comprehensive Network Architecture & Security modal directly from the dashboard.
  - **"View All" Link**: Navigates directly to the full Connected Users & IP Tracker tab (`/dashboard/settings/network?subTab=sessions`).
* **1-Click "Simulate"**: Direct action on each row transferring the user IP to the firewall packet tester.

---

## 10. In-App Interactive Guide & Operational Walkthrough

Administrators can access the in-app **Network Architecture & Security Guide** at any time:
1. **Primary Access Point**: Click the prominent **"Open Security Guide"** button located on the top-right side of the **Network Architecture & Security** header in `MenuManagement.jsx`.
2. **Dashboard Access Point**: Click the **"Guide"** button on the header of the **Campus Network & IP Telemetry** widget on the main dashboard.

### Operational Verification Flow:
1. **Verify Operating Mode**: Ensure the top-left mode selector is set to **Audit-Only (Safe)** for testing or **Enforce (Strict)** for live blocking.
2. **Check DHCP Station Health**: Navigate to Tab 2 and click **"Ping"** on an authorized management workstation to verify application availability and simulated latency telemetry (0.8ms – 4.3ms RTT).
3. **Simulate Cross-Zone Request**:
   - In Tab 4 (Packet Simulator), select preset *"Student Phone accessing Staff Inventory"*.
   - Click **"Simulate Packet Flow"**.
   - Verify that Rule #40 (`Deny-Student-Inventory-Access`) matches the `172.16.0.0/20` CIDR and yields a **DROPPED** verdict.
4. **Simulate Legitimate Student Request**:
   - Select preset *"Student Phone accessing Student Portal"*.
   - Click **"Simulate Packet Flow"**.
   - Verify that Rule #20 matches and yields a **PERMITTED** verdict.
5. **Inspect Incident Audit Logs**: Navigate to Tab 5 to verify forensic traceability of all dropped and flagged packets.
6. **Monitor Live Sessions**: Check Tab 6 or the main dashboard table to verify real-time user avatars, IPs, VLAN zones, and dynamic **Last Activity** indicators.
