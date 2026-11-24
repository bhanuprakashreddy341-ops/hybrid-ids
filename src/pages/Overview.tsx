import React from 'react';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  HardDrive,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard.tsx';
import { RiskBadge } from '../components/common/RiskBadge.tsx';
import { StatusIndicator } from '../components/common/StatusIndicator.tsx';
import { useSocket } from '../context/SocketContext.tsx';
import { HealthcareDevice, Alert, NetworkFlow } from '../types.ts';

interface OverviewProps {
  devices: HealthcareDevice[];
  alerts: Alert[];
  onNavigate: (tab: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  devices,
  alerts,
  onNavigate,
  onAcknowledgeAlert,
}) => {
  const {
    totalFlowsCount,
    threatsDetectedCount,
    threatsBlockedCount,
    recentFlows,
    isConnected,
  } = useSocket();

  const onlineDevicesCount = devices.filter((d) => d.connectionStatus === 'online').length;
  const criticalAlertsCount = alerts.filter(
    (a) => a.severity === 'Critical' && a.status === 'New'
  ).length;

  // Aggregate network risk score
  const avgDeviceRisk = Math.round(
    devices.reduce((acc, d) => acc + d.riskScore, 0) / (devices.length || 1)
  );

  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top SOC Banner with Architectural Visualization */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900/60 p-6">
        <div className="absolute inset-0 opacity-15 mix-blend-luminosity pointer-events-none">
          <img
            src="/src/assets/images/heartguard_soc_header_1791296802970.jpg"
            alt="HeartGuard SOC operations center"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 uppercase tracking-wider">
              <span>HEARTGUARD IDS v1.0</span>
              <span className="text-slate-600">/</span>
              <span>B.E. MAJOR PROJECT DEFENSE</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
              INTRUSION DETECTION – OVERVIEW
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time hybrid machine learning intrusion detection system monitoring 10 connected
              Internet of Medical Things (IoMT) devices across clinical hospital subnets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('prediction-tester')}
              className="px-3.5 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded border border-sky-400/30 transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Test Flow Vector
            </button>
            <button
              onClick={() => onNavigate('training')}
              className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              Retrain Models
            </button>
          </div>
        </div>
      </div>

      {/* 7 MAIN DASHBOARD CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard
          label="Total Flows"
          value={totalFlowsCount.toLocaleString()}
          subtext="Analyzed packets"
          icon={Activity}
          highlightColor="sky"
        />
        <MetricCard
          label="Threats Detected"
          value={threatsDetectedCount}
          subtext="Hybrid ML alerts"
          icon={AlertTriangle}
          highlightColor="amber"
        />
        <MetricCard
          label="Threats Blocked"
          value={threatsBlockedCount}
          subtext="Simulated sandbox"
          icon={ShieldAlert}
          highlightColor="rose"
        />
        <MetricCard
          label="Hybrid Model Acc."
          value="98.42%"
          subtext="CICIDS2017 Benchmark"
          icon={ShieldCheck}
          highlightColor="emerald"
        />
        <MetricCard
          label="Devices Online"
          value={`${onlineDevicesCount} / ${devices.length}`}
          subtext="IoMT telemetry active"
          icon={HardDrive}
          highlightColor="sky"
        />
        <MetricCard
          label="Critical Alerts"
          value={criticalAlertsCount}
          subtext="Requiring immediate triage"
          icon={AlertTriangle}
          highlightColor="rose"
        />
        <MetricCard
          label="Network Risk"
          value={`${avgDeviceRisk}/100`}
          subtext="Adaptive hospital risk"
          icon={TrendingUp}
          highlightColor={avgDeviceRisk > 60 ? 'rose' : avgDeviceRisk > 35 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Center Grid: Live Network Activity & Threat Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Network Flow Activity */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Live Network Flow Telemetry</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time feature extraction and 6-model hybrid classification stream
              </p>
            </div>
            <button
              onClick={() => onNavigate('prediction-tester')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              <span>Inspect Manual Vector</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/60 font-mono">
                  <th className="py-2 px-2">Time</th>
                  <th className="py-2 px-2">Device / Source</th>
                  <th className="py-2 px-2">Proto</th>
                  <th className="py-2 px-2">Dst Port</th>
                  <th className="py-2 px-2">Rate (pkts/s)</th>
                  <th className="py-2 px-2">Hybrid Threat</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {recentFlows.slice(0, 7).map((flow) => {
                  const score = flow.prediction ? Math.round(flow.prediction.finalHybridScore * 100) : 10;
                  const classification = flow.prediction?.attackClassification || 'Normal';
                  return (
                    <tr key={flow.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-2 text-slate-400 tabular-nums">
                        {flow.timestamp.substring(11, 19)}
                      </td>
                      <td className="py-2.5 px-2 font-sans font-medium text-slate-200 truncate max-w-[150px]">
                        {flow.deviceName || flow.sourceIp}
                      </td>
                      <td className="py-2.5 px-2 text-sky-400">{flow.protocol}</td>
                      <td className="py-2.5 px-2 text-slate-300 tabular-nums">
                        {flow.destinationPort}
                      </td>
                      <td className="py-2.5 px-2 text-slate-300 tabular-nums">
                        {flow.flowPacketsPerSec}
                      </td>
                      <td className="py-2.5 px-2">
                        <RiskBadge score={score} />
                      </td>
                      <td className="py-2.5 px-2 font-sans">
                        <RiskBadge classification={classification} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Threat Classification Distribution & Models */}
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-100 mb-1">
              Hybrid Classification Engine
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Weighted consensus voting across 6 detection algorithms
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Random Forest (Gini Bagging)</span>
                  <span className="text-sky-400 font-bold">w = 0.25</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Support Vector Machine (Platt)</span>
                  <span className="text-indigo-400 font-bold">w = 0.15</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>XGBoost (Residual Gradient)</span>
                  <span className="text-emerald-400 font-bold">w = 0.25</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '25%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>CNN-MLP (1D Conv Layer)</span>
                  <span className="text-amber-400 font-bold">w = 0.15</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>LSTM-MLP (Recurrent Gating)</span>
                  <span className="text-purple-400 font-bold">w = 0.10</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '10%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Isolation Forest (Anomaly Depth)</span>
                  <span className="text-rose-400 font-bold">w = 0.10</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Decision Boundary:</span>
              <span className="font-mono text-slate-200">
                Suspicious: 0.40 | Malicious: 0.75
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Alerts & Healthcare Device Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Recent Security Alerts</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest anomalies flagged by hybrid detection
              </p>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
            >
              <span>View All Alerts</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            {recentAlerts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No active threats recorded. Hospital network is operating within baseline bounds.
              </div>
            ) : (
              recentAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3 rounded border border-slate-800/90 bg-slate-900/40 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <RiskBadge severity={alt.severity} />
                      <span className="text-xs font-semibold text-slate-200">
                        {alt.attackType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Target: <span className="text-slate-300">{alt.device}</span> ({alt.source} &rarr; {alt.destination})
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                      Threat Score: {alt.threatScore}% · Confidence: {alt.confidence}% · {alt.timestamp.substring(11, 19)}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {alt.status === 'New' && (
                      <button
                        onClick={() => onAcknowledgeAlert(alt.id)}
                        className="px-2.5 py-1 text-[11px] font-medium text-sky-400 hover:bg-sky-500/10 rounded border border-sky-500/30 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">
                      {alt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Connected Medical Devices Risk Overview */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Connected Medical Devices Risk Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuous telemetry monitoring for 10 clinical hospital assets
              </p>
            </div>
            <button
              onClick={() => onNavigate('devices')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
            >
              <span>Manage Devices</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {devices.slice(0, 6).map((device) => (
              <div
                key={device.id}
                className="p-2.5 rounded border border-slate-800/80 bg-slate-900/40 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {device.name}
                  </span>
                  <StatusIndicator status={device.connectionStatus} size="sm" />
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{device.department}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono">
                  <span className="text-slate-400">IP: {device.ipAddress}</span>
                  <RiskBadge score={device.riskScore} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
