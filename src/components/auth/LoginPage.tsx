import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Activity,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../services/authContext';
import { DEMO_USERS } from '../../types/auth';
import smartFactoryBg from '../../assets/images/smart_factory_bg_1790926457588.jpg';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = await login(identifier, password);
    if (!result.success && result.error) {
      setErrorMessage(result.error);
    }
  };

  const handleSelectDemoUser = (email: string) => {
    setIdentifier(email);
    setErrorMessage(null);
  };

  return (
    <div
      className="min-h-screen h-[100dvh] w-full flex flex-col justify-between text-slate-100 relative overflow-hidden select-none"
      style={{
        backgroundImage: `url(${smartFactoryBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >

      {/* Top Status Bar */}
      <header className="relative z-10 w-full px-5 py-4 flex items-center justify-between border-b border-[#1E293B]/70 backdrop-blur-md bg-[#0A1019]/60">
        <div className="flex items-center gap-3">
          <img
            src="/nova-command-logo.png"
            alt="NOVA COMMAND Logo"
            className="h-8 w-8 object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]"
          />
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-sm text-slate-200">
              NOVA COMMAND
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800/60">
              V1.0 ENTERPRISE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-slate-400 tracking-wide hidden sm:inline">
            CORE NETWORK: OPERATIONAL
          </span>
          <span className="font-mono text-[11px] text-emerald-400 font-semibold sm:hidden">
            ONLINE
          </span>
        </div>
      </header>

      {/* Centered Authentication Card Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* Card Container */}
          <div className="relative rounded-2xl border border-[#243044] bg-[#0D131D]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black/80">
            {/* Top Cyan Accent Line */}
            <div className="absolute inset-x-8 -top-px h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-80" />

            {/* Header Branding */}
            <div className="text-center space-y-2 mb-6">
              <div className="relative inline-block">
                <div className="absolute inset-0 rounded-2xl bg-sky-500/20 blur-xl" />
                <img
                  src="/nova-command-logo.png"
                  alt="NOVA COMMAND"
                  className="relative h-14 w-14 object-contain mx-auto drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
                  <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    NOVA COMMAND
                  </span>
                </h1>
                <p className="text-[11px] uppercase tracking-widest text-sky-400 font-semibold mt-1">
                  Manufacturing Operations Command Center
                </p>
              </div>

              {/* Welcome message */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141D2A] border border-[#243044] text-slate-300 text-xs mt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span>Secure access to your operations command center</span>
              </div>
            </div>

            {/* Validation Error Banner */}
            {errorMessage && (
              <div
                className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-shake"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User ID / Email Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="user-id-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  User ID / Corporate Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="user-id-input"
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. admin.user@novacommand.io or admin"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#243044] bg-[#070B12]/80 text-slate-100 placeholder-slate-500 text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password-input"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Security Password
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Encrypted Token
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#243044] bg-[#070B12]/80 text-slate-100 placeholder-slate-500 text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-500 hover:via-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Authorizing Session...</span>
                  </span>
                ) : (
                  <>
                    <span>Authenticate & Access Command Center</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Helper */}
            <div className="mt-6 pt-5 border-t border-[#1E293B] space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-slate-400">
                  Select Demo Profile:
                </span>
                <span className="text-[10px] text-sky-400 font-mono">1-CLICK FILL</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectDemoUser(u.email)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer text-xs ${
                      identifier === u.email
                        ? 'border-sky-500 bg-sky-950/40 text-sky-200'
                        : 'border-[#243044] bg-[#070B12]/60 text-slate-300 hover:border-slate-600 hover:bg-[#111927]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[11px] text-white">
                        {u.role}
                      </span>
                      {identifier === u.email && (
                        <CheckCircle2 className="h-3 w-3 text-sky-400" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {u.title.split(' ')[0]} {u.title.split(' ')[1] || ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance & Security Tag */}
          <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-sky-400" />
              <span>Role-Based Access Control</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-400" />
              <span>Telemetry Node v1.0</span>
            </div>
            <span>•</span>
            <span>Zero-Trust Architecture</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-5 py-3 border-t border-[#1E293B]/70 bg-[#0A1019]/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-1.5">
        <div>
          © 2026 NOVA COMMAND Operations Systems · Aerospace & Industrial Grade
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          <span>CONNECTED CASUAL GRAPH ENGINE</span>
        </div>
      </footer>
    </div>
  );
};
