import React, { useState } from 'react';
import {
  Shield,
  Users,
  Settings,
  UserCheck,
  Key,
  Lock,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { useTheme } from '../../services/themeContext';
import { UserRole, ROLE_CONFIGS, AppUser, DEMO_USERS } from '../../types/auth';

export const AdminSettings: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    updateUserRole,
    addUser,
    resetAllData,
  } = useManufacturingStore();

  const { isDark } = useTheme();

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('MANAGER');
  const [newUserTitle, setNewUserTitle] = useState('');
  const [newUserDept, setNewUserDept] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const initials = newUserName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const avatarColors: Record<UserRole, string> = {
      ADMIN: 'bg-purple-600 text-white',
      MANAGER: 'bg-blue-600 text-white',
      HR: 'bg-teal-600 text-white',
      PRODUCTION_PLANNER: 'bg-amber-600 text-white',
      QUALITY_INSPECTOR: 'bg-emerald-600 text-white',
    };

    addUser({
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      title: newUserTitle.trim() || `${newUserRole} Lead`,
      department: newUserDept.trim() || 'Operations',
      initials: initials || 'US',
      avatarBg: avatarColors[newUserRole],
      description: ROLE_CONFIGS[newUserRole].description,
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserTitle('');
    setNewUserDept('');
    setShowAddUserModal(false);
  };

  const sectionsList = [
    { name: 'Command Center', key: 'command-center', desc: 'Plant overview & live KPIs' },
    { name: 'Production Planning', key: 'production', desc: 'Gantt dispatch & operations' },
    { name: 'Factory Floor', key: 'factory-floor', desc: 'Shop floor line layout' },
    { name: 'Machines & Telemetry', key: 'machines', desc: 'Telemetry & sensor streams' },
    { name: 'Maintenance', key: 'maintenance', desc: 'Work order dispatch & parts' },
    { name: 'Inventory & Parts', key: 'inventory', desc: 'Stock buffers & ledger' },
    { name: 'Procurement', key: 'procurement', desc: 'Purchase orders & supplier transit' },
    { name: 'Workforce', key: 'workforce', desc: 'Technicians & shift workload' },
    { name: 'Quality Control', key: 'quality', desc: 'Inspections & scrap tracking' },
    { name: 'Orders & Delivery', key: 'orders', desc: 'Customer SLA & contracts' },
    { name: 'What-If Simulator', key: 'what-if', desc: 'Operational sandbox engine' },
    { name: 'Decision Center', key: 'decision-center', desc: 'AI recommendations & governance' },
    { name: 'Analytics & Cost', key: 'analytics', desc: 'Cost rollup & MTBF/MTTR' },
    { name: 'Admin & User Mgmt', key: 'admin-settings', desc: 'User accounts & RBAC policies' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Administrative Settings & User Management
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Configure team accounts, assign role-based access control (RBAC), and audit operational permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-xl border shadow-xs"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Total Registered Users</span>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {users.length}
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            3 Active Demo Roles
          </span>
        </div>

        <div
          className="p-4 rounded-xl border shadow-xs"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Access Policy Mode</span>
            <Key className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            Enforced
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            Strict RBAC on all modules
          </span>
        </div>

        <div
          className="p-4 rounded-xl border shadow-xs"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Your Active Session</span>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold mt-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>{currentUser.name}</span>
            <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${ROLE_CONFIGS[currentUser.role].badgeClass}`}>
              {currentUser.role}
            </span>
          </div>
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate block">
            {currentUser.title}
          </span>
        </div>
      </div>

      {/* User Management Table */}
      <div
        className="rounded-xl border shadow-xs overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Application Users & Role Assignments
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Change user roles dynamically or switch active demo sessions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className="text-[11px] uppercase font-bold tracking-wider border-b"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Permissions Scope</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                const roleConfig = ROLE_CONFIGS[u.role];

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors ${
                      isCurrent ? 'bg-purple-50/50 dark:bg-purple-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${u.avatarBg}`}>
                          {u.initials}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                        className={`text-xs font-bold uppercase px-2 py-1 rounded-md border cursor-pointer outline-none ${roleConfig.badgeClass}`}
                        style={{
                          backgroundColor: 'var(--card)',
                        }}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="HR">HR</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {u.department}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {roleConfig.description}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isCurrent ? (
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                          Active Session
                        </span>
                      ) : (
                        <button
                          onClick={() => switchUser(u.id)}
                          className="px-2.5 py-1 rounded-lg border text-xs font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors cursor-pointer"
                          style={{
                            backgroundColor: 'var(--surface-secondary)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          Switch to User
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Matrix */}
      <div
        className="rounded-xl border shadow-xs overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Lock className="h-4 w-4 text-blue-500" />
              Role Permissions & Access Matrix
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Defines exactly which functional areas are unlocked or restricted for each role
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className="text-[11px] uppercase font-bold tracking-wider border-b"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <tr>
                <th className="py-3 px-4">Section / Functional Area</th>
                <th className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded border bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800 font-extrabold">
                    ADMIN
                  </span>
                </th>
                <th className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded border bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800 font-extrabold">
                    MANAGER
                  </span>
                </th>
                <th className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded border bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-extrabold">
                    HR
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {sectionsList.map((sec) => {
                const adminAllowed = ROLE_CONFIGS.ADMIN.allowedTabs.includes(sec.key);
                const managerAllowed = ROLE_CONFIGS.MANAGER.allowedTabs.includes(sec.key);
                const hrAllowed = ROLE_CONFIGS.HR.allowedTabs.includes(sec.key);

                return (
                  <tr key={sec.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {sec.name}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{sec.desc}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {adminAllowed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Full Access</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                          <XCircle className="h-4 w-4" />
                          <span>Restricted</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {managerAllowed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Operational</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 font-semibold text-[11px]">
                          <XCircle className="h-4 w-4" />
                          <span>Restricted</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {hrAllowed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Permitted</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 font-semibold text-[11px]">
                          <XCircle className="h-4 w-4" />
                          <span>Restricted</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className="border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Add Team Member
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jordan@novacommand.io"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Assigned Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer font-bold"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Quality Assurance"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500"
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Production Supervisor"
                  value={newUserTitle}
                  onChange={(e) => setNewUserTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border font-semibold cursor-pointer"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-sm transition-all cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
