const nodemailer = require("nodemailer");

// Require environment variables
const { EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

if (process.env.DISABLE_EMAIL === "true") {
  console.log("[Email] SMTP Transporter: Email delivery is disabled via DISABLE_EMAIL.");
} else if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("[Email] SMTP Transporter: Warning! EMAIL_USER or EMAIL_PASS environment variables are missing.");
} else {
  // Asynchronously verify connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error("[Email] SMTP Transporter verification failed:", {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      });
    } else {
      console.log("[Email] SMTP Transporter is successfully verified and ready to send emails.");
    }
  });
}

module.exports = transporter;
