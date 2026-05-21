const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Base HTML styling for LITTLE_PAWS branding
const baseEmailTemplate = (title, content) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #f43f5e; margin: 0;">LITTLE PAWS 🐾</h1>
    </div>
    <div style="background-color: #fffaf0; padding: 20px; border-radius: 8px;">
      <h2 style="color: #f59e0b; margin-top: 0;">${title}</h2>
      ${content}
    </div>
    <div style="text-align: center; margin-top: 20px; font-size: 0.9em; color: #777;">
      <p>Thank you for making a difference!</p>
      <p>&copy; ${new Date().getFullYear()} Little Paws. All Rights Reserved.</p>
    </div>
  </div>
`;

const sendMailWrapper = async (mailOptions) => {
  if (process.env.DISABLE_EMAIL === "true") {
    console.log("[Email] Email sending disabled");
    return { skipped: true };
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] Warning: RESEND_API_KEY is not defined. Skipping email sending.");
    return { skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Little Paws <onboarding@resend.dev>",
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
    });

    if (error) {
      console.error("[Email] Resend API Error sending email:", {
        message: error.message,
        name: error.name,
        code: error.code,
      });
      const resendError = new Error(error.message || "Resend API Error");
      resendError.code = error.code;
      throw resendError;
    }

    console.log(`[Email] Success: Email sent to ${mailOptions.to}. ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error("[Email] Detailed Error sending email:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const sendWelcomeEmail = async (email, userName) => {
  const title = "Welcome to LITTLE_PAWS 🐾";
  const content = `
    <p>Hi <strong>${userName || "there"}</strong>,</p>
    <p>Welcome to Little Paws! We're thrilled to have you join our community.</p>
    <p>You can now browse pets, manage your adoptions, report stray animals, and shop for pet essentials.</p>
    <p>Get ready to find your perfect companion or make a difference in an animal's life!</p>
  `;
  
  return sendMailWrapper({
    to: email,
    subject: title,
    html: baseEmailTemplate(title, content),
  });
};

const sendAdoptionEmail = async (email, userName, petName) => {
  const title = "Your adoption request has been submitted successfully.";
  const content = `
    <p>Hi <strong>${userName || "there"}</strong>,</p>
    <p>Thank you for submitting an adoption request for <strong>${petName}</strong>!</p>
    <p>Our shelter admins are currently reviewing your application. You can check the status of your application anytime in your user dashboard.</p>
    <p>We appreciate your heart for giving a pet a loving forever home.</p>
  `;
  
  return sendMailWrapper({
    to: email,
    subject: "Adoption Request Submitted - Little Paws",
    html: baseEmailTemplate(title, content),
  });
};

const sendOrderEmail = async (email, userName, orderId) => {
  const title = "Your order has been confirmed successfully.";
  const content = `
    <p>Hi <strong>${userName || "there"}</strong>,</p>
    <p>Thank you for your purchase! We've received your order and are getting it ready for shipment.</p>
    <p><strong>Order ID:</strong> #${orderId}</p>
    <p>You can track the progress of your order in your account dashboard.</p>
    <p>We hope your pet loves their new items!</p>
  `;
  
  return sendMailWrapper({
    to: email,
    subject: "Order Confirmation - Little Paws",
    html: baseEmailTemplate(title, content),
  });
};

const sendStrayReportEmail = async (email, userName, petType) => {
  const title = "Your stray animal report has been received.";
  const content = `
    <p>Hi <strong>${userName || "there"}</strong>,</p>
    <p>Thank you for reporting a stray <strong>${petType}</strong>. Your vigilance helps us rescue and rehabilitate animals in need.</p>
    <p>Our team has been notified and we will take appropriate action. You can check the status of your report in your dashboard.</p>
    <p>Thank you for being a hero to animals!</p>
  `;
  
  return sendMailWrapper({
    to: email,
    subject: "Stray Animal Report Received - Little Paws",
    html: baseEmailTemplate(title, content),
  });
};

const sendPasswordResetEmail = async ({ email, resetLink }) => {
  const title = "Reset your Little Paws password";
  const content = `
    <p>Hi,</p>
    <p>We received a request to reset your password. You can reset it by clicking the link below:</p>
    <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #f43f5e; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  
  return sendMailWrapper({
    to: email,
    subject: "Password Reset - Little Paws",
    html: baseEmailTemplate(title, content),
  });
};

module.exports = {
  sendWelcomeEmail,
  sendAdoptionEmail,
  sendOrderEmail,
  sendStrayReportEmail,
  sendPasswordResetEmail,
};
