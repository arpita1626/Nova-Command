import React from 'react';
import {
  X,
  Shield,
  Briefcase,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useManufacturingStore } from '../../services/manufacturingStore';
import { DEMO_USERS, ROLE_CONFIGS, AppUser, isTabAllowed } from '../../types/auth';

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSelectionModal: React.FC<UserSelectionModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchUser, activeTab, setActiveTab } = useManufacturingStore();

  if (!isOpen) return null;

  const handleSelectUser = (user: AppUser) => {
    switchUser(user.id);
    // If current tab is not allowed for the new role, automatically navigate to command center
    if (!isTabAllowed(activeTab, user.role)) {
      setActiveTab('command-center');
    }
    onClose();
  };

  const getRoleIcon = (role: AppUser['role']) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'MANAGER':
        return <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'HR':
        return <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div
        className="border rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-5 shadow-2xl relative"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
          aria-label="Close user selection"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-cyan-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                User Login & Role Switcher
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Select a demo user to inspect role-based access control and navigation rules
              </p>
            </div>
          </div>
        </div>

        {/* User Cards */}
        <div className="space-y-3">
          {DEMO_USERS.map((user) => {
            const isSelected = user.id === currentUser.id;
            const config = ROLE_CONFIGS[user.role];

            return (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'ring-2 ring-blue-500 shadow-md'
                    : 'hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs'
                }`}
                style={{
                  backgroundColor: isSelected
                    ? 'var(--surface-secondary)'
                    : 'var(--card)',
                  borderColor: isSelected
                    ? 'var(--accent)'
                    : 'var(--border)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${user.avatarBg}`}
                    >
                      {user.initials}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {user.name}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${config.badgeClass}`}>
                          {user.role}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                            Active Session
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {user.title} · <span className="text-slate-600 dark:text-slate-400 font-medium">{user.email}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed pt-1" style={{ color: 'var(--text-secondary)' }}>
                        {user.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pt-1">
                    {isSelected ? (
                      <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectUser(user);
                        }}
                        className="px-2.5 py-1 rounded-lg border text-xs font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors cursor-pointer"
                        style={{
                          backgroundColor: 'var(--surface-secondary)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissions quick pills */}
                <div className="mt-3 pt-2.5 border-t flex flex-wrap items-center gap-1.5 text-[10px]" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-slate-600 dark:text-slate-400 font-bold">Permitted:</span>
                  {config.allowedTabs.slice(0, 5).map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded font-mono capitalize"
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {t.replace('-', ' ')}
                    </span>
                  ))}
                  {config.allowedTabs.length > 5 && (
                    <span className="text-slate-600 dark:text-slate-400 font-medium">+{config.allowedTabs.length - 5} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          <span>Switching users dynamically updates navigation and enforces RBAC</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
