import { db } from "@workspace/db";
import { usersTable, userSessionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

export async function getUserFromToken(token: string) {
  const [session] = await db
    .select()
    .from(userSessionsTable)
    .where(eq(userSessionsTable.token, token))
    .limit(1);
  if (!session) return null;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.user_id))
    .limit(1);
  return user || null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-user-token"] as string;
  if (!token) {
    res.status(401).json({ error: "Unauthorized", message: "Missing x-user-token header" });
    return;
  }
  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" });
    return;
  }

  res.locals.userId = user.id;
  res.locals.userRole = user.role;
  res.locals.userDepartmentId = user.department_id;
  next();
}

/**
 * Require one of the given roles. Must be used AFTER requireAuth.
 */
export function requireRole(...roles: string[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const role: string = res.locals.userRole ?? "";
    if (!roles.includes(role)) {
      res.status(403).json({ error: "Forbidden", message: "Insufficient permissions" });
      return;
    }
    next();
  };
}
