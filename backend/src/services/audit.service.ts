import { prisma } from '../utils/prisma';

export interface AuditLogEntry {
  id?: string;
  user: string;
  role: string;
  action: string;
  module: string;
  timestamp?: string;
  affectedRecord: string;
  previousValue?: string;
  newValue?: string;
}

export class AuditService {
  async getAll(): Promise<any[]> {
    const logs = await (prisma as any).auditLog.findMany({
      orderBy: { timestamp: 'desc' },
    });
    return logs;
  }

  async record(entry: AuditLogEntry): Promise<any> {
    const id = entry.id || `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = entry.timestamp || new Date().toISOString();

    const created = await (prisma as any).auditLog.create({
      data: {
        id,
        user: entry.user,
        role: entry.role,
        action: entry.action,
        module: entry.module,
        timestamp,
        affectedRecord: entry.affectedRecord,
        previousValue: entry.previousValue || null,
        newValue: entry.newValue || null,
      },
    });

    return created;
  }
}

export const auditService = new AuditService();
