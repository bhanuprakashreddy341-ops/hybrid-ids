# HEARTGUARD IDS v1.0
## Hybrid Machine Learning-Based Intrusion Detection for Connected Healthcare Networks

HeartGuard IDS is an advanced cybersecurity intrusion detection and risk assessment platform engineered specifically for the Internet of Medical Things (IoMT) and hospital clinical networks. Built as a B.E. Major Project, it demonstrates real-time network flow collection, 15-feature extraction, a 6-algorithm machine learning and deep learning ensemble, an adaptive weighted decision engine, and simulated device protection controls.

---

### Key Capabilities

1. **Monitored Healthcare Device Inventory (10 Assets)**
   - ECG Monitor (*Cardiology Ward 3A*)
   - Ventilator (*Intensive Care Unit*)
   - Infusion Pump (*Emergency Medicine*)
   - MRI Scanner (*Diagnostic Radiology*)
   - CT Scanner (*Diagnostic Imaging*)
   - Glucose Monitor (*Endocrinology Clinic*)
   - Blood Pressure Cuff (*Outpatient Triage*)
   - Patient Monitor (*Surgical Recovery*)
   - Hospital Gateway (*Core DMZ*)
   - PACS Archival Server (*Health Informatics Data Center*)

2. **Multi-Tier Machine Learning & Deep Learning Detection Engine**
   - **Tier 1 (Classical ML):** Random Forest (14 Decision Trees with Gini Splitting), Support Vector Machine (Margin Hyperplane with Platt Sigmoid Calibrator), XGBoost (Gradient Boosted Trees with Shrinkage $\eta=0.15$).
   - **Tier 2 (Deep Learning):** CNN-MLP (1D Convolutional Filter Bank with Max-Pooling and Softmax), LSTM-MLP (Temporal Recurrent Gating for Low-and-Slow Attack Sequences).
   - **Tier 3 (Unsupervised Anomaly Detection):** Isolation Forest (Recursive Partition Depth Anomaly Isolation).
   - **Weighted Hybrid Decision Engine:** Dynamic weighted voting combining all 3 tiers with configurable thresholds in Settings.

3. **Explainable AI (XAI)**
   - Approximated Shapley feature attributions computing marginal output contributions across all 15 network flow parameters (packet rates, byte volume, TCP flags, duration, port signatures).

4. **Continuous Telemetry & Real-Time WebSockets**
   - Live flow stream simulating realistic hospital device transmissions and adversarial bursts (DDoS SYN floods, DICOM buffer attacks, medical gateway brute force, data exfiltration).
   - Bi-directional WebSocket communication on `/ws` with automatic reconnect and 15s daemon heartbeats.

5. **Safe Response Controls (Medical Device Sandbox Protection)**
   - Device isolation and flow blocking operate strictly within a simulated sandbox environment, guaranteeing zero disruption to real patient care or biomedical equipment.

6. **Training & Model Lifecycle Management**
   - Upload custom CSV datasets (e.g., CICIDS2017) or benchmark on pre-indexed datasets.
   - Automated data validation (missing value imputation, duplicate detection, class balance).
   - Hyperparameter configuration, multi-model selection, live progress tracking, model persistence, and version switching.

7. **SOC Governance & Role-Based Access Control (RBAC)**
   - **Admin:** Full privileges including hyperparameter calibration and device isolation.
   - **Security Analyst:** Alert triage, device inspection, model training, and prediction tester.
   - **Viewer:** Read-only dashboard access.
   - Cryptographic Audit Trail logging all operator interventions with JSON export.

---

### Network Flow Feature Matrix (15 Attributes)

| Attribute | Type | Description |
|---|---|---|
| `sourcePort` | Integer | Originating source transport port |
| `destinationPort` | Integer | Destination transport port (104=DICOM, 2575=HL7, 1883=MQTT) |
| `protocolNum` | Integer | IANA protocol number (6=TCP, 17=UDP, 1=ICMP) |
| `packetSize` | Integer | Average packet length in bytes |
| `flowDuration` | Integer | Total flow lifespan in milliseconds |
| `packetRate` | Float | Rate of packet transmission |
| `byteCount` | Integer | Cumulative transmission volume in bytes |
| `forwardPackets` | Integer | Packet count transmitted in forward direction |
| `backwardPackets` | Integer | Packet count transmitted in return direction |
| `tcpFlagsNum` | Integer | Bitmask of TCP flags (SYN, ACK, FIN, RST, PSH, URG) |
| `loginAttempts` | Integer | Cumulative authentication challenge count |
| `connectionFrequency` | Integer | Connections initiated within rolling time window |
| `interArrivalTime` | Float | Inter-arrival time between successive packets (ms) |
| `flowBytesPerSec` | Float | Bandwidth consumption in bytes/sec |
| `flowPacketsPerSec` | Float | Packet throughput in packets/sec |

---

### System Architecture

```text
Healthcare Devices (10 IoMT Assets)
               ↓
Network Flow Collection & Validation
               ↓
Feature Extraction (15 Attributes)
               ↓
┌──────────────────────────────────────────────┐
│ Random Forest  |      SVM      |   XGBoost   │ (Classical ML)
└──────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│    CNN-MLP     |           LSTM-MLP          │ (Deep Learning)
└──────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────┐
│               Isolation Forest               │ (Anomaly Detection)
└──────────────────────────────────────────────┘
               ↓
Hybrid Decision Engine (Weighted Ensemble)
               ↓
Adaptive Device Risk Score + Attack Classifier
               ↓
Safe Response Sandbox & Alert Management
               ↓
FastAPI / Express Backend API
               ↓
WebSocket Real-Time Updates (/ws)
               ↓
React SOC Cybersecurity Dashboard
```

---

### REST API Endpoints

- `GET /api/devices` - Retrieve all 10 monitored healthcare devices
- `POST /api/devices/:id/isolate` - Safe sandbox quarantine of simulated device
- `POST /api/devices/:id/restore` - Reconnect simulated device to telemetry
- `GET /api/alerts` - Query alerts with multi-factor filters
- `POST /api/alerts/:id/acknowledge` - Acknowledge security incident
- `POST /api/alerts/:id/resolve` - Resolve security incident with remediation note
- `POST /api/predict` - Execute 6 ML models and hybrid ensemble on manual flow vector
- `POST /api/datasets/upload` - Ingest and validate custom CSV dataset
- `POST /api/training/start` - Trigger model training pipeline
- `GET /api/analytics` - Retrieve model comparison metrics, confusion matrix, and feature importance
- `GET /api/health` - Inspect the 6 independent system health daemons
- `POST /api/test/run` - Execute 14-point automated diagnostic test suite
- `GET/POST /api/settings` - Configure hybrid weights, thresholds, and simulation parameters

---

### Academic & Project Verification

All performance metrics displayed are mathematically evaluated on test partitions. If a model has not been evaluated, it is designated `N/A – Not Evaluated`. Built for B.E. Major Project evaluation and defense demonstrations.
