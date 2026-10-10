import { NextResponse } from "next/server";
import { clientIp, setSession, verifyPassword } from "@/lib/auth";
import { now, readDb, writeDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email = "", code = "" } = await request.json();
    const normalizedEmail = String(email).trim().toLowerCase();
    const submittedCode = String(code).trim();
    const db = await readDb();
    const challenge = db.authChallenges.filter((item) => item.email === normalizedEmail && new Date(item.expiresAt).getTime() > Date.now()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    const user = db.users.find((item) => item.email === normalizedEmail);
    if (!challenge || !user || submittedCode.length !== 6 || !verifyPassword(submittedCode, challenge.codeHash)) return NextResponse.json({ error: "That verification code is invalid or expired." }, { status: 400 });
    user.emailVerified = true;
    user.trustedIps = Array.from(new Set([...(user.trustedIps || []), challenge.purpose === "SIGNUP" ? clientIp(request) : challenge.ip]));
    db.authChallenges = db.authChallenges.filter((item) => item.id !== challenge.id);
    await writeDb(db);
    await setSession(user);
    return NextResponse.json({ verified: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch { return NextResponse.json({ error: "Unable to verify this code." }, { status: 500 }); }
}

export async function GET() { return NextResponse.json({ error: "Use POST to verify a code." }, { status: 405 }); }
