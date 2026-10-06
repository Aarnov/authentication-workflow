```markdown
# Secure Authentication Boilerplate

A production-ready, full-stack authentication template. Features a complete security architecture including TOTP, OAuth, strict email verification, and a dark-mode glassmorphic UI. Designed to be cloned or used as a GitHub Template for rapid project scaffolding.

## Core Features

* **Multi-Vector Authentication:** Email/Password, Google OAuth 2.0, and Email OTP.
* **MFA / TOTP:** Authenticator app integration (otplib v13) with self-termination safeguards.
* **Account Security:** Password reset/change workflows and lazy ghost-account purging.
* **Verification:** Strict 5-minute double opt-in email verification.
* **Session Management:** Secure, HTTP-only JWT cookies with active state tracking.
* **Modern UI:** Glassmorphism design, sticky navigation, and a sliding security terminal.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios  
**Backend:** Node.js, Express, TypeScript, Prisma ORM (v5), PostgreSQL  
**Security:** Argon2id (hashing), JWT, `otplib`, `qrcode`, `express-rate-limit`

## Quick Start

### 1. Installation
Clone the repository and install dependencies for both environments.

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/auth_db"

# Security
JWT_SECRET="your_super_secret_jwt_key"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# SMTP / Email
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your_email@example.com"
SMTP_PASS="your_email_password"

```

### 3. Database Initialization

Push the Prisma schema to your PostgreSQL database and generate the client.

```bash
cd backend
npx prisma db push
npx prisma generate

```

### 4. Run Development Servers

Start both the backend and frontend servers.

```bash
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)
cd frontend
npm run dev

```

## Directory Structure

```text
├── backend/
│   ├── prisma/             # Schema & migrations
│   └── src/
│       ├── controllers/    # Route logic (auth, oauth, otp, totp)
│       ├── middleware/     # JWT validation & rate limiting
│       └── routes/         # Express routers
└── frontend/
    └── src/
        ├── api/            # Axios API client
        └── components/     # UI components (Glassmorphism layout & Security Drawer)

```
