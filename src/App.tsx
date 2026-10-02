/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandCenter } from './components/modules/CommandCenter';
import { ProductionPlanning } from './components/modules/ProductionPlanning';
import { FactoryFloor } from './components/modules/FactoryFloor';
import { MachinesTelemetry } from './components/modules/MachinesTelemetry';
import { Maintenance } from './components/modules/Maintenance';
import { Inventory } from './components/modules/Inventory';
import { Procurement } from './components/modules/Procurement';
import { Quality } from './components/modules/Quality';
import { Workforce } from './components/modules/Workforce';
import { OrdersDelivery } from './components/modules/OrdersDelivery';
import { WhatIfSimulator } from './components/modules/WhatIfSimulator';
import { DecisionCenter } from './components/modules/DecisionCenter';
import { Analytics } from './components/modules/Analytics';
import { AlertCenter } from './components/modules/AlertCenter';
import { AdminSettings } from './components/modules/AdminSettings';
import { ProductionPlannerDashboard } from './components/modules/ProductionPlannerDashboard';
import { QualityInspectorDashboard } from './components/modules/QualityInspectorDashboard';
import { AccessRestricted } from './components/common/AccessRestricted';
import { UserSelectionModal } from './components/common/UserSelectionModal';
import { DemoWalkthroughModal } from './components/common/DemoWalkthroughModal';
import { WelcomeModal } from './components/common/WelcomeModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { useManufacturingStore } from './services/manufacturingStore';
import { ThemeProvider, useTheme } from './services/themeContext';
import { AuthProvider, useAuth } from './services/authContext';
import { LoginPage } from './components/auth/LoginPage';
import { isTabAllowed } from './types/auth';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const { activeTab, toastMessage, currentUser } = useManufacturingStore();
  const { isDark } = useTheme();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserSelectionOpen, setIsUserSelectionOpen] = useState(false);

  // Expose optional window.novaLogout for tester convenience
  React.useEffect(() => {
    (window as any).novaLogout = logout;
    return () => {
      delete (window as any).novaLogout;
    };
  }, [logout]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveModule = () => {
    // Role-based Access Control enforcement
    if (!isTabAllowed(activeTab, currentUser.role)) {
      return (
        <AccessRestricted
          attemptedTab={activeTab}
          onOpenUserSelection={() => setIsUserSelectionOpen(true)}
        />
      );
    }

    switch (activeTab) {
      case 'command-center':
        if (currentUser.role === 'PRODUCTION_PLANNER') {
          return <ProductionPlannerDashboard />;
        }
        if (currentUser.role === 'QUALITY_INSPECTOR') {
          return <QualityInspectorDashboard />;
        }
        return <CommandCenter />;
      case 'production':
        return <ProductionPlanning />;
      case 'factory-floor':
        return <FactoryFloor />;
      case 'machines':
        return <MachinesTelemetry />;
      case 'maintenance':
        return <Maintenance />;
      case 'inventory':
        return <Inventory />;
      case 'procurement':
        return <Procurement />;
      case 'quality':
        return <Quality />;
      case 'corrective-actions':
        return <Quality initialSection="corrective-actions" />;
      case 'workforce':
        return <Workforce />;
      case 'orders':
        return <OrdersDelivery />;
      case 'what-if':
        return <WhatIfSimulator />;
      case 'decision-center':
        return <DecisionCenter />;
      case 'analytics':
        return <Analytics />;
      case 'admin-settings':
        return <AdminSettings />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <div
      className="h-screen h-[100dvh] flex flex-col font-sans transition-colors duration-250 overflow-hidden"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Header with Theme Switcher & Global Search */}
      <Header
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWelcome={() => setIsWelcomeOpen(true)}
        onOpenUserSelection={() => setIsUserSelectionOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Layout: Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left Navigation */}
        <Sidebar
          onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          onOpenWelcome={() => setIsWelcomeOpen(true)}
          onOpenUserSelection={() => setIsUserSelectionOpen(true)}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Primary Operational Workspace */}
        <main
          className="flex-1 overflow-y-auto min-h-0 px-4 lg:px-8 py-5"
          style={{ backgroundColor: 'var(--background)' }}
        >
          <div className="max-w-7xl mx-auto">{renderActiveModule()}</div>
        </main>
      </div>

      {/* Modals & Dialogs */}
      <AlertCenter isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
      <DemoWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
        onStartTour={() => {
          setIsWelcomeOpen(false);
          setIsWalkthroughOpen(true);
        }}
      />
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <UserSelectionModal
        isOpen={isUserSelectionOpen}
        onClose={() => setIsUserSelectionOpen(false)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-fade-in shadow-2xl">
          <div
            className="p-3.5 rounded-xl border flex items-center gap-3 backdrop-blur-md shadow-lg"
            style={{
              backgroundColor: toastMessage.type === 'success'
                ? isDark ? 'rgba(22, 101, 52, 0.95)' : '#DCFCE7'
                : toastMessage.type === 'warning'
                ? isDark ? 'rgba(120, 53, 15, 0.95)' : '#FEF3C7'
                : toastMessage.type === 'error'
                ? isDark ? 'rgba(153, 27, 27, 0.95)' : '#FEE2E2'
                : isDark ? 'rgba(30, 58, 138, 0.95)' : '#DBEAFE',
              borderColor: toastMessage.type === 'success'
                ? '#16A34A'
                : toastMessage.type === 'warning'
                ? '#D97706'
                : toastMessage.type === 'error'
                ? '#DC2626'
                : '#2563EB',
              color: toastMessage.type === 'success'
                ? isDark ? '#86EFAC' : '#14532D'
                : toastMessage.type === 'warning'
                ? isDark ? '#FDE68A' : '#78350F'
                : toastMessage.type === 'error'
                ? isDark ? '#FCA5A5' : '#7F1D1D'
                : isDark ? '#93C5FD' : '#1E3A8A',
            }}
          >
            {toastMessage.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />}
            {toastMessage.type === 'info' && <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />}
            <span className="text-xs font-semibold leading-snug">{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
