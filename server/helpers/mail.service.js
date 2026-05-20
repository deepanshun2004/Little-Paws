const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;

async function createGmailOAuth2Transport() {
  const {
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN,
    GMAIL_SENDER_EMAIL,
  } = process.env;

  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN || !GMAIL_SENDER_EMAIL) {
    throw new Error("Gmail OAuth2 mail configuration is incomplete.");
  }

  const oauth2Client = new OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: GMAIL_REFRESH_TOKEN,
  });

  const accessToken = await oauth2Client.getAccessToken();
  const token = typeof accessToken === "string" ? accessToken : accessToken.token;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: GMAIL_SENDER_EMAIL,
      clientId: GMAIL_CLIENT_ID,
      clientSecret: GMAIL_CLIENT_SECRET,
      refreshToken: GMAIL_REFRESH_TOKEN,
      accessToken: token,
    },
  });
}

async function sendMail({ to, subject, text, html }) {
  if (process.env.DISABLE_EMAIL === "true") {
    return { skipped: true };
  }

  const transporter = await createGmailOAuth2Transport();
  const fromName = process.env.MAIL_FROM_NAME || "Little Paws";
  const fromEmail = process.env.GMAIL_SENDER_EMAIL;

  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });
}

async function sendWelcomeEmail(user) {
  if (!user?.email) {
    return null;
  }

  return sendMail({
    to: user.email,
    subject: "Welcome to Little Paws",
    text: `Hi ${user.userName || "there"}, welcome to Little Paws. Your account is ready.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to Little Paws</h2>
        <p>Hi ${user.userName || "there"},</p>
        <p>Your account is ready. You can now find pets, manage adoptions, and continue your Little Paws journey.</p>
      </div>
    `,
  });
}

async function sendGoogleWelcomeEmail(user) {
  if (!user?.email) {
    return null;
  }

  return sendMail({
    to: user.email,
    subject: "Welcome to Little Paws",
    text: `Hi ${user.userName || "there"}, your Google sign-in to Little Paws was successful.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to Little Paws</h2>
        <p>Hi ${user.userName || "there"},</p>
        <p>Your Google sign-in was successful. Your Little Paws account is ready.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail({ email, resetLink }) {
  return sendMail({
    to: email,
    subject: "Reset your Little Paws password",
    text: `Use this link to reset your password: ${resetLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset your Little Paws password</h2>
        <p>Use the secure link below to reset your password.</p>
        <p><a href="${resetLink}">Reset password</a></p>
      </div>
    `,
  });
}

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendGoogleWelcomeEmail,
  sendPasswordResetEmail,
};
