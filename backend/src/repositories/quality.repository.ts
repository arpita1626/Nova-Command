import { prisma, Prisma } from '../utils/prisma';

export class QualityRepository {
  async getAll() {
    return prisma.qualityInspection.findMany({
      include: { machine: true },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.qualityInspection.findUnique({
      where: { id },
      include: { machine: true },
    });
  }

  async createInspection(data: {
    machineId: string;
    line?: string;
    batchId?: string;
    productId?: string;
    productName?: string;
    inspectedUnits: number;
    defectUnits: number;
    defects?: { type: string; count: number }[];
    correctiveActionId?: string;
  }) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const machine = await tx.machine.findUnique({
        where: { id: data.machineId },
      });
      if (!machine) throw new Error(`Machine ${data.machineId} not found`);

      const existing = await tx.qualityInspection.findMany({ select: { id: true } });
      const maxNum = existing.reduce((max: number, q: any) => {
        const match = q.id.match(/\d+/);
        return match ? Math.max(max, parseInt(match[0], 10)) : max;
      }, 404);
      const qiId = `QI-${maxNum + 1}`;

      const defectRatePpm =
        data.inspectedUnits > 0
          ? Math.round((data.defectUnits / data.inspectedUnits) * 1_000_000)
          : 0;

      const spcSignal =
        data.defectUnits > 2 ? 'out_of_control' : data.defectUnits > 0 ? 'warning' : 'in_control';
      const status =
        data.defectUnits > 2 ? 'rejected' : data.defectUnits > 0 ? 'warning' : 'passed';

      const defects = data.defects || [];
      const newQI = await tx.qualityInspection.create({
        data: {
          id: qiId,
          timestamp: new Date().toISOString(),
          machineId: machine.id,
          machineName: machine.name,
          line: data.line || machine.line,
          batchId: data.batchId || `BATCH-${Math.floor(8800 + Math.random() * 100)}`,
          productId: data.productId || 'PROD-GENERIC',
          productName: data.productName || 'Precision Component',
          inspectedUnits: data.inspectedUnits,
          defectUnits: data.defectUnits,
          defectRatePpm,
          spcSignal,
          status,
          defectsJson: JSON.stringify(defects),
          correctiveActionId: data.correctiveActionId,
        },
      });

      // Automatically generate prioritized alert and corrective action if defects are detected
      if (data.defectUnits > 0) {
        const alertCount = await tx.alert.count();
        const alId = `AL-${100 + alertCount + 1}`;
        const caId = `CA-${Date.now().toString().slice(-4)}`;
        
        await tx.alert.create({
          data: {
            id: alId,
            priority: data.defectUnits > 2 ? 'critical' : 'high',
            issue: `Quality Defect Spike: ${data.defectUnits} defects in ${newQI.batchId} on ${machine.name}`,
            impact: 'Surface finish tolerances breached. Production Planner notified for schedule re-evaluation.',
            owner: 'Priya Das (Quality Inspector)',
            recommendedAction: 'Halt batch, inspect tooling/bearings, and evaluate schedule impact with Production Planner.',
            status: 'active',
            timestamp: new Date().toISOString(),
            relatedModule: 'quality',
            targetId: machine.id,
          },
        });

        // Auto-create Corrective Action
        await (tx as any).correctiveAction.create({
          data: {
            id: caId,
            inspectionId: qiId,
            machineId: machine.id,
            batchId: newQI.batchId,
            title: `Resolve ${defects[0]?.type || 'Defects'} on ${machine.name}`,
            description: `Investigate spindle runout and dimensional drift causing ${data.defectUnits} defective parts in batch ${newQI.batchId}.`,
            rootCause: 'Suspected bearing degradation or high-speed vibration harmonic',
            status: 'open',
            assignedTo: 'Marcus Vance (Senior Mechatronics)',
            dueDate: 'Tomorrow, 14:00',
            createdAt: new Date().toISOString(),
            priority: data.defectUnits > 2 ? 'critical' : 'high',
          },
        });

        // Record Audit Log
        await (tx as any).auditLog.create({
          data: {
            id: `AUDIT-${Date.now()}`,
            user: 'Priya Das',
            role: 'QUALITY_INSPECTOR',
            action: `Failed quality inspection for Batch ${newQI.batchId} on ${machine.name} (${data.defectUnits} defect units). Corrective action ${caId} generated.`,
            module: 'Quality',
            timestamp: new Date().toISOString(),
            affectedRecord: newQI.batchId,
            previousValue: 'Pending Inspection',
            newValue: status.toUpperCase(),
          },
        });
      } else {
        // Record passing audit log
        await (tx as any).auditLog.create({
          data: {
            id: `AUDIT-${Date.now()}`,
            user: 'Priya Das',
            role: 'QUALITY_INSPECTOR',
            action: `Approved quality inspection for Batch ${newQI.batchId} on ${machine.name}. All ${data.inspectedUnits} units PASSED.`,
            module: 'Quality',
            timestamp: new Date().toISOString(),
            affectedRecord: newQI.batchId,
            previousValue: 'Pending Inspection',
            newValue: 'PASSED',
          },
        });
      }

      return newQI;
    });
  }

  async getAllCorrectiveActions() {
    return (prisma as any).correctiveAction.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCorrectiveAction(data: any) {
    const id = data.id || `CA-${Date.now().toString().slice(-4)}`;
    return (prisma as any).correctiveAction.create({
      data: {
        id,
        inspectionId: data.inspectionId || 'QI-MANUAL',
        machineId: data.machineId || 'M-004',
        batchId: data.batchId || 'BATCH-GENERAL',
        title: data.title,
        description: data.description,
        rootCause: data.rootCause || 'Under investigation',
        status: data.status || 'open',
        assignedTo: data.assignedTo || 'Shop Floor Team',
        dueDate: data.dueDate || 'In 48 hours',
        createdAt: new Date().toISOString(),
        priority: data.priority || 'medium',
      },
    });
  }

  async updateCorrectiveActionStatus(id: string, status: string) {
    return (prisma as any).correctiveAction.update({
      where: { id },
      data: { status },
    });
  }
}

export const qualityRepository = new QualityRepository();
