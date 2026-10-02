import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  role: string;
  name: string;
}

export function extractAuthContext(req: Request): AuthenticatedUser {
  const role = (req.headers['x-user-role'] as string) || 'ADMIN';
  const id = (req.headers['x-user-id'] as string) || 'user-admin';
  const name = (req.headers['x-user-name'] as string) || 'Admin User';
  return { id, role, name };
}

/**
 * Ensures user has permission to modify quality inspections.
 * Production Planners are blocked.
 */
export function checkQualityPermission(req: Request, res: Response, next: NextFunction): void {
  const { role } = extractAuthContext(req);
  if (role === 'PRODUCTION_PLANNER') {
    res.status(403).json({
      success: false,
      error: 'Access Denied: Production Planner is not permitted to create or modify quality inspections.',
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next();
}

/**
 * Ensures user has permission to modify production schedules, reroute, or assign machines.
 * Quality Inspectors are blocked.
 */
export function checkSchedulePermission(req: Request, res: Response, next: NextFunction): void {
  const { role } = extractAuthContext(req);
  if (role === 'QUALITY_INSPECTOR') {
    res.status(403).json({
      success: false,
      error: 'Access Denied: Quality Inspector is not permitted to modify production schedules or machine assignments.',
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next();
}

/**
 * Ensures user has permission to modify inventory or create POs.
 * Quality Inspectors are blocked.
 */
export function checkInventoryPermission(req: Request, res: Response, next: NextFunction): void {
  const { role } = extractAuthContext(req);
  if (role === 'QUALITY_INSPECTOR') {
    res.status(403).json({
      success: false,
      error: 'Access Denied: Quality Inspector is not permitted to modify inventory quantities or create purchase orders.',
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next();
}

/**
 * Ensures only Administrators can manage users and system settings.
 */
export function checkAdminPermission(req: Request, res: Response, next: NextFunction): void {
  const { role } = extractAuthContext(req);
  if (role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: 'Access Denied: Administrator privileges required to manage accounts or system settings.',
      timestamp: new Date().toISOString(),
    });
    return;
  }
  next();
}
