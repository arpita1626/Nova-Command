// In-memory Prisma-compatible store for AI Studio container environment
// Provides complete relational storage without native SQLite binary engine dependencies

export namespace Prisma {
  export type TransactionClient = any;
}

type ModelRecord = Record<string, any>;

class InMemoryModel {
  private items = new Map<string | number, ModelRecord>();
  private autoId = 1;
  private modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  async findMany(args: {
    where?: Record<string, any>;
    include?: Record<string, any>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    select?: Record<string, boolean>;
  } = {}): Promise<any[]> {
    let list = Array.from(this.items.values()).map(item => ({ ...item }));

    if (args.where) {
      list = list.filter(item => matchesWhere(item, args.where!));
    }

    if (args.orderBy) {
      const [field, direction] = Object.entries(args.orderBy)[0] || [];
      if (field) {
        list.sort((a, b) => {
          const valA = a[field];
          const valB = b[field];
          if (valA === valB) return 0;
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          const cmp = valA < valB ? -1 : 1;
          return direction === 'desc' ? -cmp : cmp;
        });
      }
    }

    if (args.include) {
      for (const item of list) {
        attachIncludes(this.modelName, item, args.include);
      }
    }

    if (args.select) {
      return list.map(item => {
        const selected: Record<string, any> = {};
        for (const [key, enabled] of Object.entries(args.select!)) {
          if (enabled && key in item) {
            selected[key] = item[key];
          }
        }
        return selected;
      });
    }

    return list;
  }

  async findUnique(args: {
    where: Record<string, any>;
    include?: Record<string, any>;
  }): Promise<any | null> {
    const item = Array.from(this.items.values()).find(i => matchesWhere(i, args.where));
    if (!item) return null;
    const copy = { ...item };
    if (args.include) {
      attachIncludes(this.modelName, copy, args.include);
    }
    return copy;
  }

  async findFirst(args: {
    where?: Record<string, any>;
    include?: Record<string, any>;
  } = {}): Promise<any | null> {
    const list = await this.findMany(args);
    return list[0] ?? null;
  }

  async create(args: { data: Record<string, any> }): Promise<any> {
    const record = { ...args.data };
    if (record.id === undefined) {
      record.id = this.autoId++;
    }
    this.items.set(record.id, record);
    return { ...record };
  }

  async update(args: {
    where: Record<string, any>;
    data: Record<string, any>;
    include?: Record<string, any>;
  }): Promise<any> {
    const key = Object.keys(args.where)[0];
    const val = args.where[key];
    const existing = Array.from(this.items.values()).find(i => i[key] === val);

    if (!existing) {
      throw new Error(`Record to update not found: ${JSON.stringify(args.where)} in ${this.modelName}`);
    }

    const updated = { ...existing, ...args.data };
    this.items.set(existing.id, updated);
    const copy = { ...updated };
    if (args.include) {
      attachIncludes(this.modelName, copy, args.include);
    }
    return copy;
  }

  async upsert(args: {
    where: Record<string, any>;
    update: Record<string, any>;
    create: Record<string, any>;
  }): Promise<any> {
    const existing = await this.findUnique({ where: args.where });
    if (existing) {
      return this.update({ where: args.where, data: args.update });
    }
    return this.create({ data: args.create });
  }

  async deleteMany(args: { where?: Record<string, any> } = {}): Promise<{ count: number }> {
    if (!args.where) {
      const count = this.items.size;
      this.items.clear();
      return { count };
    }
    let count = 0;
    for (const [id, item] of this.items.entries()) {
      if (matchesWhere(item, args.where)) {
        this.items.delete(id);
        count++;
      }
    }
    return { count };
  }

  async count(args: { where?: Record<string, any> } = {}): Promise<number> {
    if (!args.where) return this.items.size;
    let count = 0;
    for (const item of this.items.values()) {
      if (matchesWhere(item, args.where)) {
        count++;
      }
    }
    return count;
  }
}

function matchesWhere(item: ModelRecord, where: Record<string, any>): boolean {
  for (const [key, condition] of Object.entries(where)) {
    if (condition !== undefined && item[key] !== condition) {
      return false;
    }
  }
  return true;
}

// In-memory collections singleton
const models = {
  machine: new InMemoryModel('machine'),
  machineTelemetry: new InMemoryModel('machineTelemetry'),
  order: new InMemoryModel('order'),
  operation: new InMemoryModel('operation'),
  employee: new InMemoryModel('employee'),
  inventoryItem: new InMemoryModel('inventoryItem'),
  inventoryTransaction: new InMemoryModel('inventoryTransaction'),
  purchaseOrder: new InMemoryModel('purchaseOrder'),
  maintenanceWorkOrder: new InMemoryModel('maintenanceWorkOrder'),
  workOrderSparePart: new InMemoryModel('workOrderSparePart'),
  qualityInspection: new InMemoryModel('qualityInspection'),
  alert: new InMemoryModel('alert'),
  decisionRecommendation: new InMemoryModel('decisionRecommendation'),
  whatIfScenario: new InMemoryModel('whatIfScenario'),
  appUser: new InMemoryModel('appUser'),
  systemState: new InMemoryModel('systemState'),
  auditLog: new InMemoryModel('auditLog'),
  correctiveAction: new InMemoryModel('correctiveAction'),
};

function attachIncludes(modelName: string, item: ModelRecord, include: Record<string, any>): void {
  if (modelName === 'machine') {
    if (include.telemetryHistory) {
      item.telemetryHistory = (models.machineTelemetry as any).findManySync({
        where: { machineId: item.id },
      });
    }
    if (include.operations) {
      item.operations = (models.operation as any).findManySync({
        where: { machineId: item.id },
      });
    }
    if (include.workOrders) {
      item.workOrders = (models.maintenanceWorkOrder as any).findManySync({
        where: { machineId: item.id },
      });
    }
    if (include.qualityInspections) {
      item.qualityInspections = (models.qualityInspection as any).findManySync({
        where: { machineId: item.id },
      });
    }
  } else if (modelName === 'order') {
    if (include.operations) {
      const ops = (models.operation as any).findManySync({ where: { orderId: item.id } });
      if (typeof include.operations === 'object' && include.operations.include?.machine) {
        for (const op of ops) {
          op.machine = (models.machine as any).findUniqueSync({ where: { id: op.machineId } });
        }
      }
      item.operations = ops;
    }
  } else if (modelName === 'operation') {
    if (include.machine) {
      item.machine = (models.machine as any).findUniqueSync({ where: { id: item.machineId } });
    }
    if (include.order) {
      item.order = (models.order as any).findUniqueSync({ where: { id: item.orderId } });
    }
  } else if (modelName === 'employee') {
    if (include.workOrders) {
      item.workOrders = (models.maintenanceWorkOrder as any).findManySync({
        where: { technicianId: item.id },
      });
    }
  } else if (modelName === 'purchaseOrder') {
    if (include.item) {
      item.item = (models.inventoryItem as any).findUniqueSync({ where: { id: item.itemId } });
    }
  } else if (modelName === 'maintenanceWorkOrder') {
    if (include.machine) {
      item.machine = (models.machine as any).findUniqueSync({ where: { id: item.machineId } });
    }
    if (include.technician && item.technicianId) {
      item.technician = (models.employee as any).findUniqueSync({ where: { id: item.technicianId } });
    }
    if (include.spareParts) {
      const sps = (models.workOrderSparePart as any).findManySync({ where: { workOrderId: item.id } });
      if (typeof include.spareParts === 'object' && include.spareParts.include?.sparePart) {
        for (const sp of sps) {
          sp.sparePart = (models.inventoryItem as any).findUniqueSync({ where: { id: sp.sparePartId } });
        }
      }
      item.spareParts = sps;
    }
  } else if (modelName === 'qualityInspection') {
    if (include.machine) {
      item.machine = (models.machine as any).findUniqueSync({ where: { id: item.machineId } });
    }
  }
}

// Attach synchronous helpers for internal relational joins
for (const [name, model] of Object.entries(models)) {
  (model as any).findManySync = function (args: { where?: Record<string, any> } = {}) {
    let list = Array.from((this as any).items.values()).map((i: any) => ({ ...i }));
    if (args.where) {
      list = list.filter((i: any) => matchesWhere(i, args.where!));
    }
    return list;
  };
  (model as any).findUniqueSync = function (args: { where: Record<string, any> }) {
    const item = Array.from((this as any).items.values()).find((i: any) => matchesWhere(i, args.where));
    return item ? { ...item } : null;
  };
}

export const prisma = {
  ...models,
  async $transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return fn(prisma);
  },
  async $connect(): Promise<void> {
    return Promise.resolve();
  },
  async $disconnect(): Promise<void> {
    return Promise.resolve();
  },
};
