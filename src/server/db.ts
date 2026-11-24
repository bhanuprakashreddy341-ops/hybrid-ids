import {
  User,
  HealthcareDevice,
  NetworkFlow,
  Alert,
  DatasetMeta,
  AuditLog,
  SystemSettings,
  FlowPredictionResult,
} from '../types.ts';
import { mlEngineSingleton } from './ml/engine.ts';

class DatabaseStore {
  public users: User[] = [
    {
      id: 'usr-admin',
      username: 'admin',
      name: 'Dr. Evelyn Reed (SecOps Lead)',
      role: 'Admin',
      email: 'evelyn.reed@hospital-heartguard.med',
    },
    {
      id: 'usr-analyst',
      username: 'analyst',
      name: 'Marcus Vance (SOC Analyst)',
      role: 'Security Analyst',
      email: 'm.vance@hospital-heartguard.med',
    },
    {
      id: 'usr-viewer',
      username: 'viewer',
      name: 'Dr. Sarah Lin (Clinical Director)',
      role: 'Viewer',
      email: 's.lin@hospital-heartguard.med',
    },
  ];

  public devices: HealthcareDevice[] = [
    {
      id: 'dev-001',
      name: 'HeartFlo ECG Telemetry Station',
      type: 'ECG Monitor',
      ipAddress: '192.168.10.15',
      macAddress: '00:1A:2B:4C:10:15',
      department: 'Cardiology Ward 3A',
      location: 'Bedside 304',
      firmwareVersion: 'v3.2.1-sec',
      connectionStatus: 'online',
      riskScore: 18,
      lastSeen: new Date().toISOString(),
      packetsPerSecond: 42,
      recentAlertsCount: 0,
      securityStatus: 'secure',
      isSimulated: true,
      monitoringLevel: 'standard',
    },
    {
      id: 'dev-002',
      name: 'RespiraCare Advanced Ventilator',
      type: 'Ventilator',
      ipAddress: '192.168.10.22',
      macAddress: '00:1A:2B:4C:10:22',
      department: 'Intensive Care Unit (ICU)',
      location: 'ICU Bay 4',
      firmwareVersion: 'v4.1.0-med',
      connectionStatus: 'online',
      riskScore: 24,
      lastSeen: new Date().toISOString(),
      packetsPerSecond: 38,
      recentAlertsCount: 0,
      securityStatus: 'secure',
      isSimulated: true,
      monitoringLevel: 'standard',
    },
    {
      id: 'dev-003',
      name: 'Alaris SmartPump Infusion Station',
      type: 'Infusion Pump',
      ipAddress: '192.168.10.34',
      macAddress: '00:1A:2B:4C:10:34',
      department: 'Emergency Medicine',
      location: 'ER Trauma Room 1',
      firmwareVersion: 'v2.8.4',
      connectionStatus: 'online',
      riskScore: 68,
      lastSeen: new Date().toISOString(),
      packetsPerSecond: 195,
      recentAlertsCount: 3,
      securityStatus: 'suspicious',
      isSimulated: true,
      monitoringLevel: 'elevated',
    },
    {
      id: 'dev-004',
      name: 'Siemens Magnetom 3T MRI Scanner',
      type: 'MRI Scanner',
      ipAddress: '192.168.20.101',
      macAddress: '00:1A:2B:4C:20:01',
      department: 'Diagnostic Radiology',
      location: 'Imaging Vault 1',
      firmwareVersion: 'v5.0.2-rad',
      connectionStatus: 'online',
      riskScore: 32,
      lastSeen: new Date().toISOString(),
      packetsPerSecond: 140,
      recentAlertsCount: 1,
      securityStatus: 'secure',
      isSimulated: true,
      monitoringLevel: 'standard',
    },
    {
      id: 'dev-005',
      name: 'Somatom Definition CT Scanner',
      type: 'CT Scanner',
      ipAddress: '192.168.20.108',
      macAddress: '00:1A:2B:4C:20:08',
      department: 'Diagnostic Imaging',
      location: 'CT Suite 2',
      firmwareVersion: 'v4.9.1',
      connectionStatus: 'online',
      riskScore: 21,
      lastSeen: new Date().toISOString(),
      packetsPerSecond: 85,
      recentAlertsCount: 0,
      securityStatus: 'secure',
      isSimulated: true,
      monitoringLevel: 'standard',
    },
    {
      id: 'dev-006',
      name: 'DexContinuous Glucose Monitor Hub',
      type: 'Glucose Monitor',
      ipAddress: '192.168.10.45',
      macAddress: '00:1A:2B:4C:10:45',
      department: 'Endocrinology Clinic',
      location: 'Clinic Suite 202',
      firmwareVersion: 'v1.7.3',
      connectionStatus: 'online',
      riskScore: 12,
      lastSeen: new Date().toISOString(),
      packetsPerSecond: 15,
      recentAlertsCount: 0,
      securityStatus: 'secure',
      isSimulated: true,
      monitoringLevel: 'standard',
    },
    {
      id: 'dev-007',
      name: 'Omron VitalSync Blood Pressure Cuff',
      type: 'Blood Pressure Cuff',
      ipAddress: '192.168.10.51',
      macAddress: '00:1A:2B:4C:10:51',
      department: 'Outpatient Triage',
      location: 'Triage Station B',
      firmwareVersion: 'v2.1.0',
      connectionStatus: 'online',
      riskScore: 14,
      lastSeen: new Date().toISOString(),
      packetsPerSecond: 18,
      recentAlertsCount: 0,
      securityStatus: 'secure',
      isSimulated: true,
      monitoringLevel: 'standard',
    },
    {
      id: 'dev-008',
      name: 'Philips IntelliVue Multiparameter Monitor',
      type: 'Patient Monitor',
      ipAddress: '192.168.10.18',
      macAddress: '00:1A:2B:4C:10:18',
      department: 'Surgical Recovery',
      location: 'PACU Bed 12',
      firmwareVersion: 'v3.5.7',
      connectionStatus: 'online',
      riskScore: 26,
      lastSeen: new Date().toISOString(),
      packetsPerSecond: 64,
      recentAlertsCount: 0,
      securityStatus: 'secure',
      isSimulated: true,
      monitoringLevel: 'standard',
    },
    {
      id: 'dev-009',
      name: 'Cisco HealthEdge Hospital Security Gateway',
      type: 'Hospital Gateway',
      ipAddress: '192.168.1.1',
      macAddress: '00:1A:2B:4C:01:01',
      department: 'Network Operations (DMZ)',
      location: 'Server Room Core Rack',
      firmwareVersion: 'v12.4.9-hardened',
      connectionStatus: 'online',
      riskScore: 45,
      lastSeen: new Date().toISOString(),
      packetsPerSecond: 820,
      recentAlertsCount: 2,
      securityStatus: 'secure',
      isSimulated: true,
      monitoringLevel: 'standard',
    },
    {
      id: 'dev-010',
      name: 'Enterprise Orthanc PACS Archival Server',
      type: 'PACS Server',
      ipAddress: '192.168.30.50',
      macAddress: '00:1A:2B:4C:30:50',
      department: 'Health Informatics Data Center',
      location: 'Data Center Row C',
      firmwareVersion: 'v6.3.0-pacs',
      connectionStatus: 'online',
      riskScore: 78,
      lastSeen: new Date().toISOString(),
      packetsPerSecond: 460,
      recentAlertsCount: 4,
      securityStatus: 'compromised',
      isSimulated: true,
      monitoringLevel: 'elevated',
    },
  ];

  public networkFlows: NetworkFlow[] = [];
  public alerts: Alert[] = [
    {
      id: 'alt-101',
      timestamp: new Date(Date.now() - 360000).toISOString(),
      attackType: 'PACS Imaging Data Exfiltration',
      severity: 'Critical',
      source: '192.168.30.50',
      destination: '203.0.113.88',
      device: 'Enterprise Orthanc PACS Archival Server',
      deviceId: 'dev-010',
      protocol: 'DICOM',
      threatScore: 92,
      confidence: 96,
      detectionModel: 'Hybrid Ensemble (RF + XGB + LSTM)',
      status: 'New',
      description: 'Anomalous outbound DICOM C-STORE burst transmission exceeding nominal patient study threshold.',
    },
    {
      id: 'alt-102',
      timestamp: new Date(Date.now() - 980000).toISOString(),
      attackType: 'Medical Gateway Brute Force',
      severity: 'High',
      source: '198.51.100.42',
      destination: '192.168.1.1',
      device: 'Cisco HealthEdge Hospital Security Gateway',
      deviceId: 'dev-009',
      protocol: 'TCP',
      threatScore: 84,
      confidence: 91,
      detectionModel: 'Random Forest & SVM',
      status: 'Acknowledged',
      description: 'Multiple failed SSH administrative logins within 60-second window detected.',
      acknowledgedBy: 'Marcus Vance (SOC Analyst)',
      acknowledgedAt: new Date(Date.now() - 850000).toISOString(),
    },
    {
      id: 'alt-103',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      attackType: 'DICOM Buffer Injection Anomaly',
      severity: 'Medium',
      source: '192.168.10.34',
      destination: '192.168.20.101',
      device: 'Alaris SmartPump Infusion Station',
      deviceId: 'dev-003',
      protocol: 'TCP',
      threatScore: 66,
      confidence: 85,
      detectionModel: 'Isolation Forest & CNN-MLP',
      status: 'Investigating',
      description: 'Unusual payload byte distribution on infusion management port 2575.',
      acknowledgedBy: 'Dr. Evelyn Reed (SecOps Lead)',
      acknowledgedAt: new Date(Date.now() - 1700000).toISOString(),
    },
    {
      id: 'alt-104',
      timestamp: new Date(Date.now() - 4200000).toISOString(),
      attackType: 'TCP SYN Port Scan',
      severity: 'Low',
      source: '192.168.10.200',
      destination: '192.168.20.108',
      device: 'Somatom Definition CT Scanner',
      deviceId: 'dev-005',
      protocol: 'TCP',
      threatScore: 48,
      confidence: 82,
      detectionModel: 'XGBoost',
      status: 'Resolved',
      description: 'Fast sequential TCP probing across healthcare subnet ports 104, 2575, 8080.',
      acknowledgedBy: 'Marcus Vance (SOC Analyst)',
      acknowledgedAt: new Date(Date.now() - 4100000).toISOString(),
      resolvedBy: 'Marcus Vance (SOC Analyst)',
      resolvedAt: new Date(Date.now() - 3900000).toISOString(),
      resolutionNote: 'Identified authorized quarterly biomedical engineering vulnerability assessment scanner.',
    },
  ];

  public datasets: DatasetMeta[] = [
    {
      id: 'ds-cicids2017-sample',
      filename: 'CICIDS2017_Healthcare_IoT_Flows.csv',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      rowCount: 8420,
      columnCount: 16,
      columns: [
        'source_port',
        'destination_port',
        'protocol',
        'packet_size',
        'flow_duration',
        'packet_rate',
        'byte_count',
        'forward_packets',
        'backward_packets',
        'tcp_flags',
        'login_attempts',
        'connection_frequency',
        'inter_arrival_time',
        'flow_bytes_per_sec',
        'flow_packets_per_sec',
        'label',
      ],
      targetColumn: 'label',
      classDistribution: {
        'Normal Flow': 6120,
        'DDoS / SYN Flood': 1140,
        'Port Scan': 580,
        'DICOM Exploit': 320,
        'Brute Force': 260,
      },
      missingValuesCount: 0,
      duplicateRecordsCount: 14,
      invalidValuesCount: 0,
      sampleRows: [
        {
          source_port: 49152,
          destination_port: 104,
          protocol: 'TCP',
          packet_size: 512,
          flow_duration: 1250,
          packet_rate: 28,
          byte_count: 14336,
          forward_packets: 16,
          backward_packets: 12,
          tcp_flags: 'ACK, PSH',
          login_attempts: 0,
          connection_frequency: 4,
          inter_arrival_time: 44,
          flow_bytes_per_sec: 11468,
          flow_packets_per_sec: 28,
          label: 'Normal Flow',
        },
        {
          source_port: 54120,
          destination_port: 104,
          protocol: 'TCP',
          packet_size: 1460,
          flow_duration: 450,
          packet_rate: 1840,
          byte_count: 828000,
          forward_packets: 120,
          backward_packets: 3,
          tcp_flags: 'SYN',
          login_attempts: 0,
          connection_frequency: 85,
          inter_arrival_time: 2,
          flow_bytes_per_sec: 1840000,
          flow_packets_per_sec: 1840,
          label: 'DDoS / SYN Flood',
        },
        {
          source_port: 33412,
          destination_port: 2575,
          protocol: 'TCP',
          packet_size: 320,
          flow_duration: 9800,
          packet_rate: 12,
          byte_count: 3136,
          forward_packets: 6,
          backward_packets: 4,
          tcp_flags: 'ACK',
          login_attempts: 0,
          connection_frequency: 2,
          inter_arrival_time: 120,
          flow_bytes_per_sec: 320,
          flow_packets_per_sec: 12,
          label: 'Normal Flow',
        },
      ],
      sizeBytes: 2450800,
    },
  ];

  public auditLogs: AuditLog[] = [
    {
      id: 'aud-001',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Dr. Evelyn Reed (SecOps Lead)',
      role: 'Admin',
      action: 'SYSTEM_INITIALIZED',
      module: 'Kernel',
      details: 'HeartGuard IDS v1.0 started with active model v1.0.0-HG-CICIDS',
    },
    {
      id: 'aud-002',
      timestamp: new Date(Date.now() - 3400000).toISOString(),
      user: 'Dr. Evelyn Reed (SecOps Lead)',
      role: 'Admin',
      action: 'DATASET_VALIDATED',
      module: 'Training',
      details: 'Validated CICIDS2017_Healthcare_IoT_Flows.csv: 8420 rows, 16 features',
    },
    {
      id: 'aud-003',
      timestamp: new Date(Date.now() - 2200000).toISOString(),
      user: 'Marcus Vance (SOC Analyst)',
      role: 'Security Analyst',
      action: 'ALERT_ACKNOWLEDGED',
      module: 'Alerts',
      details: 'Alert alt-102 (Medical Gateway Brute Force) marked as Acknowledged',
    },
    {
      id: 'aud-004',
      timestamp: new Date(Date.now() - 1900000).toISOString(),
      user: 'Marcus Vance (SOC Analyst)',
      role: 'Security Analyst',
      action: 'ALERT_RESOLVED',
      module: 'Alerts',
      details: 'Alert alt-104 (TCP SYN Port Scan) resolved: Confirmed authorized biomedical audit scanner',
    },
  ];

  public settings: SystemSettings = {
    weights: {
      randomForest: 0.25,
      svm: 0.15,
      xgboost: 0.25,
      cnn: 0.15,
      lstm: 0.1,
      isolationForest: 0.1,
    },
    thresholds: {
      suspicious: 0.4,
      malicious: 0.75,
      criticalSeverity: 0.85,
    },
    telemetrySimulation: {
      enabled: true,
      frequencySeconds: 3,
      attackSimulationRatio: 0.25, // 25% suspicious/malicious traffic
    },
    disclaimerAccepted: true,
  };

  public recordAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const record: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.auditLogs.unshift(record);
    // Keep max 500 records
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  public addNetworkFlow(flow: NetworkFlow): void {
    this.networkFlows.unshift(flow);
    if (this.networkFlows.length > 150) {
      this.networkFlows.pop();
    }
  }

  public addAlert(alert: Alert): void {
    this.alerts.unshift(alert);
    if (this.alerts.length > 200) {
      this.alerts.pop();
    }
  }

  // Adaptive device risk score recalculation
  public updateDeviceRisk(deviceId: string, latestScore: number): void {
    const dev = this.devices.find((d) => d.id === deviceId);
    if (!dev) return;

    // Device criticality weight based on type
    let criticalityFactor = 1.0;
    if (dev.type === 'Ventilator' || dev.type === 'Infusion Pump') criticalityFactor = 1.3;
    if (dev.type === 'Hospital Gateway' || dev.type === 'PACS Server') criticalityFactor = 1.25;

    // Exponential moving average update
    const alpha = 0.25;
    const alertWeight = Math.min(30, dev.recentAlertsCount * 10);
    const rawRisk = Math.min(100, Math.round(dev.riskScore * (1 - alpha) + (latestScore * 100 * criticalityFactor * 0.7 + alertWeight * 0.3) * alpha));
    
    dev.riskScore = Math.max(5, Math.min(99, rawRisk));
    dev.lastSeen = new Date().toISOString();

    if (dev.connectionStatus !== 'isolated') {
      if (dev.riskScore >= 75) {
        dev.securityStatus = 'compromised';
      } else if (dev.riskScore >= 45) {
        dev.securityStatus = 'suspicious';
      } else {
        dev.securityStatus = 'secure';
      }
    }
  }
}

export const dbStore = new DatabaseStore();
