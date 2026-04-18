# Strategic India Intelligence Platform (STRATEGIC-COP)

A high-fidelity, web-based intelligence fusion dashboard designed to provide a unified "Common Operating Picture" (COP) for tactical operations across the Indian subcontinent.

## 🚀 Overview
This platform integrates multi-modal data sources (OSINT, HUMINT, IMINT) into an interactive geospatial interface. It solves four critical intelligence challenges using a modern Tactical Design System (Glassmorphism, Dark Mode, and Real-Time Animations).

## 🛠️ Core Features

### 1. Multi-Source Intelligence Fusion
- **OSINT Analysis**: Automatic parsing of public infrastructure tenders and social vectors.
- **HUMINT Integration**: Field asset reports and manual sighting verification.
- **IMINT Hover-and-View**: High-resolution satellite imagery inspection with thermal signature analysis.

### 2. Predictive LoRa Telemetry Reconstruction
- **Packet Repair**: Intelligent middleware to handle fragmented or malformed JSON data strings.
- **Kalman Filtering**: 2D state estimation for predictive continuity when LoRa signals are lost.
- **Visual Confidence**: Distinct markers for "Verified" ground-truth and "Estimated" predicted paths.

### 3. Predictive Urban Growth Modeling
- **Growth Velocity Score (GVS)**: Algorithmic weightage of municipal intent (Tenders) vs. market demand (Price trends).
- **Time-Series Projection**: A 24–60 month timeline slider visualizing future urban "hotspots" via dynamic heatmaps.

### 4. Real-Time Logistics & Traffic Modeling
- **Sensing Layer**: Live congestion monitoring on major transit corridors (e.g., Delhi Ring Road, Bangalore Silk Board).
- **Adaptive Rerouting**: Autonomous pathfinding for specialized fleet units.
- **Hazardous Buffers**: Dynamic safety halos for HAZMAT assets based on velocity and traffic density.

## 🖥️ Tactical User Interface
- **War-Room Aesthetic**: Ultra-dark charcoal palette with neon data overlays.
- **Live Debug Terminal**: Matrix-style scrolling logs showing the underlying mathematical logic.
- **Global Radar Sweep**: Visual conic surveillance scan for enhanced situational immersion.

## 🏗️ Architecture & Data Flow

### System Architecture
```mermaid
graph TD
    UI[index.html / style.css] <--> App[app.js Orchestrator]
    App --> TP[telemetryProcessor.js]
    App --> GE[growthEngine.js]
    App --> LE[logisticsEngine.js]
    
    TP --> |Kalman Filter| App
    GE --> |Growth Projection| App
    LE --> |Rerouting Logic| App
    
    Data[(Mock Data: MongoDB/S3)] --> App
```

### Intelligence Pipeline (Data Flow)
```mermaid
sequenceDiagram
    participant Raw as Raw Data Sources
    participant Proc as Middleware (Logic Units)
    participant UI as Tactical Dashboard
    
    Raw->>Proc: Fragmented JSON (LoRa)
    Proc->>Proc: fixBrokenJSON() Repair
    Proc->>Proc: Kalman State Estimation (t-1, t-2)
    Proc->>UI: Verified vs Estimated Markers
    
    Raw->>Proc: Urban Tender & Price Data
    Proc->>Proc: Growth Velocity Scoring (GVS)
    Proc->>UI: Time-Series Heatmap Projection
```

## 🎯 Mapping to Problem Statement

| Requirement | Implementation Feature |
| :--- | :--- |
| **Common Operating Picture** | Unified Leaflet Map with toggleable intelligence layers. |
| **Multi-Modal Data Fusion** | Integration of OSINT, HUMINT, and IMINT (Mocked S3/MongoDB). |
| **State Estimation (t-1, t-2)** | `telemetryProcessor.js` using Kalman Filter for predictive continuity. |
| **Fragmented Data Repair** | `fixBrokenJSON()` and `repairPacket()` heuristic logic. |
| **Rich Aesthetics** | Tactical Dark Mode, Glassmorphism, and Conic Radar Scans. |
| **Hover Previews** | `tactical-tooltip` showing rich metadata and image previews on hover. |
| **Storage Integration** | Mocked **MongoDB** (for OSINT Vector logs) and **AWS S3** (for IMINT imagery storage). |

## 🗄️ Backend Integration (Mocked)
The platform is architected to interface with low-latency tactical backends:
- **MongoDB (OSINT_LIVE)**: Stores unstructured social vectors and infrastructure tender data.
- **AWS S3 (INTEL_IMG)**: A high-availability bucket for sub-meter resolution satellite imagery and thermal IMINT frames.
- **Auto-Sync**: The sidebar displays real-time sync status for both storage layers, simulating live API connections.

## 📦 Project Structure
- `index.html`: Core UI structure.
- `style.css`: Tactical design system and animations.
- `app.js`: Main logic orchestrator & Mock Data Integration.
- `telemetryProcessor.js`: Telemetry repair and Kalman engine.
- `growthEngine.js`: GVS analytics and real estate projections.
- `logisticsEngine.js`: Routing and congestion simulation.

## 🚦 Getting Started
1. Open `index.html` in a modern browser.
2. Hover over markers to see **Rich IMINT Previews**.
3. Observe the **Live Terminal** for "Packet Repair" logs.
4. Drag an image onto the **Manual Ingestion** zone to simulate data entry.

---
*Developed as an end-to-end Strategic Intelligence solution.*
