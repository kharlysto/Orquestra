import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { canUseCrm } from "@/lib/crm";
import { id, now, readDb, writeDb } from "@/lib/db";

export async function GET() {
  try { const user = await requireUser(); const db = await readDb(); return NextResponse.json({ customers: db.customers.filter((item) => item.workspaceId === user.workspaceId).sort((a, b) => a.name.localeCompare(b.name)) }); }
  catch { return NextResponse.json({ error: "Authentication required." }, { status: 401 }); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!canUseCrm(user.role)) return NextResponse.json({ error: "Only CRM agents or workspace owners can manage customers." }, { status: 403 });
    const body = await request.json(); const db = await readDb();
    let source: "MANUAL" | "CRM" = "MANUAL"; let conversationId: string | undefined;
    let name = String(body.name || "").trim(); let email = String(body.email || "").trim(); let phone = String(body.phone || "").trim(); let address = String(body.address || "").trim();
    if (body.conversationId) {
      const conversation = db.conversations.find((item) => item.id === String(body.conversationId) && item.workspaceId === user.workspaceId);
      if (!conversation) return NextResponse.json({ error: "CRM conversation not found." }, { status: 404 });
      source = "CRM"; conversationId = conversation.id; name = name || conversation.customerName; address = address || conversation.customerAddress;
    }
    if (!name) return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    const existing = db.customers.find((item) => item.workspaceId === user.workspaceId && ((conversationId && item.conversationId === conversationId) || (!conversationId && email && item.email === email)));
    if (existing) return NextResponse.json({ customer: existing, existing: true });
    const customer = { id: id(), workspaceId: user.workspaceId, name, email: email || undefined, phone: phone || undefined, address: address || undefined, source, conversationId, createdAt: now(), updatedAt: now() };
    db.customers.push(customer); await writeDb(db); return NextResponse.json({ customer }, { status: 201 });
  } catch { return NextResponse.json({ error: "Authentication required." }, { status: 401 }); }
}
