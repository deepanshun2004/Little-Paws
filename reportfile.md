# Little Paws Project Report

## Cover

**Project Title:** Little Paws: Pet Adoption, Shelter Management, and Pet Supplies Platform

**Date of Submission:** [Enter Submission Date]

**Submitted By:** Deepanshu

**Affiliation:** [Enter Department, Institution, or Organization]

## Title Page

**Little Paws** is a full-stack web application designed to support pet adoption, stray pet reporting, shelter administration, real-time communication, and pet supplies shopping. The system connects adopters, shelters, administrators, and product sellers through one integrated platform.

The project was developed using a React and Vite frontend, an Express and Node.js backend, a MySQL database, Firebase authentication, Socket.io real-time communication, multer local image uploads, Nodemailer email services, and Razorpay payment integration.

## Abstract

Little Paws is a web-based platform developed to improve the process of pet adoption and shelter coordination. The system allows users to browse pets, search by location and category, view detailed pet information, submit adoption applications, report stray animals, communicate with shelters, and purchase pet supplies. Shelter administrators can manage pet listings, review adoption applications, update shelter information, and communicate with adopters. The platform also includes role-based access control, real-time chat, notifications, image uploads, shopping cart management, order processing, and payment support.

The final product is a modular full-stack application with separate frontend and backend layers. The frontend uses React, Redux Toolkit, React Router, Tailwind CSS, Radix UI components, Leaflet maps, and Socket.io Client. The backend uses Node.js, Express, MySQL, JWT, Firebase Admin, bcryptjs, Socket.io, Multer, Nodemailer, Razorpay, and Kafka. The application stores structured data in MySQL and supports multiple user roles, including user, shelter administrator, seller administrator, and platform administrator.

## Acknowledgments

I would like to acknowledge the support and guidance of my project faculty advisor, institution, and all individuals who provided feedback during the development of Little Paws. I also acknowledge the usefulness of open-source technologies such as React, Node.js, Express, MySQL, Firebase, Tailwind CSS, Socket.io, and related libraries that made the development of this system possible.

## Table of Contents

1. Introduction
2. Statement of the Problem
3. Background
4. Purpose of Project and Overview of Project Report
5. Methods and Design Approach
6. Results
7. Specifications
8. Construction Methods
9. Operation
10. Testing and Calibration
11. External Constraints
12. Conclusions
13. Recommendations
14. References
15. Appendices

## List of Figures

Figure 1: Little Paws system architecture  
Figure 2: User authentication flow  
Figure 3: Pet adoption workflow  
Figure 4: Shelter administrator workflow  
Figure 5: E-commerce order workflow  

## List of Tables

Table 1: Technology stack  
Table 2: User roles and permissions  
Table 3: Main database tables  
Table 4: Major API modules  
Table 5: External constraints  

# Introduction

## Statement of the Problem

Pet adoption often involves scattered information, manual communication, and limited visibility between adopters and shelters. Users may struggle to find nearby pets, compare available animals, understand adoption requirements, or track the status of an application. Shelters may have difficulty managing pet listings, reviewing adoption requests, responding to user queries, and maintaining records in an organized way.

In addition to adoption challenges, stray and lost animal reporting is often informal and slow. People who see stray animals may not have a structured way to submit location details, photos, and status updates to shelters or responsible organizations. Pet owners and adopters also need access to supplies, but adoption and pet supply shopping are usually handled through separate systems.

Little Paws addresses these problems by providing a centralized platform for pet discovery, adoption applications, shelter management, stray pet reporting, user communication, notifications, and pet supplies purchasing.

## Background

Animal shelters and adoption organizations depend on accurate information, quick communication, and organized workflows. A digital platform can reduce manual effort by storing pet records, adoption forms, shelter details, user accounts, and communication history in a single system. Location-based search and map features can help users find pets or report stray animals more effectively.

Modern web technologies make it possible to build such a platform with responsive interfaces, secure authentication, real-time messaging, backend-served local image upload storage, and online payment integration. Little Paws uses a MERN-like architecture, with React on the frontend and Node.js with Express on the backend, but uses MySQL as the relational database. This choice supports structured relationships between users, pets, shelters, applications, products, orders, payments, chats, and notifications.

## Purpose of Project and Overview of Project Report

The purpose of this project was to develop an effective pet adoption and shelter management platform by designing and implementing a full-stack web application named Little Paws.

This report describes the problem addressed by the project, the background of the system, the methods and design approach used during development, the features and implementation results, testing methods, external constraints, conclusions, and recommendations for future improvement.

# Methods and Design Approach

The project was developed as a modular full-stack web application. The frontend and backend were separated into different folders to improve maintainability and allow each layer to handle a clear responsibility.

The frontend was designed using React 18 and Vite for fast development and production builds. React Router DOM was used for page navigation. Redux Toolkit was used to manage shared application state such as authentication, products, cart, address, and order data. Tailwind CSS and Radix UI components were used to build a responsive and consistent user interface. Lucide React icons were used for visual controls, and Leaflet with React-Leaflet was used for location-based features.

The backend was designed using Node.js and Express. Routes were separated by feature area, including authentication, pets, adoption, shelter administration, user management, shopping, payments, chat, notifications, and orders. Controllers contain the business logic, while models communicate with the MySQL database. Middleware is used for authentication and authorization.

Authentication was implemented using JWT, Firebase Authentication, Firebase Admin, and bcryptjs password hashing. Role-based access control was included to separate the permissions of normal users, shelter administrators, seller administrators, and platform administrators.

Real-time functionality was implemented with Socket.io. Users can join rooms based on user ID and role, allowing the system to send user-specific and role-specific chat messages and notifications. Image uploads are handled through Multer and served from the backend `/uploads` route, while payment processing is handled using Razorpay. Nodemailer supports email-related workflows such as password reset and notifications.

# Results

The result of the project is a working full-stack platform with the following major modules:

- Pet discovery and search
- Pet adoption application submission and tracking
- Shelter administration
- Stray or lost pet reporting
- Pet supplies e-commerce
- Shopping cart and wishlist
- Order and payment processing
- Real-time chat
- Real-time and email notifications
- User profile and account management
- Role-based access control
- Location-based pet features

## Specifications

Little Paws supports four main user roles:

| Role | Description |
|------|-------------|
| User | Can browse pets, apply for adoption, report stray pets, chat with shelters, manage profile, and shop for products. |
| Shelter Admin | Can manage shelter details, pet listings, adoption requests, and shelter communication. |
| Seller Admin | Can manage product-related e-commerce workflows. |
| Admin | Can manage platform-level operations and administrative views. |

The frontend uses the following major technologies:

| Technology | Purpose |
|------------|---------|
| React 18.3.1 | User interface development |
| Vite 5.4.10 | Frontend build tool |
| Redux Toolkit 2.3.0 | State management |
| React Router DOM 6.28.0 | Client-side routing |
| Tailwind CSS 3.4.14 | Responsive styling |
| Radix UI | Accessible UI components |
| Socket.io Client 4.8.1 | Real-time communication |
| Axios 1.7.7 | API requests |
| Firebase 12.13.0 | Authentication |
| Leaflet and React-Leaflet | Map and location features |

The backend uses the following major technologies:

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express 4.21.1 | Web server and API framework |
| MySQL2 3.14.5 | Database connection |
| Socket.io 4.8.1 | Real-time server communication |
| JWT | Token-based authentication |
| Firebase Admin | Firebase token verification |
| bcryptjs | Password hashing |
| Multer | File upload handling |
| Nodemailer | Email delivery |
| Razorpay | Payment processing |
| KafkaJS | Asynchronous messaging support |

## Construction Methods

The project is organized into two main parts:

- `client/`: React frontend application
- `server/`: Express backend application

The frontend contains reusable components, page-level route components, Redux store slices, custom hooks, utility libraries, configuration files, and static assets. The backend contains models, controllers, routes, middleware, helper services, database configuration, socket handling, and the main server entry file.

The backend starts from `server.js`, initializes environment variables, configures CORS, parses cookies and JSON requests, registers API routes, configures Socket.io rooms, validates startup environment variables, connects to MySQL, and starts the server on the configured port.

The database layer uses MySQL tables for users, pets, adoption forms, shelters, products, orders, carts, payments, chat, messages, notifications, addresses, reviews, wishlists, and password reset tokens. This relational structure allows the platform to connect user actions with pets, shelters, applications, orders, and messages.

## Operation

A normal user can register or log in using email/password or Google authentication. After logging in, the user can browse available pets, open a pet detail page, search or filter by relevant criteria, and submit an adoption application. The user can also report stray or lost animals by providing location and photo details.

A shelter administrator can log in to a protected dashboard and manage shelter-related data. This includes adding, editing, or deleting pet listings, reviewing adoption applications, updating shelter information, and communicating with users.

The e-commerce section allows users to browse pet supplies, add products to the cart, save products to a wishlist, manage delivery addresses, place orders, make payments through Razorpay, and view order history.

The chat and notification systems operate in real time through Socket.io. When a user joins the platform, the socket connection can join rooms such as `user:{userId}` and `role:{role}`. This allows the system to deliver messages and notifications to specific users or roles.

## Testing and Calibration

The project includes test scripts at the root level, frontend level, and backend level.

Root command:

```bash
npm test
```

Frontend command:

```bash
npm --prefix client test
```

Backend command:

```bash
npm --prefix server test
```

The frontend contains tests for utility and image-related logic. The backend contains tests for base model behavior. The project also supports manual testing through the frontend development server and backend API server.

Important manual test cases include:

- Registering a new user
- Logging in with email/password
- Logging in with Google authentication
- Browsing available pets
- Opening a pet details page
- Submitting an adoption application
- Managing shelter pet listings
- Reporting a stray pet
- Sending and receiving chat messages
- Receiving notifications
- Adding products to cart
- Placing an order
- Processing a payment
- Verifying role-based access control

## External Constraints

| Constraint | Project Consideration |
|------------|----------------------|
| Economic | The project uses open-source frameworks where possible. Paid services such as Firebase, email delivery, Railway MySQL, Render, Vercel, and Razorpay may require pricing review before production deployment. |
| Environmental | The platform supports animal welfare by improving adoption visibility and stray pet reporting. Cloud infrastructure should be used responsibly to reduce unnecessary storage and compute usage. |
| Sustainability | The modular architecture makes the system easier to maintain and extend. Future improvements can be added without rewriting the full application. |
| Manufacturability | As a software system, deployment requires proper hosting, database setup, environment variables, and service credentials rather than physical manufacturing. |
| Ethical | The system handles personal user data, adoption applications, messages, and location information. It must protect user privacy and avoid misuse of animal or adopter data. |
| Health and Safety | The platform can help shelters and users respond to stray animals more safely by providing location and status information. It should avoid encouraging unsafe direct handling of injured or aggressive animals. |
| Social | The project promotes adoption, responsible pet ownership, and better communication between communities and shelters. |
| Political and Legal | The platform must respect local animal welfare rules, payment regulations, data protection requirements, and shelter policies. |

# Conclusions

Little Paws successfully implements the core requirements of a pet adoption and shelter management platform. It provides a centralized system where users can discover pets, apply for adoption, report stray animals, communicate with shelters, and purchase pet supplies. Shelter administrators receive tools for managing listings and adoption workflows, while the platform supports authentication, authorization, real-time communication, notifications, local backend image uploads, and online payments.

The project demonstrates a practical full-stack architecture with a React frontend, Express backend, MySQL database, and multiple third-party integrations. The modular structure makes the application understandable and maintainable.

Some limitations remain. Production deployment would require stronger validation, more complete automated test coverage, security hardening, detailed error handling, backup planning, and monitoring. Payment, email, Firebase, upload persistence, and database configuration must be carefully managed through secure environment variables. The platform would also benefit from better analytics, shelter verification, improved moderation, and stronger accessibility testing.

## Recommendations

The project can be improved further through the following steps:

- Add more automated tests for controllers, routes, authentication, adoption workflows, payments, and real-time messaging.
- Add stronger form validation on both frontend and backend.
- Add admin analytics for adoption rates, application status, shelter activity, and product sales.
- Improve accessibility testing for keyboard navigation, color contrast, form labels, and screen reader support.
- Add stronger file upload validation for image size, format, and content safety.
- Add shelter verification before allowing public pet listings.
- Improve notification preferences so users can choose email, in-app, or real-time alerts.
- Add deployment documentation for frontend hosting, backend hosting, MySQL setup, and environment variables.
- Add logging and monitoring for production errors and performance.
- Conduct user testing with adopters and shelter staff before public release.

# References

- React Documentation: https://react.dev/
- Vite Documentation: https://vite.dev/
- Express Documentation: https://expressjs.com/
- MySQL Documentation: https://dev.mysql.com/doc/
- Firebase Documentation: https://firebase.google.com/docs
- Socket.io Documentation: https://socket.io/docs/
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- Redux Toolkit Documentation: https://redux-toolkit.js.org/
- Razorpay Documentation: https://razorpay.com/docs/
- Nodemailer Documentation: https://nodemailer.com/about/

# Appendices

## Appendix A: Main Project Structure

```text
LITTLE_PAWS final/
  client/
    src/
      components/
      pages/
      store/
      hooks/
      lib/
      config/
      assets/
      App.jsx
      main.jsx
  server/
    models/
    controllers/
    routes/
    middlewares/
    helpers/
    db/
    config/
    utils/
    server.js
    socket.js
  package.json
  README.md
  reportfile.md
```

## Appendix B: Main API Modules

```text
/api/auth
/api/pets
/api/user
/api/shelter
/api/shelterAdmin
/api/adoptions
/api/shop/products
/api/shop/cart
/api/shop/address
/api/shop/order
/api/shop/payment
/api/notifications
/api/chat
/api/orders
```

## Appendix C: Required Environment Configuration

Frontend environment variables include Firebase configuration and API URL values. Backend environment variables include server port, CORS origin, MySQL credentials, JWT secret, email credentials, Razorpay credentials, Firebase Admin credentials, and Kafka configuration.

## Appendix D: Development Commands

```bash
npm test
npm run test:client
npm run test:server
npm --prefix client run dev
npm --prefix client run build
npm --prefix server run dev
npm --prefix server start
```

