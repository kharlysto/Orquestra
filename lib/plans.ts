import type { Plan, Role } from "./types";

export const planRules = {
  STARTER: { maxProducts: 100, aiQueries: 20, canInvite: false, roles: [] as Role[], analytics: "basic" },
  GROWTH: { maxProducts: Infinity, aiQueries: Infinity, canInvite: true, roles: ["SALES", "INVENTORY", "ANALYTICS", "CRM"] as Role[], analytics: "full" },
  ENTERPRISE: { maxProducts: Infinity, aiQueries: Infinity, canInvite: true, roles: ["SALES", "INVENTORY", "ANALYTICS", "CRM"] as Role[], analytics: "full" },
} as const;

export function canAccess(role: Role, resource: "products.read" | "products.write" | "sales.write" | "analytics.read" | "crm.read" | "messages.write") {
  if (role === "OWNER") return true;
  if (resource === "products.read") return ["SALES", "INVENTORY", "ANALYTICS"].includes(role);
  if (resource === "products.write") return role === "INVENTORY";
  if (resource === "sales.write") return role === "SALES";
  if (resource === "analytics.read") return role === "ANALYTICS";
  if (resource === "crm.read") return role === "CRM";
  return true;
}
