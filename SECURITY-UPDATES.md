# SMARTSERVE — Security Enhancements Documentation

This document outlines the security updates implemented in **SMARTSERVE** to protect application APIs, prevent unauthorized access, mitigate automated attacks, and ensure data integrity across both Admin/Staff and Student portals.

---

## Overview of Security Features

The security fortification strategy is divided into progressive phases. **Phase 1** (HTTP & Traffic Security) and **Phase 2** (Data Validation & Sanitization) have been fully integrated into the backend core.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SMARTSERVE SECURITY                        │
├──────────────────────────┬──────────────────────────────────────────────┤
│ Phase 1: Traffic & HTTP  │ Helmet Headers, NoSQL Sanitizer, Rate Limit  │
│ Phase 2: Data & Payload  │ Express Validator, Schema Checks, Whitelist  │
│ Phase 3 (Planned)        │ HttpOnly Cookies, Token Expiration & Refresh │
│ Phase 4 (Planned)        │ Deep MIME File Validation (Magic Bytes)      │
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
  1. **Global API Limiter (`apiLimiter`)**: Limits all `/api/*` endpoints to a maximum of **300 requests per 15 minutes** per IP.
  2. **Auth Endpoint Limiter (`authLimiter`)**: Applied strictly to sensitive endpoints (`/api/auth/login`, `/api/student/auth/login`, `/register`, `/forgot-password`). Limits attempts to **15 requests per 15 minutes** per IP.

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

## How to Run & Verify Security Setup

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```

2. **Verify Rate Limiting**:
   - Send 16 consecutive login requests within 15 minutes to `/api/auth/login`.
   - The server will respond with HTTP `429 Too Many Requests`.

3. **Verify NoSQL Injection Defense**:
   - Attempt a payload with `{"username": {"$gt": ""}}`.
   - The sanitizer will strip the `$gt` key, causing the query to execute safely without bypassing auth.

---

## Security Roadmap (Phases 3 & 4)

- **Phase 3 (Session & Token Security)**: Migrate JWT tokens from `localStorage` to `HttpOnly` SameSite cookies, implement Access Token expiration with Refresh Token rotation.
- **Phase 4 (File Upload Hardening)**: Validate image magic numbers (header bytes) for profile picture uploads to prevent malicious executable files disguised as images.
