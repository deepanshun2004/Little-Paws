const jwt = require("jsonwebtoken");
const User = require("../models/User");
const firebaseAdmin = require("../helpers/firebaseAdmin");
require("dotenv").config();

const CLIENT_SECRET_KEY = process.env.CLIENT_SECRET_KEY;
const normalizeRole = (role) => (role === "seller" ? "sellerAdmin" : role);

async function attachUser(req, res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });
  }

  try {
    const decoded = jwt.verify(token, CLIENT_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist anymore.",
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: normalizeRole(user.role),
      userName: user.userName,
      city: user.city,
      profileImage: user.profileImage,
      firebaseUid: user.firebaseUid,
      authProvider: user.authProvider,
      emailVerified: Boolean(user.emailVerified),
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
}

async function verifyFirebaseToken(req, res, next) {
  const token =
    req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Firebase ID token is required.",
      code: "MISSING_ID_TOKEN"
    });
  }

  try {
    let decoded;
    
    if (firebaseAdmin) {
      decoded = await firebaseAdmin.auth().verifyIdToken(token);
    } else {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[DEV ONLY] [Firebase] Firebase Admin verification bypass enabled for middleware`);
        decoded = jwt.decode(token);
        
        if (!decoded) {
          throw new Error("Invalid JWT format");
        }
        
        if (!decoded.uid) {
           decoded.uid = decoded.sub;
        }
      } else {
        return res.status(500).json({
          success: false,
          message: "Firebase Admin is not configured. Cannot verify token.",
          code: "FIREBASE_ADMIN_MISSING"
        });
      }
    }

    const normalizedEmail = decoded.email?.trim().toLowerCase();
    const user =
      (await User.findOne({ firebaseUid: decoded.uid })) ||
      (normalizedEmail ? await User.findOne({ email: normalizedEmail }) : null);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Firebase user is not registered in this app.",
        code: "USER_NOT_REGISTERED"
      });
    }

    req.firebaseUser = decoded;
    req.user = {
      id: user._id,
      email: user.email,
      role: normalizeRole(user.role),
      userName: user.userName,
      city: user.city,
      profileImage: user.profileImage,
      firebaseUid: user.firebaseUid,
      authProvider: user.authProvider,
      emailVerified: Boolean(user.emailVerified),
    };

    next();
  } catch (error) {
    console.error("[Auth] Error verifying token in middleware:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired Firebase token.",
      code: "INVALID_FIREBASE_TOKEN",
      details: { error: process.env.NODE_ENV === 'development' ? error.message : undefined }
    });
  }
}

function verifyRoles(...allowedRoles) {
  return async (req, res, next) => {
    attachUser(req, res, () => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Allowed roles: ${allowedRoles.join(", ")}`,
        });
      }

      next();
    });
  };
}

module.exports = {
  attachUser,
  verifyFirebaseToken,
  verifyRoles,
  verifyUser: verifyRoles("user"),
  verifyShelterAdmin: verifyRoles("shelterAdmin"),
  verifySellerAdmin: verifyRoles("sellerAdmin"),
  verifyAdminRoles: verifyRoles("sellerAdmin", "shelterAdmin"),
};
