import React from 'react';
import {
  LayoutDashboard,
  AlertOctagon,
  HardDrive,
  BarChart2,
  Terminal,
  Cpu,
  FileText,
  BookOpen,
  Activity,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  criticalAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  criticalAlertCount,
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'alerts',
      label: 'Alert Log',
      icon: AlertOctagon,
      badge: criticalAlertCount > 0 ? criticalAlertCount : undefined,
    },
    { id: 'devices', label: 'Devices', icon: HardDrive },
    { id: 'analytics', label: 'Model Analytics', icon: BarChart2 },
    { id: 'prediction-tester', label: 'Prediction Tester', icon: Terminal },
    { id: 'training', label: 'Training', icon: Cpu },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
    { id: 'system-health', label: 'System Health', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-slate-800 bg-slate-950/60 flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono tracking-wider text-slate-500 uppercase">
          SOC NAVIGATION
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800/90 text-sky-400 border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hospital Node Identity Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/30 rounded mt-4">
        <div className="text-[11px] font-semibold text-slate-300">HeartGuard Node #1</div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Memorial Hospital DMZ</div>
        <div className="text-[10px] text-emerald-400/90 font-mono mt-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          Ensemble Active
        </div>
      </div>
    </aside>
  );
};
