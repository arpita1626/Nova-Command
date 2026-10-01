import { prisma, Prisma } from '../utils/prisma';

export class MaintenanceRepository {
  async getAll() {
    return prisma.maintenanceWorkOrder.findMany({
      include: {
        machine: true,
        technician: true,
        spareParts: {
          include: { sparePart: true },
        },
      },
      orderBy: { created: 'desc' },
    });
  }

  async getById(id: string) {
    return prisma.maintenanceWorkOrder.findUnique({
      where: { id },
      include: {
        machine: true,
        technician: true,
        spareParts: {
          include: { sparePart: true },
        },
      },
    });
  }

  /**
   * Creates a work order, verifies/reserves spare parts atomically,
   * updates the machine activeWorkOrderId and status.
   */
  async createWorkOrder(data: {
    machineId: string;
    issue: string;
    priority?: string;
    type?: string;
    technicianId?: string;
    requiredSkill?: string;
    sparePartIds?: string[];
    estimatedDurationHours?: number;
    notes?: string;
  }) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const machine = await tx.machine.findUnique({
        where: { id: data.machineId },
      });
      if (!machine) {
        throw new Error(`Machine ${data.machineId} not found`);
      }

      const existing = await tx.maintenanceWorkOrder.findMany({ select: { id: true } });
      const maxNum = existing.reduce((max: number, w: any) => {
        const match = w.id.match(/\d+/);
        return match ? Math.max(max, parseInt(match[0], 10)) : max;
      }, 204);
      const woId = `WO-${maxNum + 1}`;

      let technicianName: string | undefined;
      if (data.technicianId) {
        const emp = await tx.employee.findUnique({
          where: { id: data.technicianId },
        });
        if (emp) {
          technicianName = emp.name;
          await tx.employee.update({
            where: { id: emp.id },
            data: {
              availability: 'assigned',
              currentTaskId: woId,
              workloadPct: Math.min(100, emp.workloadPct + 20),
            },
          });
        }
      }

      // Check and reserve spare parts
      let allPartsAvailable = true;
      const sparePartIds = data.sparePartIds || [];

      for (const partId of sparePartIds) {
        const part = await tx.inventoryItem.findUnique({
          where: { id: partId },
        });
        if (!part || part.available < 1) {
          allPartsAvailable = false;
          throw new Error(
            `Required spare part ${part?.name || partId} is not available in stock (available: ${part?.available || 0}).`
          );
        }

        // Reserve 1 unit
        const newReserved = part.reserved + 1;
        const newAvailable = Math.max(0, part.onHand - newReserved);
        let stockoutRisk = 'low';
        if (newAvailable <= 0 || newAvailable <= part.reorderPoint) {
          stockoutRisk = 'high';
        } else if (newAvailable <= part.reorderPoint * 1.5) {
          stockoutRisk = 'medium';
        }

        await tx.inventoryItem.update({
          where: { id: part.id },
          data: {
            reserved: newReserved,
            available: newAvailable,
            stockoutRisk,
          },
        });

        // Record reservation transaction
        const txCount = await tx.inventoryTransaction.count();
        await tx.inventoryTransaction.create({
          data: {
            id: `TX-${1100 + txCount + 1}`,
            timestamp: new Date().toISOString(),
            itemId: part.id,
            itemName: part.name,
            type: 'reservation',
            quantity: 1,
            referenceType: 'work_order',
            referenceId: woId,
            performedBy: 'NOVA Command Dispatch',
            notes: `Reserved 1 unit of ${part.name} for work order ${woId}`,
          },
        });
      }

      const createdWO = await tx.maintenanceWorkOrder.create({
        data: {
          id: woId,
          machineId: machine.id,
          machineName: machine.name,
          issue: data.issue,
          priority: data.priority || 'critical',
          type: data.type || 'corrective',
          technicianId: data.technicianId,
          technicianName,
          requiredSkill: data.requiredSkill || 'CNC Diagnostics',
          sparePartsChecked: allPartsAvailable,
          status: data.technicianId ? 'assigned' : 'open',
          created: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          estimatedDurationHours: data.estimatedDurationHours || 6.5,
          notes: data.notes || 'Corrective overhaul created via NOVA Command.',
        },
      });

      for (const partId of sparePartIds) {
        await tx.workOrderSparePart.create({
          data: {
            workOrderId: woId,
            sparePartId: partId,
          },
        });
      }

      await tx.machine.update({
        where: { id: machine.id },
        data: {
          activeWorkOrderId: woId,
          status: 'warning',
        },
      });

      return createdWO;
    });
  }

  async assignTechnician(workOrderId: string, employeeId: string) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const wo = await tx.maintenanceWorkOrder.findUnique({
        where: { id: workOrderId },
      });
      if (!wo) throw new Error(`Work order ${workOrderId} not found`);

      const emp = await tx.employee.findUnique({
        where: { id: employeeId },
      });
      if (!emp) throw new Error(`Employee ${employeeId} not found`);

      // Free previous technician if any
      if (wo.technicianId && wo.technicianId !== employeeId) {
        await tx.employee.update({
          where: { id: wo.technicianId },
          data: {
            availability: 'available',
            currentTaskId: null,
            workloadPct: Math.max(20, emp.workloadPct - 20),
          },
        });
      }

      await tx.employee.update({
        where: { id: emp.id },
        data: {
          availability: 'assigned',
          currentTaskId: wo.id,
          workloadPct: Math.min(100, emp.workloadPct + 20),
        },
      });

      return tx.maintenanceWorkOrder.update({
        where: { id: workOrderId },
        data: {
          technicianId: emp.id,
          technicianName: emp.name,
          status: 'assigned',
        },
        include: {
          machine: true,
          technician: true,
          spareParts: { include: { sparePart: true } },
        },
      });
    });
  }

  async startWorkOrder(workOrderId: string) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const wo = await tx.maintenanceWorkOrder.findUnique({
        where: { id: workOrderId },
      });
      if (!wo) throw new Error(`Work order ${workOrderId} not found`);

      const updatedWO = await tx.maintenanceWorkOrder.update({
        where: { id: workOrderId },
        data: { status: 'in_progress' },
      });

      await tx.machine.update({
        where: { id: wo.machineId },
        data: { status: 'maintenance' },
      });

      return updatedWO;
    });
  }

  async completeWorkOrder(workOrderId: string) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const wo = await tx.maintenanceWorkOrder.findUnique({
        where: { id: workOrderId },
        include: { spareParts: true },
      });
      if (!wo) throw new Error(`Work order ${workOrderId} not found`);

      // Consume reserved spare parts
      for (const sp of wo.spareParts) {
        const item = await tx.inventoryItem.findUnique({
          where: { id: sp.sparePartId },
        });
        if (item && item.reserved > 0) {
          const newReserved = Math.max(0, item.reserved - 1);
          const newOnHand = Math.max(0, item.onHand - 1);
          const newAvailable = Math.max(0, newOnHand - newReserved);

          await tx.inventoryItem.update({
            where: { id: item.id },
            data: {
              reserved: newReserved,
              onHand: newOnHand,
              available: newAvailable,
            },
          });

          const txCount = await tx.inventoryTransaction.count();
          await tx.inventoryTransaction.create({
            data: {
              id: `TX-${1100 + txCount + 1}`,
              timestamp: new Date().toISOString(),
              itemId: item.id,
              itemName: item.name,
              type: 'issue',
              quantity: 1,
              referenceType: 'work_order',
              referenceId: wo.id,
              performedBy: wo.technicianName || 'Maintenance Tech',
              notes: `Consumed for overhaul under ${wo.id}`,
            },
          });
        }
      }

      // Free technician
      if (wo.technicianId) {
        const emp = await tx.employee.findUnique({
          where: { id: wo.technicianId },
        });
        if (emp) {
          await tx.employee.update({
            where: { id: emp.id },
            data: {
              availability: 'available',
              currentTaskId: null,
              workloadPct: Math.max(20, emp.workloadPct - 20),
            },
          });
        }
      }

      // Restore machine to running optimal condition
      await tx.machine.update({
        where: { id: wo.machineId },
        data: {
          status: 'running',
          healthScore: 97,
          vibration: 1.72,
          temperature: 47.8,
          criticalIssue: null,
          activeWorkOrderId: null,
        },
      });

      // Resolve critical alert AL-101 if this was M-004
      if (wo.machineId === 'M-004') {
        const al101 = await tx.alert.findUnique({ where: { id: 'AL-101' } });
        if (al101) {
          await tx.alert.update({
            where: { id: 'AL-101' },
            data: { status: 'resolved' },
          });
        }
      }

      return tx.maintenanceWorkOrder.update({
        where: { id: workOrderId },
        data: {
          status: 'completed',
          actualDurationHours: wo.estimatedDurationHours,
        },
      });
    });
  }
}

export const maintenanceRepository = new MaintenanceRepository();
