import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { SocketProvider, useSocket } from './context/SocketContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { Overview } from './pages/Overview.tsx';
import { AlertLog } from './pages/AlertLog.tsx';
import { Devices } from './pages/Devices.tsx';
import { ModelAnalytics } from './pages/ModelAnalytics.tsx';
import { PredictionTester } from './pages/PredictionTester.tsx';
import { Training } from './pages/Training.tsx';
import { AuditLogs } from './pages/AuditLogs.tsx';
import { Methodology } from './pages/Methodology.tsx';
import { SystemHealth } from './pages/SystemHealth.tsx';
import { Settings } from './pages/Settings.tsx';
import { HealthcareDevice, Alert } from './types.ts';

function MainDashboard() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [devices, setDevices] = useState<HealthcareDevice[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { latestAlert } = useSocket();

  const fetchDevices = () => {
    fetch('/api/devices')
      .then((r) => r.json())
      .then((d) => {
        if (d.devices) setDevices(d.devices);
      })
      .catch((e) => console.error('Failed to load devices:', e));
  };

  const fetchAlerts = () => {
    fetch('/api/alerts')
      .then((r) => r.json())
      .then((d) => {
        if (d.alerts) setAlerts(d.alerts);
      })
      .catch((e) => console.error('Failed to load alerts:', e));
  };

  useEffect(() => {
    fetchDevices();
    fetchAlerts();
    const interval = setInterval(() => {
      fetchDevices();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Sync new real-time alerts
  useEffect(() => {
    if (latestAlert) {
      setAlerts((prev) => {
        if (prev.some((a) => a.id === latestAlert.id)) return prev;
        return [latestAlert, ...prev];
      });
      fetchDevices();
    }
  }, [latestAlert]);

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/acknowledge`, { method: 'POST' });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'Acknowledged' } : a))
        );
      }
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    }
  };

  const handleResolveAlert = async (id: string, note: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'Resolved', resolutionNote: note } : a))
        );
        fetchDevices();
      }
    } catch (e) {
      console.error('Failed to resolve alert:', e);
    }
  };

  const handleIsolateDevice = async (deviceId: string, reason: string) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/isolate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        fetchDevices();
      }
    } catch (e) {
      console.error('Failed to isolate device:', e);
    }
  };

  const handleRestoreDevice = async (deviceId: string) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/restore`, { method: 'POST' });
      if (res.ok) {
        fetchDevices();
      }
    } catch (e) {
      console.error('Failed to restore device:', e);
    }
  };

  const handleUpdateMonitoring = async (
    deviceId: string,
    level: 'standard' | 'elevated' | 'quarantined'
  ) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/monitoring-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
      if (res.ok) {
        fetchDevices();
      }
    } catch (e) {
      console.error('Failed to update monitoring:', e);
    }
  };

  const criticalAlertCount = alerts.filter(
    (a) => a.severity === 'Critical' && a.status === 'New'
  ).length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      <Header currentTab={currentTab} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          criticalAlertCount={criticalAlertCount}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'overview' && (
              <Overview
                devices={devices}
                alerts={alerts}
                onNavigate={setCurrentTab}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            )}

            {currentTab === 'alerts' && (
              <AlertLog
                alerts={alerts}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
              />
            )}

            {currentTab === 'devices' && (
              <Devices
                devices={devices}
                onIsolate={handleIsolateDevice}
                onRestore={handleRestoreDevice}
                onUpdateMonitoring={handleUpdateMonitoring}
              />
            )}

            {currentTab === 'analytics' && (
              <ModelAnalytics onNavigateTraining={() => setCurrentTab('training')} />
            )}

            {currentTab === 'prediction-tester' && <PredictionTester />}

            {currentTab === 'training' && <Training />}

            {currentTab === 'audit-logs' && <AuditLogs />}

            {currentTab === 'methodology' && <Methodology />}

            {currentTab === 'system-health' && <SystemHealth />}

            {currentTab === 'settings' && <Settings />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainDashboard />
      </SocketProvider>
    </AuthProvider>
  );
}
