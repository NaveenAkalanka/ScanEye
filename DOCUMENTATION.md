# ScanEye Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Project Origin & Purpose](#project-origin--purpose)
3. [Architecture Overview](#architecture-overview)
4. [Development Journey](#development-journey)
5. [Technical Implementation](#technical-implementation)
6. [Security Hardening](#security-hardening)
7. [Challenges & Solutions](#challenges--solutions)
8. [Deployment Guide](#deployment-guide)
9. [Future Enhancements](#future-enhancements)

---

## Introduction

**ScanEye** is a modern, lightweight network monitoring tool built with React, Node.js, and Docker. It provides real-time device discovery, speed testing, and network health monitoring through a beautiful, dark-themed interface.

### Key Features
- 🔍 Real-time network scanning using Nmap
- 🚀 Integrated internet speed testing
- 📊 Beautiful, responsive UI with React and TailwindCSS
- 🛡️ Production-ready security (Helmet, rate limiting, input validation)
- 💾 Persistent configuration storage
- 🐳 Fully containerized with Docker

---

## Project Origin & Purpose

### The ClusterEye Connection

ScanEye is an **extended module of the ClusterEye project**, created to solve a fundamental limitation: **browsers cannot perform real local-network scanning**.

#### Why ScanEye Exists

**ClusterEye** is a comprehensive infrastructure monitoring platform, but web browsers have security restrictions that prevent them from:
- Directly scanning local network devices
- Accessing raw network interfaces
- Running privileged network operations like Nmap

**ScanEye bridges this gap** by:
1. Running as a lightweight Docker service on your local network
2. Performing privileged network scans using Nmap
3. Discovering all devices on your LAN (IP, MAC, vendor info)
4. Securely feeding that data back into ClusterEye via API
5. Providing complete infrastructure visibility

This architecture allows ClusterEye to maintain a complete view of your network infrastructure without compromising browser security or requiring browser extensions.

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                      ClusterEye                         │
│              (Main Monitoring Platform)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ API Calls
                     │
┌────────────────────▼────────────────────────────────────┐
│                      ScanEye                            │
│         (Local Network Scanner Module)                  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   React UI   │  │  Express API │  │  Nmap Engine │ │
│  │  (Frontend)  │◄─┤  (Backend)   │◄─┤  (Scanner)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Network Scan
                     │
┌────────────────────▼────────────────────────────────────┐
│              Local Area Network (LAN)                   │
│  [Device 1]  [Device 2]  [Device 3]  [Device N]        │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19.2.0
- Vite 7.2.4 (build tool)
- TailwindCSS 4.1.17 (styling)
- Axios 1.13.2 (HTTP client)
- React Router 7.9.6 (routing)

**Backend:**
- Node.js 18.20.8
- Express 4.21.2
- Nmap (network scanning)
- speedtest-net 2.2.0 (speed testing)
- WebSocket (ws 8.18.3) for real-time updates

**Security:**
- Helmet 7.1.0 (HTTP headers)
- express-rate-limit 7.1.5 (DoS protection)
- ip-cidr 3.1.0 (input validation)
- Morgan 1.10.0 (logging)

**Containerization:**
- Docker
- Node.js 18 base image
- Multi-stage build optimization

---

## Development Journey

### Phase 1: Initial Setup & Core Functionality

#### 1.1 Project Structure
We started with a clean separation of concerns:

```
ScanEye/
├── backend/          # Node.js + Express API
│   ├── index.js      # Main server
│   ├── routes/       # API endpoints
│   └── utils/        # Network scanning, config, scheduling
├── webui/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   └── pages/       # Route pages
│   └── dist/         # Production build
└── docker/           # Containerization
    ├── Dockerfile
    └── docker-compose.yml
```

#### 1.2 Network Scanning Implementation

The core scanning logic uses `node-nmap` to discover devices:

```javascript
// backend/utils/network.js
import pkg from "node-nmap";
import IPCIDR from "ip-cidr";
const { NmapScan } = pkg;

export const runFastScan = async (subnet) => {
    return new Promise((resolve, reject) => {
        // Validate Subnet (added during security hardening)
        if (!IPCIDR.isValidCIDR(subnet)) {
            return reject(new Error("Invalid subnet format. Expected CIDR notation (e.g., 192.168.1.0/24)."));
        }

        // Use ping scan (-sn) to discover all active hosts
        // This is faster and finds all devices, not just those with specific ports open
        const scan = new NmapScan(subnet, "-sn -T4 --min-parallelism 50");

        scan.on("complete", data => {
            const devices = data.map(d => ({
                ip: d.ip,
                hostname: d.hostname || null,
                mac: d.mac || null,
                vendor: d.vendor || null
            }));
            resolve(devices);
        });

        scan.on("error", reject);
        scan.startScan();
    });
};
```

**Key Design Decision:** We chose `-sn` (ping scan) over port scanning because:
- It's significantly faster
- Discovers ALL devices, not just those with open ports
- Less intrusive on the network
- Sufficient for device discovery purposes

#### 1.3 Automated Scheduling

We implemented a scheduler to run scans and speed tests at configurable intervals:

```javascript
// backend/utils/scheduler.js
let scanIntervalId = null;
let speedTestIntervalId = null;

export const startScheduler = async () => {
    const config = await getConfig();
    
    // Initial scan on startup
    await runScheduledScan();
    
    // Schedule recurring scans
    scanIntervalId = setInterval(runScheduledScan, config.scanInterval);
    speedTestIntervalId = setInterval(runScheduledSpeedTest, config.speedTestInterval);
};
```

### Phase 2: UI Development

#### 2.1 Design System

We created a cohesive dark-themed design with custom CSS variables:

```css
/* webui/src/index.css */
:root {
    --bg-primary: #060906;
    --bg-secondary: #0D100D;
    --bg-tertiary: #1a1f1a;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-muted: #94a3b8;
    --accent-primary: #A8C9AD;    /* Sage green */
    --accent-secondary: #69639E;  /* Purple */
    --accent-success: #10b981;
    --accent-warning: #f59e0b;
    --accent-danger: #ef4444;
    --border-color: #2d332d;
}
```

**Interesting Code: Custom Scrollbars with Browser Compatibility**

We encountered a browser compatibility issue with scrollbar styling. Firefox supports `scrollbar-width`, but Chrome/Safari require `-webkit-scrollbar`. Our solution:

```css
/* Custom Scrollbar for Webkit browsers */
::-webkit-scrollbar {
    width: 12px;
    height: 12px;
}

::-webkit-scrollbar-thumb {
    background: var(--accent-primary);
    border-radius: 10px;
    border: 2px solid var(--bg-secondary);
}

/* Firefox Scrollbar - wrapped in @supports to avoid compatibility warnings */
@supports (scrollbar-width: thin) {
    * {
        scrollbar-width: thin;
        scrollbar-color: var(--accent-primary) var(--bg-secondary);
    }
}
```

The `@supports` query ensures Firefox-specific styles only apply when supported, preventing console warnings.

#### 2.2 Real-time Updates with WebSocket

We implemented WebSocket for live scan updates:

```javascript
// backend/utils/websocket.js
import { WebSocketServer } from 'ws';

let wss = null;

export const initWebSocket = (server) => {
    wss = new WebSocketServer({ server });
    
    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');
        ws.on('close', () => console.log('WebSocket client disconnected'));
    });
};

export const broadcast = (event, data) => {
    if (!wss) return;
    
    const message = JSON.stringify({ event, data });
    wss.clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
            client.send(message);
        }
    });
};
```

### Phase 3: Docker Integration

#### 3.1 Dockerfile Design

```dockerfile
FROM node:18

# Install Nmap for network scanning
RUN apt-get update && apt-get install -y nmap && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN mkdir -p data

COPY backend ./backend
COPY webui ./webui

RUN cd backend && npm install
RUN cd webui && npm install && npm run build

EXPOSE 5050

CMD ["node", "backend/index.js"]
```

**Key Points:**
- Uses Node.js 18 (though Vite recommends 20+, it works)
- Installs Nmap system package
- Creates `/data` directory for persistent config
- Builds frontend during image creation
- Single-stage build (could be optimized with multi-stage)

#### 3.2 Network Mode Requirement

**Critical Discovery:** ScanEye requires `network_mode: host` to scan the local network.

```yaml
# portainer-stack.yml
services:
  scaneye:
    image: naveenakalanka/scaneye:latest
    network_mode: host  # REQUIRED for LAN scanning
    volumes:
      - scaneye-data:/app/data
```

**Why?**
- Docker's default bridge network isolates containers
- `host` mode gives the container direct access to the host's network stack
- This allows Nmap to see and scan all devices on the LAN

**Windows/Mac Limitation:**
- Docker Desktop on Windows/Mac runs in a VM
- `host` mode only gives access to the VM's network, not the actual LAN
- **Solution:** Deploy on Linux (Raspberry Pi, VPS, home server)

---

## Technical Implementation

### Configuration Management

We implemented a robust configuration system with defaults and persistence:

```javascript
// backend/utils/configManager.js
const DATA_DIR = path.join(__dirname, '../../data');
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');

const DEFAULT_CONFIG = {
    scanInterval: 300000,        // 5 minutes
    speedTestInterval: 1800000,  // 30 minutes
    manualSubnet: null,
    networkSpeed: null,
    uploadSpeed: null,
    ping: null,
    lastSpeedTest: null
};

async function ensureConfig() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }

    try {
        await fs.access(CONFIG_PATH);
    } catch {
        await fs.writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    }
}
```

**Design Decision:** We moved config from `/app/backend` to `/app/data` to:
1. Prevent volume mapping from blocking code updates
2. Ensure settings persist across container restarts
3. Separate data from code

### API Design

Clean RESTful API with clear responsibilities:

```javascript
// backend/routes/scan.js
router.get("/network-info", (req, res) => { /* ... */ });
router.get("/config", async (req, res) => { /* ... */ });
router.post("/config", async (req, res) => { /* ... */ });
router.get("/results", (req, res) => { /* ... */ });
router.get("/speed-test", async (req, res) => { /* ... */ });
router.get("/scan", async (req, res) => { /* ... */ });
router.post("/scan/trigger", async (req, res) => { /* ... */ });
```

---

## Security Hardening

### Phase 1: Security Analysis

We conducted a comprehensive security audit and found:

1. **Dependency Vulnerabilities:** `node-nmap` uses outdated `xml2js`
2. **Missing Input Validation:** Subnet parameter not validated (command injection risk)
3. **No Security Headers:** Missing Helmet middleware
4. **No Rate Limiting:** API exposed to DoS attacks
5. **Permissive CORS:** Accepting requests from any origin
6. **No Logging:** No request tracking

### Phase 2: Security Implementation

#### 2.1 HTTP Security Headers (Helmet)

```javascript
// backend/index.js
import helmet from "helmet";

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "upgrade-insecure-requests": null,
        },
    },
    strictTransportSecurity: false, // Disable HSTS for local network (HTTP)
    crossOriginOpenerPolicy: false  // Disable COOP to prevent issues with non-secure origins
}));
```

**Why the relaxed config?**
- ScanEye runs on local networks over HTTP (no SSL)
- Default Helmet settings enforce HTTPS, breaking local deployments
- We disabled HSTS and upgrade-insecure-requests for HTTP compatibility
- Still provides XSS protection, clickjacking prevention, etc.

#### 2.2 Rate Limiting

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});

app.use("/api", limiter);
```

Prevents DoS attacks by limiting API requests to 100 per 15 minutes per IP.

#### 2.3 Input Validation

```javascript
import IPCIDR from "ip-cidr";

export const runFastScan = async (subnet) => {
    // Validate Subnet
    if (!IPCIDR.isValidCIDR(subnet)) {
        return reject(new Error("Invalid subnet format. Expected CIDR notation (e.g., 192.168.1.0/24)."));
    }
    
    // Safe to proceed with scan
    const scan = new NmapScan(subnet, "-sn -T4 --min-parallelism 50");
    // ...
};
```

**Critical Security Fix:** Without validation, a malicious user could inject commands:
```
Bad input: "192.168.1.0/24; rm -rf /"
```

The `ip-cidr` library ensures only valid CIDR notation is accepted.

#### 2.4 Request Logging

```javascript
import morgan from "morgan";

app.use(morgan("combined"));
```

Logs all requests in Apache combined format for security auditing.

---

## Challenges & Solutions

### Challenge 1: Duplicate Footer Rendering

**Problem:** The Footer component appeared twice on every page.

**Investigation:**
```javascript
// App.jsx - Footer rendered here
<Footer />

// Dashboard.jsx - ALSO rendered here (duplicate!)
<Footer />

// ApiSettings.jsx - ALSO rendered here (duplicate!)
<Footer />

// Scan.jsx - ALSO rendered here (duplicate!)
<Footer />
```

**Root Cause:** Footer was imported and rendered in both the main layout AND individual pages.

**Solution:** Remove Footer from all page components, keep only in `App.jsx`:

```javascript
// App.jsx (CORRECT)
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/settings" element={<ApiSettings />} />
          </Routes>
        </main>
        <Footer />  {/* Single footer for all pages */}
      </div>
    </Router>
  );
}
```

### Challenge 2: SSL Protocol Errors

**Problem:** After adding Helmet, the app failed to load with:
```
GET https://192.168.1.203:5050/assets/index-CyapL1_t.css net::ERR_SSL_PROTOCOL_ERROR
```

**Root Cause:** Helmet's default configuration enforces HTTPS, but ScanEye runs on HTTP (local network).

**Solution:** Relax Helmet settings for HTTP compatibility:

```javascript
app.use(helmet({
    strictTransportSecurity: false,  // Disable HSTS
    crossOriginOpenerPolicy: false   // Disable COOP
}));
```

### Challenge 3: Data Persistence

**Problem:** Configuration changes didn't persist after container restart.

**Root Cause:** Volume was mapped to `/app/backend`, which:
1. Persisted the entire backend code (blocking updates)
2. Didn't have a dedicated config file location

**Solution:**
1. Create dedicated `/app/data` directory
2. Update `configManager.js` to use `/data/config.json`
3. Map volume to `/app/data` only

```yaml
volumes:
  - scaneye-data:/app/data  # Only persist data, not code
```

### Challenge 4: GitHub Email Privacy

**Problem:** Git push failed with:
```
remote: error: GH007: Your push would publish a private email address.
```

**Root Cause:** GitHub blocks pushes that expose private emails when privacy protection is enabled.

**Solution:** Configure git to use GitHub's noreply email:

```bash
git config user.email "87641781+NaveenAkalanka@users.noreply.github.com"
git commit --amend --reset-author --no-edit
git push
```

### Challenge 5: Node.js Version Warnings

**Problem:** Vite and React Router show warnings:
```
You are using Node.js 18.20.8. Vite requires Node.js version 20.19+ or 22.12+.
```

**Current Status:** Works despite warnings, but should be upgraded in future.

**Potential Solution:** Update Dockerfile to use Node.js 20 or 22:
```dockerfile
FROM node:20  # or node:22
```

---

## Deployment Guide

### Option 1: Portainer Stack (Recommended)

1. Create stack in Portainer
2. Paste configuration:

```yaml
version: '3.9'

services:
  scaneye:
    image: naveenakalanka/scaneye:latest
    container_name: scaneye
    network_mode: host
    volumes:
      - scaneye-data:/app/data
    restart: unless-stopped
    environment:
      - NODE_ENV=production

volumes:
  scaneye-data:
    driver: local
```

3. Deploy stack
4. Access at `http://<server-ip>:5050`

### Option 2: Docker CLI

```bash
docker run -d \
  --name scaneye \
  --network host \
  --restart unless-stopped \
  -v scaneye-data:/app/data \
  naveenakalanka/scaneye:latest
```

### Building from Source

```bash
# Clone repository
git clone https://github.com/NaveenAkalanka/ScanEye.git
cd ScanEye

# Build Docker image
docker build -t scaneye:local -f docker/Dockerfile .

# Run container
docker run -d --name scaneye --network host -v scaneye-data:/app/data scaneye:local
```

---

## Future Enhancements

### Planned Features

1. **Multi-Network Support**
   - Scan multiple subnets simultaneously
   - Network segmentation awareness

2. **Device History & Tracking**
   - Track when devices join/leave the network
   - Historical device presence data

3. **Alerting System**
   - Notify when new devices appear
   - Alert on network anomalies

4. **Enhanced Security**
   - JWT authentication for API
   - HTTPS support with Let's Encrypt
   - Role-based access control

5. **Performance Optimization**
   - Multi-stage Docker build
   - Frontend code splitting
   - Caching strategies

6. **ClusterEye Integration**
   - Direct API integration with ClusterEye
   - Automated data synchronization
   - Unified authentication

### Technical Debt

1. **Upgrade Node.js to v20+** (currently v18)
2. **Add comprehensive test suite** (unit + integration)
3. **Implement CI/CD pipeline** (GitHub Actions)
4. **Add API documentation** (Swagger/OpenAPI)
5. **Optimize Docker image size** (multi-stage build)

---

## Conclusion

ScanEye successfully bridges the gap between browser-based monitoring (ClusterEye) and local network scanning. Through careful architecture, security hardening, and Docker containerization, we've created a production-ready tool that provides real-time network visibility while maintaining security and performance.

The project demonstrates:
- ✅ Modern full-stack development (React + Node.js)
- ✅ Production security practices (Helmet, rate limiting, validation)
- ✅ Docker containerization and deployment
- ✅ Real-time communication (WebSocket)
- ✅ Clean architecture and separation of concerns

**Repository:** https://github.com/NaveenAkalanka/ScanEye  
**Docker Hub:** https://hub.docker.com/r/naveenakalanka/scaneye

---

*Documentation last updated: November 23, 2025*
