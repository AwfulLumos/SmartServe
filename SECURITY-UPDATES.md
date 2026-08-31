# SMARTSERVE — Security Enhancements Documentation

This document outlines the security updates implemented in **SMARTSERVE** to protect application APIs, prevent unauthorized access, mitigate automated attacks, and ensure data integrity across both Admin/Staff and Student portals.

---

## Overview of Security Features

The security fortification strategy is divided into progressive phases. **Phase 1** (HTTP & Traffic Security), **Phase 2** (Data Validation & Sanitization), **Phase 3** (Account Lockout & HttpOnly Cookies), and **Phase 4** (File Upload Hardening & Magic Byte Validation) have all been fully integrated into the backend core.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SMARTSERVE SECURITY                            │
├──────────────────────────┬──────────────────────────────────────────────┤
│ Phase 1: Traffic & HTTP  │ Helmet Headers, NoSQL Sanitizer, Rate Limit  │
│ Phase 2: Data & Payload  │ Express Validator, Schema Checks, Whitelist  │
│ Phase 3: Auth & Session  │ Account Lockout (5 Fails), HttpOnly Cookies  │
│ Phase 4: File Uploads    │ Extension Whitelist & Magic Byte Binary Check│
└──────────────────────────┴──────────────────────────────────────────────┘
```

---

## Phase 1: HTTP Security & Traffic Hardening

### 1. Security HTTP Headers (`helmet`)
- **Package**: `helmet` (v8.3.0)
- **Purpose**: Prevents Cross-Site Scripting (XSS), Clickjacking, MIME-type sniffing, and hides server fingerprinting headers (`X-Powered-By`).
- **Configuration**: Set `crossOriginResourcePolicy: { policy: "cross-origin" }` in `server/index.js` to ensure uploaded static images (e.g. user profile photos under `/uploads`) display smoothly in the client application without cross-origin resource blockages.

### 2. NoSQL Injection Prevention (`express-mongo-sanitize`)
- **Package**: `express-mongo-sanitize` (v2.2.0)
- **Purpose**: Protects MongoDB database queries against NoSQL injection attacks.
- **How it works**: Automatically strips out dollar sign operators (`$`) and dot characters (`.`) from incoming request bodies, query strings, and route parameters. This prevents attackers from manipulating MongoDB queries (e.g. passing `{"$gt": ""}` to bypass authentication).

### 3. API & Auth Rate Limiting (`express-rate-limit`)
- **Package**: `express-rate-limit` (v8.7.0)
- **Purpose**: Prevents Denial of Service (DoS) attacks and brute-force password cracking attempts.
- **Limiters Implemented**:
  1. **Global API Limiter (`apiLimiter`)**: Limits all `/api/*` endpoints to a maximum of **300 requests per 15 minutes** (1000 in dev) per IP.
  2. **Auth Endpoint Limiter (`authLimiter`)**: Applied strictly to sensitive endpoints (`/api/auth/login`, `/api/student/auth/login`, `/register`, `/forgot-password`). Limits attempts to **15 requests per 15 minutes** (100 in dev) per IP.

---

## Phase 2: Input Validation & Payload Sanitization

### 1. Request Payload Validation (`express-validator`)
- **Package**: `express-validator` (v7.2.1)
- **File Created**: `server/middleware/validators.js`
- **Purpose**: Validates, cleanses, and sanitizes all incoming JSON request bodies before they reach controller handlers. Returns structured `400 Bad Request` responses if validation rules fail.

### 2. Validated Routes Summary

| Portal | Endpoint | Validation Rules Applied |
| :--- | :--- | :--- |
| **Admin / Staff** | `POST /api/auth/register` | Full name length (2–100 chars), normalized email, username regex (`[a-zA-Z0-9._-]`), role whitelist (`admin`/`staff`), matching passwords (min 6 chars). |
| **Admin / Staff** | `POST /api/auth/login` | Required username and password checks. |
| **Admin / Staff** | `PATCH /api/auth/me/profile` | Optional field validations for name, email format, and username constraints. |
| **Admin / Staff** | `POST /api/auth/staff` | Whitelisted role check (`admin`/`staff`), email validation, minimum password length. |
| **Admin / Staff** | `PATCH /api/auth/change-password` | Current password check, minimum 6 characters for new password, matching password confirmation. |
| **Student** | `POST /api/student/auth/login` | Mandatory Student ID / Email identifier and password check. |
| **Both Portals** | `POST /.../forgot-password` | Validates presence of a valid email or Student ID. |
| **Both Portals** | `POST /.../verify-reset-code` | Strict 6-digit numeric reset code check. |
| **Both Portals** | `POST /.../reset-password` | Password length validation and valid 6-digit reset code check. |

---

## Phase 3: Account Lockout Guard & HttpOnly Cookies

### 1. User-Level Account Lockout Guard
- **Schemas Modified**: `User.js` & `Student.js`
- **Fields Added**: `failedLoginAttempts` (Number), `lockUntil` (Date)
- **Mechanism**:
  - Tracks consecutive failed password attempts for any specific account.
  - Upon **5 consecutive failed login attempts**, the user or student account is automatically locked for **15 minutes**.
  - Subsequent login attempts during lockout are blocked with `HTTP 403 Forbidden` and report the exact minutes remaining.
  - Successful login resets the counter to 0 and clears the lock.

### 2. HttpOnly Cookie Support (`cookie-parser`)
- **Package**: `cookie-parser` (v1.4.7)
- **Mechanism**:
  - On successful login, JWT tokens are issued as `HttpOnly`, `SameSite=Lax` cookies (`token` for staff, `student_token` for students).
  - Protects tokens from being stolen via XSS (Cross-Site Scripting).
  - Middleware (`auth.js` and `studentAuth.js`) seamlessly accepts either the `Authorization: Bearer <token>` header OR the `HttpOnly` cookie.
- **Logout Endpoints**: Added `POST /api/auth/logout` and `POST /api/student/auth/logout` to securely clear session cookies.

---

## Phase 4: File Upload Security & Magic Byte Validation

### 1. Extension & MIME Type Whitelisting
- **Middleware**: `server/middleware/upload.js`
- **Allowed Extensions**: `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`
- **Allowed MIME Types**: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`, `image/gif`
- **Size Limit**: Enforces a strict **2MB file size cap**. Exceeding file sizes returns structured `400 Bad Request` JSON responses instead of crashing the server.

### 2. Binary Magic Byte Verification
- **Purpose**: Prevents malicious executable scripts (e.g. `.php`, `.exe`, `.js`) disguised as images by changing their extension.
- **Header Bytes Checked**:
  - **PNG**: `89 50 4E 47`
  - **JPEG**: `FF D8 FF`
  - **GIF**: `47 49 46 38` ("GIF8")
  - **WebP**: `52 49 46 46` ... `57 45 42 50` ("RIFF" ... "WEBP")
- **Behavior**: If the magic byte inspection fails, the file is immediately **unlinked/deleted from disk** and an HTTP `400` error is returned.

---

## How to Run & Verify Security Setup

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```

2. **Verify File Upload Protection**:
   - Try uploading a `.txt` or `.exe` file renamed to `test.png`.
   - The upload handler will detect the invalid magic bytes, immediately delete the uploaded file from disk, and return `400 Bad Request`.

3. **Verify Account Lockout**:
   - Try logging into an account with an incorrect password 5 times in a row.
   - The 5th failed attempt will lock the account for 15 minutes.
