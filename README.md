# SmartServe

School cafeteria management system. Admin/staff manage orders, inventory, students, rewards, and eco points. Students log in via a mobile-friendly portal to track points and redeem rewards.

## Stack

- **Frontend** — React 18, Vite, Tailwind CSS
- **Backend** — Node.js, Express, MongoDB
- **Auth** — JWT (separate tokens for staff and students)
- **Email** — Nodemailer via Gmail SMTP

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure the server

Create `server/.env.development`:

```env
NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16char_app_password
SMTP_FROM=SmartServe <your_email@gmail.com>
```

For Gmail, use an [App Password](https://myaccount.google.com/apppasswords) — not your account password.

### 3. Run

```bash
npm run dev
```

Client runs on `http://localhost:5173`, server on `http://localhost:5001`.

## Portals

| Portal | URL |
|---|---|
| Admin / Staff | `/login` |
| Student | `/student` |

## Notes

- First registered account is auto-approved as admin. All others need manual approval.
- Students are created by admin — no self-registration.
- Student API routes are isolated under `/api/student/` with a separate JWT type.




#Linear Regressions with Exponential Smoothing - Revenue Predictions
#Linear Regressions 
