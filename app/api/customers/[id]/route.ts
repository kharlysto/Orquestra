import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { canUseCrm } from "@/lib/crm";
import { now, readDb, writeDb } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const user = await requireUser(); if (!canUseCrm(user.role)) return NextResponse.json({ error: "Only CRM agents or workspace owners can manage customers." }, { status: 403 }); const { id } = await params; const db = await readDb(); const customer = db.customers.find((item) => item.id === id && item.workspaceId === user.workspaceId); if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 }); const body = await request.json(); customer.name = String(body.name ?? customer.name).trim(); customer.email = String(body.email ?? customer.email ?? "").trim() || undefined; customer.phone = String(body.phone ?? customer.phone ?? "").trim() || undefined; customer.address = String(body.address ?? customer.address ?? "").trim() || undefined; customer.updatedAt = now(); await writeDb(db); return NextResponse.json({ customer }); }
  catch { return NextResponse.json({ error: "Authentication required." }, { status: 401 }); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const user = await requireUser(); if (!canUseCrm(user.role)) return NextResponse.json({ error: "Only CRM agents or workspace owners can manage customers." }, { status: 403 }); const { id } = await params; const db = await readDb(); const index = db.customers.findIndex((item) => item.id === id && item.workspaceId === user.workspaceId); if (index < 0) return NextResponse.json({ error: "Customer not found." }, { status: 404 }); db.customers.splice(index, 1); await writeDb(db); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Authentication required." }, { status: 401 }); }
}
