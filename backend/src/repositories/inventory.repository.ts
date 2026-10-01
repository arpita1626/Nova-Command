import { prisma, Prisma } from '../utils/prisma';

export class InventoryRepository {
  async getAll() {
    return prisma.inventoryItem.findMany();
  }

  async getById(id: string) {
    return prisma.inventoryItem.findUnique({
      where: { id },
    });
  }

  async getAllTransactions() {
    return prisma.inventoryTransaction.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Atomic inventory adjustment with transaction logging
   */
  async recordTransaction(txData: {
    itemId: string;
    type: 'receipt' | 'issue' | 'reservation' | 'adjustment';
    quantity: number;
    referenceType?: string;
    referenceId?: string;
    performedBy?: string;
    notes?: string;
  }) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const item = await tx.inventoryItem.findUnique({
        where: { id: txData.itemId },
      });

      if (!item) {
        throw new Error(`Inventory item ${txData.itemId} not found`);
      }

      let newOnHand = item.onHand;
      let newReserved = item.reserved;

      if (txData.type === 'receipt') {
        newOnHand += txData.quantity;
      } else if (txData.type === 'issue') {
        newOnHand = Math.max(0, newOnHand - txData.quantity);
      } else if (txData.type === 'reservation') {
        if (item.available < txData.quantity) {
          throw new Error(
            `Insufficient available stock for item ${item.name} (${item.id}). Requested: ${txData.quantity}, Available: ${item.available}`
          );
        }
        newReserved += txData.quantity;
      } else if (txData.type === 'adjustment') {
        newOnHand = txData.quantity;
      }

      const newAvailable = Math.max(0, newOnHand - newReserved);
      let stockoutRisk = 'low';
      if (newAvailable <= 0 || newAvailable <= item.reorderPoint) {
        stockoutRisk = 'high';
      } else if (newAvailable <= item.reorderPoint * 1.5) {
        stockoutRisk = 'medium';
      }

      // Update item
      const updatedItem = await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          onHand: newOnHand,
          reserved: newReserved,
          available: newAvailable,
          stockoutRisk,
        },
      });

      // Generate transaction ID
      const txCount = await tx.inventoryTransaction.count();
      const txId = `TX-${1100 + txCount + 1}`;

      const createdTx = await tx.inventoryTransaction.create({
        data: {
          id: txId,
          timestamp: new Date().toISOString(),
          itemId: item.id,
          itemName: item.name,
          type: txData.type,
          quantity: txData.quantity,
          referenceType: txData.referenceType || 'manual',
          referenceId: txData.referenceId || 'MANUAL-ADJ',
          performedBy: txData.performedBy || 'NOVA Dispatch',
          notes: txData.notes || `Transaction ${txData.type} recorded`,
        },
      });

      return {
        item: updatedItem,
        transaction: createdTx,
      };
    });
  }

  async recalculateAllStockoutRisks() {
    const items = await prisma.inventoryItem.findMany();
    for (const item of items) {
      const available = Math.max(0, item.onHand - item.reserved);
      let stockoutRisk = 'low';
      if (available <= 0 || available <= item.reorderPoint) {
        stockoutRisk = 'high';
      } else if (available <= item.reorderPoint * 1.5) {
        stockoutRisk = 'medium';
      }

      if (available !== item.available || stockoutRisk !== item.stockoutRisk) {
        await prisma.inventoryItem.update({
          where: { id: item.id },
          data: { available, stockoutRisk },
        });
      }
    }
  }
}

export const inventoryRepository = new InventoryRepository();
