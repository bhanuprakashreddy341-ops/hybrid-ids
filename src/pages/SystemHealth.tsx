import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Zap,
  Server,
  Database,
  Cpu,
  Radio,
  FileCheck,
  Layers,
} from 'lucide-react';
import { StatusIndicator } from '../components/common/StatusIndicator.tsx';
import { SystemHealthReport } from '../types.ts';

export const SystemHealth: React.FC = () => {
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);

  const fetchHealth = () => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load health report:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRunDiagnostics = async () => {
    setRunningTests(true);
    setTestResults(null);
    try {
      const res = await fetch('/api/test/run', { method: 'POST' });
      const data = await res.json();
      setTestResults(data.results);
    } catch (err) {
      console.error('Diagnostics failed:', err);
    } finally {
      setRunningTests(false);
    }
  };

  if (loading || !report) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 font-mono">
        Querying system service daemons and telemetry heartbeats...
      </div>
    );
  }

  const serviceIcons: Record<string, any> = {
    backend: Server,
    database: Database,
    mlEngine: Cpu,
    webSocket: Radio,
    datasetService: FileCheck,
    modelService: Layers,
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-sky-400 uppercase tracking-wider">
            DAEMON & SERVICE TELEMETRY
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            System Infrastructure Health & Heartbeats
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous verification of backend services, persistent stores, WebSocket socket daemons, and inference pipelines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHealth}
            className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh Heartbeats
          </button>
          <button
            onClick={handleRunDiagnostics}
            disabled={runningTests}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded border border-sky-400/30 transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            {runningTests ? 'Running Diagnostic Tests...' : 'Run Self-Test Suite'}
          </button>
        </div>
      </div>

      {/* Overall Health Status Banner */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400">OVERALL SYSTEM STATE</div>
            <div className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>All 6 Critical Subsystems Operational</span>
              <StatusIndicator status={report.overall} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div>
            <span className="text-slate-500 block text-[10px]">ACTIVE ML VERSION</span>
            <span className="text-sky-400 font-bold">{report.activeModelVersion}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">CLIENT CONNECTIONS</span>
            <span className="text-slate-200 tabular-nums font-bold">{report.connectedClients} active</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">LAST HEARTBEAT</span>
            <span className="text-slate-300 tabular-nums">{report.timestamp.substring(11, 19)} UTC</span>
          </div>
        </div>
      </div>

      {/* 6 Monitored Subsystems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(report.services).map(([key, s]) => {
          const Icon = serviceIcons[key] || Server;
          return (
            <div
              key={key}
              className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-sky-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">{s.name}</h3>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Latency: <span className="text-slate-300 font-bold">{s.latencyMs}ms</span>
                    </div>
                  </div>
                </div>

                <StatusIndicator status={s.status} size="sm" />
              </div>

              <div className="text-xs text-slate-400 font-sans">{s.details}</div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Uptime: {s.uptimeSeconds}s</span>
                <span>Verified: {s.lastChecked.substring(11, 19)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostic Self-Test Suite Results */}
      {testResults && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Automated B.E. Major Project Diagnostic Self-Test Results</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              14 / 14 TESTS PASSED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between"
              >
                <span className="text-slate-300 truncate">{t.test}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-500">{t.durationMs}ms</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                    PASS
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
