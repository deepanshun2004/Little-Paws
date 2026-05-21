# 🐾 LITTLE_PAWS - Full-Stack Pet Adoption & E-Commerce Platform

[![Production Deployment](https://img.shields.io/badge/Deployment-Production--Ready-brightgreen.svg)](#-production-deployment-setup)
[![Stack](https://img.shields.io/badge/Stack-MERN%20(MySQL)--React-blue.svg)](#-technology-stack)
[![License](https://img.shields.io/badge/License-ISC-orange.svg)](LICENSE)

Little Paws is a premium full-stack web application that serves as a centralized hub for pet adoption, shelter administration, stray pet reporting, real-time community chat, and e-commerce for pet supplies. Developed by **Deepanshu**, this production-ready application integrates modern technologies to provide an engaging, responsive, and seamless experience for pet lovers and shelter managers alike.

---

## 🏗️ Deployment & System Architecture

The application is architected as a decoupled client-server system designed for horizontal scalability, high availability, and secure cross-origin communication.

```mermaid
graph TD
    Client[Vercel Frontend: React + Vite] <-->|HTTPS / REST API / WS| Server[Render Backend: Node.js + Express]
    Server <-->|SQL Queries| DB[Railway Hosted MySQL / Local MySQL]
    Server -->|OAuth Verification| Firebase[Firebase Admin Auth]
    Server -->|Payment Capture| Razorpay[Razorpay Payment API]
    Server -->|SMTP TLS| Nodemailer[Nodemailer SMTP Service]
    Server -->|Local Disk Storage| Uploads[Multer /uploads Directory]
    Server -->|Event Log Queue| Kafka[KafkaJS Event Broker]
```

### Deployment Strategy
- **Frontend Hosting:** Deployed on **Vercel** for lightning-fast CDN delivery, automatic SSL termination, and seamless edge-routing.
- **Backend Hosting:** Deployed on **Render** (Web Service instance) running Node.js with persistent/local directory bindings for static uploads.
- **Production Database:** Deployed on **Railway MySQL**, utilizing connection pooling for optimized query latency and high concurrency support.
- **Local Development:** Fully supports a standard local **MySQL** server instance, allowing offline testing and rapid feature iteration.

---

## 🛠️ Technology Stack

### Frontend (Client)
* **Framework:** React 18.3.1 (configured with Vite 5.4.10)
* **State Management:** Redux Toolkit (@reduxjs/toolkit 2.3.0) for centralized auth, cart, address, and checkout states.
* **Routing:** React Router DOM 6.28.0 for dynamic, declarative client-side routes.
* **Real-time Engine:** Socket.io-client 4.8.1 for active bidirectional communication.
* **Styling & Components:** Tailwind CSS 3.4.14, Radix UI primitive modules, Lucide React icons, and a custom Tailwind component system.
* **Authentication:** Firebase Client SDK 12.13.0 (handling Google OAuth login).
* **Maps & Geo-location:** Leaflet and React-Leaflet for stray reports and shelter location pinpointing.

### Backend (Server)
* **Runtime:** Node.js
* **Framework:** Express 4.21.1 (handling REST API, cookies, JSON payloads, and CORS policies).
* **Database Driver:** MySQL 2 (`mysql2` 3.14.5) with a custom ORM-like `BaseModel` class.
* **Real-time Server:** Socket.io 4.8.1 (implementing role-based and user-specific rooms).
* **Security & Authentication:** JSON Web Tokens (`jsonwebtoken` 9.0.2), `bcryptjs` 2.4.3 for database password hashing, and Firebase Admin 13.9.0.
* **Storage & Uploads:** Multer 1.4.5 for handling multipart form data (saving to local `/uploads` directory).
* **Email System:** **Nodemailer 8.0.7** configured with secure Gmail SMTP authentication.
* **Payment Integration:** Razorpay SDK 2.9.6 for order creation and transaction verification.
* **Message Broker:** KafkaJS 2.2.4 (Kafka producer hooks for decoupling async background event logging).

---

## 🐾 Key Features & User Experience

### 1. Pet Discovery & Search
- Advanced search filter parameters (location, animal type, age group, size, health status).
- Location-based pet radius detection utilizing integrated Leaflet map interfaces.
- Custom cards with high-fidelity animations, micro-interactions, and detailed profile sheets.

### 2. Streamlined Pet Adoption
- Comprehensive multi-step digital adoption form (assessing housing, lifestyle, and history).
- Application progress tracker in the user dashboard with withdraw/update capabilities.
- Live notifications as applications move from "Pending" to "Reviewing", "Approved", or "Declined".

### 3. Shelter Administration Portal
- Protected analytics and listing dashboard specifically designed for shelter operators.
- Complete CRUD capabilities for pets, real-time adopter application workflow management, and shelter profile curation.
- Interactive, multi-room chat console to directly message applicants in real time.

### 4. Stray Pet Reporting System
- Geo-pinning: Click directly on the Leaflet Map to capture coordinates of a stray animal.
- Photo uploads and status labels (Pending, Approved, Under Rescue, Rescued) for transparency.
- Automatic notifications to shelter groups within the corresponding city radius.

### 5. E-Commerce Shopping Core
- Comprehensive pet supplies catalog with categories, reviews, star ratings, and wishlists.
- Fully-functional shopping cart and smooth Razorpay payment gateway integration.
- Secure customer address book management and order-tracking dashboard.

### 6. Real-Time Chat & In-App Notifications
- Direct Socket.IO messaging with full message persistence in MySQL.
- Role-based emissions: Send instant notifications to all active shelter administrators or e-commerce operators at once.
- Email triggers via **Nodemailer** for critical events: password resets, welcome messages, order confirmations, and adoption status updates.

---

## 📁 Directory Structure

```text
LITTLE_PAWS final/
├── client/                  # React Frontend (Vercel)
│   ├── src/
│   │   ├── components/      # Modular UI & Feature-specific components
│   │   ├── pages/           # Page-level route views (Auth, Shopping, Admin, Stray)
│   │   ├── store/           # Redux Toolkit store and slices (auth, shop, cart)
│   │   ├── hooks/           # use-socket.js, use-toast.js
│   │   ├── lib/             # Firebase SDK, Socket.io client, helper libraries
│   │   ├── App.jsx          # Root router & application controller
│   │   └── main.jsx         # Client mount entry point
│   ├── vite.config.js       # Vite build optimization config
│   └── tailwind.config.js   # Tailwired Design System styles
└── server/                  # Node.js + Express Backend (Render)
    ├── models/              # Custom MySQL schemas inheriting _base.js
    ├── controllers/         # Core business logic (auth, shop, pet, chat)
    ├── routes/              # Express API Route endpoints
    ├── middlewares/         # auth.middleware.js (JWT validation & Role checks)
    ├── helpers/             # Multer upload, Kafka Producer, firebaseAdmin
    ├── db/                  # mysql.js (Connection pooler & database initializer)
    ├── config/              # mail.js (Nodemailer SMTP transport setup)
    ├── utils/               # sendEmail.js (Nodemailer template wrappers)
    ├── socket.js            # Socket.io connection & event coordinator
    └── server.js            # Main Express application initialization
```

---

## 🔑 Environment Variables Setup

To run Little Paws, you must create `.env` files in both the `client` and `server` root folders.

### Client Environment Variables (`client/.env`)
| Variable Name | Description | Example/Placeholder |
|---|---|---|
| `VITE_API_URL` | Base endpoint URL of the backend server | `http://localhost:5000` |
| `VITE_FIREBASE_API_KEY` | Web API key for Firebase Authentication | `AIzaSyA1...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase project authentication domain | `little-paws-e4b81.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase unique project identifier | `little-paws-e4b81` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase cloud storage bucket name | `little-paws-e4b81.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID for cloud messaging | `254878546592` |
| `VITE_FIREBASE_APP_ID` | Firebase client application ID | `1:254878546592:web:...` |

### Backend Environment Variables (`server/.env`)
| Variable Name | Description | Example/Placeholder |
|---|---|---|
| `PORT` | Local network port the server listens on | `5000` |
| `CORS_ORIGIN` | Allowed clients (comma-separated for multi-client setup) | `http://localhost:5173` |
| `CLIENT_URL` | Single fallback client redirection URL | `http://localhost:5173` |
| `MYSQL_HOST` | Hostname of the MySQL database server | `127.0.0.1` (local) or Railway host |
| `MYSQL_PORT` | Port number of the MySQL server | `3306` |
| `MYSQL_USER` | MySQL database user name | `root` or Railway user |
| `MYSQL_PASSWORD` | Secure MySQL database access password | `mypassword123` |
| `MYSQL_DATABASE` | Targeted database instance name | `little_paws` |
| `CLIENT_SECRET_KEY` | Secret key for hashing & signing JWT cookies | `super_secret_jwt_sign_key` |
| `EMAIL_USER` | Gmail account address used by Nodemailer | `your_gmail_address@gmail.com` |
| `EMAIL_PASS` | Gmail 16-character secure App Password | `abcd efgh ijkl mnop` |
| `MAIL_FROM_NAME` | Display name for outbound platform emails | `Little Paws` |
| `DISABLE_EMAIL` | Set to `true` to bypass Nodemailer sending locally | `false` |
| `RAZORPAY_KEY_ID` | Razorpay Merchant Key ID | `rzp_test_SnXj16...` |
| `RAZORPAY_SECRET` | Razorpay API Secret | `dX1eNP9fDTzA...` |
| `FIREBASE_PROJECT_ID` | Firebase project identifier | `little-paws-e4b81` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account client email | `firebase-adminsdk-fbsvc@...` |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin private key (include block syntax) | `"-----BEGIN PRIVATE KEY-----\nMIIE...\n"` |

---

## 💻 Local Installation & Setup

### Prerequisites
- **Node.js** (v18.x or above)
- **MySQL Server** (v8.x or above) installed locally and running.
- **Git**

### Step-by-Step Local Setup

#### 1. Clone the repository
```bash
git clone https://github.com/deepanshun2004/Little-Paws.git
cd Little-Paws
```

#### 2. Configure the local Database
- Start your local MySQL service.
- Open your MySQL CLI or workbench and create a new database:
```sql
CREATE DATABASE little_paws;
```
- Custom tables and pooled models are generated automatically by `server/db/mysql.js` on initial boot, so no manual table imports are necessary!

#### 3. Setup Backend Server (`server`)
```bash
cd server
npm install
# Copy the env example and configure with your local MySQL password and credentials
cp .env.example .env
```
- Open `.env` and fill in your database username (`root`), password, port, and key parameters.

#### 4. Setup Frontend Client (`client`)
```bash
cd ../client
npm install
# Copy the env example and fill out your Firebase credentials
cp .env.example .env
```

---

## 🏃 Running Locally

To run the application locally, you can start both servers concurrently or open two terminal sessions.

### Start Backend Server
```bash
cd server
npm run dev
```
- The API server will boot up and automatically initialize the MySQL schema. You will see a `[DB] MySQL connected` log, alongside a `[Email] SMTP Transporter successfully verified` confirmation once Nodemailer authenticates with Gmail SMTP.

### Start Frontend Client
```bash
cd client
npm run dev
```
- The Vite development server will start at `http://localhost:5173`. Open this URL in your web browser.

---

## 🚀 Production Deployment Setup

### 1. Database Deployment on Railway MySQL
1. Log in to [Railway.app](https://railway.app/) and create a new project.
2. Select **Provision MySQL**.
3. Under the Variables tab, copy the database connection details: `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, and `MYSQLDATABASE`.
4. Run your initial migration by pointing your local client connection to the Railway variables temporarily, or let the Render backend automatically run the initialization scripts upon initial startup.

### 2. Backend Deployment on Render
1. Register/log in to [Render.com](https://render.com/).
2. Select **New** -> **Web Service**.
3. Link your GitHub repository.
4. Set the following build configurations:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. In the **Environment Variables** section, configure the complete set of variables matching `server/.env` (pointing `MYSQL_*` parameters to your Railway variables).
6. Enable Cookie Security: Ensure `CORS_ORIGIN` matches the deployed Vercel frontend address.

### 3. Frontend Deployment on Vercel
1. Log in to [Vercel.com](https://vercel.com/) and click **Add New** -> **Project**.
2. Select your GitHub repository.
3. In the project setup panel:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add all required client environment variables (including `VITE_API_URL` pointing to your deployed Render URL).
5. Click **Deploy**. Vercel will build the frontend bundle and supply a secure HTTPS deployment link.

---

## 🔌 API Communication & Security Handles

### CORS Handling
The server employs Express-level CORS configuration to permit credentialed HTTP requests while preventing unauthorized cross-origin requests.
```js
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
  credentials: true,
};
```

### Production Cookie Handling
To support secure session control, the application signs and issues JWT tokens inside HTTP-only cookies.
- **Development:** Cookies are transmitted over standard HTTP with `SameSite: "lax"`.
- **Production:** Cookies are configured with `secure: true`, `sameSite: "none"` (enabling cross-origin authentication across Vercel and Render), and `httpOnly: true` (blocking client-side JavaScript access to prevent XSS attacks).

### Socket Connection Handling
Socket.IO handles real-time messaging and events, dynamically adapting to the environment. In production, the client establishes an active WebSocket handshake using the Render backend URL with `withCredentials: true` to authenticate socket sessions safely.

---

## 🛠️ Troubleshooting & Support

### 1. Nodemailer SMTP Connection Timeout
- **Problem:** Server fails to boot or logs SMTP connection timeout.
- **Fix:** Make sure your `EMAIL_PASS` is a **Gmail App Password** (16 characters) and not your standard email account password. Two-factor authentication (2FA) must be active on your Google Account to generate an App Password.
- **Local Bypassing:** Set `DISABLE_EMAIL=true` in your `server/.env` to run the authentication flow locally without sending active emails.

### 2. Multer Image Upload Disappearing on Render
- **Problem:** Profile pictures, pet photos, or stray animal reports disappear after a few hours or server restarts.
- **Fix:** Render instances use an ephemeral filesystem by default; files written to `/uploads` are cleared when the server sleeps or rebuilds. In production, attach a **Render Disk** to mount `/uploads` to persistent physical storage, or transition helper/upload code to an S3-compatible cloud bucket.

### 3. Google OAuth Redirect Issues
- **Problem:** "Unable to verify Google sign-in" or 401 response during login.
- **Fix:** Ensure the active Google Web Client ID and Firebase Configuration domains match the registered origins in the Firebase Auth console.

---

## 🔮 Future Improvements

1. **Persistent Cloud Storage:** Integrate AWS S3 or Cloudinary SDK in `server/helpers/upload.js` to decouple images from the server container entirely.
2. **Advanced Chat Persistence:** Integrate Redis caching layers to store active chat handshakes and user presence details.
3. **Advanced Shelter Verification:** Introduce a system administrator queue to vet and authorize animal shelters using official NGO registration forms.
4. **Enhanced Offline Sync:** Implement service worker caching and IndexedDB offline queues to allow users to compile stray pet reports in zero-connectivity environments.
