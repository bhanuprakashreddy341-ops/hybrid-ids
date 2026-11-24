export type UserRole = 'Admin' | 'Security Analyst' | 'Viewer';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
}

export type ConnectionStatus = 'online' | 'degraded' | 'offline' | 'isolated';
export type SecurityStatus = 'secure' | 'suspicious' | 'compromised' | 'isolated';

export interface HealthcareDevice {
  id: string;
  name: string;
  type: string;
  ipAddress: string;
  macAddress: string;
  department: string;
  location: string;
  firmwareVersion: string;
  connectionStatus: ConnectionStatus;
  riskScore: number; // 0 - 100
  lastSeen: string;
  packetsPerSecond: number;
  recentAlertsCount: number;
  securityStatus: SecurityStatus;
  isSimulated: boolean;
  isolationReason?: string;
  monitoringLevel?: 'standard' | 'elevated' | 'quarantined';
}

export type ProtocolType = 'TCP' | 'UDP' | 'ICMP' | 'DICOM' | 'HL7' | 'MQTT';

export interface NetworkFlow {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  protocol: ProtocolType;
  packetSize: number;
  flowDuration: number;
  packetRate: number;
  byteCount: number;
  forwardPackets: number;
  backwardPackets: number;
  tcpFlags: string; // e.g. SYN, ACK, FIN, RST, PSH, URG
  loginAttempts: number;
  connectionFrequency: number;
  interArrivalTime: number;
  flowBytesPerSec: number;
  flowPacketsPerSec: number;
  deviceId?: string;
  deviceName?: string;
  // Predictions attached to flow
  prediction?: FlowPredictionResult;
}

export type AttackClassification = 'Normal' | 'Suspicious' | 'Malicious';
export type AlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type AlertStatus = 'New' | 'Acknowledged' | 'Investigating' | 'Resolved';

export interface ModelPredictionDetail {
  score: number; // 0.0 - 1.0 threat probability
  classification: AttackClassification;
  confidence: number; // 0 - 100%
  latencyMs: number;
}

export interface FeatureAttribution {
  feature: string;
  value: number | string;
  contribution: number; // -1.0 to 1.0 (SHAP-like importance)
  description: string;
}

export interface FlowPredictionResult {
  rf: ModelPredictionDetail;
  svm: ModelPredictionDetail;
  xgboost: ModelPredictionDetail;
  cnn: ModelPredictionDetail;
  lstm: ModelPredictionDetail;
  isolationForest: {
    anomalyScore: number; // 0.0 - 1.0
    isAnomaly: boolean;
    latencyMs: number;
  };
  mlThreatScore: number; // 0.0 - 1.0
  dlThreatScore: number; // 0.0 - 1.0
  anomalyScore: number; // 0.0 - 1.0
  finalHybridScore: number; // 0.0 - 1.0
  attackClassification: AttackClassification;
  attackType?: string;
  severity: AlertSeverity;
  confidence: number; // 0 - 100%
  recommendedResponse: string;
  featureAttributions: FeatureAttribution[];
  evaluatedAt: string;
  modelVersionId: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  attackType: string;
  severity: AlertSeverity;
  source: string;
  destination: string;
  device: string;
  deviceId?: string;
  protocol: ProtocolType;
  threatScore: number; // 0 - 100
  confidence: number; // 0 - 100
  detectionModel: string;
  status: AlertStatus;
  description: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface ModelPerformanceMetric {
  accuracy: number | 'N/A – Not Evaluated';
  precision: number | 'N/A – Not Evaluated';
  recall: number | 'N/A – Not Evaluated';
  f1Score: number | 'N/A – Not Evaluated';
  trainingTimeSec: number | 'N/A – Not Evaluated';
  avgInferenceMs: number | 'N/A – Not Evaluated';
}

export interface ConfusionMatrixData {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

export type ModelMetricOrNA = ModelPerformanceMetric | 'N/A – Not Evaluated';

export interface ModelVersion {
  id: string;
  version: string;
  datasetName: string;
  datasetSize: number;
  features: string[];
  trainingDate: string;
  algorithms: string[];
  metrics: {
    randomForest: ModelMetricOrNA;
    svm: ModelMetricOrNA;
    xgboost: ModelMetricOrNA;
    cnnMlp: ModelMetricOrNA;
    lstmMlp: ModelMetricOrNA;
    isolationForest: ModelMetricOrNA;
    hybridEnsemble: ModelMetricOrNA;
  };
  confusionMatrix: ConfusionMatrixData;
  featureImportances: { feature: string; importance: number }[];
  status: 'active' | 'archived' | 'training';
  trainedBy: string;
}

export interface DatasetMeta {
  id: string;
  filename: string;
  uploadedAt: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  targetColumn: string;
  classDistribution: Record<string, number>;
  missingValuesCount: number;
  duplicateRecordsCount: number;
  invalidValuesCount: number;
  sampleRows: Record<string, any>[];
  sizeBytes: number;
}

export interface TrainingRunConfig {
  datasetId: string;
  targetColumn: string;
  features: string[];
  selectedModels: string[]; // 'Random Forest', 'SVM', 'XGBoost', 'CNN-MLP', 'LSTM-MLP', 'Isolation Forest', 'Hybrid Ensemble'
  splitRatio: number; // e.g. 0.8
  normalizeMethod: 'MinMax' | 'ZScore';
  epochs: number;
}

export interface TrainingRun {
  id: string;
  config: TrainingRunConfig;
  status: 'queued' | 'running' | 'completed' | 'failed';
  currentEpoch: number;
  totalEpochs: number;
  progressPercent: number;
  activeModelTraining?: string;
  logs: string[];
  startedAt: string;
  completedAt?: string;
  resultVersionId?: string;
  error?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
}

export interface SystemServiceHealth {
  name: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  uptimeSeconds: number;
  lastChecked: string;
  details: string;
}

export interface SystemHealthReport {
  overall: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  services: {
    backend: SystemServiceHealth;
    database: SystemServiceHealth;
    mlEngine: SystemServiceHealth;
    webSocket: SystemServiceHealth;
    datasetService: SystemServiceHealth;
    modelService: SystemServiceHealth;
  };
  connectedClients: number;
  telemetryRate: number;
  activeModelVersion: string;
  timestamp: string;
}

export interface SystemSettings {
  weights: {
    randomForest: number;
    svm: number;
    xgboost: number;
    cnn: number;
    lstm: number;
    isolationForest: number;
  };
  thresholds: {
    suspicious: number; // 0.0 - 1.0 (default ~0.40)
    malicious: number; // 0.0 - 1.0 (default ~0.75)
    criticalSeverity: number; // default ~0.85
  };
  telemetrySimulation: {
    enabled: boolean;
    frequencySeconds: number;
    attackSimulationRatio: number; // 0.0 - 1.0
  };
  disclaimerAccepted: boolean;
}
