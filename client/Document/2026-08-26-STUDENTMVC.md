# Student Portal MVC & Parent-Child Architecture Refactoring
**Date:** August 26, 2026  
**Module:** Student Portal Infrastructure & Page Routing
**Author:** SmartServe Engineering Team  

---

## 1. Executive Summary

As part of the **SmartServe Architectural Hardening Phase**, the Student Portal undergone a comprehensive refactoring to transition from legacy monolithic views into a clean **MVC (Model-View-Controller) / Parent-Child Component Hierarchy**. 

All 23 student component modules have been organized into 7 distinct feature domain directories under `client/src/components/student/`. Additionally, root-level authentication pages were reorganized into `client/src/pages/auth/` to maintain strict boundary isolation between Admin/Staff and Student applications.

---

## 2. Parent-Child Directory & Component Tree

```text
client/src/
├── pages/
│   ├── auth/                             [Admin & Gateway Auth Pages]
│   │   ├── Home.jsx                      (Landing & Server Health)
│   │   ├── Login.jsx                     (Admin/Staff Login)
│   │   ├── Register.jsx                  (Staff Account Registration)
│   │   ├── ForgotPassword.jsx            (Admin Email Recovery)
│   │   ├── VerifyResetCode.jsx           (Admin OTP Verification)
│   │   └── ResetPassword.jsx             (Admin New Password Entry)
│   │
│   ├── student/                          [Student Controller Pages]
│   │   ├── StudentDashboard.jsx          (Main Root Controller)
│   │   ├── StudentSplash.jsx             (Mobile Welcome Splash)
│   │   ├── StudentLogin.jsx              (Student & Employee Sign In)
│   │   ├── StudentForgotPassword.jsx     (Student Recovery)
│   │   ├── StudentVerifyResetCode.jsx    (Student Code Verification)
│   │   └── StudentResetPassword.jsx      (Student Password Reset)
│   │
│   └── admin/                            [Admin Portal Pages]
│       └── AdminDashboard.jsx            (Admin Control Hub)
│
└── components/student/                   [Student Parent-Child Sub-Modules]
    ├── home/
    │   ├── StudentHomeTab.jsx            (Child: Home View, Stats & Recent Activity)
    │   ├── StudentNotificationBell.jsx   (Child: Header Notification Bell & Dropdown)
    │   └── StudentSessionScreens.jsx     (Child: Login Progress & Logout Overlays)
    │
    ├── menu/
    │   ├── MenuView.jsx                  (Child: Food Menu Grid & Category Pills)
    │   ├── CartView.jsx                  (Child: Cart Summary, BYOC Toggle & Checkout)
    │   ├── MyUsualCard.jsx               (Child: 1-Click Quick Order Card)
    │   └── OrderPlacedView.jsx           (Child: Order Confirmation Screen)
    │
    ├── orders/
    │   ├── OrdersView.jsx                (Child: Tabbed Order History)
    │   ├── LiveOrderProgressTracker.jsx  (Child: Animated ETA Status Stepper)
    │   └── PastOrderDetail.jsx           (Child: Detailed Receipt & Re-Order Modal)
    │
    ├── qr/
    │   └── MyQRView.jsx                  (Child: Dynamic Counter Scanner QR Code)
    │
    ├── rewards/
    │   ├── RewardsView.jsx               (Child: Rewards Hub & Points Header)
    │   ├── RewardsCatalogTab.jsx         (Child: Redeemable Canteen Items Grid)
    │   ├── BYOCEcoProgramTab.jsx         (Child: CO2 Savings & Container Impact)
    │   └── RedeemModals.jsx              (Child: Reward Details & Claim Modals)
    │
    ├── profile/
    │   ├── ProfileView.jsx               (Parent: Profile Navigation Container)
    │   ├── ProfileMenuList.jsx           (Child: Options & Avatar Header)
    │   ├── AccountSettingsTab.jsx        (Child: School ID, Name, Class & Password)
    │   ├── PreferencesTab.jsx            (Child: Dark Mode & Alert Settings)
    │   ├── EcoProgramTab.jsx             (Child: Daily BYOC Reminder Times)
    │   ├── FeedbackTab.jsx               (Child: Star Ratings & Feedback History)
    │   └── SupportHelpTab.jsx            (Child: Help Center & FAQ Accordion)
    │
    └── common/
        └── TermsAndPrivacyModals.jsx     (Child: Terms & Privacy Sheet Overlays)
```

---

### 2.1 Parent vs Child Component Role Mapping

| Component Type | File Location | Controlled Child Components |
| :--- | :--- | :--- |
| **Root Parent Controller** | `client/src/pages/student/StudentDashboard.jsx` | `StudentHomeTab`, `MenuView`, `OrdersView`, `MyQRView`, `RewardsView`, `ProfileView` |
| **Profile Parent Component** | `client/src/components/student/profile/ProfileView.jsx` | `ProfileMenuList`, `AccountSettingsTab`, `PreferencesTab`, `EcoProgramTab`, `FeedbackTab`, `SupportHelpTab` |
| **Rewards Parent Component** | `client/src/components/student/rewards/RewardsView.jsx` | `RewardsCatalogTab`, `BYOCEcoProgramTab`, `RedeemModals` |
| **Orders Parent Component** | `client/src/components/student/orders/OrdersView.jsx` | `LiveOrderProgressTracker`, `PastOrderDetail` |
| **Menu Parent Component** | `client/src/components/student/menu/MenuView.jsx` | `CartView`, `MyUsualCard`, `OrderPlacedView` |
| **Home Parent Component** | `client/src/components/student/home/StudentHomeTab.jsx` | `StudentNotificationBell`, `MyUsualCard`, `LiveOrderProgressTracker` |

## 3. Key Technical Fixes & Enhancements

### 3.1 Top Cart Header Restoration
* **Problem:** Top navigation header cart icon was missing during tab switches.
* **Fix:** Reintegrated `IoCartOutline` with a dynamic item counter badge in `StudentDashboard.jsx`, opening `CartView` seamlessly.

### 3.2 Order Checkout Route Resolution
* **Problem:** Checkout threw `404 (Not Found)` POST errors on `/api/orders/place`.
* **Fix:** Corrected checkout API target URL in `CartView.jsx` to `/api/orders` to match backend router bindings.

### 3.3 1-Click Quick Order ("My Usual") Lifecycle
* **Functionality:** 
  * Re-order instantly from the Home tab (`MyUsualCard.jsx`).
  * Save any past order or completed checkout as a new usual meal via **"Set as My Usual"**.
  * Clear saved usual meals via the top-right trash action (`🗑`).

### 3.4 Category Bar Scrollbar Hiding
* **Problem:** Visible browser scrollbars cluttered category selector pills on mobile/desktop views.
* **Fix:** Added `.scrollbar-none` CSS utility class (`-ms-overflow-style: none`, `scrollbar-width: none`, `::-webkit-scrollbar { display: none }`) in `client/src/styles/index.css`.

### 3.5 Profile Settings Scroll-to-Top Auto Alignment
* **Problem:** Navigating to settings sub-pages (*Feedback & Replies*, *Account Settings*, *Preferences*) sometimes rendered mid-page if scrolled previously.
* **Fix:** Added `containerRef` and `useEffect` in `ProfileView.jsx` to automatically reset `scrollTop = 0` whenever `activeTab` switches.

### 3.6 Dev Server Proxy Log Hardening
* **Problem:** `ws proxy socket error: ECONNABORTED` printed in the terminal during server restarts.
* **Fix:** Added custom proxy error handler in `client/vite.config.js` to silently ignore expected disconnect events during `nodemon` restarts.

---

## 4. Verification & Build Integrity

* **Module Transformation:** 215/215 modules transformed without errors.
* **Build Verification:** `npm run build` executed successfully.
* **Route Resolution:** All imports validated across `pages/auth/`, `pages/student/`, and `components/student/`.

---
*Documentation maintained for future reference*
