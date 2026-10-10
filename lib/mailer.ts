import nodemailer from "nodemailer";

const logoUrl = process.env.EMAIL_LOGO_URL || `${process.env.APP_URL || "http://localhost:3000"}/logo/main-landing-logo.png`;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || "true") === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

type BrandedEmail = { to: string; subject: string; eyebrow: string; title: string; intro: string; body: string; code?: string; credentials?: { email: string; password: string } };

export async function sendBrandedEmail({ to, subject, eyebrow, title, intro, body, code, credentials }: BrandedEmail) {
  const credentialBlock = credentials ? `<div style="margin:24px 0;padding:18px;border:1px solid #233d39;border-radius:14px;background:#101918;color:#e9fffb"><p style="margin:0 0 8px"><strong>Login email:</strong> ${credentials.email}</p><p style="margin:0"><strong>Temporary password:</strong> ${credentials.password}</p></div>` : "";
  const codeBlock = code ? `<div style="margin:24px 0;padding:18px;border:1px solid #00d9ba;border-radius:14px;background:#0c2723;color:#00e5c2;font-size:24px;font-weight:800;letter-spacing:3px;text-align:center">${code}</div>` : "";
  const html = `<!doctype html><html><body style="margin:0;background:#080b0b;color:#f7fffd;font-family:Arial,Helvetica,sans-serif"><div style="max-width:620px;margin:0 auto;padding:42px 24px"><div style="border:1px solid #1c2a28;border-radius:22px;background:#101514;padding:34px"><img src="${logoUrl}" alt="Orquestra" style="display:block;width:190px;height:auto;margin:0 0 34px" /><p style="margin:0 0 12px;color:#00e5c2;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">${eyebrow}</p><h1 style="margin:0 0 14px;font-size:30px;line-height:1.12">${title}</h1><p style="margin:0 0 22px;color:#a8bbb7;font-size:16px;line-height:1.6">${intro}</p><p style="margin:0;color:#d9e7e4;font-size:15px;line-height:1.7">${body}</p>${credentialBlock}${codeBlock}<p style="margin:28px 0 0;color:#81918e;font-size:13px;line-height:1.6">If you did not expect this message, you can safely ignore it or contact your workspace owner.</p></div><div style="padding:26px 4px 0;text-align:center"><img src="${logoUrl}" alt="Orquestra" style="display:inline-block;width:116px;height:auto;opacity:.8" /><p style="margin:10px 0 0;color:#6c7c78;font-size:12px">The AI operating system for modern businesses.</p></div></div></body></html>`;
  return transporter.sendMail({ from: process.env.SMTP_FROM || `orquestra <${process.env.SMTP_USER}>`, to, subject, html, text: `${title}\n\n${intro}\n\n${body}` });
}
