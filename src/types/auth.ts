/**
 * User Roles and Access Control Types
 */

export type UserRole = 'ADMIN' | 'MANAGER' | 'HR' | 'PRODUCTION_PLANNER' | 'QUALITY_INSPECTOR';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  initials: string;
  department: string;
  avatarBg: string;
  description: string;
}

export const DEMO_USERS: AppUser[] = [
  {
    id: 'user-admin',
    name: 'Admin User',
    email: 'admin.user@novacommand.io',
    role: 'ADMIN',
    title: 'System Administrator & Plant Director',
    initials: 'AU',
    department: 'Executive Operations',
    avatarBg: 'bg-purple-600 text-white',
    description: 'Full access to all application modules, data, configurations, and user management.',
  },
  {
    id: 'user-manager',
    name: 'Manager User',
    email: 'manager.user@novacommand.io',
    role: 'MANAGER',
    title: 'Operations & Production Manager',
    initials: 'MU',
    department: 'Shop Floor Operations',
    avatarBg: 'bg-blue-600 text-white',
    description: 'Access to operational modules: Command Center, Production, Factory Floor, Machines, Maintenance, Inventory, Procurement, Analytics.',
  },
  {
    id: 'user-planner',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@novacommand.io',
    role: 'PRODUCTION_PLANNER',
    title: 'Lead Production Planner',
    initials: 'RS',
    department: 'Production Planning & Control',
    avatarBg: 'bg-amber-600 text-white',
    description: 'Manages production schedules, machine allocation, capacity, material readiness, and order priorities.',
  },
  {
    id: 'user-inspector',
    name: 'Priya Das',
    email: 'priya.das@novacommand.io',
    role: 'QUALITY_INSPECTOR',
    title: 'Senior Quality Inspector',
    initials: 'PD',
    department: 'Quality Assurance & Metrology',
    avatarBg: 'bg-emerald-600 text-white',
    description: 'Monitors inspections, defects, quality trends, SPC data, and corrective actions.',
  },
  {
    id: 'user-hr',
    name: 'HR User',
    email: 'hr.user@novacommand.io',
    role: 'HR',
    title: 'Human Resources & People Operations',
    initials: 'HR',
    department: 'Human Resources',
    avatarBg: 'bg-teal-600 text-white',
    description: 'Access to Command Center, Workforce, employee information, and HR analytics.',
  },
];

export interface RoleConfig {
  role: UserRole;
  label: string;
  badgeClass: string;
  description: string;
  allowedTabs: string[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  ADMIN: {
    role: 'ADMIN',
    label: 'ADMIN / MANAGER',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    description: 'Full administrative access across all system features and user management.',
    allowedTabs: [
      'command-center',
      'production',
      'factory-floor',
      'machines',
      'maintenance',
      'inventory',
      'procurement',
      'workforce',
      'quality',
      'orders',
      'what-if',
      'decision-center',
      'analytics',
      'admin-settings',
    ],
  },
  MANAGER: {
    role: 'MANAGER',
    label: 'MANAGER',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    description: 'Operational control across production, floor, equipment, inventory, procurement, and analytics.',
    allowedTabs: [
      'command-center',
      'production',
      'factory-floor',
      'machines',
      'maintenance',
      'inventory',
      'procurement',
      'workforce',
      'quality',
      'orders',
      'what-if',
      'decision-center',
      'analytics',
    ],
  },
  PRODUCTION_PLANNER: {
    role: 'PRODUCTION_PLANNER',
    label: 'PRODUCTION PLANNER',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    description: 'Manages production schedules, machine capacity, material readiness, What-If simulation, and order delivery.',
    allowedTabs: [
      'command-center',
      'production',
      'factory-floor',
      'machines',
      'orders',
      'inventory',
      'maintenance',
      'what-if',
      'decision-center',
      'analytics',
    ],
  },
  QUALITY_INSPECTOR: {
    role: 'QUALITY_INSPECTOR',
    label: 'QUALITY INSPECTOR',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    description: 'Monitors inspections, defects, quality trends, SPC data, and corrective actions.',
    allowedTabs: [
      'command-center',
      'quality',
      'factory-floor',
      'machines',
      'production',
      'orders',
      'corrective-actions',
      'analytics',
    ],
  },
  HR: {
    role: 'HR',
    label: 'HR',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-800',
    description: 'Access to Command Center, Workforce, and HR-related operational analytics.',
    allowedTabs: [
      'command-center',
      'workforce',
      'analytics',
    ],
  },
};

export function isTabAllowed(tabId: string, role: UserRole): boolean {
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  return config.allowedTabs.includes(tabId);
}
