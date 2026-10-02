import { Request, Response, NextFunction } from 'express';
import { qualityService } from '../services/quality.service';

export class QualityController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const qis = await qualityService.getAllInspections();
      const parsed = qis.map((q: any) => ({
        ...q,
        defects: typeof q.defectsJson === 'string' ? JSON.parse(q.defectsJson) : q.defectsJson,
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
      const qi = await qualityService.getInspectionById(req.params.id);
      res.json({
        success: true,
        data: {
          ...qi,
          defects: JSON.parse(qi.defectsJson),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { machineId, line, batchId, productId, productName, inspectedUnits, defectUnits, defects, correctiveActionId } = req.body;
      if (!machineId || inspectedUnits === undefined || defectUnits === undefined) {
        res.status(400).json({ success: false, error: 'machineId, inspectedUnits, and defectUnits are required' });
        return;
      }

      const created = await qualityService.createInspection({
        machineId,
        line,
        batchId,
        productId,
        productName,
        inspectedUnits: Number(inspectedUnits),
        defectUnits: Number(defectUnits),
        defects,
        correctiveActionId,
      });

      res.status(201).json({
        success: true,
        data: {
          ...created,
          defects: JSON.parse(created.defectsJson),
        },
        message: `Quality inspection ${created.id} logged. SPC Signal: ${created.spcSignal.toUpperCase()}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCorrectiveActions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actions = await qualityService.getAllCorrectiveActions();
      res.json({
        success: true,
        data: actions,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createCorrectiveAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await qualityService.createCorrectiveAction(req.body);
      res.status(201).json({
        success: true,
        data: created,
        message: `Corrective Action ${created.id} created`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCorrectiveAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await qualityService.updateCorrectiveActionStatus(req.params.id, req.body.status);
      res.json({
        success: true,
        data: updated,
        message: `Corrective Action ${req.params.id} updated to ${req.body.status}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const qualityController = new QualityController();
