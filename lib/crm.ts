import type { Role } from "./types";

export function canUseCrm(role: Role) { return role === "OWNER" || role === "CRM"; }
