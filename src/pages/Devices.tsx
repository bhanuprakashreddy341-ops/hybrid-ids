import React, { useState } from 'react';
import {
  HardDrive,
  Shield,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Sliders,
  CheckCircle,
  Wifi,
  WifiOff,
  Info,
} from 'lucide-react';
import { StatusIndicator } from '../components/common/StatusIndicator.tsx';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { HealthcareDevice } from '../types.ts';

interface DevicesProps {
  devices: HealthcareDevice[];
  onIsolate: (deviceId: string, reason: string) => void;
  onRestore: (deviceId: string) => void;
  onUpdateMonitoring: (deviceId: string, level: 'standard' | 'elevated' | 'quarantined') => void;
}

export const Devices: React.FC<DevicesProps> = ({
  devices,
  onIsolate,
  onRestore,
  onUpdateMonitoring,
}) => {
  const { canModifyDevices } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState<HealthcareDevice | null>(null);
  const [isolatingDevice, setIsolatingDevice] = useState<HealthcareDevice | null>(null);
  const [isolationReason, setIsolationReason] = useState('Anomalous telemetry flow pattern (Simulated testbed quarantine)');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const departments = Array.from(new Set(devices.map((d) => d.department)));

  const filteredDevices = devices.filter((d) => {
    if (filterDepartment !== 'all' && d.department !== filterDepartment) return false;
    return true;
  });

  const handleConfirmIsolation = (e: React.FormEvent) => {
    e.preventDefault();
    if (isolatingDevice) {
      onIsolate(isolatingDevice.id, isolationReason);
      setIsolatingDevice(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Safety Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-sky-400 uppercase tracking-wider">
            CONNECTED HEALTHCARE NETWORK
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Medical Device Inventory & Risk Assessment
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            10 monitored clinical endpoints with active telemetry and simulated safe response controls
          </p>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Department:</span>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-sans"
          >
            <option value="all">All Hospital Units</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3.5 bg-sky-950/30 border border-sky-800/40 rounded-lg flex items-start gap-3">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <span className="font-semibold text-sky-300">Simulated IoMT Sandbox Safety Protocol:</span>{' '}
          All 10 monitored healthcare assets below are configured in a simulated sandbox telemetry
          environment. Per safety requirements, device isolation and blocking actions operate
          exclusively on simulated software flows and will never disrupt physical clinical care
          or medical machinery.
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => {
          const isCompromised = device.securityStatus === 'compromised';
          const isSuspicious = device.securityStatus === 'suspicious';
          const isIsolated = device.connectionStatus === 'isolated';

          return (
            <div
              key={device.id}
              className={`p-4 rounded-lg border transition-all bg-slate-900/80 ${
                isIsolated
                  ? 'border-purple-600/40 bg-purple-950/10'
                  : isCompromised
                  ? 'border-rose-600/50 hover:border-rose-500'
                  : isSuspicious
                  ? 'border-amber-600/40 hover:border-amber-500'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100">{device.name}</span>
                  </div>
                  <div className="text-[11px] text-sky-400 font-mono mt-0.5">
                    {device.type}
                    <span className="text-slate-600 mx-1">·</span>
                    <span className="text-slate-400">{device.department}</span>
                  </div>
                </div>

                <StatusIndicator status={device.connectionStatus} size="sm" />
              </div>

              {/* Specs & Identifiers */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block text-[10px]">IP ADDRESS</span>
                  <span className="text-slate-200">{device.ipAddress}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">MAC ADDRESS</span>
                  <span className="text-slate-200">{device.macAddress}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">LOCATION</span>
                  <span className="text-slate-200 truncate">{device.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">FIRMWARE</span>
                  <span className="text-slate-200">{device.firmwareVersion}</span>
                </div>
              </div>

              {/* Telemetry Stats */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">RISK SCORE</span>
                  <RiskBadge score={device.riskScore} />
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-500 block">TRAFFIC RATE</span>
                  <span className="text-slate-200 tabular-nums">
                    {device.packetsPerSecond} pkts/s
                  </span>
                </div>
              </div>

              {/* Security Status and Recent Alerts */}
              <div className="mt-2 text-[11px] flex items-center justify-between text-slate-400 font-mono">
                <span>Recent Alerts: <strong className="text-slate-200">{device.recentAlertsCount}</strong></span>
                <span className="text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300">
                  SIMULATED DEVICE
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-1">
                {isIsolated ? (
                  <button
                    disabled={!canModifyDevices}
                    onClick={() => onRestore(device.id)}
                    className="w-full py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 rounded border border-emerald-500/30 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore Sandbox Connection
                  </button>
                ) : (
                  <>
                    <button
                      disabled={!canModifyDevices}
                      onClick={() =>
                        onUpdateMonitoring(
                          device.id,
                          device.monitoringLevel === 'elevated' ? 'standard' : 'elevated'
                        )
                      }
                      className="px-2.5 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors disabled:opacity-50"
                      title="Adjust telemetry polling frequency"
                    >
                      {device.monitoringLevel === 'elevated' ? 'Elevated' : 'Standard'} Poll
                    </button>

                    <button
                      disabled={!canModifyDevices}
                      onClick={() => setIsolatingDevice(device)}
                      className="px-2.5 py-1 text-[11px] font-medium text-rose-400 hover:bg-rose-500/10 rounded border border-rose-500/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                      title="Isolate simulated flow"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      Isolate Sandbox
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Isolation Confirmation Modal */}
      <Modal
        isOpen={!!isolatingDevice}
        onClose={() => setIsolatingDevice(null)}
        title="Simulated Device Isolation Protocol"
        subtitle={`Quarantine ${isolatingDevice?.name} (${isolatingDevice?.ipAddress})`}
      >
        <form onSubmit={handleConfirmIsolation} className="space-y-4">
          <div className="p-3 rounded bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Safety Verification
            </div>
            <p className="mt-1 text-slate-300">
              Isolation will divert simulated network packets from this asset to an isolated
              black-hole honeynet for deep packet forensics. As a software simulation, this
              action has zero effect on hospital patient care equipment.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Quarantine Justification:
            </label>
            <input
              type="text"
              required
              value={isolationReason}
              onChange={(e) => setIsolationReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsolatingDevice(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded border border-rose-400/30 transition-colors"
            >
              Execute Simulated Isolation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
