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

      // Automatically generate prioritized alert if defects are detected
      if (data.defectUnits > 0) {
        const alertCount = await tx.alert.count();
        const alId = `AL-${100 + alertCount + 1}`;
        await tx.alert.create({
          data: {
            id: alId,
            priority: data.defectUnits > 2 ? 'critical' : 'high',
            issue: `Quality Defect Spike: ${data.defectUnits} defects detected in ${newQI.batchId} on ${machine.name}`,
            impact: 'Surface finish tolerances breached. Risk of customer SLA delay & scrap cost.',
            owner: 'Aria Thorne (Quality Metrology)',
            recommendedAction: 'Perform tool wear inspection and calibrate spindle runout.',
            status: 'active',
            timestamp: new Date().toISOString(),
            relatedModule: 'quality',
            targetId: machine.id,
          },
        });
      }

      return newQI;
    });
  }
}

export const qualityRepository = new QualityRepository();
