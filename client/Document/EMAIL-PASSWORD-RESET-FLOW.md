# Smartserve  - Email Password Reset Flow Guide

## Architecture Summary
The password reset system provides 6-digit OTP delivery exclusively via email (Gmail SMTP) without exposing OTP secrets in terminal logs.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Student
    participant FE as Frontend (Vite/React)
    participant API as Express API (/api/auth)
    participant DB as MongoDB (User / Student)
    participant SMTP as Gmail SMTP Server

    User->>FE: Enters registered email address
    FE->>API: POST /api/auth/forgot-password { email }
    API->>DB: Search User collection, fallback to Student collection
    alt Account Found
        API->>DB: Store resetCode (6 digits) & 15-min resetCodeExpiry
        API->>SMTP: sendResetCode(email, code)
        SMTP-->>User: Delivers 6-digit code to Inbox
        API-->>FE: 200 OK ("A reset code has been sent...")
    else Account Not Found
        API-->>FE: 404 Not Found ("No account found with that email address")
    end

    User->>FE: Enters 6-digit code from email
    FE->>API: POST /api/auth/verify-reset-code { email, code }
    API->>DB: Verify resetCode & resetCodeExpiry > Date.now()
    API-->>FE: 200 OK ("Code verified")

    User->>FE: Enters new password & confirmPassword
    FE->>API: POST /api/auth/reset-password { email, code, password }
    API->>DB: Save hashed new password, clear resetCode & resetCodeExpiry
    API-->>FE: 200 OK ("Password reset successfully")
    FE->>User: Displays choice: Sign In to Student or Staff Portal
```

---

## Technical Details

### API Endpoints
| Endpoint | Method | Body Payload | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/forgot-password` | `POST` | `{ email }` | Initiates reset, stores OTP in DB, sends email |
| `/api/auth/verify-reset-code` | `POST` | `{ email, code }` | Validates 6-digit OTP code against expiry |
| `/api/auth/reset-password` | `POST` | `{ email, code, password }` | Applies new password and clears reset fields |

### Modified Files Reference
1. `server/config/mailer.js` - Transport setup & send logs.
2. `server/controllers/passwordController.js` - Universal account search & OTP logic.
3. `server/controllers/studentAuthController.js` - Flexible student forgot-password & login.
4. `server/middleware/validators.js` - Validation field mapping (`password` / `newPassword`).
5. `client/src/pages/auth/ResetPassword.jsx` - Dual sign-in navigation options.
