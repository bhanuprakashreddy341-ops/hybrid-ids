import React from 'react';
import { AlertTriangle, ShieldCheck, AlertCircle, ShieldAlert } from 'lucide-react';
import { AlertSeverity, AttackClassification } from '../../types.ts';

interface RiskBadgeProps {
  score?: number; // 0 - 100
  severity?: AlertSeverity;
  classification?: AttackClassification;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, severity, classification }) => {
  if (score !== undefined) {
    let colorCls = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
    let Icon = ShieldCheck;
    let label = 'Low Risk';

    if (score >= 80) {
      colorCls = 'text-rose-400 bg-rose-950/40 border-rose-800/40';
      Icon = AlertCircle;
      label = 'Critical Risk';
    } else if (score >= 60) {
      colorCls = 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      Icon = AlertTriangle;
      label = 'High Risk';
    } else if (score >= 35) {
      colorCls = 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40';
      Icon = ShieldAlert;
      label = 'Elevated Risk';
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono tabular-nums font-medium rounded border ${colorCls}`}
      >
        <Icon className="w-3 h-3" />
        <span>{score}/100</span>
        <span className="text-[10px] opacity-75 font-sans">({label})</span>
      </span>
    );
  }

  if (severity) {
    const sevMap = {
      Critical: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
      High: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
      Medium: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40',
      Low: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${
          sevMap[severity] || sevMap.Low
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            severity === 'Critical'
              ? 'bg-rose-400 animate-pulse'
              : severity === 'High'
              ? 'bg-amber-400'
              : severity === 'Medium'
              ? 'bg-yellow-400'
              : 'bg-emerald-400'
          }`}
        />
        {severity}
      </span>
    );
  }

  if (classification) {
    const classMap = {
      Normal: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
      Suspicious: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
      Malicious: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${
          classMap[classification] || classMap.Normal
        }`}
      >
        {classification}
      </span>
    );
  }

  return null;
};
