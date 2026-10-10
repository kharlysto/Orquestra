import { randomUUID } from "node:crypto";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { Database } from "./types";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for PostgreSQL storage.");

const globalDb = globalThis as unknown as { orquestraPrisma?: PrismaClient };
export const prisma = globalDb.orquestraPrisma ?? new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
if (process.env.NODE_ENV !== "production") globalDb.orquestraPrisma = prisma;

const baseline = new WeakMap<Database, Database>();
const empty = (): Database => ({ users: [], workspaces: [], products: [], sales: [], customers: [], archive: [], invitations: [], messages: [], conversations: [], crmMessages: [], integrations: [], authChallenges: [] });
const iso = (value: Date) => value.toISOString();
const date = (value: string) => new Date(value);
const json = (value: unknown) => value as Prisma.InputJsonValue;

export async function readDb(): Promise<Database> {
  const [workspaces, users, products, sales, customers, archive, invitations, messages, conversations, crmMessages, integrations, authChallenges] = await Promise.all([
    prisma.workspace.findMany(), prisma.user.findMany(), prisma.product.findMany(), prisma.sale.findMany(),
    prisma.customer.findMany(), prisma.archiveEntry.findMany(), prisma.invitation.findMany(), prisma.message.findMany(),
    prisma.conversation.findMany(), prisma.crmMessage.findMany(), prisma.integration.findMany(), prisma.authChallenge.findMany(),
  ]);
  const db: Database = {
    workspaces: workspaces.map((item) => ({ ...item, createdAt: iso(item.createdAt) })),
    users: users.map((item) => ({ ...item, createdAt: iso(item.createdAt) })),
    products: products.map((item) => ({ ...item, details: item.details as Database["products"][number]["details"], createdAt: iso(item.createdAt), updatedAt: iso(item.updatedAt) })),
    sales: sales.map((item) => ({ ...item, productSku: item.productSku ?? undefined, customerId: item.customerId ?? undefined, note: item.note ?? undefined, createdAt: iso(item.createdAt), updatedAt: item.updatedAt ? iso(item.updatedAt) : undefined })),
    customers: customers.map((item) => ({ ...item, email: item.email ?? undefined, phone: item.phone ?? undefined, address: item.address ?? undefined, conversationId: item.conversationId ?? undefined, source: item.source as "MANUAL" | "CRM", createdAt: iso(item.createdAt), updatedAt: iso(item.updatedAt) })),
    archive: archive.map((item) => ({ ...item, record: item.record, entity: "SALE", action: "DELETE", deletedAt: iso(item.deletedAt) })),
    invitations: invitations.map((item) => ({ ...item, role: item.role as Database["invitations"][number]["role"], createdAt: iso(item.createdAt) })),
    messages: messages.map((item) => ({ ...item, mentionUserId: item.mentionUserId ?? undefined, attachment: (item.attachment ?? undefined) as Database["messages"][number]["attachment"], recipientId: item.recipientId ?? undefined, replyToId: item.replyToId ?? undefined, reactions: (item.reactions ?? undefined) as Database["messages"][number]["reactions"], createdAt: iso(item.createdAt) })),
    conversations: conversations.map((item) => ({ ...item, subject: item.subject ?? undefined, assignedTo: item.assignedTo ?? undefined, lastMessageAt: iso(item.lastMessageAt), createdAt: iso(item.createdAt) })),
    crmMessages: crmMessages.map((item) => ({ ...item, externalId: item.externalId ?? undefined, createdAt: iso(item.createdAt) })),
    integrations: integrations.map((item) => ({ ...item, accountAddress: item.accountAddress ?? undefined, createdAt: iso(item.createdAt) })),
    authChallenges: authChallenges.map((item) => ({ ...item, expiresAt: iso(item.expiresAt), createdAt: iso(item.createdAt) })),
  };
  baseline.set(db, structuredClone(db));
  return db;
}

type Collection = keyof Database;
type Row = { id: string };

function changed<K extends Collection>(key: K, current: Database, before: Database): Database[K] {
  const old = new Map((before[key] as Row[]).map((item) => [item.id, JSON.stringify(item)]));
  return current[key].filter((item) => JSON.stringify(item) !== old.get(item.id)) as Database[K];
}

function removed(key: Collection, current: Database, before: Database): string[] {
  const ids = new Set((current[key] as Row[]).map((item) => item.id));
  return (before[key] as Row[]).filter((item) => !ids.has(item.id)).map((item) => item.id);
}

export async function writeDb(db: Database): Promise<void> {
  const before = baseline.get(db) ?? empty();
  await prisma.$transaction(async (tx) => {
    for (const item of changed("workspaces", db, before)) {
      const data = { ...item, createdAt: date(item.createdAt) };
      await tx.workspace.upsert({ where: { id: item.id }, create: data, update: data });
    }
    for (const item of changed("users", db, before)) {
      const data = { ...item, emailVerified: item.emailVerified ?? false, trustedIps: item.trustedIps ?? [], createdAt: date(item.createdAt) };
      await tx.user.upsert({ where: { id: item.id }, create: data, update: data });
    }
    for (const item of changed("products", db, before)) {
      const data = { ...item, details: json(item.details), currency: item.currency ?? "USD", createdAt: date(item.createdAt), updatedAt: date(item.updatedAt) };
      await tx.product.upsert({ where: { id: item.id }, create: data, update: data });
    }
    for (const item of changed("customers", db, before)) {
      const data = { ...item, email: item.email ?? null, phone: item.phone ?? null, address: item.address ?? null, conversationId: item.conversationId ?? null, createdAt: date(item.createdAt), updatedAt: date(item.updatedAt) };
      await tx.customer.upsert({ where: { id: item.id }, create: data, update: data });
    }
    for (const item of changed("conversations", db, before)) {
      const data = { ...item, subject: item.subject ?? null, assignedTo: item.assignedTo ?? null, lastMessageAt: date(item.lastMessageAt), createdAt: date(item.createdAt) };
      await tx.conversation.upsert({ where: { id: item.id }, create: data, update: data });
    }
    for (const item of changed("integrations", db, before)) {
      const data = { ...item, accountAddress: item.accountAddress ?? null, createdAt: date(item.createdAt) };
      await tx.integration.upsert({ where: { id: item.id }, create: data, update: data });
    }
    for (const item of changed("invitations", db, before)) {
      const data = { ...item, createdAt: date(item.createdAt) };
      await tx.invitation.upsert({ where: { id: item.id }, create: data, update: data });
    }
    for (const item of changed("messages", db, before)) {
      const data = { ...item, mentionUserId: item.mentionUserId ?? null, attachment: item.attachment ? json(item.attachment) : Prisma.DbNull, visibility: item.visibility ?? "GENERAL", recipientId: item.recipientId ?? null, replyToId: item.replyToId ?? null, reactions: item.reactions ? json(item.reactions) : Prisma.DbNull, createdAt: date(item.createdAt) };
      await tx.message.upsert({ where: { id: item.id }, create: data, update: data });
    }
    for (const item of changed("crmMessages", db, before)) {
      const data = { ...item, externalId: item.externalId ?? null, createdAt: date(item.createdAt) };
      await tx.crmMessage.upsert({ where: { id: item.id }, create: data, update: data });
    }
    for (const item of changed("sales", db, before)) {
      const data = { ...item, productSku: item.productSku ?? null, currency: item.currency ?? "USD", customerId: item.customerId ?? null, note: item.note ?? null, createdAt: date(item.createdAt), updatedAt: item.updatedAt ? date(item.updatedAt) : null };
      await tx.sale.upsert({ where: { id: item.id }, create: data, update: data });
    }
    for (const item of changed("archive", db, before)) {
      const data = { ...item, record: json(item.record), deletedAt: date(item.deletedAt) };
      await tx.archiveEntry.upsert({ where: { id: item.id }, create: data, update: data });
    }
    for (const item of changed("authChallenges", db, before)) {
      const data = { ...item, expiresAt: date(item.expiresAt), createdAt: date(item.createdAt) };
      await tx.authChallenge.upsert({ where: { id: item.id }, create: data, update: data });
    }

    for (const id of removed("authChallenges", db, before)) await tx.authChallenge.delete({ where: { id } });
    for (const id of removed("crmMessages", db, before)) await tx.crmMessage.delete({ where: { id } });
    for (const id of removed("messages", db, before)) await tx.message.delete({ where: { id } });
    for (const id of removed("sales", db, before)) await tx.sale.delete({ where: { id } });
    for (const id of removed("archive", db, before)) await tx.archiveEntry.delete({ where: { id } });
    for (const id of removed("invitations", db, before)) await tx.invitation.delete({ where: { id } });
    for (const id of removed("integrations", db, before)) await tx.integration.delete({ where: { id } });
    for (const id of removed("conversations", db, before)) await tx.conversation.delete({ where: { id } });
    for (const id of removed("customers", db, before)) await tx.customer.delete({ where: { id } });
    for (const id of removed("products", db, before)) await tx.product.delete({ where: { id } });
    for (const id of removed("users", db, before)) await tx.user.delete({ where: { id } });
    for (const id of removed("workspaces", db, before)) await tx.workspace.delete({ where: { id } });
  }, { timeout: 120_000 });
  baseline.set(db, structuredClone(db));
}

export const id = () => randomUUID();
export const now = () => new Date().toISOString();
