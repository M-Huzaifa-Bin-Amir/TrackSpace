// utils/email.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587 etc
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * sendEmail({ to, subject, text, html })
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) {
    throw new Error("Email 'to' is required");
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"TrackSphere" <no-reply@tracksphere.local>',
    to,
    subject,
    text,
    html,
  });

  // Helpful in dev
  if (process.env.NODE_ENV !== "production") {
    console.log("📧 Email sent:", info.messageId);
  }

  return info;
};
2