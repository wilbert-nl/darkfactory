import nodemailer from "nodemailer";

export async function sendVerificationEmail(to: string, link: string) {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM || "Stash <noreply@stash.local>";
  const subject = "Verify your Stash account";
  const text = `Welcome to Stash!\n\nClick to verify your email:\n${link}\n\nThis link expires in 24 hours.`;
  const html = `<p>Welcome to Stash!</p><p><a href="${link}">Click here to verify your email</a></p><p>This link expires in 24 hours.</p>`;

  if (!host) {
    // Dev fallback: log the link so registration is testable without SMTP.
    console.log(`\n[stash] Verification link for ${to}:\n${link}\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  await transporter.sendMail({ from, to, subject, text, html });
}
