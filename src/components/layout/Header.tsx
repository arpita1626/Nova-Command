import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  Search,
  Menu,
  HelpCircle,
  Users,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { ROLE_CONFIGS } from '../../types/auth';

interface HeaderProps {
  onOpenWalkthrough: () => void;
  onOpenAlerts: () => void;
  onOpenSearch: () => void;
  onOpenWelcome: () => void;
  onOpenUserSelection?: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenWalkthrough,
  onOpenAlerts,
  onOpenSearch,
  onOpenWelcome,
  onOpenUserSelection,
  onToggleMobileMenu,
}) => {
  const {
    machines,
    orders,
    alerts,
    demoStep,
    committedPlanVersion,
    plantShift,
    resetAllData,
    currentUser,
    isBackendConnected,
    backendError,
  } = useManufacturingStore();

  const { isDark, toggleTheme } = useTheme();

  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour12: false })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const criticalAlertsCount = alerts.filter((a) => a.priority === 'critical' && a.status === 'active').length;
  const highAlertsCount = alerts.filter((a) => a.priority === 'high' && a.status === 'active').length;
  const ordersAtRiskCount = orders.filter((o) => o.deliveryRisk === 'high').length;
  const hasMachineWarning = machines.some((m) => m.status === 'warning' || m.status === 'critical');

  return (
    <header
      className="sticky top-0 z-40 px-3 sm:px-5 py-2.5 border-b shadow-xs backdrop-blur-md shrink-0"
      style={{
        backgroundColor: 'var(--header)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Mobile Hamburger + Branding */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg border text-slate-700 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <img
            src="/nova-command-logo.png"
            alt="NOVA COMMAND Logo"
            className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                NOVA COMMAND
              </h1>
              <span
                className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded border hidden sm:inline"
                style={{
                  backgroundColor: 'var(--info-bg)',
                  color: 'var(--info-text)',
                  borderColor: 'var(--border)',
                }}
              >
                PROTOTYPE ESTIMATE
              </span>
              <span className="text-[11px] hidden md:inline font-medium" style={{ color: 'var(--text-secondary)' }}>
                · Plan V{committedPlanVersion}.0
              </span>
            </div>
            <p className="text-[11px] font-medium hidden sm:block truncate max-w-[280px] md:max-w-none" style={{ color: 'var(--text-secondary)' }}>
              Manufacturing Operations Command Center
            </p>
          </div>
        </div>

        {/* Global Search Bar Button (Middle) */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100 transition-all cursor-pointer max-w-[220px] sm:max-w-xs w-full shadow-2xs font-semibold"
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
          title="Search machines, orders, employees, work orders, inventory (⌘K)"
        >
          <Search className="h-3.5 w-3.5 text-blue-700 dark:text-cyan-400 shrink-0" />
          <span className="truncate text-left flex-1 text-slate-700 dark:text-slate-300 font-medium">Search factory...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded border bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-400 dark:border-slate-700 font-bold">
            ⌘K
          </kbd>
        </button>

        {/* Right: Plant Info, Tour, Theme Switcher, Alerts */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Plant status pill (hidden on mobile) */}
          <div
            className="hidden xl:flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border shadow-xs"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                hasMachineWarning ? 'bg-amber-500 animate-pulse-amber' : 'bg-emerald-500'
              }`}
            />
            <span className="font-semibold text-[11px]" style={{ color: 'var(--text-primary)' }}>
              {hasMachineWarning ? 'Line 2 Advisory' : 'All Lines Nominal'}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                isBackendConnected
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/40'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/40'
              }`}
              title={isBackendConnected ? 'Connected to live SQLite backend API' : backendError || 'Backend disconnected'}
            >
              {isBackendConnected ? 'DB LIVE' : 'DB OFFLINE'}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>{currentTime}</span>
          </div>

          {/* Quick Help / 2-minute Guide */}
          <button
            onClick={onOpenWelcome}
            className="p-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            title="How NOVA COMMAND works (2-minute beginner guide)"
          >
            <HelpCircle className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
          </button>

          {/* THEME TOGGLE (Light / Dark) */}
          <div
            className="flex items-center p-0.5 rounded-lg border"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <button
              onClick={() => toggleTheme()}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                !isDark
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Light Mode"
            >
              <Sun className={`h-3 w-3 ${!isDark ? 'text-amber-600 fill-amber-500' : ''}`} />
              <span className="text-[10px] hidden md:inline font-bold">Light</span>
            </button>
            <button
              onClick={() => toggleTheme()}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 text-sky-400 shadow-sm border border-slate-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Dark Mode"
            >
              <Moon className={`h-3 w-3 ${isDark ? 'text-sky-400 fill-sky-400' : ''}`} />
              <span className="text-[10px] hidden md:inline">Dark</span>
            </button>
          </div>

          {/* Demo Flow Stepper Trigger */}
          <button
            onClick={onOpenWalkthrough}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm transition-all cursor-pointer"
            title="Open 15-step Hackathon Live Demo Flow"
          >
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span className="hidden sm:inline">Demo:</span>
            <span>Step {demoStep}/15</span>
          </button>

          {/* User Role Switcher Pill */}
          {onOpenUserSelection && (
            <button
              onClick={onOpenUserSelection}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all hover:border-blue-400 shadow-2xs"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
              title={`Active User: ${currentUser.name} (${currentUser.role}). Click to switch user/role.`}
            >
              <div
                className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold ${currentUser.avatarBg}`}
              >
                {currentUser.initials}
              </div>
              <span className="hidden xl:inline font-bold truncate max-w-[100px]">
                {currentUser.name}
              </span>
              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${ROLE_CONFIGS[currentUser.role].badgeClass}`}>
                {currentUser.role}
              </span>
            </button>
          )}

          {/* Priority Alerts Trigger */}
          <button
            onClick={onOpenAlerts}
            className="relative flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-medium"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
            <span className="hidden md:inline">Alerts</span>
            {(criticalAlertsCount > 0 || highAlertsCount > 0) && (
              <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                {criticalAlertsCount + highAlertsCount}
              </span>
            )}
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data back to initial baseline?')) {
                resetAllData();
              }
            }}
            className="p-1.5 rounded-lg border transition-colors cursor-pointer text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
            }}
            title="Reset Seed Demo Data"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
