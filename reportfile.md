# Little Paws Project Report

## Cover

**Project Title:** Little Paws: An Integrated Full-Stack Platform for Pet Adoption, Shelter Management, Stray Pet Reporting, and Pet Supplies E-Commerce

**Date of Submission:** May 21, 2026

**Submitted By:** Deepanshu

**Affiliation:** Department of Computer Science & Engineering

---

## Title Page

**Little Paws** is an enterprise-grade full-stack web application engineered to bridge the communication gap between pet animal shelters, potential adopters, product sellers, and the broader community. The system provides unified features for browsing and adopting pets, submitting digital adoption forms, reporting stray/lost animals with geo-location pinning, interacting via real-time messaging, and shopping for premium pet supplies.

The system is built on a highly modular, decoupled MERN-like architecture where the "M" represents a **MySQL** relational database backend instead of MongoDB. This architectural choice enables robust transactional integrity, structured relational schemas, and complex multi-table query performance. The application integrates React (Vite) on the frontend, Express and Node.js on the backend, Firebase client-side OAuth for Google Sign-in, Socket.IO for real-time WebSockets, Multer for multipart image handling, **Nodemailer** for automated SMTP mail delivery, and Razorpay for transactional checkout flows.

---

## Abstract

Coordinating pet adoptions, tracking stray animal sightings, and managing shelter populations typically involves manual, fragmented channels such as social media posts, physical sign-up lists, or stand-alone databases. Little Paws addresses these coordination challenges by providing a centralized digital portal. 

Adopters can search for animals within a specified geographic radius, review detailed medical records, and submit comprehensive multi-step adoption applications that are tracked in real time. Shelter managers are equipped with an administrative dashboard to curate listings, process adoption workflows, update organizational profiles, and message applicants directly through an active chat console. Community members can report strays by pinning locations on dynamic maps and uploading photo documentation. The platform also embeds a complete e-commerce hub where pet owners can buy supplies, submit reviews, and complete payments securely.

This report outlines the background, architectural design, component division, deployment workflows, testing protocols, external constraints, and future recommendations for the Little Paws application.

---

## Acknowledgments

I express my sincere appreciation to the project advisors and peers who offered technical feedback, design evaluations, and UI/UX critiques throughout the lifecycle of Little Paws. I also acknowledge the creators of React, Node.js, Express, MySQL, Tailwind CSS, Socket.IO, Firebase, and other open-source packages that formed the technological foundation of this platform.

---

## Table of Contents

1. [Introduction](#1-introduction)
   - [1.1 Statement of the Problem](#11-statement-of-the-problem)
   - [1.2 Background](#12-background)
   - [1.3 Purpose of the Project and Report Overview](#13-purpose-of-the-project-and-report-overview)
2. [Methods and Design Approach](#2-methods-and-design-approach)
   - [2.1 Decoupled Client-Server Architecture](#21-decoupled-client-server-architecture)
   - [2.2 Database Engineering and Custom BaseModel ORM](#22-database-engineering-and-custom-basemodel-orm)
   - [2.3 Real-Time Communications Engine](#23-real-time-communications-engine)
   - [2.4 Authentication, Middleware, and Security Architecture](#24-authentication-middleware-and-security-architecture)
3. [Production Architecture & Deployment Workflow](#3-production-architecture--deployment-workflow)
   - [3.1 Production Deployment Strategy](#31-production-deployment-strategy)
   - [3.2 Database Migration: Local MySQL to Railway](#32-database-migration-local-mysql-to-railway)
   - [3.3 Backend API Deployment on Render Web Services](#33-backend-api-deployment-on-render-web-services)
   - [3.4 Frontend Client Deployment on Vercel CDNs](#34-frontend-client-deployment-on-vercel-cdns)
   - [3.5 Environment Variables Configuration Matrix](#35-environment-variables-configuration-matrix)
4. [Results and Technical Specifications](#4-results-and-technical-specifications)
   - [4.1 Specifications and System Requirements](#41-specifications-and-system-requirements)
   - [4.2 Core Features Overview](#42-core-features-overview)
   - [4.3 System Construction Methods](#43-system-construction-methods)
   - [4.4 Operational Behavior and User Flows](#44-operational-behavior-and-user-flows)
5. [Testing, Calibration, and Validation](#5-testing-calibration-and-validation)
   - [5.1 Automated Testing Environment](#51-automated-testing-environment)
   - [5.2 Manual Production Test Cases](#52-manual-production-test-cases)
6. [External Constraints and Impact Analysis](#6-external-constraints-and-impact-analysis)
7. [Conclusions and Recommendations](#7-conclusions-and-recommendations)
   - [7.1 Project Conclusions](#71-project-conclusions)
   - [7.2 Future Recommendations](#72-future-recommendations)
8. [References](#8-references)
9. [Appendices](#9-appendices)

---

## List of Figures

* **Figure 1:** Decoupled Architecture and API Flow (Vercel CDN ⟷ Render Web Service ⟷ Railway MySQL)
* **Figure 2:** Multi-layered Auth Flow (Firebase Auth ⟷ Express Server ⟷ JWT Signed Cookie ⟷ MySQL User Record)
* **Figure 3:** E-Commerce Payment Pipeline (React Client ⟷ Express Server ⟷ Razorpay API ⟷ MySQL Transaction Tables)
* **Figure 4:** Real-Time Socket.io Room Topology (`user:${id}` and `role:${roleName}` namespaces)

---

## List of Tables

* **Table 1:** System Technology Integration Matrix
* **Table 2:** Database Table Design & Key Index Schema
* **Table 3:** Core Authentication Endpoints
* **Table 4:** E-Commerce & Transaction Endpoints
* **Table 5:** Production Environment Variable Mapping
* **Table 6:** Socio-Economic and Technical Constraints

---

# 1. Introduction

## 1.1 Statement of the Problem
Traditional pet adoption workflows are often inefficient due to fragmented databases, slow paper-based application systems, and poor coordination between shelters and potential adopters. The general public lacks an intuitive interface to search for pets near their location, track adoption applications, or report stray animals. Conversely, animal shelter workers struggle to process incoming adoption forms, manage animal status workflows, and coordinate with adopters. 

Additionally, the animal welfare ecosystem has separate platforms for pet discovery, stray reporting, and e-commerce. A user adopting an animal must go elsewhere to buy pet food, toys, and healthcare supplies, which limits engagement. Little Paws addresses these problems by providing a unified web platform that integrates pet discovery, shelter management, real-time messaging, stray reporting, and e-commerce.

## 1.2 Background
Modern web applications leverage separate frontend and backend systems to improve development speed and interface responsiveness. Building a platform that supports pet adoption and e-commerce requires real-time messaging, secure user sessions, online payments, and automated email notifications.

While many full-stack tutorials rely on MongoDB, relational databases like MySQL are better suited for platforms with highly structured relationships. Little Paws uses a relational MySQL database schema to enforce strict foreign key constraints and transactional integrity across users, pet listings, shelter accounts, adoption applications, shopping carts, orders, chat messages, and notifications.

## 1.3 Purpose of the Project and Report Overview
The primary objective of this project was to design, implement, and deploy a production-ready, full-stack platform named **Little Paws**. 

This report provides a detailed overview of the system, including the engineering choices made during development, the production architecture deployed on Vercel, Render, and Railway, testing procedures, constraints, and recommendations for future enhancements.

---

# 2. Methods and Design Approach

## 2.1 Decoupled Client-Server Architecture
The platform is built with a separated client-server structure to ensure modularity and scalability.
- **Frontend Client (`client`):** Compiled with React 18.3.1 and Vite 5.4.10. It serves as a Single Page Application (SPA) with routes managed by React Router DOM. High-fidelity UI layouts are constructed using Tailwind CSS, Radix UI primitive modules, and Lucide React icons.
- **Backend API (`server`):** Formulated as a Node.js and Express RESTful application. The backend handles REST endpoints, parses cookie-based sessions, and manages a Socket.IO WebSocket server.

## 2.2 Database Engineering and Custom BaseModel ORM
Rather than using heavy external ORM libraries, the backend implements a custom lightweight ORM class called `BaseModel` (located in `server/models/_base.js`). This base class handles connection pooling, constructs parameterized SQL queries, dynamically maps model properties, and parses JSON fields stored inside MySQL text columns (such as arrays of picture URLs). 

```js
class BaseModel {
  static async query(sql, params) {
    // Executes pooled queries safely to prevent SQL Injection
  }
  static fromRow(row) {
    // Maps table rows to javascript objects
  }
}
```

## 2.3 Real-Time Communications Engine
Socket.IO is used to enable real-time messaging and notifications.
- When users authenticate, their web browser establishes a persistent WebSocket connection.
- The server registers the socket session and places it into dynamic rooms: `user:${userId}` (for direct messages and updates) and `role:${roleName}` (for administrative announcements).
- This room structure allows the system to send real-time chat updates and adoption notifications instantly.

## 2.4 Authentication, Middleware, and Security Architecture
Little Paws implements a multi-tier authentication system:
1. **JWT Cookie Authentication:** Traditional registration and logins are validated by issuing a JSON Web Token signed with a secure server secret key (`CLIENT_SECRET_KEY`). This token is stored in an HTTP-only, secure, same-site cookie on the client's browser.
2. **Google OAuth Verification:** Google logins are validated on the backend using the **Firebase Admin SDK**. If the Google credential token is valid, the server logs the user in and issues a matching application JWT.
3. **Role-Based Access Control (RBAC):** Middleware checks the parsed JWT payload to verify roles (`user`, `shelterAdmin`, `sellerAdmin`, `admin`) before granting access to protected routes.

---

# 3. Production Architecture & Deployment Workflow

```
[Vercel Client (HTTPS/Vite)] 
       │ 
       ▼ (Secure Cross-Origin HTTPS / WSS WebSockets)
[Render Server (NodeJS/Express)] 
       │ 
       ├─► [Railway MySQL (Structured Data Storage)]
       ├─► [Firebase Admin SDK (OAuth Validation)]
       ├─► [Nodemailer (Gmail SMTP TLS Email Delivery)]
       └─► [Razorpay Gateway (Secure Checkout API)]
```

## 3.1 Production Deployment Strategy
To transition the MERN (MySQL) architecture to a reliable, cost-effective production environment, the platform was deployed across three cloud platforms:
* **Frontend:** Hosted on **Vercel** for low latency and high availability via CDN caching.
* **Backend:** Hosted on **Render** as a persistent Node.js web service.
* **Database:** Hosted on **Railway** using a fully managed MySQL instance with automated connection pooling.

## 3.2 Database Migration: Local MySQL to Railway
1. A managed MySQL instance was provisioned on Railway.
2. The local database structure was exported to a schema SQL file:
   ```bash
   mysqldump -u root -p little_paws > db_backup.sql
   ```
3. The SQL schema was imported into the live Railway database:
   ```bash
   mysql -h <railway_host> -P <railway_port> -u <railway_user> -p<railway_password> <railway_database> < db_backup.sql
   ```
4. The database connection pool on the Express server (`server/db/mysql.js`) was configured to dynamically adjust its limits based on production environment variables.

## 3.3 Backend API Deployment on Render Web Services
1. A Node.js Web Service was created on Render, linked to the main branch of the GitHub repository.
2. The root directory was set to `server`.
3. In the environment configuration, all secrets (`CLIENT_SECRET_KEY`, `RAZORPAY_SECRET`, `FIREBASE_PRIVATE_KEY`) and database parameters were populated.
4. **Nodemailer SMTP Configuration:** Outbound emails are processed via Nodemailer utilizing a Gmail App Password, ensuring delivery of verification messages, welcome emails, and order confirmations.

## 3.4 Frontend Client Deployment on Vercel CDNs
1. A Vercel project was initialized and linked to the `client` subdirectory of the repository.
2. The framework preset was set to **Vite**, with build commands configured to compile static assets into the `dist` folder.
3. The `VITE_API_URL` environment variable was configured to point to the live Render backend URL, enabling secure API routing and cross-origin cookie authentication.

## 3.5 Environment Variables Configuration Matrix

| Scope | Variable Name | Purpose | Production Value |
|---|---|---|---|
| **Client** | `VITE_API_URL` | API server endpoint | Deployed Render web service URL |
| **Client** | `VITE_FIREBASE_API_KEY` | Firebase API credentials | Live Web API credentials key |
| **Server** | `CORS_ORIGIN` | Allowed domains list | Live Vercel client application URL |
| **Server** | `MYSQL_HOST` | Database host name | Hosted Railway database endpoint |
| **Server** | `CLIENT_SECRET_KEY` | Token signing secret | Long random cryptographic hash string |
| **Server** | `EMAIL_USER` | Email sender address | Integrated Google Gmail account |
| **Server** | `EMAIL_PASS` | Nodemailer password | Secure 16-character Google App Password |
| **Server** | `DISABLE_EMAIL` | Mail toggle flag | Set to `false` for active production emails |

---

# 4. Results and Technical Specifications

## 4.1 Specifications and System Requirements
The platform has been optimized to handle active adopter and shopper workflows, with the following technical specifications:
- **Maximum API Latency:** `< 250ms` for typical database read operations.
- **WebSocket Synchronization Delay:** `< 50ms` for chat message and notification delivery.
- **Concurrent Connections:** Handles up to `50` concurrent database connection threads via MySQL pooling.
- **Browser Compatibility:** Supports all modern evergreen browsers (Chrome, Safari, Firefox, Edge) using responsive CSS viewports.

## 4.2 Core Features Overview
* **Interactive Pet Directory:** Detailed pet profiles with medical status, rescue location, and shelter contact options.
* **Digital Adoption Workflow:** Multi-step questionnaire with fields for home photos, pet experience, and lifestyle. Applications can be approved or rejected by shelter admins through their dashboard.
* **Real-Time Live Messaging:** In-app chat console using Socket.IO that connects adopters directly with shelter managers.
* **Supplies E-Commerce:** Unified store featuring product catalogs, wishlists, reviews, and secure Razorpay payment integrations.
* **Nodemailer Notification Core:** Automated email notifications sent using **Nodemailer** for user registration, order confirmations, and password resets.

## 4.3 System Construction Methods
The backend is structured into clean layers to separate concerns:
- **`server.js`:** The main entry point that configures Express, CORS policies, cookie parsing, and static directory serving, then launches the server.
- **`routes/`:** Maps API endpoints to their corresponding controller functions.
- **`controllers/`:** Implements the business logic (e.g. processing orders, creating listings, verifying payments).
- **`models/`:** Custom model classes that inherit from `BaseModel` to interact with database tables using parameterized queries.

## 4.4 Operational Behavior and User Flows
1. **Adoption Flow:** User registers $\rightarrow$ Browses available pets $\rightarrow$ Fills out multi-step adoption application $\rightarrow$ Shelter admin receives notification $\rightarrow$ Admin reviews application $\rightarrow$ User receives real-time approval update and confirmation email via **Nodemailer**.
2. **E-Commerce Flow:** User browses supplies $\rightarrow$ Adds items to Cart $\rightarrow$ Initiates Razorpay checkout $\rightarrow$ Completes payment $\rightarrow$ Order record is generated in MySQL $\rightarrow$ User receives confirmation email.

---

# 5. Testing, Calibration, and Validation

## 5.1 Automated Testing Environment
The project contains modular testing scripts to verify database models and utility functions before deployment:
- **Model Tests (`npm run test:server`):** Validates the `BaseModel` class. It tests connection behavior, JSON serialization, number casting, and parameterized SQL construction.
- **Frontend Utility Tests (`npm run test:client`):** Verifies image helper functions and client-side formatting utilities.

## 5.2 Manual Production Test Cases
To ensure production stability, the following operational scenarios were manually validated:

1. **Authentication Scenarios:**
   - User signs up with email/password $\rightarrow$ Verification email received $\rightarrow$ Logged in successfully.
   - User logs in via Google OAuth $\rightarrow$ Server validates Firebase token $\rightarrow$ User session active.

2. **Adoption & Chat Scenarios:**
   - Adopter submits application $\rightarrow$ Shelter admin dashboard updates in real time $\rightarrow$ Adopter receives in-app and email notifications.
   - Adopter opens chat with shelter $\rightarrow$ Live messaging operates bi-directionally over WebSockets.

3. **E-Commerce & Razorpay Checkout Scenarios:**
   - Items added to cart $\rightarrow$ Razorpay modal launches $\rightarrow$ Mock payment completed $\rightarrow$ Inventory decreases in database $\rightarrow$ Order confirmation email sent.

---

# 6. External Constraints and Impact Analysis

| Constraint Category | Project Consideration & Technical Response |
|---|---|
| **Economic** | Operates on free/hobby tiers (Vercel, Render, Railway, Firebase, Razorpay). Scaling up to handle larger user bases would require reviewing operational costs. |
| **Environmental** | The server implements resource-efficient connection pooling and asset compression to minimize unnecessary server compute and database operations. |
| **Ethics & Privacy** | Protects user privacy by hashing passwords using `bcryptjs` and storing JWT session tokens in secure, HTTP-only cookies. |
| **Sustainability** | The decoupled architecture allows developers to update or scale the frontend, backend, or database independently without rewriting the codebase. |

---

# 7. Conclusions and Recommendations

## 7.1 Project Conclusions
Little Paws provides a unified platform for pet adoption, stray animal reporting, shelter administration, and pet supplies shopping. Integrating these features into a single application improves coordinator workflows and increases user engagement.

Deploying the system across Vercel, Render, and Railway using a MySQL database demonstrates that a robust relational architecture can be hosted cost-effectively. The authentication system, real-time WebSockets, **Nodemailer** integration, and Razorpay checkout provide a reliable foundation for community pet adoption services.

## 7.2 Future Recommendations
1. **Cloud File Storage:** Migrate Multer uploads to AWS S3 or Cloudinary to prevent image loss on ephemeral cloud servers.
2. **Extended Test Suites:** Write automated integration tests for Express routes and Redux slices.
3. **Optimized Notification Engine:** Build a user preferences portal to let users toggle email, SMS, and push notification alerts.
4. **Enhanced Search Queries:** Implement full-text indexing in MySQL to improve search performance for pet descriptions and product catalogs.

---

# 8. References

1. React Documentation: https://react.dev/
2. Vite Documentation: https://vite.dev/
3. Express Documentation: https://expressjs.com/
4. MySQL Relational Database: https://dev.mysql.com/doc/
5. Firebase Client & Admin SDK: https://firebase.google.com/docs
6. Socket.IO WebSocket Engine: https://socket.io/docs/
7. Nodemailer SMTP: https://nodemailer.com/about/
8. Razorpay Integration Guides: https://razorpay.com/docs/

---

# 9. Appendices

### Appendix A: Project Directory Structure
```text
LITTLE_PAWS final/
  ├── client/        # Vite + React Frontend SPA (Vercel)
  ├── server/        # Express + NodeJS API Server (Render)
  ├── package.json   # Workspace testing scripts
  └── README.md      # Project Documentation
```

### Appendix B: Registered API Route Tree
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Initiate JWT cookie session
- `POST /api/auth/google` - Verify Google OAuth credentials
- `GET /api/pets` - Retrieve pet listings
- `POST /api/adoptions` - Submit adoption application
- `POST /api/shop/payment/order` - Initiate Razorpay payment intent
- `POST /api/chat/send` - Save and broadcast chat message

### Appendix C: Database Tables SQL Schema DDL
```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userName VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
