import { useState, useEffect } from 'react';
import {
  Machine,
  Operation,
  Order,
  Employee,
  InventoryItem,
  InventoryTransaction,
  PurchaseOrder,
  MaintenanceWorkOrder,
  QualityInspection,
  Alert,
  DecisionRecommendation,
  WhatIfScenario,
} from '../types';
import {
  initialMachines,
  initialOperations,
  initialOrders,
  initialEmployees,
  initialInventory,
  initialTransactions,
  initialPurchaseOrders,
  initialWorkOrders,
  initialQualityInspections,
  initialAlerts,
  initialRecommendations,
  initialWhatIfScenario,
} from '../data/initialData';
import { AppUser, UserRole, DEMO_USERS } from '../types/auth';
import { ApiService } from './api';

export interface StoreState {
  machines: Machine[];
  operations: Operation[];
  orders: Order[];
  employees: Employee[];
  inventory: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  purchaseOrders: PurchaseOrder[];
  workOrders: MaintenanceWorkOrder[];
  qualityInspections: QualityInspection[];
  alerts: Alert[];
  recommendations: DecisionRecommendation[];
  whatIfScenario: WhatIfScenario;
  committedPlanVersion: number;
  plantShift: string;
  plantTime: string;
  lastUpdated: string;
  demoStep: number;
  selectedMachineId: string;
  selectedOrderId: string;
  activeTab: string;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  users: AppUser[];
  currentUser: AppUser;
  // Connection & sync state
  isLoading: boolean;
  isBackendConnected: boolean;
  backendError: string | null;
}

// Global in-memory singleton
let globalState: StoreState = {
  machines: JSON.parse(JSON.stringify(initialMachines)),
  operations: JSON.parse(JSON.stringify(initialOperations)),
  orders: JSON.parse(JSON.stringify(initialOrders)),
  employees: JSON.parse(JSON.stringify(initialEmployees)),
  inventory: JSON.parse(JSON.stringify(initialInventory)),
  inventoryTransactions: JSON.parse(JSON.stringify(initialTransactions)),
  purchaseOrders: JSON.parse(JSON.stringify(initialPurchaseOrders)),
  workOrders: JSON.parse(JSON.stringify(initialWorkOrders)),
  qualityInspections: JSON.parse(JSON.stringify(initialQualityInspections)),
  alerts: JSON.parse(JSON.stringify(initialAlerts)),
  recommendations: JSON.parse(JSON.stringify(initialRecommendations)),
  whatIfScenario: JSON.parse(JSON.stringify(initialWhatIfScenario)),
  committedPlanVersion: 1,
  plantShift: 'Shift A (06:00 - 14:00)',
  plantTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
  lastUpdated: 'Initializing backend sync...',
  demoStep: 1,
  selectedMachineId: 'M-004',
  selectedOrderId: 'ORDER-1042',
  activeTab: 'command-center',
  toastMessage: null,
  users: JSON.parse(JSON.stringify(DEMO_USERS)),
  currentUser: JSON.parse(JSON.stringify(DEMO_USERS[0])),
  isLoading: true,
  isBackendConnected: false,
  backendError: null,
};

const listeners = new Set<(state: StoreState) => void>();

function notify() {
  const stateCopy = { ...globalState };
  listeners.forEach((listener) => listener(stateCopy));
}

export function getGlobalStoreState(): StoreState {
  return { ...globalState };
}

export function switchGlobalUser(userId: string): AppUser | null {
  const targetUser = globalState.users.find((u) => u.id === userId);
  if (targetUser) {
    globalState.currentUser = { ...targetUser };
    notify();
    return targetUser;
  }
  return null;
}

let syncPromise: Promise<void> | null = null;

/**
 * Synchronizes entire operational state from backend REST API
 */
export async function syncStateFromBackend(): Promise<void> {
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      const data = await ApiService.fetchAllOperationalState();

      globalState.machines = data.machines;
      globalState.operations = data.operations;
      globalState.orders = data.orders;
      globalState.employees = data.employees;
      globalState.inventory = data.inventory;
      globalState.inventoryTransactions = data.inventoryTransactions;
      globalState.purchaseOrders = data.purchaseOrders;
      globalState.workOrders = data.workOrders;
      globalState.qualityInspections = data.qualityInspections;
      globalState.alerts = data.alerts;
      globalState.recommendations = data.recommendations;
      globalState.whatIfScenario = data.whatIfScenario;
      globalState.users = data.users.length > 0 ? data.users : globalState.users;

      // Ensure currentUser stays synced
      const foundUser = globalState.users.find((u) => u.id === globalState.currentUser.id);
      if (foundUser) {
        globalState.currentUser = { ...foundUser };
      }

      globalState.plantShift = data.systemStatus.activeShift;
      globalState.plantTime = data.systemStatus.plantTime;
      globalState.lastUpdated = data.systemStatus.lastUpdated;
      globalState.committedPlanVersion = data.systemStatus.committedPlanVersion;
      globalState.selectedMachineId = data.systemStatus.selectedMachineId || globalState.selectedMachineId;
      globalState.selectedOrderId = data.systemStatus.selectedOrderId || globalState.selectedOrderId;

      globalState.isBackendConnected = true;
      globalState.backendError = null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[NOVA Store] Backend sync issue:', msg);
      globalState.isBackendConnected = false;
      globalState.backendError = msg;
    } finally {
      globalState.isLoading = false;
      syncPromise = null;
      notify();
    }
  })();

  return syncPromise;
}

// Initial bootstrap from backend
let isInitialized = false;
function ensureInitialized() {
  if (!isInitialized) {
    isInitialized = true;
    syncStateFromBackend();
  }
}

export function useManufacturingStore() {
  const [state, setState] = useState<StoreState>(globalState);

  useEffect(() => {
    ensureInitialized();
    const handler = (newState: StoreState) => setState(newState);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const setToast = (toast: { text: string; type: 'success' | 'info' | 'warning' | 'error' } | null) => {
    globalState.toastMessage = toast;
    notify();
    if (toast) {
      setTimeout(() => {
        if (globalState.toastMessage === toast) {
          globalState.toastMessage = null;
          notify();
        }
      }, 4000);
    }
  };

  return {
    ...state,

    // Navigation & UI state
    setActiveTab: (tab: string) => {
      globalState.activeTab = tab;
      notify();
    },
    setSelectedMachineId: (id: string) => {
      globalState.selectedMachineId = id;
      notify();
    },
    setSelectedOrderId: (id: string) => {
      globalState.selectedOrderId = id;
      notify();
    },
    setToast,

    // Refresh from backend manually
    refreshAllData: async () => {
      await syncStateFromBackend();
      setToast({ text: 'Data refreshed from backend database.', type: 'info' });
    },

    // 1. Machine Actions
    updateMachineStatus: async (machineId: string, status: Machine['status']) => {
      try {
        await ApiService.updateMachineStatus(machineId, status);
        await syncStateFromBackend();
        setToast({
          text: `Machine ${machineId} status updated to ${status.toUpperCase()} in backend. Consequence cascade updated.`,
          type: 'info',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to update machine status: ${msg}`, type: 'error' });
      }
    },

    // 2. Maintenance Work Order Lifecycle
    createWorkOrder: async (wo: Partial<MaintenanceWorkOrder>) => {
      try {
        const created = await ApiService.createWorkOrder(wo);
        await syncStateFromBackend();
        setToast({
          text: `Work Order ${created.id} created for ${created.machineName}. Spare parts verified and reserved in database.`,
          type: 'success',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to create work order: ${msg}`, type: 'error' });
      }
    },

    assignTechnicianToWorkOrder: async (workOrderId: string, employeeId: string) => {
      try {
        const updated = await ApiService.assignTechnician(workOrderId, employeeId);
        await syncStateFromBackend();
        setToast({
          text: `Technician ${updated.technicianName} successfully assigned to ${workOrderId}.`,
          type: 'info',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to assign technician: ${msg}`, type: 'error' });
      }
    },

    startWorkOrder: async (workOrderId: string) => {
      try {
        const updated = await ApiService.startWorkOrder(workOrderId);
        await syncStateFromBackend();
        setToast({
          text: `Work order ${updated.id} started. Machine is now OFFLINE in Maintenance. Cascading delays recalculated.`,
          type: 'warning',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to start work order: ${msg}`, type: 'error' });
      }
    },

    completeWorkOrder: async (workOrderId: string) => {
      try {
        const updated = await ApiService.completeWorkOrder(workOrderId);
        await syncStateFromBackend();
        setToast({
          text: `Work order ${updated.id} COMPLETED in database! Spare parts consumed and machine restored to running.`,
          type: 'success',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to complete work order: ${msg}`, type: 'error' });
      }
    },

    // 3. Production Scheduling & Rerouting
    rerouteOperation: async (operationId: string, targetMachineId: string) => {
      try {
        const updated = await ApiService.rerouteOperation(operationId, targetMachineId);
        await syncStateFromBackend();
        setToast({
          text: `Operation ${updated.id} rerouted to ${targetMachineId} in backend database. Delays eliminated!`,
          type: 'success',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to reroute operation: ${msg}`, type: 'error' });
      }
    },

    // 4. Inventory Actions
    addInventoryTransaction: async (tx: Partial<InventoryTransaction>) => {
      try {
        const result = await ApiService.createInventoryTransaction(tx);
        await syncStateFromBackend();
        setToast({
          text: `Inventory transaction logged: ${tx.type?.toUpperCase()} of ${tx.quantity} for ${result.item.name}.`,
          type: 'info',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to record transaction: ${msg}`, type: 'error' });
      }
    },

    // 5. Procurement Actions
    updatePurchaseOrderStatus: async (poId: string, status: PurchaseOrder['status']) => {
      try {
        const updated = await ApiService.updatePurchaseOrderStatus(poId, status);
        await syncStateFromBackend();
        setToast({
          text: status === 'delivered'
            ? `PO ${updated.id} marked DELIVERED! Goods receipt logged and inventory replenished in database.`
            : `PO ${updated.id} status updated to ${status}.`,
          type: status === 'delivered' ? 'success' : 'info',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to update purchase order: ${msg}`, type: 'error' });
      }
    },

    // 6. Quality Inspection Logging
    addQualityInspection: async (qi: Partial<QualityInspection>) => {
      try {
        const created = await ApiService.createQualityInspection(qi);
        await syncStateFromBackend();
        setToast({
          text: `Quality inspection ${created.id} logged in database. Result: ${created.status.toUpperCase()}`,
          type: created.status === 'rejected' ? 'error' : created.status === 'warning' ? 'warning' : 'success',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to record quality inspection: ${msg}`, type: 'error' });
      }
    },

    // 7. Alert Actions
    updateAlertStatus: async (alertId: string, status: Alert['status']) => {
      try {
        await ApiService.updateAlertStatus(alertId, status);
        await syncStateFromBackend();
        setToast({
          text: `Alert ${alertId} marked as ${status.toUpperCase()} in database.`,
          type: 'info',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to update alert: ${msg}`, type: 'error' });
      }
    },

    // 8. What-If Simulator & Commit Flow
    simulateWhatIf: async (params: Partial<WhatIfScenario['parameters']>) => {
      try {
        const simulated = await ApiService.simulateWhatIf(params);
        globalState.whatIfScenario = simulated;
        notify();
        setToast({
          text: 'What-If simulation calculated by backend engine.',
          type: 'info',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to run simulation: ${msg}`, type: 'error' });
      }
    },

    commitProposedPlan: async () => {
      try {
        const result = await ApiService.commitWhatIfPlan();
        await syncStateFromBackend();
        setToast({
          text: `Proposed Plan Version #${result.committedPlanVersion} COMMITTED by Operations Director! Schedule rerouted and saved in database.`,
          type: 'success',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to commit proposed plan: ${msg}`, type: 'error' });
      }
    },

    // 9. Demo Walkthrough Steps
    runDemoStep: async (stepNumber: number) => {
      globalState.demoStep = stepNumber;

      switch (stepNumber) {
        case 1:
          globalState.activeTab = 'command-center';
          break;
        case 2:
          globalState.activeTab = 'machines';
          globalState.selectedMachineId = 'M-004';
          break;
        case 3:
          globalState.activeTab = 'machines';
          globalState.selectedMachineId = 'M-004';
          break;
        case 4:
          globalState.activeTab = 'decision-center';
          break;
        case 5:
          globalState.activeTab = 'maintenance';
          break;
        case 6:
          globalState.activeTab = 'inventory';
          break;
        case 7:
          globalState.activeTab = 'factory-floor';
          break;
        case 8:
          globalState.activeTab = 'production';
          break;
        case 9:
          globalState.activeTab = 'orders';
          globalState.selectedOrderId = 'ORDER-1042';
          break;
        case 10:
          globalState.activeTab = 'orders';
          break;
        case 11:
          globalState.activeTab = 'what-if';
          break;
        case 12:
          globalState.activeTab = 'what-if';
          break;
        case 13:
          globalState.activeTab = 'what-if';
          break;
        case 14:
          globalState.activeTab = 'decision-center';
          break;
        case 15:
          globalState.activeTab = 'command-center';
          break;
        default:
          break;
      }

      setToast({
        text: `Demo Flow: Step ${stepNumber} activated.`,
        type: 'info',
      });
      notify();
    },

    // 10. User & Role Switching
    switchUser: (userId: string) => {
      const targetUser = globalState.users.find((u) => u.id === userId);
      if (targetUser) {
        globalState.currentUser = { ...targetUser };
        setToast({
          text: `Switched session to ${targetUser.name} (${targetUser.role})`,
          type: 'info',
        });
        notify();
      }
    },

    updateUserRole: async (userId: string, newRole: UserRole) => {
      try {
        await ApiService.updateUserRole(userId, newRole);
        await syncStateFromBackend();
        setToast({
          text: `User role updated to ${newRole} in database.`,
          type: 'success',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to update user role: ${msg}`, type: 'error' });
      }
    },

    addUser: async (user: AppUser) => {
      try {
        await ApiService.createUser(user);
        await syncStateFromBackend();
        setToast({
          text: `User ${user.name} added as ${user.role} in database.`,
          type: 'success',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to add user: ${msg}`, type: 'error' });
      }
    },

    // 11. Reset Database & State
    resetAllData: async () => {
      try {
        await ApiService.resetSystemData();
        await syncStateFromBackend();
        setToast({
          text: 'NOVA Command database successfully reset to pristine demo seed.',
          type: 'info',
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setToast({ text: `Failed to reset database: ${msg}`, type: 'error' });
      }
    },
  };
}
