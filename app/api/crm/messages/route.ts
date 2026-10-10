import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { id, now, readDb, writeDb } from "@/lib/db";
import { canUseCrm } from "@/lib/crm";
import type { Channel } from "@/lib/types";

export async function GET(request: Request) {
  try { const user = await requireUser(); if (!canUseCrm(user.role)) return NextResponse.json({ error: "CRM access is restricted to CRM agents and workspace owners." }, { status: 403 }); const conversationId = new URL(request.url).searchParams.get("conversationId"); const db = await readDb(); return NextResponse.json({ messages: db.crmMessages.filter((item) => item.workspaceId === user.workspaceId && (!conversationId || item.conversationId === conversationId)).sort((a, b) => a.createdAt.localeCompare(b.createdAt)) }); }
  catch { return NextResponse.json({ error: "Authentication required." }, { status: 401 }); }
}

export async function POST(request: Request) {
  try { const user = await requireUser(); if (!canUseCrm(user.role)) return NextResponse.json({ error: "CRM access is restricted to CRM agents and workspace owners." }, { status: 403 }); const { conversationId, body } = await request.json(); const db = await readDb(); const conversation = db.conversations.find((item) => item.id === conversationId && item.workspaceId === user.workspaceId); if (!conversation || !String(body || "").trim()) return NextResponse.json({ error: "Conversation and message body are required." }, { status: 400 }); const message = { id: id(), workspaceId: user.workspaceId, conversationId, channel: conversation.channel as Channel, direction: "OUTBOUND" as const, senderName: user.name, senderAddress: "workspace-agent", body: String(body).trim(), status: "QUEUED" as const, createdAt: now() }; conversation.lastMessageAt = message.createdAt; db.crmMessages.push(message); await writeDb(db); return NextResponse.json({ message, delivery: "queued" }, { status: 201 }); }
  catch { return NextResponse.json({ error: "Authentication required." }, { status: 401 }); }
}
