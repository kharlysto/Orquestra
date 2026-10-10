import { NextResponse } from "next/server";
import { id, now, readDb, writeDb } from "@/lib/db";
import type { Channel } from "@/lib/types";

const channels = new Set<Channel>(["WHATSAPP", "WECHAT", "LINE", "MESSENGER", "VIBER", "TELEGRAM", "SMS", "GMAIL", "OUTLOOK"]);

export async function POST(request: Request, context: { params: Promise<{ channel: string }> }) {
  const { channel: rawChannel } = await context.params; const channel = rawChannel.toUpperCase() as Channel; if (!channels.has(channel)) return NextResponse.json({ error: "Unsupported channel." }, { status: 404 });
  const expected = process.env.INTEGRATION_WEBHOOK_SECRET; if (expected && request.headers.get("x-orquestra-webhook-secret") !== expected) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  const body = await request.json(); const workspaceId = String(body.workspaceId || ""); const externalId = String(body.externalId || ""); const senderAddress = String(body.senderAddress || ""); const messageBody = String(body.body || ""); if (!workspaceId || !externalId || !senderAddress || !messageBody) return NextResponse.json({ error: "workspaceId, externalId, senderAddress, and body are required." }, { status: 400 });
  const db = await readDb(); let conversation = db.conversations.find((item) => item.workspaceId === workspaceId && item.channel === channel && item.externalId === externalId); if (!conversation) { conversation = { id: id(), workspaceId, channel, externalId, customerName: String(body.customerName || senderAddress), customerAddress: senderAddress, subject: body.subject ? String(body.subject) : undefined, status: "OPEN", lastMessageAt: now(), createdAt: now() }; db.conversations.push(conversation); }
  if (db.crmMessages.some((item) => item.externalId === String(body.messageId || "") && body.messageId)) return NextResponse.json({ ok: true, duplicate: true }); const message = { id: id(), workspaceId, conversationId: conversation.id, channel, direction: "INBOUND" as const, externalId: body.messageId ? String(body.messageId) : undefined, senderName: String(body.customerName || senderAddress), senderAddress, body: messageBody, status: "RECEIVED" as const, createdAt: now() }; conversation.lastMessageAt = message.createdAt; db.crmMessages.push(message); await writeDb(db); return NextResponse.json({ ok: true, conversationId: conversation.id, messageId: message.id });
}
