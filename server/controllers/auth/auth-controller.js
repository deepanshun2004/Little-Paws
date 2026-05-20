const bcrypt=require('bcryptjs');
const crypto = require("crypto");
const jwt=require('jsonwebtoken');
const User=require("../../models/User")
const { query } = require("../../db/mysql");
const { attachUser } = require("../../middlewares/auth.middleware");
const firebaseAdmin = require("../../helpers/firebaseAdmin");
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../../utils/sendEmail");
const CLIENT_SECRET_KEY = process.env.CLIENT_SECRET_KEY;
const isProduction = process.env.NODE_ENV === "production";

const normalizeRole = (role) => (role === "seller" ? "sellerAdmin" : role);
const toUserResponse = (user) => ({
  email: user.email,
  role: normalizeRole(user.role),
  id: user._id,
  userName: user.userName,
  city: user.city,
  profileImage: user.profileImage,
  firebaseUid: user.firebaseUid,
  authProvider: user.authProvider,
  emailVerified: Boolean(user.emailVerified),
});

const signAppToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: normalizeRole(user.role),
      email: user.email,
      userName: user.userName,
    },
    CLIENT_SECRET_KEY,
    { expiresIn: "30d" }
  );

const issueAuthResponse = (res, user, message, extra = {}) => {
  const token = signAppToken(user);

  return res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  }).json({
    success: true,
    token,
    message,
    user: toUserResponse(user),
    ...extra,
  });
};

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

async function savePasswordResetToken(userId, token) {
  const now = new Date();
  const ttlMinutes = Number(process.env.RESET_TOKEN_TTL_MINUTES || 30);
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
  const tokenHash = hashResetToken(token);

  await query(
    "UPDATE password_reset_tokens SET usedAt = ?, updatedAt = ? WHERE userId = ? AND usedAt IS NULL",
    [now, now, userId]
  );

  await query(
    `INSERT INTO password_reset_tokens (userId, tokenHash, expiresAt, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, tokenHash, expiresAt, now, now]
  );
}

async function consumePasswordResetToken(token) {
  const tokenHash = hashResetToken(token);
  const rows = await query(
    `SELECT * FROM password_reset_tokens
     WHERE tokenHash = ? AND usedAt IS NULL AND expiresAt > ?
     LIMIT 1`,
    [tokenHash, new Date()]
  );
  const resetToken = rows[0];

  if (!resetToken) {
    return null;
  }

  await query(
    "UPDATE password_reset_tokens SET usedAt = ?, updatedAt = ? WHERE id = ?",
    [new Date(), new Date(), resetToken.id]
  );

  return resetToken;
}

async function buildUniqueUserName(displayName, email) {
  const baseName = (displayName || email?.split("@")[0] || "user")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24) || "user";

  let candidate = baseName;
  let suffix = 1;

  while (await User.findOne({ userName: candidate })) {
    candidate = `${baseName}${suffix}`;
    suffix += 1;
  }

  return candidate;
}
//register

const registerUser=async(req,res)=>{
    const {userName,email,password,city}= req.body;

    try{
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUserName = userName?.trim();

    if (!normalizedUserName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }

    const checkUserByEmail = await User.findOne({ email: normalizedEmail });
    if (checkUserByEmail)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

      const checkUserByUserName = await User.findOne({ userName: normalizedUserName });
      if (checkUserByUserName)
        return res.json({
          success: false,
          message: "Username already taken! Please try another one",
        });

      const hashPassword= await bcrypt.hash(password,12);
      const newUser= new User({
        userName: normalizedUserName,
        email: normalizedEmail,
        password: hashPassword,
        role: "user",
        city: city?.trim() || null,
      });

      await newUser.save();
      sendWelcomeEmail(newUser.email, newUser.userName).catch((error) => {
        console.log("Welcome email failed:", error.message);
      });
      res.status(200).json({
        success:true,
        message:"Registration Successful",
      })

    }catch(e){
      console.log(e);
      res.status (500).json ({
        success:false,
        message:"Some error occured",
      });
    }
};
//login

const loginUser=async(req,res)=>{
    const {email,password}=req.body;
    try{
      const normalizedEmail = email?.trim().toLowerCase();
      const checkUser=await User.findOne({email: normalizedEmail});
      if(!checkUser) return res.json({
        success:false,
        message:"User doesn't exists! Please register first"
      })
      
      const checkPasswordMatch= await bcrypt.compare(password,checkUser.password);
      if(!checkPasswordMatch) return res.json({
        success:false,
        message:"Incorrect password! Please try again",
      });

      return issueAuthResponse(res, checkUser, "Logged in successfully");


    }catch(e){
      console.log(e);
      res.status (500).json ({
        success:false,
        message:"Some error occured",
      });
    }
}

const loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;
  const correlationId = crypto.randomBytes(4).toString("hex");

  console.log(`[Google Login] [${correlationId}] Initiating Google sign-in flow...`);

  if (!idToken) {
    console.warn(`[Google Login] [${correlationId}] Missing ID token in request`);
    return res.status(400).json({
      success: false,
      message: "Firebase ID token is required",
      code: "MISSING_ID_TOKEN"
    });
  }

  try {
    let decodedToken;
    
    if (firebaseAdmin) {
      decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      console.log(`[Google Login] [${correlationId}] Token verified via Firebase Admin`);
    } else {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[DEV ONLY] [Google Login] [${correlationId}] Firebase Admin verification bypass enabled`);
        decodedToken = jwt.decode(idToken);
        
        if (!decodedToken) {
          throw new Error("Invalid JWT format");
        }
        
        const provider = decodedToken.firebase?.sign_in_provider;
        if (provider !== "google.com") {
          throw new Error(`Invalid provider: ${provider}`);
        }
        
        if (!decodedToken.email || (!decodedToken.uid && !decodedToken.sub)) {
           throw new Error("Missing required token claims (email or uid/sub)");
        }
        
        if (!decodedToken.uid) {
           decodedToken.uid = decodedToken.sub;
        }
        
      } else {
        console.error(`[Google Login] [${correlationId}] Firebase Admin not configured in production`);
        return res.status(500).json({
          success: false,
          message: "Firebase Admin is not configured. Cannot verify token.",
          code: "FIREBASE_ADMIN_MISSING"
        });
      }
    }

    const normalizedEmail = decodedToken.email?.trim().toLowerCase();

    if (!normalizedEmail) {
      console.warn(`[Google Login] [${correlationId}] Token missing email address`);
      return res.status(400).json({
        success: false,
        message: "Google account must include an email address",
        code: "MISSING_EMAIL"
      });
    }

    console.log(`[DB] [${correlationId}] Looking up user by Firebase UID...`);
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (user && user.email !== normalizedEmail) {
      console.warn(`[Google Login] [${correlationId}] Account email mismatch`);
      return res.status(409).json({
        success: false,
        message: "This Google account is already linked to another email.",
        code: "EMAIL_MISMATCH"
      });
    }

    if (!user) {
      console.log(`[DB] [${correlationId}] Looking up user by email...`);
      user = await User.findOne({ email: normalizedEmail });
    }

    const isNewUser = !user;

    if (!user) {
      console.log(`[Google Login] [${correlationId}] Creating new user...`);
      const userName = await buildUniqueUserName(decodedToken.name, normalizedEmail);
      const placeholderPassword = await bcrypt.hash(`firebase:${decodedToken.uid}`, 12);

      user = new User({
        userName,
        email: normalizedEmail,
        password: placeholderPassword,
        role: "user",
        city: null,
        profileImage: decodedToken.picture || null,
        firebaseUid: decodedToken.uid,
        authProvider: "google",
        emailVerified: decodedToken.email_verified ? 1 : 0,
      });
    } else {
      console.log(`[Google Login] [${correlationId}] Updating existing user...`);
      if (user.firebaseUid && user.firebaseUid !== decodedToken.uid) {
        console.warn(`[Google Login] [${correlationId}] Email linked to different Firebase account`);
        return res.status(409).json({
          success: false,
          message: "An account already exists with this email.",
          code: "ACCOUNT_EXISTS"
        });
      }

      user.firebaseUid = decodedToken.uid;
      user.authProvider = "google";
      user.profileImage = user.profileImage || decodedToken.picture || null;
      user.emailVerified = decodedToken.email_verified ? 1 : 0;
    }

    await user.save();
    console.log(`[DB] [${correlationId}] User saved successfully`);

    let emailWarning = null;
    try {
      if (isNewUser) {
         await sendWelcomeEmail(user.email, user.userName);
      }
    } catch (error) {
      console.error(`[Google Login] [${correlationId}] Welcome email failed:`, error.message);
      emailWarning = "Signed in, but the welcome email could not be sent.";
    }

    console.log(`[JWT] [${correlationId}] Issuing auth response...`);
    return issueAuthResponse(
      res,
      user,
      isNewUser ? "Google account created successfully" : "Logged in with Google successfully",
      emailWarning ? { emailWarning } : {}
    );
  } catch (error) {
    console.error(`[Google Login] [${correlationId}] Error verifying token:`, error.message);
    return res.status(401).json({
      success: false,
      message: "Unable to verify Google sign-in. Please try again.",
      code: "INVALID_FIREBASE_TOKEN",
      details: { error: process.env.NODE_ENV === 'development' ? error.message : undefined }
    });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.authProvider === "google") {
      return res.json({
        success: true,
        message: "If that email can be reset, a reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    await savePasswordResetToken(user._id, token);

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientUrl}/auth/reset-password?token=${token}`;
    await sendPasswordResetEmail({ email: normalizedEmail, resetLink });

    return res.json({
      success: true,
      message: "If that email can be reset, a reset link has been sent.",
    });
  } catch (error) {
    console.log(error);
    return res.status(503).json({
      success: false,
      message: "Unable to send the reset email right now. Please try again later.",
    });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      success: false,
      message: "Reset token and new password are required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters",
    });
  }

  try {
    const resetToken = await consumePasswordResetToken(token);

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or expired",
      });
    }

    const user = await User.findById(resetToken.userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or expired",
      });
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful. You can sign in now.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};
//logout

const logoutUser = (req, res) => {
  console.log(`[Logout] Backend session cleared`);
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  }).json({
    success: true,
    message: "Logged out successfully!",
  });
};




// auth middleware



module.exports={
  registerUser,
  loginUser,
  loginWithGoogle,
  requestPasswordReset,
  resetPassword,
  logoutUser,
  authMiddleware: attachUser,
};
