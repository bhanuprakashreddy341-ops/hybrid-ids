import React from 'react';
import { ConnectionStatus, SecurityStatus } from '../../types.ts';

interface StatusIndicatorProps {
  status: ConnectionStatus | SecurityStatus | 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const isOnline = status === 'online' || status === 'ONLINE' || status === 'secure';
  const isDegraded = status === 'degraded' || status === 'DEGRADED' || status === 'suspicious';
  const isOffline = status === 'offline' || status === 'OFFLINE' || status === 'compromised';
  const isIsolated = status === 'isolated';

  let dotColor = 'bg-emerald-400';
  let textColor = 'text-emerald-400';
  let text = label || String(status).toUpperCase();

  if (isIsolated) {
    dotColor = 'bg-purple-400';
    textColor = 'text-purple-400';
    text = label || 'ISOLATED';
  } else if (isOffline) {
    dotColor = 'bg-rose-400';
    textColor = 'text-rose-400';
    text = label || (status === 'compromised' ? 'COMPROMISED' : 'OFFLINE');
  } else if (isDegraded) {
    dotColor = 'bg-amber-400';
    textColor = 'text-amber-400';
    text = label || (status === 'suspicious' ? 'SUSPICIOUS' : 'DEGRADED');
  }

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium ${textColor}`}>
      <span className={`${dotSize} rounded-full ${dotColor} ${isDegraded || isOffline ? 'animate-pulse' : ''}`} />
      <span>{text}</span>
    </span>
  );
};
