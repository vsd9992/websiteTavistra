# Environment Architecture: Windows Development with Debian Dev/Deployment Server

modified: 2026-11-01

## Context
Tavistra is developed locally on a Windows host machine, while application runtime and deployment are targeted to an internal Linux development/deployment server.

## Decision
- **Local Dev Environment**: Windows workstation (`d:\_devProjects\Tavistra`).
- **Target Deployment / Dev Server**:
  - **Host / IP**: `192.168.1.100` (`devMachine`)
  - **OS**: Debian GNU/Linux (x86_64)
  - **User**: `vishnu`
  - **Authentication**: SSH Key (`~/.ssh/krama_dev_server`)
- Deployment workflows, remote build tasks, containers, or remote service executions must target this server using key-based SSH authentication (`vishnu@192.168.1.100`).

## Consequences
- Windows is used for authoring code and local tooling.
- Scripts, configs, or container setups intended for deployment must be compatible with Debian Linux.
- Secrets and raw key files remain local in standard SSH storage (`%USERPROFILE%\.ssh\krama_dev_server`) and are not committed to source control.

