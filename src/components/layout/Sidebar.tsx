import React from 'react';
import {
  LayoutDashboard,
  CalendarRange,
  Factory,
  Activity,
  Wrench,
  Boxes,
  Truck,
  CheckCircle2,
  Users,
  PackageCheck,
  GitFork,
  BrainCircuit,
  BarChart3,
  Bell,
  PlayCircle,
  HelpCircle,
  X,
  Shield,
  KeyRound,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { ROLE_CONFIGS, isTabAllowed } from '../../types/auth';

interface SidebarProps {
  onOpenWalkthrough: () => void;
  onOpenAlerts: () => void;
  onOpenWelcome?: () => void;
  onOpenUserSelection?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenWalkthrough,
  onOpenAlerts,
  onOpenWelcome,
  onOpenUserSelection,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const {
    activeTab,
    setActiveTab,
    machines,
    orders,
    workOrders,
    inventory,
    currentUser,
    alerts,
    recommendations,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const openWorkOrdersCount = workOrders.filter((w) => w.status !== 'completed').length;
  const criticalMachines = machines.filter((m) => m.status === 'warning' || m.status === 'critical').length;
  const ordersAtRisk = orders.filter((o) => o.deliveryRisk === 'high').length;
  const pendingRecs = recommendations.filter((r) => r.status === 'pending').length;
  const activeAlerts = alerts.filter((a) => a.status === 'active').length;
  const lowStockCount = inventory.filter((i) => i.stockoutRisk === 'high').length;

  const sections = [
    {
      group: 'OVERVIEW',
      items: [
        {
          id: 'command-center',
          label: 'Command Center',
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        {
          id: 'production',
          label: 'Production Planning',
          icon: CalendarRange,
          badge: ordersAtRisk > 0 ? `${ordersAtRisk} Risk` : null,
          badgeColor: 'text-amber-700 dark:text-amber-400 font-bold',
        },
        {
          id: 'factory-floor',
          label: 'Factory Floor',
          icon: Factory,
          badge: '3 Lines',
        },
        {
          id: 'machines',
          label: 'Machines',
          icon: Activity,
          badge: criticalMachines > 0 ? `${criticalMachines} Alert` : null,
          badgeColor: 'text-rose-700 dark:text-rose-400 font-bold',
        },
        {
          id: 'maintenance',
          label: 'Maintenance',
          icon: Wrench,
          badge: openWorkOrdersCount > 0 ? `${openWorkOrdersCount} Open` : null,
          badgeColor: 'text-amber-700 dark:text-amber-400 font-bold',
        },
      ],
    },
    {
      group: 'RESOURCES',
      items: [
        {
          id: 'inventory',
          label: 'Inventory',
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
          badgeColor: 'text-orange-700 dark:text-orange-400 font-bold',
        },
        {
          id: 'procurement',
          label: 'Procurement',
          icon: Truck,
          badge: '4 POs',
        },
        {
          id: 'workforce',
          label: 'Workforce',
          icon: Users,
          badge: '10 Active',
        },
      ],
    },
    {
      group: 'PERFORMANCE',
      items: [
        {
          id: 'quality',
          label: 'Quality',
          icon: CheckCircle2,
          badge: '98.2%',
        },
        {
          id: 'orders',
          label: 'Orders & Delivery',
          icon: PackageCheck,
          badge: ordersAtRisk > 0 ? `${ordersAtRisk} Late Risk` : '8 Active',
          badgeColor: ordersAtRisk > 0 ? 'text-rose-700 dark:text-rose-400 font-bold' : undefined,
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
          badge: null,
        },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        {
          id: 'what-if',
          label: 'What-If Simulator',
          icon: GitFork,
          badge: 'Core Engine',
          badgeColor: 'text-blue-700 dark:text-cyan-400 font-bold',
        },
        {
          id: 'decision-center',
          label: 'Decision Center',
          icon: BrainCircuit,
          badge: pendingRecs > 0 ? `${pendingRecs} Recs` : null,
          badgeColor: 'text-purple-700 dark:text-purple-400 font-bold',
        },
      ],
    },
    ...(currentUser.role === 'ADMIN' ? [{
      group: 'ADMINISTRATION',
      items: [
        {
          id: 'admin-settings',
          label: 'Admin Settings',
          icon: Shield,
          badge: 'RBAC',
          badgeColor: 'text-purple-700 dark:text-purple-400 font-bold',
        },
      ],
    }] : []),
  ];

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isTabAllowed(item.id, currentUser.role)),
    }))
    .filter((section) => section.items.length > 0);

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`w-64 border-r flex flex-col justify-between shrink-0 select-none shadow-sm transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile
            ? 'fixed inset-y-0 left-0 translate-x-0 top-[53px] h-[calc(100vh-53px)] h-[calc(100dvh-53px)] z-40'
            : 'fixed lg:sticky inset-y-0 left-0 -translate-x-full lg:translate-x-0 top-[53px] lg:top-0 h-[calc(100vh-53px)] lg:h-full z-40 lg:z-30'
        }`}
        style={{
          backgroundColor: 'var(--sidebar)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Navigation List grouped into clear sections */}
        <div className="py-3 px-2.5 overflow-y-auto space-y-4 flex-1 min-h-0">
          {visibleSections.map((section) => (
            <div key={section.group} className="space-y-1">
              <div
                className="px-2.5 pb-1 text-[10px] font-extrabold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                {section.group}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border"
                    style={{
                      backgroundColor: isActive
                        ? isDark
                          ? 'rgba(56, 189, 248, 0.12)'
                          : '#EFF6FF'
                        : 'transparent',
                      borderColor: isActive
                        ? isDark
                          ? 'rgba(56, 189, 248, 0.3)'
                          : '#93C5FD'
                        : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{
                          color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                        }}
                      />
                      <span className={`truncate ${isActive ? 'font-bold' : 'font-semibold'}`}>
                        {item.label}
                      </span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] ${item.badgeColor || ''}`}
                        style={{
                          color: item.badgeColor ? undefined : 'var(--text-muted)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div
          className="p-3 border-t space-y-2 shrink-0"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Quick Demo Stepper Trigger */}
          <button
            onClick={() => {
              onOpenWalkthrough();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#EEF2FF',
              borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : '#C7D2FE',
              color: isDark ? '#A5B4FC' : '#4338CA',
            }}
          >
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-indigo-500" />
              <span className="font-semibold">Interactive Demo Tour</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-semibold">
              15 Steps
            </span>
          </button>

          {/* Quick Help / Welcome Overview */}
          {onOpenWelcome && (
            <button
              onClick={() => {
                onOpenWelcome();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                <span>How It Works (2 min)</span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400">Guide</span>
            </button>
          )}

          {/* Priority Alert Quick View */}
          <button
            onClick={() => {
              onOpenAlerts();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
              <span>Priority Alerts</span>
            </div>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
              {activeAlerts} Active
            </span>
          </button>

          {/* User Profile & Role Switcher */}
          <button
            onClick={() => {
              if (onOpenUserSelection) onOpenUserSelection();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full pt-1.5 flex items-center justify-between p-2 rounded-xl border text-left transition-all hover:border-blue-400 cursor-pointer shadow-2xs group"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
            title="Click to switch active user role (Admin, Manager, HR)"
          >
            <div className="flex items-center gap-2 truncate">
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${currentUser.avatarBg}`}
              >
                {currentUser.initials}
              </div>
              <div className="truncate text-left leading-tight">
                <div className="text-xs font-bold truncate flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>
                  {currentUser.title}
                </div>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1">
              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${ROLE_CONFIGS[currentUser.role].badgeClass}`}>
                {currentUser.role}
              </span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
