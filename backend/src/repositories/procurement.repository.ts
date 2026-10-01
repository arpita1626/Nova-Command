import { prisma, Prisma } from '../utils/prisma';

export class ProcurementRepository {
  async getAll() {
    return prisma.purchaseOrder.findMany({
      include: { item: true },
      orderBy: { orderDate: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.purchaseOrder.findUnique({
      where: { id },
      include: { item: true },
    });
  }

  async updateStatus(poId: string, status: string) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: poId },
        include: { item: true },
      });

      if (!po) throw new Error(`Purchase order ${poId} not found`);

      const updatedPO = await tx.purchaseOrder.update({
        where: { id: poId },
        data: { status },
      });

      // If marked as delivered, execute goods receipt and inventory update atomically
      if (status === 'delivered') {
        const item = await tx.inventoryItem.findUnique({
          where: { id: po.itemId },
        });

        if (item) {
          const newOnHand = item.onHand + po.quantity;
          const newAvailable = Math.max(0, newOnHand - item.reserved);
          let stockoutRisk = 'low';
          if (newAvailable <= 0 || newAvailable <= item.reorderPoint) {
            stockoutRisk = 'high';
          } else if (newAvailable <= item.reorderPoint * 1.5) {
            stockoutRisk = 'medium';
          }

          await tx.inventoryItem.update({
            where: { id: item.id },
            data: {
              onHand: newOnHand,
              available: newAvailable,
              stockoutRisk,
            },
          });

          const txCount = await tx.inventoryTransaction.count();
          await tx.inventoryTransaction.create({
            data: {
              id: `TX-${1100 + txCount + 1}`,
              timestamp: new Date().toISOString(),
              itemId: item.id,
              itemName: item.name,
              type: 'receipt',
              quantity: po.quantity,
              referenceType: 'purchase_order',
              referenceId: po.id,
              performedBy: 'Dock Receiving Clerk',
              notes: `Goods received against PO ${po.id}`,
            },
          });
        }
      }

      return updatedPO;
    });
  }

  async createPurchaseOrder(data: {
    supplier: string;
    itemId: string;
    quantity: number;
    unitPriceUsd: number;
    expectedDelivery: string;
    notes?: string;
  }) {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: data.itemId },
    });
    if (!item) throw new Error(`Item ${data.itemId} not found`);

    const existing = await prisma.purchaseOrder.findMany({ select: { id: true } });
    const maxNum = existing.reduce((max: number, p: any) => {
      const match = p.id.match(/\d+/);
      return match ? Math.max(max, parseInt(match[0], 10)) : max;
    }, 904);
    const poId = `PO-${maxNum + 1}`;

    return prisma.purchaseOrder.create({
      data: {
        id: poId,
        supplier: data.supplier,
        itemId: item.id,
        itemName: item.name,
        quantity: data.quantity,
        unitPriceUsd: data.unitPriceUsd,
        totalPriceUsd: data.quantity * data.unitPriceUsd,
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: data.expectedDelivery,
        status: 'requisition',
        risk: 'low',
        riskNotes: data.notes || 'Created via NOVA Command Procurement Requisition',
      },
    });
  }
}

export const procurementRepository = new ProcurementRepository();
