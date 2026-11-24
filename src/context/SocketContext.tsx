import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { NetworkFlow, Alert } from '../types.ts';

interface RealtimeUpdatePayload {
  flow?: NetworkFlow;
  device?: {
    id: string;
    riskScore: number;
    securityStatus: string;
    recentAlertsCount: number;
    lastSeen: string;
  };
  alert?: Alert | null;
}

interface SocketContextType {
  isConnected: boolean;
  latestFlow: NetworkFlow | null;
  latestAlert: Alert | null;
  recentFlows: NetworkFlow[];
  totalFlowsCount: number;
  threatsDetectedCount: number;
  threatsBlockedCount: number;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  latestFlow: null,
  latestAlert: null,
  recentFlows: [],
  totalFlowsCount: 0,
  threatsDetectedCount: 0,
  threatsBlockedCount: 0,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestFlow, setLatestFlow] = useState<NetworkFlow | null>(null);
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  const [recentFlows, setRecentFlows] = useState<NetworkFlow[]>([]);
  const [totalFlowsCount, setTotalFlowsCount] = useState(1284);
  const [threatsDetectedCount, setThreatsDetectedCount] = useState(48);
  const [threatsBlockedCount, setThreatsBlockedCount] = useState(19);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial fetch of recent flows
    fetch('/api/flows?limit=30')
      .then((r) => r.json())
      .then((d) => {
        if (d.flows && d.flows.length > 0) {
          setRecentFlows(d.flows);
        }
      })
      .catch((e) => console.error('Failed to load initial flows:', e));

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'TELEMETRY_FLOW') {
              const payload: RealtimeUpdatePayload = msg.data;
              if (payload.flow) {
                setLatestFlow(payload.flow);
                setRecentFlows((prev) => [payload.flow!, ...prev.slice(0, 39)]);
                setTotalFlowsCount((c) => c + 1);

                if (payload.flow.prediction?.attackClassification !== 'Normal') {
                  setThreatsDetectedCount((c) => c + 1);
                }
                if (payload.flow.prediction?.severity === 'Critical') {
                  setThreatsBlockedCount((c) => c + 1);
                }
              }
              if (payload.alert) {
                setLatestAlert(payload.alert);
              }
            }
          } catch (e) {
            console.error('Error handling socket message:', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Auto reconnect after 3s
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(connect, 4000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        latestFlow,
        latestAlert,
        recentFlows,
        totalFlowsCount,
        threatsDetectedCount,
        threatsBlockedCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
