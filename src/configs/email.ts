import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "./index";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("[email] EMAIL_USER or EMAIL_PASS not set — skipping email");
    return;
  }
  const info = await transporter.sendMail({
    from: `HardwareHub <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  console.log("[email] sent:", info.messageId);
  return info;
}
