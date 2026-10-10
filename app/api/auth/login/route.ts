import { NextResponse } from "next/server";
import { clientIp, hashPassword, setSession, verificationCode, verifyPassword } from "@/lib/auth";
import { id, now, readDb, writeDb } from "@/lib/db";
import { sendBrandedEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  const { email = "", password = "" } = await request.json();
  const db = await readDb();
  const user = db.users.find((item) => item.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  const ip = clientIp(request);
  const trusted = Boolean(user.emailVerified && user.trustedIps?.includes(ip));
  if (!trusted) {
    const code = verificationCode();
    db.authChallenges = db.authChallenges.filter((challenge) => !(challenge.userId === user.id && challenge.purpose === "LOGIN"));
    db.authChallenges.push({ id: id(), userId: user.id, email: user.email, purpose: "LOGIN", ip, codeHash: hashPassword(code), expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), createdAt: now() });
    await writeDb(db);
    let emailSent = false;
    try { await sendBrandedEmail({ to: user.email, subject: "Your Orquestra sign-in code", eyebrow: "Security verification", title: "Confirm this sign-in", intro: `A sign-in was requested for your Orquestra account from a new location.`, body: "If this was you, enter the code to continue. This code expires in 10 minutes.", code }); emailSent = true; } catch { emailSent = false; }
    return NextResponse.json({ requiresVerification: true, email: user.email, emailSent, message: emailSent ? "Verification code sent." : "The verification email could not be sent." }, { status: 202 });
  }
  await setSession(user);
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
