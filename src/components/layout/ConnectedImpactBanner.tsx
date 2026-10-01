import React from 'react';
import {
  Activity,
  Wrench,
  UserCheck,
  Package,
  Calendar,
  Layers,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';

export const ConnectedImpactBanner: React.FC = () => {
  const {
    machines,
    workOrders,
    employees,
    inventory,
    operations,
    orders,
    setActiveTab,
    setSelectedMachineId,
    setSelectedOrderId,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const m4 = machines.find((m) => m.id === 'M-004');
  const wo204 = workOrders.find((w) => w.machineId === 'M-004');
  const tech = employees.find((e) => e.id === wo204?.technicianId);
  const sparePart = inventory.find((i) => i.id === 'SP-104');
  const op27 = operations.find((o) => o.id === 'OP-27');
  const order1042 = orders.find((o) => o.id === 'ORDER-1042');

  const isRerouted = op27?.machineId === 'M-006';

  const stages = [
    {
      id: 'machine',
      step: '1. Machine',
      title: 'M-004 Spindle',
      icon: Activity,
      status: m4?.status === 'running' ? 'nominal' : m4?.status === 'maintenance' ? 'offline' : 'warning',
      metric: `${m4?.vibration.toFixed(2)} mm/s`,
      detail: m4?.status === 'maintenance' ? 'In Overhaul (WO-204)' : m4?.criticalIssue || 'Vibration > 3.2 mm/s',
      tab: 'machines',
      action: () => {
        setSelectedMachineId('M-004');
        setActiveTab('machines');
      },
    },
    {
      id: 'maintenance',
      step: '2. Maintenance',
      title: wo204?.id || 'WO-204',
      icon: Wrench,
      status: wo204?.status === 'completed' ? 'nominal' : 'warning',
      metric: wo204?.status?.toUpperCase() || 'OPEN',
      detail: '6.5h Bearing Overhaul',
      tab: 'maintenance',
      action: () => setActiveTab('maintenance'),
    },
    {
      id: 'technician',
      step: '3. Technician',
      title: tech?.name || 'Marcus Vance',
      icon: UserCheck,
      status: 'nominal',
      metric: 'Level 3 Cert',
      detail: 'Assigned (Shift A)',
      tab: 'workforce',
      action: () => setActiveTab('workforce'),
    },
    {
      id: 'spare_part',
      step: '4. Spare Part',
      title: 'SP-104 Bearing',
      icon: Package,
      status: sparePart && sparePart.available > 0 ? 'nominal' : 'warning',
      metric: `${sparePart?.available} Available`,
      detail: sparePart?.reserved ? '1 Reserved in Stock' : 'Ready in Cage B-02',
      tab: 'inventory',
      action: () => setActiveTab('inventory'),
    },
    {
      id: 'schedule',
      step: '5. Production Schedule',
      title: isRerouted ? 'OP-27 on M-006' : 'OP-27 on M-004',
      icon: Calendar,
      status: isRerouted ? 'nominal' : 'warning',
      metric: isRerouted ? 'On Schedule' : `+${op27?.delayHours || 5.5}h Delay`,
      detail: isRerouted ? 'Rerouted to Standby Cell' : 'Spindle Chatter Risk',
      tab: 'production',
      action: () => setActiveTab('production'),
    },
    {
      id: 'orders',
      step: '6. Customer Orders',
      title: 'ORDER-1042',
      icon: Layers,
      status: order1042?.deliveryRisk === 'low' ? 'nominal' : 'warning',
      metric: '₹2,45,000 Val',
      detail: 'SkyVector Aerospace',
      tab: 'orders',
      action: () => {
        setSelectedOrderId('ORDER-1042');
        setActiveTab('orders');
      },
    },
    {
      id: 'risk',
      step: '7. Delivery Risk',
      title: order1042?.deliveryRisk?.toUpperCase() + ' RISK',
      icon: order1042?.deliveryRisk === 'low' ? ShieldCheck : AlertTriangle,
      status: order1042?.deliveryRisk === 'low' ? 'nominal' : 'warning',
      metric: order1042?.deliveryRisk === 'low' ? '100% On-Time' : '1.5h SLA Buffer',
      detail: order1042?.deliveryRisk === 'low' ? 'Mitigated via What-If Plan' : '₹18,500/day Penalty Risk',
      tab: 'what-if',
      action: () => setActiveTab('what-if'),
    },
  ];

  return (
    <div
      className="rounded-xl p-4 border shadow-sm"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b gap-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <span
            className="text-xs font-bold tracking-wider uppercase"
            style={{ color: 'var(--accent)' }}
          >
            Connected Consequences Graph
          </span>
          <span style={{ color: 'var(--border)' }} className="hidden sm:inline">·</span>
          <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>
            Real-time causal propagation across physical and commercial boundaries
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            Interactive: Click any stage to inspect affected subsystem
          </span>
        </div>
      </div>

      {/* Chain flow cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isWarning = stage.status === 'warning';
          const isOffline = stage.status === 'offline';

          return (
            <div key={stage.id} className="relative group">
              <button
                onClick={stage.action}
                className="w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer shadow-xs"
                style={{
                  backgroundColor: isWarning
                    ? isDark
                      ? 'rgba(245, 158, 11, 0.12)'
                      : '#FEF3C7'
                    : isOffline
                    ? isDark
                      ? 'rgba(100, 116, 139, 0.15)'
                      : '#F1F5F9'
                    : isDark
                    ? 'rgba(13, 19, 29, 0.7)'
                    : '#FFFFFF',
                  borderColor: isWarning
                    ? isDark
                      ? 'rgba(245, 158, 11, 0.4)'
                      : '#FCD34D'
                    : isOffline
                    ? 'var(--border)'
                    : 'var(--border)',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {stage.step}
                  </span>
                  <ExternalLink
                    className="h-3 w-3 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  />
                </div>

                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{
                      color: isWarning
                        ? 'var(--warning)'
                        : isOffline
                        ? 'var(--text-secondary)'
                        : 'var(--success)',
                    }}
                  />
                  <div
                    className="text-xs font-bold truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {stage.title}
                  </div>
                </div>

                <div className="flex items-baseline justify-between text-[11px]">
                  <span
                    className="font-bold"
                    style={{
                      color: isWarning
                        ? 'var(--warning-text)'
                        : isOffline
                        ? 'var(--text-secondary)'
                        : 'var(--success)',
                    }}
                  >
                    {stage.metric}
                  </span>
                </div>
                <p
                  className="text-[10px] truncate mt-0.5"
                  style={{ color: 'var(--text-secondary)' }}
                  title={stage.detail}
                >
                  {stage.detail}
                </p>
              </button>

              {/* Arrow connector for desktop */}
              {idx < stages.length - 1 && (
                <div
                  className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                  style={{ color: isDark ? 'var(--accent)' : '#1D4ED8' }}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
