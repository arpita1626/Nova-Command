import { Request, Response, NextFunction } from 'express';
import { maintenanceService } from '../services/maintenance.service';

export class MaintenanceController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wos = await maintenanceService.getAllWorkOrders();
      const parsed = wos.map((w: any) => ({
        ...w,
        sparePartIds: (w.spareParts || []).map((sp: any) => sp.sparePartId),
      }));
      res.json({
        success: true,
        data: parsed,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wo: any = await maintenanceService.getWorkOrderById(req.params.id);
      res.json({
        success: true,
        data: {
          ...wo,
          sparePartIds: (wo?.spareParts || []).map((sp: any) => sp.sparePartId),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { machineId, issue, priority, type, technicianId, requiredSkill, sparePartIds, estimatedDurationHours, notes } = req.body;
      if (!machineId || !issue) {
        res.status(400).json({ success: false, error: 'machineId and issue are required' });
        return;
      }

      const created = await maintenanceService.createWorkOrder({
        machineId,
        issue,
        priority,
        type,
        technicianId,
        requiredSkill,
        sparePartIds,
        estimatedDurationHours,
        notes,
      });

      res.status(201).json({
        success: true,
        data: created,
        message: `Work Order ${created.id} created successfully. Spare parts verified and reserved.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async assign(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId } = req.body;
      if (!employeeId) {
        res.status(400).json({ success: false, error: 'employeeId is required' });
        return;
      }

      const updated = await maintenanceService.assignTechnician(req.params.id, employeeId);
      res.json({
        success: true,
        data: updated,
        message: `Technician assigned to work order ${req.params.id}.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await maintenanceService.startWorkOrder(req.params.id);
      res.json({
        success: true,
        data: updated,
        message: `Work order ${req.params.id} started. Machine is now in maintenance. Cascade recalculated.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await maintenanceService.completeWorkOrder(req.params.id);
      res.json({
        success: true,
        data: updated,
        message: `Work order ${req.params.id} completed. Reserved spare parts issued, technician freed, machine restored.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const maintenanceController = new MaintenanceController();
