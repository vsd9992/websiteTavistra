# Dev Server Deployment & Runtime Configuration

modified: 2026-11-04

## Target Machine
- **Host**: `192.168.1.100` (`devMachine`, Debian Linux)
- **Deployment Directory**: `/home/vishnu/deployments/websiteTavistra`
- **Node Runtime**: Node.js v22.23.1 (via nvm)
- **Package Manager**: pnpm v12.16.1

## Service Ports
- **Port 3000**: Reserved by existing `docshare` container on devMachine.
- **Port 3001**: **Tavistra Storefront** (Next.js production runtime).
  - Launch script: `/home/vishnu/deployments/websiteTavistra/start.sh`
  - Accessible on local network at `http://192.168.1.100:3001`
