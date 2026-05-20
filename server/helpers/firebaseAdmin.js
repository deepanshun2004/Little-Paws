const admin = require("firebase-admin");

function getFirebaseCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
    } catch (e) {
      console.warn("⚠️ [Firebase] Invalid FIREBASE_SERVICE_ACCOUNT_JSON format");
    }
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    try {
      let parsedKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
      
      // Remove surrounding quotes if mistakenly included in the .env file
      if (parsedKey.startsWith('"') && parsedKey.endsWith('"')) {
        parsedKey = parsedKey.slice(1, -1);
      } else if (parsedKey.startsWith("'") && parsedKey.endsWith("'")) {
        parsedKey = parsedKey.slice(1, -1);
      }

      if (!parsedKey.includes("-----BEGIN PRIVATE KEY-----")) {
        console.warn("⚠️ [Firebase] FIREBASE_PRIVATE_KEY is malformed. It must include '-----BEGIN PRIVATE KEY-----'");
      }

      return admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: parsedKey,
      });
    } catch (e) {
      console.warn("⚠️ [Firebase] Error parsing environment credentials:", e.message);
    }
  }

  return null;
}

function getFirebaseAdmin() {
  const credential = getFirebaseCredential();

  if (!credential) {
    console.warn("⚠️ [Firebase] Missing or invalid Firebase Admin credentials.");
    return null;
  }

  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential,
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } catch (e) {
      console.warn("⚠️ [Firebase] Error initializing Firebase Admin:", e.message);
      return null;
    }
  }

  return admin;
}

module.exports = getFirebaseAdmin();
