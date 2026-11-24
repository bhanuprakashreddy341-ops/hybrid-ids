import { NetworkFlow, Alert, ProtocolType } from '../types.ts';
import { dbStore } from './db.ts';
import { mlEngineSingleton } from './ml/engine.ts';
import { evaluateHybridPrediction } from './ml/hybrid.ts';
import { FeatureVector } from './ml/algorithms.ts';

export type BroadcastFunction = (event: { type: string; data: any }) => void;

class HealthcareTelemetrySimulator {
  private timer: NodeJS.Timeout | null = null;
  private broadcaster: BroadcastFunction | null = null;
  private isRunning = false;

  public setBroadcaster(fn: BroadcastFunction): void {
    this.broadcaster = fn;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.scheduleNextTick();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNextTick(): void {
    if (!this.isRunning) return;
    const intervalSec = dbStore.settings.telemetrySimulation.frequencySeconds || 3;
    const jitterMs = (Math.random() - 0.5) * 800;
    const delay = Math.max(1200, intervalSec * 1000 + jitterMs);

    this.timer = setTimeout(() => {
      if (dbStore.settings.telemetrySimulation.enabled) {
        this.generateTick();
      }
      this.scheduleNextTick();
    }, delay);
  }

  public generateTick(): void {
    // Pick random active device
    const activeDevices = dbStore.devices.filter((d) => d.connectionStatus !== 'offline');
    if (activeDevices.length === 0) return;

    const device = activeDevices[Math.floor(Math.random() * activeDevices.length)];

    // Decide if this flow is simulated attack based on setting ratio
    const isAttack =
      Math.random() < dbStore.settings.telemetrySimulation.attackSimulationRatio &&
      device.connectionStatus !== 'isolated';

    const flow = this.createFlowForDevice(device, isAttack);

    // Run flow through ML Bundle
    try {
      const bundle = mlEngineSingleton.getActiveBundle();
      const featureVector = this.extractFeatureVector(flow);

      const prediction = evaluateHybridPrediction({
        featureVector,
        rfModel: bundle.rfModel,
        svmModel: bundle.svmModel,
        xgbModel: bundle.xgbModel,
        cnnModel: bundle.cnnModel,
        lstmModel: bundle.lstmModel,
        ifModel: bundle.ifModel,
        scaler: bundle.scaler,
        settings: dbStore.settings,
        modelVersionId: bundle.versionId,
      });

      flow.prediction = prediction;
      dbStore.addNetworkFlow(flow);

      // Update device risk
      dbStore.updateDeviceRisk(device.id, prediction.finalHybridScore);

      // Create Alert if malicious or high suspicious
      let createdAlert: Alert | null = null;
      if (prediction.attackClassification === 'Malicious' || (prediction.attackClassification === 'Suspicious' && prediction.finalHybridScore >= 0.55)) {
        device.recentAlertsCount += 1;
        createdAlert = {
          id: `alt-${Date.now()}-${Math.floor(Math.random() * 100)}`,
          timestamp: new Date().toISOString(),
          attackType: prediction.attackType || 'Unidentified Healthcare Intrusion',
          severity: prediction.severity,
          source: flow.sourceIp,
          destination: flow.destinationIp,
          device: device.name,
          deviceId: device.id,
          protocol: flow.protocol,
          threatScore: Math.round(prediction.finalHybridScore * 100),
          confidence: prediction.confidence,
          detectionModel: `Hybrid Ensemble (${prediction.rf.score >= 0.5 ? 'RF+' : ''}${prediction.xgboost.score >= 0.5 ? 'XGB+' : ''}${prediction.cnn.score >= 0.5 ? 'CNN+' : ''}${prediction.isolationForest.isAnomaly ? 'IF' : ''})`,
          status: 'New',
          description: `Telemetry intrusion pattern detected on ${device.name}. Recommended response: ${prediction.recommendedResponse}`,
        };
        dbStore.addAlert(createdAlert);
      }

      // Broadcast real-time update
      if (this.broadcaster) {
        this.broadcaster({
          type: 'TELEMETRY_FLOW',
          data: {
            flow,
            device: {
              id: device.id,
              riskScore: device.riskScore,
              securityStatus: device.securityStatus,
              recentAlertsCount: device.recentAlertsCount,
              lastSeen: device.lastSeen,
            },
            alert: createdAlert,
          },
        });
      }
    } catch (err) {
      console.error('Simulator flow evaluation failed:', err);
    }
  }

  private extractFeatureVector(flow: NetworkFlow): FeatureVector {
    let protocolNum = 6;
    if (flow.protocol === 'UDP') protocolNum = 17;
    if (flow.protocol === 'ICMP') protocolNum = 1;

    let tcpFlagsNum = 16; // ACK
    if (flow.tcpFlags.includes('SYN')) tcpFlagsNum |= 2;
    if (flow.tcpFlags.includes('FIN')) tcpFlagsNum |= 1;
    if (flow.tcpFlags.includes('RST')) tcpFlagsNum |= 4;
    if (flow.tcpFlags.includes('PSH')) tcpFlagsNum |= 8;

    return {
      sourcePort: flow.sourcePort,
      destinationPort: flow.destinationPort,
      protocolNum,
      packetSize: flow.packetSize,
      flowDuration: flow.flowDuration,
      packetRate: flow.packetRate,
      byteCount: flow.byteCount,
      forwardPackets: flow.forwardPackets,
      backwardPackets: flow.backwardPackets,
      tcpFlagsNum,
      loginAttempts: flow.loginAttempts,
      connectionFrequency: flow.connectionFrequency,
      interArrivalTime: flow.interArrivalTime,
      flowBytesPerSec: flow.flowBytesPerSec,
      flowPacketsPerSec: flow.flowPacketsPerSec,
    };
  }

  private createFlowForDevice(device: any, isAttack: boolean): NetworkFlow {
    const id = `flw-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();

    let protocol: ProtocolType = 'TCP';
    let dstPort = 443;
    let srcPort = 1024 + Math.floor(Math.random() * 60000);

    // Device-specific port assignments
    if (device.type === 'ECG Monitor' || device.type === 'Patient Monitor') {
      protocol = 'HL7';
      dstPort = 2575;
    } else if (device.type === 'MRI Scanner' || device.type === 'CT Scanner' || device.type === 'PACS Server') {
      protocol = 'DICOM';
      dstPort = 104;
    } else if (device.type === 'Glucose Monitor' || device.type === 'Blood Pressure Cuff') {
      protocol = 'MQTT';
      dstPort = 1883;
    } else if (device.type === 'Hospital Gateway') {
      protocol = 'TCP';
      dstPort = isAttack ? 22 : 443;
    }

    let packetSize = 120 + Math.floor(Math.random() * 300);
    let flowDuration = 800 + Math.floor(Math.random() * 15000);
    let packetRate = 10 + Math.floor(Math.random() * 45);
    let byteCount = packetSize * packetRate;
    let forwardPackets = 8 + Math.floor(Math.random() * 12);
    let backwardPackets = 6 + Math.floor(Math.random() * 10);
    let tcpFlags = 'ACK, PSH';
    let loginAttempts = 0;
    let connectionFrequency = 2 + Math.floor(Math.random() * 8);
    let interArrivalTime = 30 + Math.floor(Math.random() * 80);
    let flowBytesPerSec = Math.round(byteCount / Math.max(1, flowDuration / 1000));
    let flowPacketsPerSec = packetRate;

    let sourceIp = device.ipAddress;
    let destinationIp = '192.168.1.1'; // Gateway

    if (isAttack) {
      const attackSignatures = [
        'DDoS_FLOOD',
        'PORT_SCAN',
        'EXPLOIT_DICOM',
        'BRUTE_FORCE',
        'EXFILTRATION',
      ];
      const sig = attackSignatures[Math.floor(Math.random() * attackSignatures.length)];

      if (sig === 'DDoS_FLOOD') {
        packetRate = 1400 + Math.floor(Math.random() * 1200);
        packetSize = 1200 + Math.floor(Math.random() * 300);
        byteCount = packetSize * packetRate;
        forwardPackets = 90 + Math.floor(Math.random() * 80);
        tcpFlags = 'SYN';
        flowPacketsPerSec = packetRate;
        flowBytesPerSec = packetRate * packetSize;
      } else if (sig === 'PORT_SCAN') {
        forwardPackets = 45 + Math.floor(Math.random() * 30);
        backwardPackets = 1;
        tcpFlags = 'SYN, RST';
        packetRate = 420;
        flowPacketsPerSec = 420;
      } else if (sig === 'EXPLOIT_DICOM') {
        packetSize = 1480;
        byteCount = 850000;
        forwardPackets = 60;
        tcpFlags = 'SYN, ACK, PSH';
      } else if (sig === 'BRUTE_FORCE') {
        loginAttempts = 4 + Math.floor(Math.random() * 4);
        connectionFrequency = 45;
        dstPort = 22;
        sourceIp = '198.51.100.89'; // External adversary
        destinationIp = device.ipAddress;
      } else if (sig === 'EXFILTRATION') {
        byteCount = 4200000;
        packetSize = 1460;
        forwardPackets = 180;
        backwardPackets = 4;
        flowBytesPerSec = 950000;
        destinationIp = '203.0.113.195'; // Suspicious offshore drop
      }
    }

    return {
      id,
      timestamp,
      sourceIp,
      destinationIp,
      sourcePort: srcPort,
      destinationPort: dstPort,
      protocol,
      packetSize,
      flowDuration,
      packetRate,
      byteCount,
      forwardPackets,
      backwardPackets,
      tcpFlags,
      loginAttempts,
      connectionFrequency,
      interArrivalTime,
      flowBytesPerSec,
      flowPacketsPerSec,
      deviceId: device.id,
      deviceName: device.name,
    };
  }
}

export const telemetrySimulator = new HealthcareTelemetrySimulator();
