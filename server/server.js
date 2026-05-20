const path = require("path");
const fs = require("fs");
const envPath = path.resolve(__dirname, ".env");
require("dotenv").config({ path: envPath });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const { initDatabase } = require("./db/mysql");
const { uploadDir } = require("./helpers/upload");
const authrouter = require("./routes/auth/auth-routes");
const petRouter = require("./routes/allpets");
const shelterAdminRouter = require("./routes/shelterAdmin");
const userRouter = require("./routes/user.routes");
const shopProductsRouter = require("./routes/shop/prdoucts-routes");
const shopcartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopPaymentRouter = require("./routes/shop/payment-routes");
const notificationRouter = require("./routes/notification.routes");
const chatRouter = require("./routes/chat.routes");
const shelterRouter = require("./routes/shelter.routes");
const adoptionRouter = require("./routes/adoption.routes");
const orderRouter = require("./routes/order.routes");
const { setIo } = require("./socket");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const allowedOrigins = CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "Expires",
    "Pragma",
  ],
  credentials: true,
};
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

setIo(io);

app.set("trust proxy", 1);
app.use(cors(corsOptions));

app.use(cookieparser());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));
app.use("/api/auth", authrouter);
app.use("/api/shelterAdmin", shelterAdminRouter);
app.use("/api/pets", petRouter);
app.use("/api/user", userRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopcartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/payment", shopPaymentRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/chat", chatRouter);
app.use("/api/shelter", shelterRouter);
app.use("/api/adoptions", adoptionRouter);
app.use("/api/orders", orderRouter);

io.on("connection", (socket) => {
  socket.on("user:join", ({ userId, role }) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }

    if (role) {
      socket.join(`role:${role}`);
    }
  });

  socket.on("user:leave", ({ userId, role }) => {
    if (userId) {
      socket.leave(`user:${userId}`);
    }

    if (role) {
      socket.leave(`role:${role}`);
    }
  });

  socket.on("chat:join", (roomId) => {
    socket.join(roomId);
  });

  socket.on("chat:leave", (roomId) => {
    socket.leave(roomId);
  });
});

function validateStartup() {
  const envVars = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
    "CORS_ORIGIN",
    "CLIENT_URL",
    "MYSQL_HOST",
    "MYSQL_USER",
    "MYSQL_DATABASE",
    "CLIENT_SECRET_KEY",
  ];

  console.log("--- Startup Validation ---");
  const envFileExists = fs.existsSync(envPath);
  console.log(`[ENV] .env file exists at ${envPath}: ${envFileExists ? "YES" : "NO"}`);
  console.log(`[ENV] Current working directory: ${process.cwd()}`);

  if (envFileExists) {
    console.log("[ENV] .env loaded successfully");
  }

  const missingVars = [];
  for (const v of envVars) {
    if (process.env[v]) {
      console.log(`[ENV] ${v}: PRESENT`);
    } else {
      missingVars.push(v);
      console.log(`[ENV] ${v}: MISSING`);
    }
  }

  if (missingVars.length > 0) {
    console.warn(`⚠️ [Startup] Missing ${missingVars.length} required environment variables: ${missingVars.join(", ")}`);
  } else {
    console.log("✅ [Startup] All required environment variables detected.");
  }

  const firebaseAdmin = require("./helpers/firebaseAdmin");
  if (firebaseAdmin && firebaseAdmin.apps && firebaseAdmin.apps.length > 0) {
    console.log("✅ [Firebase] Admin initialized successfully");
  } else {
    console.warn("⚠️ [Firebase] Admin initialization bypassed (credentials missing)");
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ [DEV ONLY] Firebase Admin verification bypass enabled");
    }
  }
  console.log("--------------------------");
}

validateStartup();

initDatabase()
  .then(() => {
    console.log("✅ [DB] MySQL connected");
    server.listen(PORT, () => {
      console.log(`✅ [Startup] Server is now running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ [DB] Error connecting to MySQL:", error);
    process.exit(1);
  });
