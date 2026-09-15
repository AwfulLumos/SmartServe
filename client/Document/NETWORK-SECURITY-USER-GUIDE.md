# SmartServe - Network & Security Management Guide
**Document:** Admin & Evaluator User Manual  
**Path:** `/dashboard/settings/network`  
**System Version:** SmartServe  
**Target Audience:** Cafeteria Administrators, Sysadmins, Teachers & Evaluators  

---

## Table of Contents
1. [Overview & Access](#1-overview--access)
2. [Global Security Modes (Enforce vs. Audit-Only)](#2-global-security-modes)
3. [Tab 1: Campus Network Topology & VLANs](#3-tab-1-campus-network-topology--vlans)
4. [Tab 2: DHCP Reservations & Hardware Station Manager](#4-tab-2-dhcp-reservations--hardware-station-manager)
5. [Tab 3: Access Control Lists (ACL) Policy Editor](#5-tab-3-access-control-lists-acl-policy-editor)
6. [Tab 4: Interactive Packet Tester & Simulator](#6-tab-4-interactive-packet-tester--simulator)
7. [Tab 5: Live ACL Block Logs & Incident Audit](#7-tab-5-live-acl-block-logs--incident-audit)
8. [Tab 6: Connected Users & IP Tracker](#8-tab-6-connected-users--ip-tracker)
9. [Admin Dashboard Campus Network Tableview](#9-admin-dashboard-campus-network-tableview)
10. [Step-by-Step Presentation / Demonstration Script](#10-step-by-step-presentation--demonstration-script)

---

## 1. Overview & Access

The **Network & Security** dashboard provides cafeteria administrators and network engineers with centralized visibility and policy enforcement over all devices communicating with SmartServe.

### How to Navigate to the Page:
1. Log into SmartServe with an **Admin Account** at `/login`.
2. On the left sidebar navigation, click on **"Network & Security"** (with the network fork icon).
3. Alternatively, navigate directly in your browser to:  
   `http://localhost:5173/dashboard/settings/network`

---

## 2. Global Security Modes

Located in the top-left summary card, this dropdown controls how the firewall engine treats incoming packets:

```
┌─────────────────────────────────────────┐
│ SECURITY MODE                           │
│ [ Audit-Only (Safe)                  ▼] │
│ • 3 Online Stations   • 7 ACL Rules     │
│ • 0 Blocked Packets (Real-time Active)  │
└─────────────────────────────────────────┘
```

| Mode | Behavior | Recommended Use Case |
| :--- | :--- | :--- |
| **Audit-Only (Safe)** *(Default)* | Requests that violate ACL rules are **permitted through**, but a warning header `X-ACL-Warning` is attached and an incident log is recorded in MongoDB. | **Testing & Development**: Allows testing ACL rules without accidentally locking out staff during counter hours. |
| **Enforce (Strict)** | Requests that violate ACL rules are **immediately dropped** with `HTTP 403 Forbidden` (`code: "NETWORK_ACL_VIOLATION"`). | **Production**: Full zero-trust campus security. Students cannot hit staff APIs even if they find the URL or intercept a token. |
| **Disabled** | Completely bypasses the ACL evaluation engine for maximum throughput. | High-volume debugging or offline maintenance. |

> **Localhost Protection**: In development mode, requests from `127.0.0.1` and `localhost` are automatically treated as Admin Management traffic so you never accidentally lock yourself out of the dashboard while testing.

---

## 3. Tab 1: Campus Network Topology & VLANs

This tab provides a visual architectural map of how physical network hardware is segmented in the cafeteria:

### The 2-Tier Campus Network Hierarchy:
1. **VLAN 10 — Admin & Management Network (`192.168.1.0/24`)**:
   * **Devices**: Administrator desktop PCs, management laptops, central SmartServe server.
   * **Access**: Unrestricted read/write access to all API endpoints, orders, inventory, student accounts, and database records.
2. **VLAN 20 — Student Mobile Wi-Fi Network (`172.16.0.0/20`)**:
   * **Devices**: Student personal smartphones connecting over campus Wi-Fi.
   * **Access**: Restricted strictly to `/api/student/*` routes. All attempts to probe or modify staff/admin endpoints are intercepted and dropped.

---

## 4. Tab 2: DHCP Reservations & Hardware Station Manager

Administrator PCs and management laptops maintain permanent, deterministic IP addresses bound to physical hardware MAC addresses to protect administrative network space.

### Features in this Tab:
* **Hardware MAC Binding**: Admin PCs and laptops have their MAC addresses bound to specific IPs (`192.168.1.50`, `192.168.1.51`). If an unauthorized device connects, it cannot claim administrative IP space.
* **Live ICMP Ping Test**:
  1. Find any station row (e.g., *Admin Management Workstation (PC)*).
  2. Click the blue **"Ping"** button.
  3. The system sends an ICMP ping test and returns live telemetry:
     ```
     ICMP Ping Reply Received from Admin Management Workstation (PC)
     IP: 192.168.1.50 | MAC: 00:50:56:A3:B1:00 | RTT: 1.42ms | Loss: 0% | TTL: 64
     ```
* **Registering a New Station**:
  1. Click **"+ Register New Station"**.
  2. Enter the device name (e.g., *"Admin Portable Laptop"*).
  3. Enter the physical hardware MAC address (e.g., `00:1A:2B:3C:4D:5E`).
  4. Enter the reserved IP address (e.g., `192.168.1.52`).
  5. Select Device Type (**Admin Desktop PC** or **Admin Laptop**).
  6. Click **"Bind MAC & Reserve IP"**.

---

## 5. Tab 3: Access Control Lists (ACL) Policy Editor

ACL rules define the firewall logic that determines which subnets can access which system routes.

### How Rules are Evaluated:
* Rules are evaluated from **lowest priority number to highest** (`#10` → `#20` → `#30`...).
* **First match wins**: The first rule matching the client IP, HTTP method, and route pattern determines the verdict (`ALLOW` or `DENY`).

### Managing Rules:
* **Enable / Disable Toggle**: Click the **"Active / Disabled"** button in any row to instantly enable or disable a policy without deleting it.
* **Creating a Custom Rule**:
  1. Click **"+ Add ACL Rule"**.
  2. Specify the **Action** (`DENY` or `ALLOW`).
  3. Enter the **Priority** (e.g., `45` to run before rule `#50`).
  4. Enter the **Source Subnet CIDR** (e.g., `172.16.0.0/20` for Student Wi-Fi, or `*` for all).
  5. Enter the **Target Route Pattern** (e.g., `/api/inventory/*`).
  6. Select HTTP Method (`ALL`, `GET`, `POST`, `PUT`, `DELETE`).
  7. Click **"Save & Apply Policy"**.

---

## 6. Tab 4: Interactive Packet Tester & Simulator

The simulator allows you to test whether an arbitrary network packet from any device will be allowed or blocked by your ACL policies **without needing physical hardware**.

### How to Run a Simulation:
1. Navigate to the **"Packet Tester / Simulator"** tab.
2. Click any of the **Quick Scenario Presets**:
   * 🔴 **Student Phone accessing Staff Inventory**: Automatically fills IP `172.16.4.15` and route `/api/inventory`.
   * 🟢 **Student Phone accessing Student Portal**: Fills IP `172.16.4.15` and route `/api/student/auth/login`.
   * 🟢 **Staff Cashier PC submitting an Order**: Fills IP `192.168.10.11` and route `/api/orders`.
   * 🟢 **Admin Workstation PC querying Audit Logs**: Fills IP `192.168.1.50` and route `/api/audit-logs`.
3. Or enter a custom IP and API route.
4. Click **"Simulate Packet Flow"**.

### Interpreting the Results:
* **Verdict Banner**:
  * 🟢 **PERMITTED (ALLOW)**: Packet is allowed to reach the backend controller.
  * 🔴 **DROPPED (DENY)**: Packet is blocked by the network firewall.
* **Rule Evaluation Trace**: Shows an audit trail of every single rule evaluated, indicating whether the subnet CIDR, method, and route matched, and which rule triggered the final decision.

---

## 7. Tab 5: Live ACL Block Logs & Incident Audit

Every time a device attempts an unauthorized cross-subnet request, an incident record is logged in MongoDB and broadcasted in real time:

* **Timestamp**: Exact date and time of the incident.
* **Source IP**: The client IP address that initiated the request.
* **Target Route**: The URL endpoint that was probed (e.g., `GET /api/inventory`).
* **Enforced Rule**: Which ACL rule caught and dropped the packet (e.g., `Deny-Student-Inventory-Access`).
* **Description**: Human-readable explanation of why the packet was rejected.

---

---

## 8. Tab 6: Connected Users & IP Tracker

This tab gives administrators real-time forensic observability over all active student and staff sessions currently connected to SmartServe:

### Key Features:
* **Live Campus Counters**:
  - **Students on Wi-Fi (VLAN 20)**: Real-time count of connected student smartphones (`172.16.0.0/20`).
  - **Admins on LAN (VLAN 10)**: Count of management desktop PCs and laptops (`192.168.1.0/24`).
  - **Primary Region**: Top regional aggregation (e.g., **Philippines**).
* **Search & Filter**: Quickly filter connected clients by user name, student ID, IP address, or region.
* **Telemetry Table Columns**:
  - **User / Student**: Avatar initial/photo, full name, and school ID.
  - **Account Type**: Colored badges distinguishing *Student (BYOD)* (`bg-emerald-100`) from *Staff / Admin* (`bg-blue-100`).
  - **Assigned IP Address**: Monospace IP container with copy-to-clipboard button and VLAN tag badge (`VLAN 20` or `VLAN 10`).
  - **Region**: Cleanly displays **"Philippines"** (with location pin).
  - **Device Form Factor**: Distinguishes *Smartphone (Mobile)* from *Desktop PC / Laptop*.
  - **Last Activity**: Formatted timestamp of recent activity.
  - **"Simulate" Quick-Action Button**: Immediately transfers the user's real IP into the Packet Tester to test ACL reachability against protected endpoints.

---

## 9. Admin Dashboard Campus Network Tableview

On the primary Admin Dashboard (`/dashboard`), the **Campus Network & IP Telemetry** component is placed directly beneath the **Recent Orders** table:

* **Full-Width Tableview**: Spans the entire width of the dashboard so all 6 columns (*Client/User*, *Account Role*, *IP Address & VLAN*, *Region*, *Device*, and *Last Active*) are completely viewable without horizontal scroll or cramped cards.
* **Region Column**: Displays **"Philippines"** for all recognized Philippine client connections.
* **Header KPI Pills**: Shows live counts for `X Wi-Fi (VLAN 20)` and `Y LAN (VLAN 10)` alongside a pulsing green **Live** indicator.
* **1-Click Shortcut**: Clicking any row or the *"View All"* button takes you directly to the Connected Users & IP Tracker tab.
* **Balanced Bottom Grid**: Quick Actions (left) and Recent Redemptions (right) sit side-by-side underneath the tables for clean dashboard symmetry.

---

## 10. Step-by-Step Presentation / Demonstration Script

If demonstrating this project to a teacher, examiner, or class:

```markdown
Step 1: Open the Network & Security Dashboard
- "Here is SmartServe's Network & Security Dashboard. In our school cafeteria, we have two primary network user groups: Administrators and staff on VLAN 10 (Admin LAN), and students accessing menus and BYOC rewards on VLAN 20 (Cafeteria Mobile Wi-Fi)."

Step 2: Demonstrate DHCP Hardware Binding & Ping
- "Under DHCP Stations, we see our physical admin workstation. Notice that the Admin Workstation PC has its physical MAC address permanently bound to 192.168.1.50 on VLAN 10. Let's ping the workstation."
- (Click 'Ping' on Admin Management Workstation -> Observe the live sub-2ms ICMP reply with TTL 64).

Step 3: Demonstrate the ACL Packet Simulator
- "Now let's test our Access Control Lists. Suppose a student connected to the cafeteria Wi-Fi (IP 172.16.4.15) discovers our internal inventory API and tries to view stock levels."
- (Click the red preset: 'Student Phone accessing Staff Inventory' -> Click 'Simulate Packet Flow').
- (Point to the Red DROPPED banner and Rule #40 'Deny-Student-Inventory-Access').
- "Notice how rule #40 immediately caught the packet and dropped it before it could ever hit our database."

Step 4: Demonstrate Permitted Student Traffic
- "Now let's see what happens when that same student smartphone accesses the student portal."
- (Click 'Student Phone accessing Student Portal' -> Click 'Simulate Packet Flow').
- (Point to the Green PERMITTED banner and Rule #20 'Allow-Student-Portal-Routes').

Step 5: Show the Live Security Audit Log
- "Switching to the 'ACL Block Logs' tab, administrators have full forensic traceability over every unauthorized network probe with timestamps and source IPs."

Step 6: Demonstrate Connected Users & IP Tracker
- "Next, in the 'Connected Users & IP Tracker' tab, we can see real-time sessions of students and administrators, their hardware form factor (smartphones vs PCs), and their region (Philippines). Clicking 'Simulate' on any student immediately loads their real IP into the Packet Tester."

Step 7: Show the Main Dashboard Tableview
- "Finally, back on the main Admin Dashboard, the Campus Network & IP Telemetry table sits right below Recent Orders, giving administrators instant situational awareness over all Wi-Fi and LAN connections across campus."
```
