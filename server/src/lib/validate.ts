import type { Request, Response, NextFunction } from "express";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Express router.param middleware to validate UUID path parameters.
 * Returns 404 immediately if the parameter value is not a valid UUID format,
 * preventing database query syntax crashes.
 */
export function validateUuid(req: Request, res: Response, next: NextFunction, value: string, name: string) {
  if (!uuidRegex.test(value)) {
    res.status(404).json({ error: "Not Found", message: `Invalid UUID format for parameter: ${name}` });
    return;
  }
  next();
}
