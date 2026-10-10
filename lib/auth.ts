import { cookies } from "next/headers";
import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import type { Role, User } from "./types";
import { readDb } from "./db";

const secret = process.env.AUTH_SECRET || "orquestra-local-development-secret";
const cookieName = "orquestra_session";
export const hashPassword = (password: string) => { const salt = randomBytes(16).toString("hex"); return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`; };
export const verifyPassword = (password: string, stored: string) => { const [salt, hash] = stored.split(":"); if (!salt || !hash) return false; return timingSafeEqual(Buffer.from(hash, "hex"), scryptSync(password, salt, 64)); };
export const verificationCode = () => String(randomInt(100000, 1000000));
export function clientIp(request: Request) { return (request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local").slice(0, 120); }
const sign = (value: string) => createHmac("sha256", secret).update(value).digest("hex");
export async function setSession(user: User) { const value = Buffer.from(JSON.stringify({ userId: user.id, workspaceId: user.workspaceId, role: user.role })).toString("base64url"); (await cookies()).set(cookieName, `${value}.${sign(value)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 }); }
export async function clearSession() { (await cookies()).delete(cookieName); }
export async function currentUser() { const raw = (await cookies()).get(cookieName)?.value; if (!raw) return null; const [value, signature] = raw.split("."); if (!value || !signature || sign(value) !== signature) return null; try { const data = JSON.parse(Buffer.from(value, "base64url").toString()); const db = await readDb(); return db.users.find((u) => u.id === data.userId) || null; } catch { return null; } }
export async function requireUser(): Promise<User> { const user = await currentUser(); if (!user) throw new Error("UNAUTHENTICATED"); return user; }
export type SessionUser = { id: string; workspaceId: string; role: Role };
