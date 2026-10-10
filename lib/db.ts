import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { Database } from "./types";

const file = path.join(process.cwd(), "data", "orquestra.json");
const empty: Database = { users: [], workspaces: [], products: [], sales: [], customers: [], archive: [], invitations: [], messages: [], conversations: [], crmMessages: [], integrations: [], authChallenges: [] };

export async function readDb(): Promise<Database> {
  try { const parsed = JSON.parse(await readFile(file, "utf8")); const database: Database = { ...empty, ...parsed, customers: parsed.customers || [], archive: parsed.archive || [], authChallenges: parsed.authChallenges || [] }; const seen = new Set<string>(); let repaired = false; for (const product of database.products) { const key = String(product.sku || "").trim().toLowerCase(); if (!key || seen.has(key)) { product.sku = `SKU-${randomUUID().slice(0, 8).toUpperCase()}`; repaired = true; } seen.add(product.sku.toLowerCase()); } for (const sale of database.sales) { if (!sale.productSku) { sale.productSku = database.products.find((product) => product.id === sale.productId)?.sku; repaired = true; } } if (repaired) await writeFile(file, JSON.stringify(database, null, 2)); return database; }
  catch { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, JSON.stringify(empty, null, 2)); return structuredClone(empty); }
}

export async function writeDb(db: Database) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(db, null, 2));
}

export const id = () => randomUUID();
export const now = () => new Date().toISOString();
