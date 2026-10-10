import { NextResponse } from "next/server";
import { requireUser, hashPassword } from "@/lib/auth";
import { id, now, readDb, writeDb } from "@/lib/db";
import { planRules } from "@/lib/plans";
import { sendBrandedEmail } from "@/lib/mailer";
import type { Role } from "@/lib/types";

export async function GET() {
  try {
    const user = await requireUser();
    const db = await readDb();
    return NextResponse.json({ invitations: db.invitations.filter((item) => item.workspaceId === user.workspaceId).map(({ temporaryPassword: _password, ...invite }) => invite), members: db.users.filter((item) => item.workspaceId === user.workspaceId).map((member) => ({ id: member.id, name: member.name, email: member.email, role: member.role })) });
  } catch { return NextResponse.json({ error: "Authentication required." }, { status: 401 }); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const db = await readDb();
    const workspace = db.workspaces.find((item) => item.id === user.workspaceId);
    if (!workspace || user.role !== "OWNER" || !planRules[workspace.plan].canInvite) return NextResponse.json({ error: "Agent invitations require the Growth or Enterprise plan." }, { status: 403 });
    const agentCount = db.users.filter((item) => item.workspaceId === workspace.id && item.role !== "OWNER").length;
    if (workspace.plan === "GROWTH" && agentCount >= 5) return NextResponse.json({ error: "Growth workspaces can have a maximum of 5 agents." }, { status: 403 });
    const { name = "Agent", email = "", role } = await request.json();
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) return NextResponse.json({ error: "Agent email is required." }, { status: 400 });
    if (!planRules[workspace.plan].roles.includes(role as Role)) return NextResponse.json({ error: "That role is not available on this plan." }, { status: 400 });
    const temporaryPassword = `Orq-${Math.random().toString(36).slice(2, 8)}!`;
    const invite = { id: id(), workspaceId: user.workspaceId, email: normalizedEmail, name: String(name), role: role as Exclude<Role, "OWNER">, code: `ORQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, temporaryPassword, status: "PENDING" as const, createdAt: now() };
    db.invitations.push(invite);
    db.users.push({ id: id(), workspaceId: user.workspaceId, name: invite.name, email: invite.email, passwordHash: hashPassword(temporaryPassword), role: invite.role, createdAt: now() });
    await writeDb(db);
    let emailSent = false;
    try { await sendBrandedEmail({ to: invite.email, subject: `You have been invited to ${workspace.name} on Orquestra`, eyebrow: "Workspace invitation", title: `Welcome to ${workspace.name}`, intro: `${user.name} invited you to join their Orquestra workspace as a ${invite.role.toLowerCase()} agent.`, body: "Use the credentials below to sign in. Your access is limited to the permissions assigned to your role.", code: invite.code, credentials: { email: invite.email, password: temporaryPassword } }); emailSent = true; } catch { emailSent = false; }
    return NextResponse.json({ invitation: invite, emailSent, delivery: emailSent ? "Invitation sent by email." : "Invitation created, but the email could not be sent. Share the credentials securely." }, { status: 201 });
  } catch { return NextResponse.json({ error: "Authentication required." }, { status: 401 }); }
}
