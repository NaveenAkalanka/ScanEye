# ScanEye 👁️

**ScanEye** is a modern, lightweight, and beautiful network monitoring tool designed to give you instant visibility into your local network. Built with performance and aesthetics in mind, it provides real-time device discovery, speed testing, and network health monitoring in a sleek, dark-themed interface.

## ✨ Features

- **🔍 Real-time Network Scanning**: Instantly discover all devices connected to your local network (IP, MAC, Vendor).
- **🚀 Integrated Speed Test**: Monitor your internet connection's download, upload, and ping latency.
- **📊 Visual Dashboard**: A beautiful, responsive UI built with React and TailwindCSS.
- **⚡ Fast & Lightweight**: Powered by a Node.js backend with optimized Nmap scanning.
- **🛡️ Secure**: Production-ready with security headers (Helmet), rate limiting, and input validation.
- **💾 Persistent Config**: Settings are saved locally, ensuring your preferences survive restarts.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Scanning**: Nmap
- **Containerization**: Docker

---

## � Deployment Guide

ScanEye is designed to be deployed via Docker.

### Option 1: Portainer Stack (Recommended)

1.  Log in to your Portainer instance.
2.  Go to **Stacks** > **Add stack**.
3.  Name the stack `scaneye`.
4.  Paste the following configuration into the Web editor:

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

5.  Click **Deploy the stack**.

### Option 2: Docker CLI

If you prefer using the command line:

```bash
docker run -d \
  --name scaneye \
  --network host \
  --restart unless-stopped \
  -v scaneye-data:/app/data \
  naveenakalanka/scaneye:latest
```

---

## ⚠️ Windows & Mac Docker Limitation

**ScanEye requires `network_mode: host` to accurately scan your local network.**

-   **Linux**: Works perfectly. The container shares the host's network stack and can see all devices on your LAN.
-   **Windows / Mac (Docker Desktop)**: **NOT SUPPORTED for scanning.**
    -   Docker on Windows/Mac runs inside a lightweight VM.
    -   Using `network_mode: host` only gives the container access to that VM's network, *not* your actual home LAN.
    -   **Result**: ScanEye will only see itself and the VM gateway, not your other devices.

**Workaround for Windows/Mac**:
You can run the backend directly on your host machine (Node.js required) while developing, or deploy to a Linux server (Raspberry Pi, VPS, Home Lab) for full functionality.

---

## 🔒 Security

This application is hardened for production use:
-   **Rate Limiting**: API requests are limited to prevent abuse.
-   **Secure Headers**: configured via `helmet` (relaxed for local network HTTP compatibility).
-   **Input Validation**: Strict validation on network inputs to prevent command injection.

## 👨‍💻 Author

**Naveen Akalanka**
- [GitHub](https://github.com/NaveenAkalanka)

---
*© 2025 ScanEye. All rights reserved.*
