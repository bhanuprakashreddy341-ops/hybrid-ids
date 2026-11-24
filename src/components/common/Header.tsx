import React, { useState } from 'react';
import { Shield, Radio, User, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useSocket } from '../../context/SocketContext.tsx';
import { UserRole } from '../../types.ts';

interface HeaderProps {
  currentTab: string;
}

export const Header: React.FC<HeaderProps> = ({ currentTab }) => {
  const { currentUser, allUsers, switchUser } = useAuth();
  const { isConnected } = useSocket();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap">
            HEARTGUARD IDS
          </span>
        </div>

        <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
          /
        </span>
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider hidden sm:inline">
          {currentTab.replace('-', ' ')}
        </span>
      </div>

      {/* Zone 2: Real-time telemetry status */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span>{isConnected ? 'LIVE TELEMETRY STREAM' : 'SOCKET RECONNECTING'}</span>
        </div>
        <span className="text-slate-700" aria-hidden="true">
          ·
        </span>
        <span className="text-slate-400">IoMT CLINICAL NET</span>
        <span className="text-slate-700" aria-hidden="true">
          ·
        </span>
        <span className="text-sky-400">HYBRID ML v1.0</span>
      </div>

      {/* Zone 3: User Role Switcher & Account */}
      <div className="relative">
        <button
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-xs text-slate-200 transition-colors"
          aria-expanded={showRoleMenu}
        >
          <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <User className="w-3 h-3" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="font-medium text-slate-200 leading-none">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{currentUser.role}</div>
          </div>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {showRoleMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
            <div className="px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
              Switch Security Persona:
            </div>
            {allUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  switchUser(user.role);
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                  currentUser.role === user.role ? 'text-sky-400 bg-sky-500/5' : 'text-slate-300'
                }`}
              >
                <div>
                  <div className="font-medium">{user.role}</div>
                  <div className="text-[10px] text-slate-400">{user.name}</div>
                </div>
                {currentUser.role === user.role && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
