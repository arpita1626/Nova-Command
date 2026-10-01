import { prisma } from '../utils/prisma';

export class AlertRepository {
  async getAll() {
    return prisma.alert.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.alert.findUnique({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.alert.update({
      where: { id },
      data: { status },
    });
  }

  async create(data: {
    priority: string;
    issue: string;
    impact: string;
    owner: string;
    recommendedAction: string;
    relatedModule: string;
    targetId?: string;
  }) {
    const existing = await prisma.alert.findMany({ select: { id: true } });
    const maxNum = existing.reduce((max: number, a: any) => {
      const match = a.id.match(/\d+/);
      return match ? Math.max(max, parseInt(match[0], 10)) : max;
    }, 104);
    const id = `AL-${maxNum + 1}`;

    return prisma.alert.create({
      data: {
        id,
        priority: data.priority,
        issue: data.issue,
        impact: data.impact,
        owner: data.owner,
        recommendedAction: data.recommendedAction,
        status: 'active',
        timestamp: new Date().toISOString(),
        relatedModule: data.relatedModule,
        targetId: data.targetId,
      },
    });
  }
}

export const alertRepository = new AlertRepository();
