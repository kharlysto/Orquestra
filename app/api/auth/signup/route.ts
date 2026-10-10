import { NextResponse } from "next/server";
import { clientIp, hashPassword, verificationCode } from "@/lib/auth";
import { id, now, readDb, writeDb } from "@/lib/db";
import { sendBrandedEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim(), email = String(body.email || "").trim().toLowerCase(), password = String(body.password || ""), plan = body.plan === "GROWTH" || body.plan === "ENTERPRISE" ? body.plan : "STARTER";
  if (!name || !email || password.length < 8) return NextResponse.json({ error: "Name, email, and an 8-character password are required." }, { status: 400 });
  const db = await readDb(); if (db.users.some((u) => u.email === email)) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  const workspaceId = id(), userId = id(), createdAt = now();
  const user = { id: userId, workspaceId, name, email, passwordHash: hashPassword(password), role: "OWNER" as const, createdAt, emailVerified: false, trustedIps: [] as string[] };
  const code = verificationCode();
  db.workspaces.push({ id: workspaceId, name: `${name}'s workspace`, plan, ownerId: userId, createdAt }); db.users.push(user);
  db.authChallenges.push({ id: id(), userId, email, purpose: "SIGNUP", ip: clientIp(request), codeHash: hashPassword(code), expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), createdAt });
  await writeDb(db);
  let emailSent = false;
  try { await sendBrandedEmail({ to: email, subject: "Verify your Orquestra email", eyebrow: "Email verification", title: "Confirm your email address", intro: `Use this code to finish setting up ${name}'s Orquestra workspace.`, body: "This code expires in 10 minutes.", code }); emailSent = true; } catch { emailSent = false; }
  return NextResponse.json({ requiresVerification: true, email, plan, emailSent, message: emailSent ? "Verification code sent." : "Account created, but the verification email could not be sent." }, { status: 201 });
}
