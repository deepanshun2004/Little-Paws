# LITTLE_PAWS - Complete Project Analysis

## 📋 Project Overview

**Project Name:** LITTLE_PAWS  
**Author:** Deepanshu 
**License:** ISC  
**Type:** Full-Stack Web Application (MERN-like)  
**Purpose:** Pet adoption platform with shelter management, pet search, and e-commerce features

---

## 🏗️ Architecture Overview

### Technology Stack

#### **Frontend**
- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.10
- **State Management:** Redux Toolkit (@reduxjs/toolkit 2.3.0)
- **Routing:** React Router DOM 6.28.0
- **UI Library:** 
  - Radix UI (components)
  - Tailwind CSS 3.4.14
  - Lucide React (icons)
  - Custom UI components (shadcn/ui style)
- **Real-time Communication:** Socket.io-client 4.8.1
- **HTTP Client:** Axios 1.7.7
- **Authentication:** Firebase 12.13.0
- **Maps:** Leaflet & React-Leaflet (for location-based features)
- **CSS-in-JS:** Tailwind + PostCSS

#### **Backend**
- **Runtime:** Node.js
- **Framework:** Express 4.21.1
- **Real-time:** Socket.io 4.8.1
- **Database:** MySQL 2 (mysql2 3.14.5)
- **Authentication:**
  - JWT (jsonwebtoken 9.0.2)
  - Firebase Admin 13.9.0
  - bcryptjs 2.4.3 (password hashing)
- **File Management:**
  - Multer 1.4.5 (local file uploads)
  - Express static `/uploads` serving
- **Email:** Nodemailer 8.0.7
- **Payment:** Razorpay 2.9.6
- **Message Queue:** Kafka (kafkajs 2.2.4)
- **Google APIs:** googleapis 171.4.0
- **Utilities:**
  - dotenv (environment config)
  - CORS support
  - Cookie Parser

---

## 📁 Directory Structure

### Frontend (`client/`)
```
client/
├── src/
│   ├── components/          # React components
│   │   ├── admin-view/      # Admin dashboard components
│   │   ├── auth/            # Authentication components
│   │   ├── common/          # Shared components
│   │   ├── main-*/          # Feature-specific components
│   │   ├── shopping-view/   # E-commerce UI
│   │   └── ui/              # Reusable UI elements
│   ├── pages/               # Page components (routes)
│   │   ├── auth/            # Login, Register, Password Reset
│   │   ├── main-*/          # Main feature pages
│   │   ├── admin-view/      # Admin pages
│   │   ├── shopping-view/   # E-commerce pages
│   │   └── unauth-page/     # Unauthorized page
│   ├── store/               # Redux store configuration
│   │   ├── auth-slice/      # Authentication state
│   │   └── shop/            # E-commerce state slices
│   ├── hooks/               # Custom React hooks
│   │   ├── use-socket.js    # Socket.io integration
│   │   └── use-toast.js     # Toast notifications
│   ├── lib/                 # Utility libraries
│   │   ├── firebase.js      # Firebase initialization
│   │   ├── socket.js        # Socket utilities
│   │   ├── image.js         # Image processing
│   │   └── utils.js         # Helper functions
│   ├── config/              # Application config
│   ├── assets/              # Static assets
│   ├── App.jsx              # Root component
│   └── main.jsx             # Entry point
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS config
├── eslint.config.js         # ESLint rules
└── index.html               # HTML template
```

### Backend (`server/`)
```
server/
├── models/                  # Database models
│   ├── User.js             # User model
│   ├── pets.model.js       # Pet listings
│   ├── adoptionForm.model.js # Adoption applications
│   ├── shelter.model.js    # Shelter information
│   ├── Cart.js             # Shopping cart
│   ├── Product.js          # E-commerce products
│   ├── Order.js            # Orders
│   ├── Payment.js          # Payment records
│   ├── Chat.js             # Chat messages
│   ├── Message.js          # Message model
│   ├── Notification.js     # User notifications
│   ├── Address.js          # Shipping/delivery addresses
│   ├── Review.js           # Product reviews
│   ├── Wishlist.js         # User wishlists
│   └── _base.js            # Base model class
├── controllers/            # Business logic
│   ├── auth/
│   │   └── auth-controller.js
│   ├── shop/               # E-commerce controllers
│   │   ├── products-controller.js
│   │   ├── cart-controller.js
│   │   ├── order-controller.js
│   │   ├── payment-controller.js
│   │   └── address-controller.js
│   ├── pet.controller.js
│   ├── user.controller.js
│   ├── chat.controller.js
│   ├── notification.controller.js
│   ├── applications.controller.js
│   ├── shelterPetController.js
│   ├── shelterWorkflowController.js
│   └── admin/              # Admin controllers
├── routes/                 # API endpoints
│   ├── auth/
│   │   └── auth-routes.js
│   ├── shop/               # E-commerce routes
│   ├── allpets.js
│   ├── adoption.routes.js
│   ├── chat.routes.js
│   ├── notification.routes.js
│   ├── user.routes.js
│   ├── shelter.routes.js
│   ├── shelterAdmin.js
│   ├── order.routes.js
│   └── admin/              # Admin routes
├── middlewares/
│   └── auth.middleware.js  # Authentication & authorization
├── helpers/                # Utility helpers
│   ├── upload.js           # Multer upload configuration
│   ├── firebaseAdmin.js    # Firebase admin SDK
│   ├── kafkaProducer.js    # Kafka producer
│   ├── mail.service.js     # Email service
│   └── notifications.js    # Notification service
├── db/
│   └── mysql.js            # MySQL connection & initialization
├── config/
│   └── mail.js             # Nodemailer configuration
├── utils/
│   └── sendEmail.js        # Email sending utility
├── server.js               # Express server setup
├── socket.js               # Socket.io event handlers
└── package.json            # Dependencies
```

---

## 🔐 Authentication System

### Methods Supported:
1. **Email/Password** - Traditional registration and login
2. **Google OAuth** - Google authentication via Firebase
3. **Firebase Authentication** - Token-based verification

### Key Routes:
- `POST /auth/register` - User registration
- `POST /auth/login` - Email/password login
- `POST /auth/google` - Google sign-in
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/logout` - User logout
- `GET /auth/check-auth` - Verify JWT token
- `GET /auth/check-firebase-auth` - Verify Firebase token

### Role-Based Access Control:
- **user** - Regular pet adoption users
- **shelterAdmin** - Shelter management personnel
- **sellerAdmin** - E-commerce seller/admin
- **admin** - Platform administrators

---

## 🐾 Core Features

### 1. **Pet Discovery & Search**
- Browse all available pets for adoption
- Advanced search with filters
- Pet details page with images and information
- Location-based pet search (using Leaflet maps)
- Pet categories: dogs, cats, etc.
- Health status tracking
- Distance calculation from user location

### 2. **Pet Adoption System**
- Submit adoption applications
- Track application status
- Withdrawal capability
- Form fields:
  - Personal information
  - Living conditions assessment
  - Pet experience
  - Adoption motivation details
  - Shelter communication

### 3. **Shelter Management**
- Shelter admin dashboard
- Pet listing management (add/edit/delete)
- Pet workflow management
- Application review and approval
- Shelter information management
- Contact management

### 4. **Stray Pet Reporting**
- Report stray/lost animals
- Location marking with coordinates
- Photo documentation
- Status tracking (approved, pending)
- Pickup eligibility marking

### 5. **E-Commerce (Pet Supplies)**
- Product catalog
- Shopping cart
- Product reviews and ratings
- Wishlist functionality
- Order management
- Payment processing (Razorpay)
- Address management for delivery
- Order history and tracking

### 6. **Real-Time Communication**
- Chat system between users and shelters
- Socket.io-based messaging
- Real-time notifications
- User presence tracking
- Message persistence in database

### 7. **Notification System**
- Real-time notifications via Socket.io
- Email notifications (Nodemailer)
- Notification history
- Role-based notifications (emit to roles)
- User-specific notifications

### 8. **Additional Features**
- User profiles
- City-based filtering
- Image upload with multer local storage
- Email verification
- About Us page
- Responsive design with Tailwind CSS

---

## 🔌 API Endpoints Summary

### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/google` | Google OAuth login |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/check-auth` | Verify JWT authentication |
| GET | `/auth/check-firebase-auth` | Verify Firebase authentication |

### Pets
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/pets` | Get all pets |
| GET | `/pets/:petId` | Get single pet details |

### Adoption
| Method | Endpoint | Purpose |
|--------|----------|---------|
| * | `/adoption/*` | Adoption form submission, status tracking |

### Shopping
| Method | Endpoint | Purpose |
|--------|----------|---------|
| * | `/shop/products/*` | Product CRUD |
| * | `/shop/cart/*` | Cart management |
| * | `/shop/orders/*` | Order management |
| * | `/shop/payment/*` | Payment processing |
| * | `/shop/address/*` | Address management |

### Shelter Management
| Method | Endpoint | Purpose |
|--------|----------|---------|
| * | `/shelterAdmin/*` | Shelter admin operations |
| * | `/shelter/*` | Shelter information |

### Real-Time
| Method | Endpoint | Purpose |
|--------|----------|---------|
| WebSocket | `/chat/*` | Chat messaging |
| WebSocket | `/notification/*` | Notifications |
| WebSocket | Socket.io events | Real-time updates |

---

## 💾 Database Schema (MySQL)

### Key Tables:
1. **users** - User accounts with roles and Firebase integration
2. **pets** - Pet listings with detailed info
3. **adoption_forms** - Adoption applications
4. **shelters** - Shelter organizations
5. **products** - E-commerce products
6. **orders** - Customer orders
7. **carts** - Shopping carts
8. **payments** - Payment records
9. **chat** - Chat conversations
10. **messages** - Individual chat messages
11. **notifications** - User notifications
12. **addresses** - Delivery addresses
13. **reviews** - Product reviews
14. **wishlists** - User wishlists
15. **password_reset_tokens** - Password reset tokens

---

## 🔄 Frontend State Management (Redux)

### Store Slices:
1. **auth** - Authentication state
   - User information
   - Authentication status
   - Loading states
   - Role management

2. **shopProducts** - Product listing
   - Products list
   - Filters
   - Sorting

3. **shopCart** - Shopping cart
   - Cart items
   - Quantities
   - Totals

4. **shopAddress** - Delivery addresses
   - Saved addresses
   - Default address

5. **shopOrder** - Order management
   - Order history
   - Order status

---

## 🔌 Socket.io Events

### Client -> Server Events:
- `user:join` - User joins with userId and role
- `chat:send-message` - Send chat message
- Various notification events

### Server -> Client Events:
- Room-based emissions to `user:${userId}`
- Role-based emissions to `role:${role}`
- Broadcast notifications
- Real-time updates on data changes

---

## 🚀 Development & Build Scripts

### Frontend (`client/`)
```bash
npm run dev          # Start dev server with Vite (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend (`server/`)
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start server (port 5000)
```

---

## 🔐 Security Features

1. **JWT Authentication** - Token-based auth with signing
2. **Password Hashing** - bcryptjs for secure password storage
3. **Firebase Auth** - Integration with Firebase security
4. **CORS Configuration** - Restricted to specific origin
5. **Cookie Security** - Secure cookie handling
6. **Role-Based Access Control** - Middleware-based authorization
7. **Token Verification** - JWT and Firebase token validation

---

## 🛠️ Configuration Files

### Frontend
- **vite.config.js** - Vite build configuration with React plugin
- **tailwind.config.js** - Tailwind CSS theme and styling
- **eslint.config.js** - Code linting rules
- **postcss.config.js** - PostCSS processing
- **jsconfig.json** - JavaScript configuration with path aliases

### Backend
- **package.json** - Dependencies and scripts
- **.env** - Environment variables (not in repo, local only)

### Environment Variables Required:
**Frontend (.env):**
- `VITE_API_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**Backend (.env):**
- `PORT` (default: 5000)
- `CORS_ORIGIN`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `CLIENT_SECRET_KEY` (for JWT signing)
- `EMAIL_USER` (Gmail for Nodemailer)
- `EMAIL_PASS` (Gmail app password)
- `RAZORPAY_API_KEY`, `RAZORPAY_API_SECRET`
- Firebase admin credentials
- Kafka broker configuration

---

## 📊 Integrations

1. **Firebase** - Authentication and user management
2. **Razorpay** - Payment processing
3. **Nodemailer** - Email delivery
4. **Google APIs** - Various Google service integrations
5. **Kafka** - Message queue (for async operations)
6. **Leaflet** - Map visualization for pet location

---

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first Tailwind CSS
- **Component Library** - Radix UI components
- **Dark Mode Support** - Tailwind dark mode config
- **Custom UI Components** - shadcn/ui style components
- **Icons** - Lucide React icons
- **Animations** - Tailwind CSS animations
- **Toast Notifications** - Custom toaster component

---

## 🔍 Key Architectural Patterns

1. **MVC Pattern** - Models, Controllers, Routes separation
2. **Middleware Architecture** - Express middleware for auth/validation
3. **Redux Store** - Centralized state management
4. **Socket.io Rooms** - User and role-based room grouping
5. **Base Model Class** - ORM-like pattern for database models
6. **Custom Hooks** - React hooks for socket and toast logic

---

## 📈 Scalability Considerations

1. **Database** - MySQL with connection pooling
2. **File Storage** - Multer local uploads served from `/uploads`
3. **Real-time** - Socket.io for scalable WebSocket
4. **Message Queue** - Kafka for async processing
5. **Caching** - Could leverage Redis (not currently implemented)
6. **API** - Stateless REST + WebSocket architecture

---

## 🐛 Code Quality

- **ESLint** - JavaScript linting enabled
- **Vite** - Modern build tool with fast refresh
- **Redux Toolkit** - Best practices for state management
- **Modular Structure** - Well-organized file structure
- **Separation of Concerns** - Clear division between frontend/backend

---

## 📝 Summary Statistics

| Metric | Count |
|--------|-------|
| Frontend Dependencies | ~20 |
| Backend Dependencies | ~16 |
| Database Models | 15 |
| API Routes | 8+ main route files |
| React Components | 15+ component directories |
| Page Routes | 15+ distinct pages |
| User Roles | 4 (user, shelterAdmin, sellerAdmin, admin) |
| Core Features | 8+ major features |

---

## 🎯 Primary Use Cases

1. **Pet Adoption** - Users browse and adopt pets from shelters
2. **Pet Reporting** - Report stray/lost animals
3. **Shelter Management** - Shelter admins manage pet listings
4. **E-Commerce** - Purchase pet supplies and accessories
5. **Real-Time Communication** - Chat between users and shelters
6. **Application Tracking** - Monitor adoption application status
7. **Notifications** - Real-time updates on applications and orders
8. **User Profiles** - Account management and preferences

---

**Last Updated:** May 10, 2026  
**Version:** 1.0.0


