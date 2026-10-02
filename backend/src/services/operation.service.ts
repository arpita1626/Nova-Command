import { operationRepository } from '../repositories/operation.repository';
import { machineRepository } from '../repositories/machine.repository';
import { consequenceEngineService } from './consequence.service';
import { prisma } from '../utils/prisma';

export class OperationService {
  async getAllOperations() {
    return operationRepository.getAll();
  }

  async getOperationById(id: string) {
    const op = await operationRepository.getById(id);
    if (!op) {
      throw new Error(`Operation ${id} not found`);
    }
    return op;
  }

  async rerouteOperation(operationId: string, targetMachineId: string) {
    const op = await operationRepository.getById(operationId);
    if (!op) {
      throw new Error(`Operation ${operationId} not found`);
    }

    const targetMachine = await machineRepository.getById(targetMachineId);
    if (!targetMachine) {
      throw new Error(`Target machine ${targetMachineId} not found`);
    }

    // Update operation
    const updated = await operationRepository.update(operationId, {
      machineId: targetMachineId,
      status: 'in_progress',
      delayHours: 0,
      delayReason: null,
    });

    // Update target machine
    await machineRepository.update(targetMachineId, {
      utilization: 82,
      currentOperationId: op.id,
    });

    // Propagate consequences across schedule & orders
    await consequenceEngineService.propagate();

    // Record audit log
    await (prisma as any).auditLog.create({
      data: {
        id: `AUDIT-${Date.now()}`,
        user: 'Rahul Sharma',
        role: 'PRODUCTION_PLANNER',
        action: `Changed production schedule for Order ${op.orderId}: Rerouted ${operationId} from ${op.machineId} to ${targetMachineId}.`,
        module: 'Production Planning',
        timestamp: new Date().toISOString(),
        affectedRecord: `${op.orderId} (${operationId})`,
        previousValue: `Machine ${op.machineId}`,
        newValue: `Machine ${targetMachineId}`,
      },
    });

    return updated;
  }

  async rescheduleOperation(operationId: string, updates: any, user = 'Rahul Sharma', role = 'PRODUCTION_PLANNER') {
    const op = await operationRepository.getById(operationId);
    if (!op) {
      throw new Error(`Operation ${operationId} not found`);
    }

    const previousSchedule = `${op.scheduledStart} - ${op.scheduledEnd}`;
    const updated = await operationRepository.update(operationId, updates);

    // If machine assignment changed
    if (updates.machineId && updates.machineId !== op.machineId) {
      await machineRepository.update(updates.machineId, {
        currentOperationId: op.id,
      });
    }

    await consequenceEngineService.propagate();

    const newSchedule = `${updated.scheduledStart} - ${updated.scheduledEnd}`;
    await (prisma as any).auditLog.create({
      data: {
        id: `AUDIT-${Date.now()}`,
        user,
        role,
        action: `Updated schedule timing for Order ${op.orderId} (${operationId}): Adjusted timeline to ${newSchedule}.`,
        module: 'Production Planning',
        timestamp: new Date().toISOString(),
        affectedRecord: `${op.orderId} (${operationId})`,
        previousValue: previousSchedule,
        newValue: newSchedule,
      },
    });

    return updated;
  }
}

export const operationService = new OperationService();
