import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { id, now, readDb, writeDb } from "@/lib/db";
import { canUseCrm } from "@/lib/crm";
import type { Channel } from "@/lib/types";

const channels: Channel[] = ["WHATSAPP", "WECHAT", "LINE", "MESSENGER", "VIBER", "TELEGRAM", "SMS", "GMAIL", "OUTLOOK"];

export async function GET() {
  try { const user = await requireUser(); if (!canUseCrm(user.role)) return NextResponse.json({ error: "CRM access is restricted to CRM agents and workspace owners." }, { status: 403 }); const db = await readDb(); return NextResponse.json({ conversations: db.conversations.filter((item) => item.workspaceId === user.workspaceId).sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)), channels, integrations: db.integrations.filter((item) => item.workspaceId === user.workspaceId) }); }
  catch { return NextResponse.json({ error: "Authentication required." }, { status: 401 }); }
}

export async function POST(request: Request) {
  try { const user = await requireUser(); if (!canUseCrm(user.role)) return NextResponse.json({ error: "CRM access is restricted to CRM agents and workspace owners." }, { status: 403 }); const body = await request.json(); if (!channels.includes(body.channel)) return NextResponse.json({ error: "Unsupported channel." }, { status: 400 }); const db = await readDb(); const conversation = { id: id(), workspaceId: user.workspaceId, channel: body.channel as Channel, externalId: String(body.externalId || id()), customerName: String(body.customerName || "New contact"), customerAddress: String(body.customerAddress || ""), subject: body.subject ? String(body.subject) : undefined, status: "OPEN" as const, lastMessageAt: now(), createdAt: now() }; db.conversations.push(conversation); await writeDb(db); return NextResponse.json({ conversation }, { status: 201 }); }
  catch { return NextResponse.json({ error: "Authentication required." }, { status: 401 }); }
}
