# SmartServe — Technology Stack & Features Overview

**Document Version:** 1.0.0  
**Last Updated:** August 25, 2026  
**File Location:** `client/Document/SYSTEM-TECH-STACK-DOCUMENTATION.md`  

---

## Executive Overview

**We used 100% of the core technologies listed in your request.**

Every foundational tool—from **React 18** and **Tailwind CSS** on the frontend, to **Node.js**, **Express**, **MongoDB**, **Dual JWT Authentication**, and **Nodemailer** on the backend—is actively running and powering **SmartServe**.

In addition, we added several high-impact packages and custom modules (like **WebSockets for real-time order sync**, **camera-based QR code scanning**, **client-side image compression**, and **smart restock analytics**) to build a complete, modern smart canteen platform.

---

## 1. Core Stack Baseline (Everything You Requested)

Here is how each of your requested technologies is used in the project:

### Frontend Stack
* **React 18**
  * **What it does:** Powers the visual user interface for both students and canteen staff/admins. It handles page rendering, pop-up modals, dashboards, interactive order tables, and reward management.
* **Vite**
  * **What it does:** The modern frontend build engine. It allows instant hot-reloading during development and bundles code efficiently for fast browser load times.
* **Tailwind CSS**
  * **What it does:** Controls all visual styling using clean utility classes. It makes the system responsive across mobile, tablet, and desktop screens, and powers our **Dark/Light Mode** theme engine.

---

### Backend & Database Stack
* **Node.js**
  * **What it does:** The server runtime environment that processes business logic outside of the browser.
* **Express.js**
  * **What it does:** The web application framework managing all REST API endpoints (`/api/orders`, `/api/menu`, `/api/students`, `/api/inventory`, `/api/rewards`, etc.).
* **MongoDB & Mongoose**
  * **What it does:** The NoSQL database storing system data including student profiles, menu items, order histories, reward points, audit logs, and system notifications.

---

### Security & Email Communications
* **JWT (Separate Staff & Student Tokens)**
  * **What it does:** Secures system access using JSON Web Tokens. Staff/Admin tokens unlock administrative tools (inventory control, order fulfillment, student management), while Student tokens strictly permit ordering and checking reward points.
* **Nodemailer (Gmail SMTP)**
  * **What it does:** Automated backend email service used to send account verification emails, OTP password reset codes, and order updates to students and staff.

---

## 2. Added Tech Stack Layers & Packages

To elevate SmartServe into a real-time, hardware-integrated campus food ordering system, we added 7 distinct technical layers:

### Layer 1: Real-Time Communication (WebSockets)
* **Socket.io (`socket.io` & `socket.io-client`)**
  * **What it adds:** Enables live, bi-directional order status updates between the kitchen order board and student screens in real-time (e.g. changing status from *Preparing* -> *Ready for Pickup* with sound alerts) without requiring page reloads.

### Layer 2: Hardware & QR Code Engine
* **`html5-qrcode`**
  * **What it adds:** Powers a live camera-based QR scanner in the staff portal so staff can scan student mobile tickets for instant pickup verification.
* **`react-qr-code`**
  * **What it adds:** Renders digital vector QR pickup tickets on student mobile screens upon order confirmation.

### Layer 3: API Communication & SPA Routing
* **`axios`**
  * **What it adds:** Centralized HTTP request client equipped with interceptors that automatically attach JWT authorization headers (`Authorization: Bearer <token>`) to backend API calls.
* **`react-router-dom` (v6)**
  * **What it adds:** Single Page Application (SPA) routing with protected route guards separating student and staff views.

### Layer 4: UI Design & User Feedback
* **`react-icons`**
  * **What it adds:** Provides a complete vector icon library (Lucide, FontAwesome, Heroicons) used across all dashboards, tables, and action buttons.
* **`react-hot-toast`**
  * **What it adds:** Renders animated toast pop-ups for order confirmations, inventory restock warnings, and form validation feedback.

### Layer 5: Image Processing & Upload Pipeline
* **`multer`**
  * **What it adds:** Backend file upload middleware for handling incoming food menu item images and student profile pictures.
* **HTML5 Canvas Compression Pipeline**
  * **What it adds:** Client-side image compression that auto-resizes menu images (capped at 3MB, max 800px dimension) into lightweight Base64 data stored directly in MongoDB.

### Layer 6: Password Hashing Security
* **`bcryptjs`**
  * **What it adds:** Salted password hashing algorithm to securely encrypt user passwords before saving them to MongoDB.

### Layer 7: Developer Tooling & Automation
* **`concurrently`**
  * **What it adds:** Enables a unified single-command launcher (`npm run dev`) that runs both frontend (Vite) and backend (Express) simultaneously.
* **`nodemon`**
  * **What it adds:** Development utility that automatically restarts the backend server whenever code changes are saved.

---

## 3. Special Custom Features Engineered for SmartServe

Beyond third-party tools, we custom-built several key operational modules:

1. **Smart Analytics & Restock Forecasting Engine**
   * Automatically calculates Cost of Goods Sold (COGS), profit margins, and predicts when food inventory will run out based on ordering trends.
2. **Interactive Food Lightbox Viewer**
   * Clicking menu images opens a full-screen photo preview modal with price details and a 1-click **"Add to Cart"** button.
3. **Bring Your Own Container (BYOC) Eco-Rewards**
   * Rewards eco-conscious students with bonus reward points when they bring their own container for meals.
4. **Universal Skeleton Loader System (`SkeletonLoader.jsx`)**
   * Replaced generic spinner icons with smooth structural skeleton loaders while data loads.
5. **1-Click "Order My Usual" & Live Order Tracker**
   * Remembers a student's favorite meal for instant re-ordering and displays a live 3-step progress bar with estimated time of arrival (ETA).
6. **Campus Clock & Operational Hours Header**
   * Live campus clock widget embedded into the administrative header displaying active service hours.

---

## 4. Quick Summary Checklist

| Requested Technology | Integrated in SmartServe? | What It Does / Added Extras |
| :--- | :---: | :--- |
| **React 18** | **Yes** | Dynamic UI, Modals, Student & Admin Dashboards |
| **Vite** | **Yes** | High-speed frontend build tool & hot-reloading |
| **Tailwind CSS** | **Yes** | Responsive styling & Dark/Light mode theme system |
| **Node.js** | **Yes** | Server runtime environment |
| **Express.js** | **Yes** | RESTful API server endpoints |
| **MongoDB / Mongoose** | **Yes** | Persistent database storage |
| **JWT Dual Authentication** | **Yes** | Separate role permissions for Staff vs. Students |
| **Nodemailer (Gmail SMTP)** | **Yes** | OTP password resets & notification emails |
| **Socket.io (WebSockets)** | *Added* | Layer 1: Real-time live kitchen order status updates |
| **Camera QR Scanner & Tickets** | *Added* | Layer 2: Mobile QR tickets & staff camera ticket scanner |
| **Axios & React Router v6** | *Added* | Layer 3: API headers & protected SPA routes |
| **React Icons & Hot Toast** | *Added* | Layer 4: Vector icons & animated toast pop-ups |
| **Multer & Canvas Compression** | *Added* | Layer 5: Food photo upload & client Base64 compression |
| **Bcryptjs Security** | *Added* | Layer 6: Salted password encryption |
| **Concurrently & Nodemon** | *Added* | Layer 7: Unified single-command dev environment |
| **Smart Restock Analytics** | *Added* | COGS tracking & inventory restock predictions |
| **BYOC Eco-Rewards** | *Added* | Point bonuses for eco-friendly reusable containers |

---

*Documentation compiled for SmartServe System Architecture.*
