import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";

if (!process.env.DATABASE_URL) process.loadEnvFile(".env.local");

const { prisma, readDb, writeDb } = await import("../lib/postgres.ts");
const source = JSON.parse(await readFile(new URL("../data/orquestra.json", import.meta.url), "utf8"));
const names = ["workspaces", "users", "products", "customers", "conversations", "integrations", "invitations", "messages", "crmMessages", "sales", "archive", "authChallenges"];

try {
  const existing = await readDb();
  const populated = names.filter((name) => existing[name].length);
  if (populated.length) throw new Error(`Import stopped: PostgreSQL already has records in ${populated.join(", ")}.`);

  await writeDb(source);
  const imported = await readDb();
  for (const name of names) {
    const expected = source[name] ?? [];
    const actual = imported[name] ?? [];
    if (expected.length !== actual.length) throw new Error(`${name}: expected ${expected.length} records, found ${actual.length}.`);
    const byId = new Map(actual.map((item) => [item.id, item]));
    for (const row of expected) {
      const stored = byId.get(row.id);
      if (!stored) throw new Error(`${name}: a record is missing after import.`);
      for (const [field, value] of Object.entries(row)) {
        if (!isDeepStrictEqual(value, stored[field])) throw new Error(`${name}: a field did not match after import (${field}).`);
      }
    }
    console.log(`${name}: ${actual.length} verified`);
  }
  console.log("All JSON records were imported and verified in PostgreSQL.");
} finally {
  await prisma.$disconnect();
}
